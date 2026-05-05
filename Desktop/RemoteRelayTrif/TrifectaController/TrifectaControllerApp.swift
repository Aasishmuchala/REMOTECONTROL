import SwiftUI

@main
struct TrifectaControllerApp: App {
    @State private var store = PresentationStore()

    var body: some Scene {
        WindowGroup {
            ContentView(store: store)
        }
    }
}
