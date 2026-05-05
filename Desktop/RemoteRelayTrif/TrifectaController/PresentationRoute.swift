import Foundation

enum PresentationRoute: String, CaseIterable, Identifiable {
    case home = "/"
    case projectOverview = "/project-overview"
    case masterPlan = "/master-plan"
    case amenities = "/amenities"
    case exteriorWalkthrough = "/exterior-walkthrough"
    case areaMap = "/area-map"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home:
            "Home"
        case .projectOverview:
            "Project Overview"
        case .masterPlan:
            "Master Plan"
        case .amenities:
            "Amenities"
        case .exteriorWalkthrough:
            "Exterior Walkthrough"
        case .areaMap:
            "Area Map"
        }
    }

    var subtitle: String {
        switch self {
        case .home:
            "Opening presentation"
        case .projectOverview:
            "Core project story"
        case .masterPlan:
            "Interactive site plan"
        case .amenities:
            "Lifestyle and facilities"
        case .exteriorWalkthrough:
            "Guided exterior view"
        case .areaMap:
            "Location context"
        }
    }

    var symbolName: String {
        switch self {
        case .home:
            "house"
        case .projectOverview:
            "square.grid.2x2"
        case .masterPlan:
            "building.2"
        case .amenities:
            "sparkles"
        case .exteriorWalkthrough:
            "figure.walk"
        case .areaMap:
            "map"
        }
    }

    func url(relativeTo baseURL: URL) -> URL {
        URL(string: rawValue, relativeTo: baseURL)?.absoluteURL ?? baseURL
    }
}
