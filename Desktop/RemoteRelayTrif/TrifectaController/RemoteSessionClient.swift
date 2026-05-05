import Foundation

// MARK: - WebSocket Transport

/// Abstracts the underlying WebSocket library so the client is testable.
/// Production: URLSession-based transport.
/// Test: MockWebSocketTransport injected in unit tests.
protocol WebSocketTransport: AnyObject {
    func connect(to url: URL)
    func disconnect()
    func send(_ text: String)
    func receive(handler: @escaping (Result<String, Error>) -> Void)
    func sendPing(handler: @escaping (Error?) -> Void)
}

// MARK: - URLSession WebSocket Transport

final class URLSessionWebSocketTransport: WebSocketTransport {
    private var task: URLSessionWebSocketTask?
    private var urlSession: URLSession

    init(urlSession: URLSession = .shared) {
        self.urlSession = urlSession
    }

    func connect(to url: URL) {
        task?.cancel(with: .goingAway, reason: nil)
        task = urlSession.webSocketTask(with: url)
        task?.resume()
    }

    func disconnect() {
        task?.cancel(with: .normalClosure, reason: nil)
        task = nil
    }

    func send(_ text: String) {
        task?.send(.string(text)) { _ in }
    }

    func receive(handler: @escaping (Result<String, Error>) -> Void) {
        task?.receive { [weak self] result in
            switch result {
            case .success(.string(let text)):
                handler(.success(text))
                self?.receive(handler: handler)
            case .success(.data):
                self?.receive(handler: handler)
            case .failure(let error):
                handler(.failure(error))
            @unknown default:
                self?.receive(handler: handler)
            }
        }
    }

    func sendPing(handler: @escaping (Error?) -> Void) {
        task?.sendPing(pongReceiveHandler: handler)
    }
}

// MARK: - RemoteSessionClient

@MainActor
final class RemoteSessionClient: ObservableObject {
    enum Status: Equatable {
        case disconnected
        case connecting
        case connected
        case failed(String)

        var title: String {
            switch self {
            case .disconnected: return "Remote off"
            case .connecting:     return "Connecting"
            case .connected:    return "Remote live"
            case .failed:       return "Remote error"
            }
        }
    }

    // MARK: - Public

    var endpoint: String = "ws://localhost:8787/session"
    var sessionCode: String = ""
    private(set) var status: Status = .disconnected
    var lastMessage: String = "No remote session"

    // MARK: - Private

    private var transport: WebSocketTransport?
    private var pendingReconnectTask: Task<Void, Never>?
    private var heartbeatTask: Task<Void, Never>?
    private var pendingMessages: [WebControlCommand] = []
    private var receivedMessages: [String] = []

    private var reconnectAttempts = 0
    private let maxReconnectAttempts = 5
    private var lastEndpoint: URL?

    private let heartbeatInterval: TimeInterval = 30

    // MARK: - Init

    init() {
        self.transport = URLSessionWebSocketTransport()
    }

    /// For test injection
    init(transport: WebSocketTransport) {
        self.transport = transport
    }

    // MARK: - Connect / Disconnect

    func connect() {
        let trimmedEndpoint = endpoint.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: trimmedEndpoint), !trimmedEndpoint.isEmpty else {
            status = .failed("Enter a WebSocket URL")
            lastMessage = "Missing remote endpoint"
            return
        }

        cancelPendingReconnect()
        cancelHeartbeat()

        status = .connecting
        lastMessage = "Opening remote session"
        lastEndpoint = url

        transport?.connect(to: url)

        status = .connected
        lastMessage = "Connected to \(url.host() ?? trimmedEndpoint)"

        reconnectAttempts = 0
        startHeartbeat()
        receiveNextMessage()

        if !sessionCode.isEmpty {
            let join = WebControlCommand(type: "session.join", payload: [
                "sessionCode": sessionCode,
                "clientName": "Trifecta iPad"
            ])
            sendInternal(join)
        }
    }

    func disconnect() {
        cancelPendingReconnect()
        cancelHeartbeat()
        transport?.disconnect()
        status = .disconnected
    }

    // MARK: - Send

    func send(_ command: WebControlCommand) {
        guard status == .connected || status == .connecting else { return }
        sendInternal(command)
    }

    private func sendInternal(_ command: WebControlCommand) {
        guard let jsonString = command.jsonString else { return }
        transport?.send(jsonString)
        lastMessage = "Sent \(command.type)"
    }

    // MARK: - Reconnect

    private func scheduleReconnect() {
        guard reconnectAttempts < maxReconnectAttempts else {
            status = .failed("Connection lost")
            lastMessage = "Reconnect failed after \(maxReconnectAttempts) attempts"
            return
        }

        reconnectAttempts += 1
        status = .connecting
        lastMessage = "Reconnecting (attempt \(reconnectAttempts))"

        let delay = exponentialBackoffDelay(attempt: reconnectAttempts)
        pendingReconnectTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            guard !Task.isCancelled else { return }
            await MainActor.run { [weak self] in
                self?.attemptReconnect()
            }
        }
    }

    private func attemptReconnect() {
        guard let endpoint = lastEndpoint else {
            status = .failed("No endpoint to reconnect to")
            return
        }
        transport?.connect(to: endpoint)
        status = .connected
        lastMessage = "Reconnected"
        reconnectAttempts = 0
        startHeartbeat()
        receiveNextMessage()
        flushPendingMessages()
        requestStateSync()
    }

    private func flushPendingMessages() {
        let messages = pendingMessages
        pendingMessages.removeAll()
        for command in messages {
            sendInternal(command)
        }
    }

    private func requestStateSync() {
        sendInternal(WebControlCommand(type: "state.request", payload: [:]))
    }

    private func cancelPendingReconnect() {
        pendingReconnectTask?.cancel()
        pendingReconnectTask = nil
    }

    private func exponentialBackoffDelay(attempt: Int) -> TimeInterval {
        let base: TimeInterval = 1.0
        let cap: TimeInterval = 30.0
        let delay = base * pow(2.0, Double(attempt - 1))
        return min(delay, cap)
    }

    // MARK: - Heartbeat

    private func startHeartbeat() {
        cancelHeartbeat()
        heartbeatTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: UInt64(30 * 1_000_000_000))
                guard !Task.isCancelled else { break }
                await MainActor.run { [weak self] in
                    self?.sendPing()
                }
            }
        }
    }

    private func cancelHeartbeat() {
        heartbeatTask?.cancel()
        heartbeatTask = nil
    }

    private func sendPing() {
        transport?.sendPing { [weak self] error in
            Task { @MainActor in
                if error != nil {
                    self?.lastMessage = "Heartbeat failed"
                    self?.handleDisconnected(error: error)
                }
            }
        }
    }

    // MARK: - Receive

    private func receiveNextMessage() {
        transport?.receive { [weak self] result in
            Task { @MainActor in
                switch result {
                case .success(let text):
                    self?.lastMessage = text
                    self?.receiveNextMessage()
                case .failure(let error):
                    self?.handleDisconnected(error: error)
                }
            }
        }
    }

    private func handleDisconnected(error: Error?) {
        cancelHeartbeat()
        if status == .disconnected { return }
        lastMessage = error?.localizedDescription ?? "Connection lost"
        scheduleReconnect()
    }
}
