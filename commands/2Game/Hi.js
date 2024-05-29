import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "قولي",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "تحويل النص إلى كلام بواسطة خدمة Google Text-to-Speech.",
  execute: async ({ api, message, args, event }) => {
    let lng = "ar";
    let say = args.join(" ");

    if (lng.includes(args[0])) {
      lng = args[0];
      args.shift();
      say = encodeURIComponent(args.join(" "));
    }

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${say}`;
      const audioResponse = await axios.get(url, { responseType: "arraybuffer" });

      const audioPath = path.join(process.cwd(), "cache", "audio.mp3");
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(audioPath)
      }, event.threadID);

      // ربما يجب عليك إزالة الملف المؤقت بعد إرساله
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error(error);
      await api.sendMessage("🐸 حدث خطأ أثناء تحويل النص إلى كلام.", event.threadID);
    }
  }
};