// قاموس الترجمة: كل مفتاح له نص عربي ونص إنجليزي
export const dict = {
  ar: {
    title: "أدوات الفيديو بتاعتك، جوه المتصفح",
    sub: "اضغط، حوّل، قص، واستخرج الصوت. الفيديو بتاعك مابيسيبش جهازك.",
    drop: "اسحب الفيديو هنا أو دوس للاختيار",
    dropHint: "MP4, MOV, WebM, MKV, AVI ... (يفضل أقل من 500MB)",
    tabConvert: "تحويل وضغط", tabTrim: "قص", tabAudio: "استخراج صوت",
    format: "الصيغة", res: "الدقة", orig: "الأصلية", quality: "الجودة",
    qHint: "رقم أقل = جودة أعلى وحجم أكبر", fps: "الفريمات (FPS)",
    speed: "سرعة المعالجة", fast: "سريعة (حجم أكبر)", balanced: "متوسطة", slow: "بطيئة (حجم أصغر)",
    mute: "بدون صوت", run: "ابدأ", start: "البداية (ثانية)", end: "النهاية (ثانية)",
    setStart: "خد البداية من المشغل", setEnd: "خد النهاية من المشغل",
    fastCut: "قص سريع بدون إعادة ترميز (ممكن يكون غير دقيق بثواني)",
    abr: "جودة MP3", download: "تحميل الملف",
    why: "ليه الموقع ده؟",
    whyText: "كل المعالجة بتتم على جهازك باستخدام ffmpeg.wasm. مفيش رفع لأي سيرفر. استخدمه مع الفيديوهات اللي إنت تملكها أو ليك حق تعديلها.",
    loadingEngine: "بنحمّل محرك المعالجة (مرة واحدة)...",
    processing: "جاري المعالجة", done: "خلص!", failed: "حصلت مشكلة: ",
    duration: "المدة", size: "الحجم", resolution: "الدقة", name: "الاسم",
    before: "قبل", outSize: "حجم الملف الناتج", badRange: "النهاية لازم تكون أكبر من البداية"
  },
  en: {
    title: "Your video tools, right in the browser",
    sub: "Compress, convert, trim and extract audio. Your video never leaves your device.",
    drop: "Drop a video here or click to choose",
    dropHint: "MP4, MOV, WebM, MKV, AVI ... (under 500MB recommended)",
    tabConvert: "Convert & compress", tabTrim: "Trim", tabAudio: "Extract audio",
    format: "Format", res: "Resolution", orig: "Original", quality: "Quality",
    qHint: "Lower number = better quality, bigger file", fps: "Frame rate (FPS)",
    speed: "Processing speed", fast: "Fast (bigger file)", balanced: "Balanced", slow: "Slow (smaller file)",
    mute: "Remove audio", run: "Start", start: "Start (seconds)", end: "End (seconds)",
    setStart: "Use player time as start", setEnd: "Use player time as end",
    fastCut: "Fast cut without re-encoding (may be off by a few seconds)",
    abr: "MP3 quality", download: "Download file",
    why: "Why this site?",
    whyText: "Everything runs on your device with ffmpeg.wasm. Nothing is uploaded. Use it only with videos you own or have rights to edit.",
    loadingEngine: "Loading the processing engine (one time)...",
    processing: "Processing", done: "Done!", failed: "Something went wrong: ",
    duration: "Duration", size: "Size", resolution: "Resolution", name: "Name",
    before: "before", outSize: "Output size", badRange: "End must be greater than start"
  }
};
