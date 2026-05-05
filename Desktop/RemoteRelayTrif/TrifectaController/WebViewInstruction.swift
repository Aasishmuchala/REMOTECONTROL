import Foundation

struct WebViewInstruction: Equatable {
    enum Kind: Equatable {
        case reload
        case goBack
        case evaluateJavaScript(String)
    }

    let id: UUID
    let kind: Kind

    init(kind: Kind) {
        self.id = UUID()
        self.kind = kind
    }
}
