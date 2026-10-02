import Foundation
import Vision
import AppKit

struct Line: Encodable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}

let files = CommandLine.arguments.dropFirst()
var result: [String: [Line]] = [:]
for file in files {
    let url = URL(fileURLWithPath: file)
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fputs("Could not read \(file)\n", stderr)
        exit(1)
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = file.contains("/simplified/") ? ["zh-Hans", "en-US"] : ["zh-Hant", "en-US"]
    request.usesLanguageCorrection = true
    let handler = VNImageRequestHandler(cgImage: cgImage)
    try handler.perform([request])
    result[file] = (request.results ?? []).compactMap { observation in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        let box = observation.boundingBox
        return Line(text: candidate.string, confidence: candidate.confidence,
                    x: box.minX, y: 1 - box.maxY, width: box.width, height: box.height)
    }.sorted { abs($0.y - $1.y) > 0.008 ? $0.y < $1.y : $0.x < $1.x }
}
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
FileHandle.standardOutput.write(try encoder.encode(result))
