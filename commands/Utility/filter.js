import axios from "axios";
import fs from "fs";

export default {
  name: "انميات",
  author: "Kaguya Project",
  role: "member",
  cooldowns: 10,
  description: "إرسال مقاطع انمي بإستخدام مؤثرات",
  async execute({ api, event }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    try {
      const response = await axios.get("https://vfx-animation-fn83.onrender.com/kshitiz", { responseType: "stream" });

      const tempVideoPath = "./cache/shoti_video.mp4";

      const writer = fs.createWriteStream(tempVideoPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const stream = fs.createReadStream(tempVideoPath);

        api.sendMessage({
          body: "🌟 | تمتع بجمالية المقطع 🥺 | 🌟",
          attachment: stream,
        }, event.threadID, (err) => {
          if (err) {
            console.error("Error sending shoti video:", err);
            api.sendMessage("❌ | عذراً، حدث خطأ أثناء إرسال مقطع الشوتي.", event.threadID);
          } else {
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            fs.unlinkSync(tempVideoPath);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching shoti video:", error);
      api.sendMessage("❌ | عذراً، حدث خطأ أثناء جلب مقطع الشوتي.", event.threadID);
    }
  },
};