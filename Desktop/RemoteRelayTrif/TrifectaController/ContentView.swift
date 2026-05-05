import SwiftUI

struct ContentView: View {
    @Bindable var store: PresentationStore

    var body: some View {
        NavigationSplitView {
            PresenterSidebar(store: store)
                .navigationTitle("Trifecta")
        } detail: {
            ZStack(alignment: .top) {
                PresentationWebView(
                    url: store.currentURL,
                    instruction: store.webInstruction,
                    onEvent: store.recordWebEvent,
                    onRemoteCommand: store.mirrorPreviewInteraction
                )
                .ignoresSafeArea()

                WebStatusBar(store: store)
                    .padding(.horizontal, 18)
                    .padding(.top, 14)
            }
        }
        .navigationSplitViewStyle(.balanced)
    }
}

private struct PresenterSidebar: View {
    @Bindable var store: PresentationStore

    var body: some View {
        List {
            Section("Presentation") {
                ForEach(PresentationRoute.allCases) { route in
                    Button {
                        store.open(route)
                    } label: {
                        RouteRow(route: route, isSelected: route == store.selectedRoute)
                    }
                    .buttonStyle(.plain)
                }
            }

            Section("Controls") {
                Button {
                    store.goBack()
                } label: {
                    Label("Back", systemImage: "chevron.backward")
                }

                Button {
                    store.reload()
                } label: {
                    Label("Reload", systemImage: "arrow.clockwise")
                }

                Button(role: .destructive) {
                    store.resetPresentation()
                } label: {
                    Label("Reset", systemImage: "arrow.counterclockwise")
                }

                Toggle(isOn: Binding(
                    get: { store.isPresentationMode },
                    set: { store.setPresentationMode($0) }
                )) {
                    Label("Presentation Mode", systemImage: "rectangle.on.rectangle")
                }

                Button {
                    store.triggerQuote()
                } label: {
                    Label("Open Quote", systemImage: "person.crop.circle.badge.plus")
                }
            }

            Section("Remote Browser") {
                RemoteSessionPanel(client: store.remoteClient)
            }

            Section("Last Event") {
                Text(store.statusMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .textSelection(.enabled)
            }
        }
        .listStyle(.sidebar)
    }
}

private struct RouteRow: View {
    let route: PresentationRoute
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: route.symbolName)
                .frame(width: 28, height: 28)
                .foregroundStyle(isSelected ? .white : .primary)
                .background(isSelected ? Color.accentColor : Color.secondary.opacity(0.12), in: RoundedRectangle(cornerRadius: 6))

            VStack(alignment: .leading, spacing: 2) {
                Text(route.title)
                    .font(.body.weight(.medium))
                Text(route.subtitle)
                    .font(.caption)
                    .foregroundStyle(isSelected ? .white.opacity(0.75) : .secondary)
            }

            Spacer(minLength: 8)
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
    }
}

private struct RemoteSessionPanel: View {
    @ObservedObject var client: RemoteSessionClient

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            TextField("ws://192.168.1.10:8787/session", text: $client.endpoint)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .keyboardType(.URL)

            TextField("Session code", text: $client.sessionCode)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()

            HStack {
                Button {
                    client.connect()
                } label: {
                    Label("Connect", systemImage: "antenna.radiowaves.left.and.right")
                }

                Button {
                    client.disconnect()
                } label: {
                    Label("Disconnect", systemImage: "xmark.circle")
                }
            }
            .buttonStyle(.borderless)

            Text(client.lastMessage)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}

private struct WebStatusBar: View {
    @Bindable var store: PresentationStore

    var body: some View {
        HStack(spacing: 12) {
            Label(store.selectedRoute.title, systemImage: store.selectedRoute.symbolName)
                .font(.callout.weight(.semibold))

            Divider()
                .frame(height: 18)

            StatusDot(status: store.remoteClient.status)

            Text(store.statusMessage)
                .font(.callout)
                .lineLimit(1)

            Spacer()

            if let lastCommand = store.lastCommand {
                Text(lastCommand.type)
                    .font(.caption.monospaced())
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(.white.opacity(0.18))
        )
    }
}

private struct StatusDot: View {
    let status: RemoteSessionClient.Status

    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)

            Text(status.title)
                .font(.caption.weight(.medium))
                .foregroundStyle(.secondary)
        }
    }

    private var color: Color {
        switch status {
        case .disconnected:
            .secondary
        case .connecting:
            .orange
        case .connected:
            .green
        case .failed:
            .red
        }
    }
}

#Preview {
    ContentView(store: PresentationStore())
}
