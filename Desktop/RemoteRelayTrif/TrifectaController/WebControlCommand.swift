import Foundation

struct WebControlCommand: Codable, Equatable, Identifiable {
    let id: String
    let type: String
    let timestamp: String
    let payload: [String: String]

    init(type: String, payload: [String: String] = [:]) {
        self.id = "cmd_\(UUID().uuidString)"
        self.type = type
        self.timestamp = Self.timestampFormatter.string(from: Date())
        self.payload = payload
    }

    var jsonString: String? {
        guard let data = try? JSONEncoder().encode(self) else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }

    var dispatchJavaScript: String? {
        guard let jsonString else {
            return nil
        }

        return """
        (() => {
          const command = \(jsonString);
          window.dispatchEvent(new CustomEvent('trifecta:control', { detail: command }));
          if (window.TrifectaPresenter && typeof window.TrifectaPresenter.receiveNativeCommand === 'function') {
            window.TrifectaPresenter.receiveNativeCommand(command);
          }
          return command.id;
        })();
        """
    }

    private static let timestampFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}
