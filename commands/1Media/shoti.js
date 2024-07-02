import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "مقطع",
  author: "kaguya project",
  role: "member",
  description: "Generates an animated video from a prompt.",
  
  execute: async function ({ api, event, args }) {
    let text = args.join(" ");
    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    if (!text) {
      return api.sendMessage("Please provide a promp.", event.threadID, event.messageID);
    }

    try {
      // ترجمة النص من العربية إلى الإنجليزية
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const prompt = translationResponse?.data?.[0]?.[0]?.[0] || text;

      await api.sendMessage("Generating video, please wait... This may take a while.", event.threadID, event.messageID);

      const apiUrl = `https://samirxpikachu.onrender.com/animated?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.video_url) {
        return api.sendMessage("Failed to generate the video. Please try again.", event.threadID, event.messageID);
      }

      const videoUrl = response.data.video_url;

      const downloadDirectory = process.cwd();
      const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.mp4`);

      // تحميل الفيديو وحفظه في المسار المؤقت
      const videoResponse = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const fileStream = fs.createWriteStream(filePath);
      videoResponse.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        // إرسال الفيديو كملف مرفق
        api.setMessageReaction("🎬", event.messageID, (err) => {}, true);
        await api.sendMessage({
          body: "࿇ ══━━━━✥◈✥━━━━══ ࿇\n✅ | تم توليد المقطع بنجاح\n࿇ ══━━━━✥◈✥━━━━══ ࿇",
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      fileStream.on('error', (error) => {
        console.error("Error downloading video:", error);
        api.sendMessage("Failed to retrieve the generated video. Please try again.", event.threadID, event.messageID);
      });

    } catch (error) {
      console.error("Error generating video:", error);
      api.sendMessage("An error occurred while generating the video. Please try again later.", event.threadID, event.messageID);
    }
  }
};
