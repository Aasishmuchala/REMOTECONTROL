import SwiftUI
import WebKit

struct PresentationWebView: UIViewRepresentable {
    let url: URL
    let instruction: WebViewInstruction?
    let onEvent: (String) -> Void
    let onRemoteCommand: (WebControlCommand) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onEvent: onEvent, onRemoteCommand: onRemoteCommand)
    }

    func makeUIView(context: Context) -> DesktopWebViewHost {
        let userContentController = WKUserContentController()
        userContentController.add(context.coordinator, name: "trifectaNative")
        userContentController.addUserScript(WKUserScript(
            source: Self.desktopViewportScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        ))
        userContentController.addUserScript(WKUserScript(
            source: Self.bridgeScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        ))

        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.userContentController = userContentController

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.customUserAgent = Self.desktopUserAgent
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.backgroundColor = .black
        webView.load(URLRequest(url: url))

        context.coordinator.lastLoadedURL = url
        return DesktopWebViewHost(webView: webView, desktopViewport: Self.desktopViewport)
    }

    func updateUIView(_ host: DesktopWebViewHost, context: Context) {
        let webView = host.webView

        if context.coordinator.lastLoadedURL != url {
            context.coordinator.lastLoadedURL = url
            webView.load(URLRequest(url: url))
        }

        guard let instruction, context.coordinator.lastInstructionID != instruction.id else {
            return
        }

        context.coordinator.lastInstructionID = instruction.id

        switch instruction.kind {
        case .reload:
            webView.reload()
        case .goBack:
            if webView.canGoBack {
                webView.goBack()
            }
        case .evaluateJavaScript(let script):
            webView.evaluateJavaScript(script) { result, error in
                if let error {
                    onEvent("JavaScript failed: \(error.localizedDescription)")
                } else if let result {
                    onEvent("Web command result: \(result)")
                }
            }
        }
    }

    private static let desktopViewport = CGSize(width: 1440, height: 810)

    private static let desktopUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"

    private static let desktopViewportScript = """
    (() => {
      const viewportContent = 'width=1440, initial-scale=1, maximum-scale=1, viewport-fit=cover';

      const installDesktopViewport = () => {
        if (!document.documentElement) {
          return;
        }

        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport && document.head) {
          viewport = document.createElement('meta');
          viewport.name = 'viewport';
          document.head.prepend(viewport);
        }

        if (viewport) {
          viewport.setAttribute('content', viewportContent);
        }
      };

      installDesktopViewport();
      window.addEventListener('DOMContentLoaded', installDesktopViewport, { once: true });

      const observer = new MutationObserver(installDesktopViewport);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
    """

    static let bridgeScript = """
    (() => {
      if (window.TrifectaPresenter) {
        return;
      }

      window.TrifectaPresenter = {
        receiveNativeCommand(command) {
          window.dispatchEvent(new CustomEvent('trifecta:control', { detail: command }));
          return true;
        },
        postState(payload) {
          window.webkit?.messageHandlers?.trifectaNative?.postMessage({
            type: 'state',
            payload
          });
        }
      };

      const interactiveSelector = [
        'a',
        'button',
        'input',
        'select',
        'textarea',
        'canvas',
        '[role="button"]',
        '[tabindex]',
        '[data-trifecta-control]',
        '[data-control-id]'
      ].join(',');

      const trimLabel = (value) => String(value || '').replace(/\\s+/g, ' ').trim().slice(0, 120);
      const normalized = (value, max) => {
        if (!max) {
          return '0';
        }

        return Math.min(1, Math.max(0, value / max)).toFixed(6);
      };

      const payloadForEvent = (event, target) => ({
        x: normalized(event.clientX, window.innerWidth),
        y: normalized(event.clientY, window.innerHeight),
        viewportWidth: String(window.innerWidth || 1440),
        viewportHeight: String(window.innerHeight || 810),
        pointerId: String(event.pointerId || 1),
        pointerType: String(event.pointerType || 'touch'),
        button: String(event.button || 0),
        buttons: String(event.buttons || 0),
        tag: String(target?.tagName || '').toLowerCase(),
        label: trimLabel(target?.textContent || target?.getAttribute?.('aria-label') || target?.getAttribute?.('title') || ''),
        href: trimLabel(target?.href || target?.getAttribute?.('href') || '')
      });

      const postInteraction = (type, event, target) => {
        window.webkit?.messageHandlers?.trifectaNative?.postMessage({
          type,
          payload: payloadForEvent(event, target)
        });
      };

      let activePointerId = null;
      let lastMoveTime = 0;

      document.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary) {
          return;
        }

        activePointerId = event.pointerId;
        const target = event.target instanceof Element ? event.target.closest(interactiveSelector) || event.target : null;
        postInteraction('interaction.pointerDown', event, target);
      }, true);

      document.addEventListener('pointermove', (event) => {
        if (activePointerId !== event.pointerId) {
          return;
        }

        const now = performance.now();
        if (now - lastMoveTime < 40) {
          return;
        }

        lastMoveTime = now;
        const target = event.target instanceof Element ? event.target.closest(interactiveSelector) || event.target : null;
        postInteraction('interaction.pointerMove', event, target);
      }, true);

      document.addEventListener('pointerup', (event) => {
        if (activePointerId !== event.pointerId) {
          return;
        }

        activePointerId = null;
        const target = event.target instanceof Element ? event.target.closest(interactiveSelector) || event.target : null;
        postInteraction('interaction.pointerUp', event, target);
      }, true);

      document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
        if (!target) {
          return;
        }

        postInteraction('interaction.tap', event, target);
      }, true);

      window.addEventListener('error', (event) => {
        window.webkit?.messageHandlers?.trifectaNative?.postMessage({
          type: 'error',
          payload: event.message || 'Unknown web error'
        });
      });
    })();
    """

    final class DesktopWebViewHost: UIView {
        let webView: WKWebView
        private let desktopViewport: CGSize

        init(webView: WKWebView, desktopViewport: CGSize) {
            self.webView = webView
            self.desktopViewport = desktopViewport
            super.init(frame: .zero)

            backgroundColor = .black
            clipsToBounds = true
            addSubview(webView)
        }

        @available(*, unavailable)
        required init?(coder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }

        override func layoutSubviews() {
            super.layoutSubviews()

            guard bounds.width > 0, bounds.height > 0 else {
                return
            }

            let scale = min(bounds.width / desktopViewport.width, bounds.height / desktopViewport.height)
            let scaledHeight = desktopViewport.height * scale
            webView.bounds = CGRect(origin: .zero, size: desktopViewport)
            webView.center = CGPoint(x: bounds.midX, y: scaledHeight / 2)
            webView.transform = CGAffineTransform(scaleX: scale, y: scale)
        }
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        var lastLoadedURL: URL?
        var lastInstructionID: UUID?
        private let onEvent: (String) -> Void
        private let onRemoteCommand: (WebControlCommand) -> Void

        init(onEvent: @escaping (String) -> Void, onRemoteCommand: @escaping (WebControlCommand) -> Void) {
            self.onEvent = onEvent
            self.onRemoteCommand = onRemoteCommand
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            lastLoadedURL = webView.url
            onEvent("Loaded \(webView.url?.path(percentEncoded: false).nilIfEmpty ?? "/")")
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            onEvent("Load failed: \(error.localizedDescription)")
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            onEvent("Load failed: \(error.localizedDescription)")
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if navigationAction.targetFrame == nil {
                webView.load(navigationAction.request)
            }

            return nil
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any] else {
                onEvent("Web event: \(message.body)")
                return
            }

            if let command = Self.remoteCommand(from: body) {
                onRemoteCommand(command)
                return
            }

            onEvent("Web event: \(body)")
        }

        private static func remoteCommand(from body: [String: Any]) -> WebControlCommand? {
            guard let type = body["type"] as? String, type.hasPrefix("interaction.") else {
                return nil
            }

            let rawPayload = body["payload"] as? [String: Any] ?? [:]
            let payload = rawPayload.reduce(into: [String: String]()) { result, item in
                result[item.key] = String(describing: item.value)
            }

            return WebControlCommand(type: type, payload: payload)
        }
    }
}

private extension String {
    var nilIfEmpty: String? {
        isEmpty ? nil : self
    }
}
