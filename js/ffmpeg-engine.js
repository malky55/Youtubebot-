// تحميل ffmpeg.wasm وتشغيل الأوامر
import { FFmpeg } from "../vendor/index.js";

const CORE_BASES = [
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm",
  "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm"
];

// نحمّل الملف ونحوله لـ blob URL عشان المتصفح يقبله جوه الـ Worker
async function toBlobURL(url, type) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return URL.createObjectURL(new Blob([await res.arrayBuffer()], { type }));
}

let ffmpeg = null;
export async function getEngine(onLog) {
  if (ffmpeg) return ffmpeg;
  const ff = new FFmpeg();
  if (onLog) ff.on("log", ({ message }) => onLog(message));
  let lastErr;
  for (const base of CORE_BASES) {
    try {
      await ff.load({
        coreURL: await toBlobURL(base + "/ffmpeg-core.js", "text/javascript"),
        wasmURL: await toBlobURL(base + "/ffmpeg-core.wasm", "application/wasm")
      });
      ffmpeg = ff;
      return ff;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

export async function run(file, outName, args, onProgress, onLog, pre = []) {
  const ff = await getEngine(onLog);
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const inName = "input." + ext;
  const handler = ({ progress }) => onProgress(Math.max(0, Math.min(1, progress)));
  ff.on("progress", handler);
  try {
    await ff.writeFile(inName, new Uint8Array(await file.arrayBuffer()));
    const code = await ff.exec([...pre, "-i", inName, ...args, outName]);
    if (code !== 0) throw new Error("ffmpeg exit " + code);
    const data = await ff.readFile(outName);
    return data;
  } catch (e) {
    // لو المحرك وقع، نقفله ونحمّله من جديد في المرة الجاية
    ff.terminate(); ffmpeg = null;
    throw e;
  } finally {
    ff.off("progress", handler);
    if (ffmpeg) {
      try { await ff.deleteFile(inName); } catch {}
      try { await ff.deleteFile(outName); } catch {}
    }
  }
}
