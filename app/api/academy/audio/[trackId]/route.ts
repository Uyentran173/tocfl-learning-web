import { readFile } from "node:fs/promises";
import path from "node:path";
import { academyTrackById } from "@/lib/academy";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  // No textbook audio is ever served by a production deployment.
  const host = request.headers.get("host")?.split(":")[0];
  if (process.env.NODE_ENV !== "development" || (host !== "localhost" && host !== "127.0.0.1")) {
    return new Response(null, { status: 404 });
  }
  const { trackId } = await params;
  const track = academyTrackById(trackId);
  if (!track || track.mappingStatus !== "verified" || track.lesson !== 1) return new Response(null, { status: 404 });
  const audioPath = path.join(process.cwd(), ".private", "academy", "cc1", track.privatePath);
  let data: Buffer;
  try { data = await readFile(audioPath); } catch { return new Response(null, { status: 404 }); }
  if (data.byteLength !== track.bytes) return new Response(null, { status: 409 });
  const range = request.headers.get("range");
  const headers = new Headers({ "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${data.byteLength}` } });
    const start = Number(match[1]);
    const end = match[2] ? Math.min(Number(match[2]), data.byteLength - 1) : data.byteLength - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= data.byteLength) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${data.byteLength}` } });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${data.byteLength}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(new Uint8Array(data.subarray(start, end + 1)), { status: 206, headers });
  }
  headers.set("Content-Length", String(data.byteLength));
  return new Response(new Uint8Array(data), { headers });
}
