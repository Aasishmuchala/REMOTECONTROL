import Foundation
import Observation

@MainActor
@Observable
final class PresentationStore {
    let baseURL = URL(string: "https://trifecta-veranza.vercel.app/")!

    var selectedRoute: PresentationRoute = .home
    var webInstruction: WebViewInstruction?
    var lastCommand: WebControlCommand?
    var statusMessage = "Embedded site ready"
    var isPresentationMode = false
    var remoteClient = RemoteSessionClient()

    var currentURL: URL {
        selectedRoute.url(relativeTo: baseURL)
    }

    func open(_ route: PresentationRoute) {
        selectedRoute = route
        statusMessage = "Opening \(route.title)"
        sendRemoteCommand(type: "navigate", payload: ["path": route.rawValue])
    }

    func reload() {
        webInstruction = WebViewInstruction(kind: .reload)
        statusMessage = "Reloading \(selectedRoute.title)"
    }

    func goBack() {
        webInstruction = WebViewInstruction(kind: .goBack)
        statusMessage = "Going back"
    }

    func resetPresentation() {
        selectedRoute = .home
        dispatch(type: "presentation.reset", payload: ["path": PresentationRoute.home.rawValue])
        statusMessage = "Reset to Home"
    }

    func triggerQuote() {
        let script = """
        (() => {
          const elements = Array.from(document.querySelectorAll('button,a'));
          const match = elements.find((element) => {
            const label = [
              element.textContent || '',
              element.getAttribute('aria-label') || '',
              element.getAttribute('title') || ''
            ].join(' ').toLowerCase();
            return label.includes('get a quote') || label.includes('quote');
          });
          if (match) {
            match.click();
            return 'quote-triggered';
          }
          window.dispatchEvent(new CustomEvent('trifecta:control', {
            detail: { type: 'lead.open', payload: {} }
          }));
          return 'quote-event-dispatched';
        })();
        """

        webInstruction = WebViewInstruction(kind: .evaluateJavaScript(script))
        dispatch(type: "lead.open")
        statusMessage = "Opening quote action"
    }

    func setPresentationMode(_ enabled: Bool) {
        isPresentationMode = enabled

        let styleAction = enabled ? "enable" : "disable"
        let script = """
        (() => {
          const styleId = 'trifecta-native-presentation-style';
          const existing = document.getElementById(styleId);
          if ('\(styleAction)' === 'disable') {
            existing?.remove();
            return 'presentation-mode-disabled';
          }

          if (!existing) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
              body { -webkit-user-select: none; user-select: none; }
              [data-native-hidden="true"] { display: none !important; }
            `;
            document.head.appendChild(style);
          }
          window.dispatchEvent(new CustomEvent('trifecta:control', {
            detail: { type: 'presentation.mode', payload: { enabled: true } }
          }));
          return 'presentation-mode-enabled';
        })();
        """

        webInstruction = WebViewInstruction(kind: .evaluateJavaScript(script))
        dispatch(type: "presentation.mode", payload: ["enabled": String(enabled)])
        statusMessage = enabled ? "Presentation mode on" : "Presentation mode off"
    }

    func recordWebEvent(_ event: String) {
        statusMessage = event
    }

    func mirrorPreviewInteraction(_ command: WebControlCommand) {
        lastCommand = command
        remoteClient.send(command)

        if command.type != "interaction.pointerMove" {
            statusMessage = "Mirrored \(command.type.replacingOccurrences(of: "interaction.", with: ""))"
        }
    }

    private func dispatch(type: String, payload: [String: String] = [:]) {
        let command = WebControlCommand(type: type, payload: payload)
        lastCommand = command

        if let javaScript = command.dispatchJavaScript {
            webInstruction = WebViewInstruction(kind: .evaluateJavaScript(javaScript))
        }

        remoteClient.send(command)
    }

    private func sendRemoteCommand(type: String, payload: [String: String] = [:]) {
        let command = WebControlCommand(type: type, payload: payload)
        lastCommand = command
        remoteClient.send(command)
    }
}
