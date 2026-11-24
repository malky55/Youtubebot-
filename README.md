# VidForge
موقع أدوات فيديو شغال كله جوه المتصفح (ffmpeg.wasm). بدون سيرفر.

## الملفات
- index.html : الصفحة
- css/style.css : التصميم
- js/app.js : منطق الواجهة وبناء أوامر ffmpeg
- js/ffmpeg-engine.js : تحميل ffmpeg.wasm وتشغيله
- js/i18n.js : النصوص عربي/إنجليزي
- vendor/ : مكتبة @ffmpeg/ffmpeg (MIT)
- _headers : إعدادات الكاش لـ Cloudflare Pages / Netlify

## تشغيل محلي
لازم سيرفر (مش فتح الملف مباشرة): `python3 -m http.server 8000` ثم افتح http://localhost:8000
