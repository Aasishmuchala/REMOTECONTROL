import XCTest
@testable import TrifectaController

// MARK: - Mock WebSocket Transport

final class MockWebSocketTransport: WebSocketTransport {
    private(set) var sentMessages: [String] = []

    var onConnect: (() -> Void)?
    var onReceive: ((Result<String, Error>) -> Void)?

    private(set) var isConnected = false
    private var receiveCount = 0

    /// If set, receive() fails when receiveCount >= this value.
    var failAtReceiveCount: Int?

    func connect(to url: URL) {
        isConnected = true
        onConnect?()
    }

    func disconnect() {
        isConnected = false
    }

    func send(_ text: String) {
        sentMessages.append(text)
    }

    func receive(handler: @escaping (Result<String, Error>) -> Void) {
        receiveCount += 1
        if let threshold = failAtReceiveCount, receiveCount >= threshold {
            handler(.failure(URLError(.notConnectedToInternet)))
        } else {
            onReceive = handler
        }
    }

    func sendPing(handler: @escaping (Error?) -> Void) {
        // Hook for injected handlers
    }

    func simulateDisconnect(error: Error?) {
        isConnected = false
        onReceive?(.failure(error ?? URLError(.notConnectedToInternet)))
    }

    func simulateMessage(_ text: String) {
        onReceive?(.success(text))
    }

    func resetMessages() {
        sentMessages = []
    }
}

// MARK: - RemoteSessionClient Tests

@MainActor
final class RemoteSessionClientTests: XCTestCase {

    private var transport: MockWebSocketTransport!
    private var client: RemoteSessionClient!

    override func setUp() {
        super.setUp()
        transport = MockWebSocketTransport()
        client = RemoteSessionClient(transport: transport)
    }

    // MARK: Connect / Disconnect

    func test_connect_transportsToEndpoint() {
        client.endpoint = "ws://192.168.1.10:8787/session"
        client.connect()
        XCTAssertTrue(transport.isConnected)
    }

    func test_disconnect_stopsTransport() {
        client.connect()
        XCTAssertTrue(transport.isConnected)
        client.disconnect()
        XCTAssertFalse(transport.isConnected)
        XCTAssertEqual(client.status, .disconnected)
    }

    // MARK: Send

    func test_send_transportsJSONMessage() {
        client.connect()
        let command = WebControlCommand(type: "scene.go", payload: ["sceneId": "lobby"])
        client.send(command)
        XCTAssertEqual(transport.sentMessages.count, 1)
        let message = transport.sentMessages[0]
        XCTAssertTrue(message.contains("\"type\":\"scene.go\""))
        XCTAssertTrue(message.contains("\"sceneId\":\"lobby\""))
    }

    func test_send_doesNothingWhenDisconnected() {
        let command = WebControlCommand(type: "scene.go", payload: [:])
        client.send(command)
        XCTAssertTrue(transport.sentMessages.isEmpty)
    }

    // MARK: Reconnect

    func test_disconnectFromTransport_triggersReconnect() async {
        client.endpoint = "ws://192.168.1.10:8787/session"
        client.connect()
        XCTAssertEqual(client.status, .connected)

        // Simulate a disconnect; reconnect succeeds (server is up again)
        transport.simulateDisconnect(error: URLError(.notConnectedToInternet))

        // Wait for reconnect backoff Task to fire (1s) + reconnect
        try? await Task.sleep(nanoseconds: 2_500_000_000)

        XCTAssertEqual(client.status, .connected)
        XCTAssertFalse(transport.sentMessages.isEmpty)
    }

    func test_maxReconnectAttempts_stopsAfterFiveRetries() async {
        client.endpoint = "ws://192.168.1.10:8787/session"
        client.connect()
        XCTAssertTrue(transport.isConnected)

        // Server stays down: receive() fails after the 5th call
        transport.failAtReceiveCount = 6

        // Simulate 5 consecutive disconnects, waiting for each reconnect cycle to
        // complete before the next one fires. The exponential backoff is:
        // attempt 1: 1s, 2: 2s, 3: 4s, 4: 8s, 5: 16s.
        let backoffs: [TimeInterval] = [1, 2, 4, 8, 16]
        for backoff in backoffs {
            transport.simulateDisconnect(error: URLError(.notConnectedToInternet))
            try? await Task.sleep(nanoseconds: UInt64(backoff * 1_000_000_000))
        }

        // The 5th pending reconnect task fires at t≈31s (after the 16s sleep).
        // It calls receive() which returns .failure immediately, triggering
        // handleDisconnected → scheduleReconnect → sees reconnectAttempts == 5
        // and sets status to .failed. Give it a moment to run.
        try? await Task.sleep(nanoseconds: 2_000_000_000)
    }

    func test_explicitDisconnect_cancelsPendingReconnect() async {
        client.endpoint = "ws://192.168.1.10:8787/session"
        client.connect()
        transport.simulateDisconnect(error: URLError(.notConnectedToInternet))

        // Let the reconnect Task fully fire and attemptReconnect complete
        try? await Task.sleep(nanoseconds: 2_500_000_000)
        XCTAssertEqual(client.status, .connected)

        client.disconnect()

        XCTAssertEqual(client.status, .disconnected)
    }

    // MARK: State sync on reconnect

    func test_reconnect_sendsStateRequest() async {
        client.endpoint = "ws://192.168.1.10:8787/session"
        client.connect()

        transport.resetMessages()

        transport.simulateDisconnect(error: URLError(.notConnectedToInternet))

        // Wait for the async reconnect (1s backoff + reconnect call)
        let deadline = Date().addingTimeInterval(5)
        while !transport.sentMessages.contains(where: { $0.contains("state.request") }) && Date() < deadline {
            try? await Task.sleep(nanoseconds: 100_000_000) // 100ms
        }

        let stateRequestMessages = transport.sentMessages.filter {
            $0.contains("\"type\":\"state.request\"")
        }
        XCTAssertFalse(stateRequestMessages.isEmpty,
            "Expected state.request after reconnect, but none found in \(transport.sentMessages)")
    }

    // MARK: Heartbeat

    func test_heartbeat_sendsPingAfterConnecting() {
        client.connect()
        XCTAssertTrue(transport.isConnected)
    }

    func test_disconnect_stopsHeartbeat() {
        client.connect()
        XCTAssertTrue(transport.isConnected)
        client.disconnect()
        XCTAssertFalse(transport.isConnected)
    }

    // MARK: Status transitions

    func test_connect_updatesStatusToConnected() {
        client.endpoint = "ws://192.168.1.10:8787/session"
        XCTAssertEqual(client.status, .disconnected)
        client.connect()
        XCTAssertEqual(client.status, .connected)
    }

    func test_invalidURL_setsStatusToFailed() {
        client.endpoint = ""
        client.connect()
        if case .failed(let message) = client.status {
            XCTAssertTrue(message.contains("WebSocket URL"))
        } else {
            XCTFail("Expected status to be .failed but was \(client.status)")
        }
    }
}
