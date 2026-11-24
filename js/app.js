import { dict } from "./i18n.js";
import { run, getEngine } from "./ffmpeg-engine.js";

const $ = (id) => document.getElementById(id);
let lang = "ar";
let file = null;
let busy = false;
let outUrl = null;

// ---------- الترجمة ----------
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = dict[lang][el.dataset.i18n];
  });
  $("langBtn").textContent = lang === "ar" ? "EN" : "عربي";
  if (file) showInfo();
}
const t = (k) => dict[lang][k];
$("langBtn").onclick = () => { lang = lang === "ar" ? "en" : "ar"; applyLang(); };

// ---------- اختيار الملف ----------
const drop = $("drop");
drop.onclick = () => $("file").click();
drop.onkeydown = (e) => { if (e.key === "Enter") $("file").click(); };
drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
drop.ondragleave = () => drop.classList.remove("over");
drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove("over"); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };
$("file").onchange = (e) => { if (e.target.files[0]) setFile(e.target.files[0]); };

function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB"; }
function fmtTime(s) { s = Math.round(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

function setFile(f) {
  file = f;
  const p = $("player");
  p.src = URL.createObjectURL(f);
  p.onloadedmetadata = () => {
    $("tEnd").value = p.duration.toFixed(1);
    showInfo();
  };
  $("workspace").hidden = false;
  $("result").hidden = true;
  getEngine().catch(() => {}); // نبدأ تحميل المحرك من دلوقتي عشان نوفر وقت
}

function showInfo() {
  const p = $("player");
  const w = p.videoWidth ? `${p.videoWidth}×${p.videoHeight}` : "-";
  $("info").innerHTML =
    `${t("name")}: ${file.name.replace(/[<>&]/g, "")}<br>${t("size")}: ${fmtSize(file.size)}<br>` +
    `${t("duration")}: ${fmtTime(p.duration || 0)}<br>${t("resolution")}: ${w}`;
}

// ---------- التابات ----------
document.querySelectorAll(".tab").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".pane").forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab));
  };
});
$("cCrf").oninput = (e) => ($("qVal").textContent = e.target.value);
$("setStart").onclick = () => ($("tStart").value = $("player").currentTime.toFixed(1));
$("setEnd").onclick = () => ($("tEnd").value = $("player").currentTime.toFixed(1));

// ---------- بناء أوامر ffmpeg ----------
function buildJob(mode) {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\w\u0600-\u06FF-]+/g, "_") || "video";
  if (mode === "audio") {
    return { out: "out.mp3", name: base + ".mp3", mime: "audio/mpeg", audio: true,
      args: ["-vn", "-c:a", "libmp3lame", "-b:a", $("aBr").value + "k"] };
  }
  if (mode === "trim") {
    const s = parseFloat($("tStart").value) || 0;
    const e = parseFloat($("tEnd").value) || 0;
    if (e <= s) throw new Error(t("badRange"));
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const keep = ["mp4", "mov", "mkv", "webm"].includes(ext) ? ext : "mp4";
    // -ss قبل -i أسرع، و -t هو طول المقطع
    const range = ["-ss", String(s), "-t", String(e - s)];
    const args = $("tFast").checked
      ? [...range, "-c", "copy"]
      : [...range, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac"];
    // لازم نحط -ss قبل -i، فبنرجّعها في run عن طريق pre
    return { out: "out." + keep, name: base + "_trim." + keep, mime: "video/" + keep, pre: range,
      args: args.slice(range.length) };
  }
  const fmt = $("cFormat").value;
  const h = parseInt($("cRes").value, 10);
  const crf = $("cCrf").value;
  const vf = [h ? `scale=-2:'min(${h},ih)'` : "scale=trunc(iw/2)*2:trunc(ih/2)*2"];
  if ($("cFps").value !== "0") vf.push("fps=" + $("cFps").value);
  let args = ["-vf", vf.join(",")];
  if (fmt === "webm") {
    // VP8 بدل VP9 لأن VP9 بيوقع النسخة single-thread من ffmpeg.wasm
    args.push("-c:v", "libvpx", "-crf", crf, "-b:v", "4M", "-deadline", "realtime", "-cpu-used", "5");
    if (!$("cMute").checked) args.push("-c:a", "libopus");
  } else {
    args.push("-c:v", "libx264", "-preset", $("cPreset").value, "-crf", crf, "-pix_fmt", "yuv420p");
    if (!$("cMute").checked) args.push("-c:a", "aac", "-b:a", "128k");
    if (fmt === "mp4") args.push("-movflags", "+faststart");
  }
  if ($("cMute").checked) args.push("-an");
  return { out: "out." + fmt, name: `${base}_${h || "orig"}p.${fmt}`, mime: "video/" + fmt, args };
}

// ---------- التشغيل ----------
document.querySelectorAll("[data-run]").forEach((btn) => {
  btn.onclick = async () => {
    if (busy || !file) return;
    let job;
    try { job = buildJob(btn.dataset.run); } catch (e) { alert(e.message); return; }
    busy = true;
    document.querySelectorAll(".go[data-run]").forEach((b) => (b.disabled = true));
    $("result").hidden = true;
    $("progressBox").hidden = false;
    $("bar").style.width = "0";
    $("status").textContent = t("loadingEngine");
    try {
      const data = await runJob(job);
      if (outUrl) URL.revokeObjectURL(outUrl);
      outUrl = URL.createObjectURL(new Blob([data.buffer], { type: job.mime }));
      $("outVideo").hidden = !!job.audio;
      $("outAudio").hidden = !job.audio;
      (job.audio ? $("outAudio") : $("outVideo")).src = outUrl;
      $("dl").href = outUrl;
      $("dl").download = job.name;
      $("outInfo").textContent = `${t("outSize")}: ${fmtSize(data.length)} (${t("before")}: ${fmtSize(file.size)})`;
      $("result").hidden = false;
      $("status").textContent = t("done");
      $("bar").style.width = "100%";
      $("result").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {
      $("status").textContent = t("failed") + (e.message || e);
    } finally {
      busy = false;
      document.querySelectorAll(".go[data-run]").forEach((b) => (b.disabled = false));
    }
  };
});

async function runJob(job) {
  const onProgress = (p) => {
    $("bar").style.width = (p * 100).toFixed(0) + "%";
    $("status").textContent = `${t("processing")} ${(p * 100).toFixed(0)}%`;
  };
  return run(file, job.out, job.args, onProgress, null, job.pre || []);
}

applyLang();
window.__vf = { buildJob }; // للاختبار
