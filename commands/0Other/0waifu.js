import axios from "axios";
import fs from "fs-extra";

export default {
  name: "زوجة",
  author: "Hussein",
  role: "member",
  description: "الحصول على صورة عشوائية لشخصية أنمي",
  async execute({ api, event }) {
    let path = process.cwd() + "/cache/waifu_image.png";

    let tid = event.threadID;
    let mid = event.messageID;

    try {
      let response = await axios.get("https://hasan-oi-girl-api.onrender.com/randomphoto");

      if (response.data && response.data.url) {
        let imageUrl = response.data.url;

        // تحميل الصورة من URL المسترجع
        let imageResponse = await axios.get(imageUrl, { responseType: "stream" });
        imageResponse.data.pipe(fs.createWriteStream(path));

        imageResponse.data.on("end", () => {
          api.setMessageReaction("😘", event.messageID, (err) => {}, true);

          api.sendMessage({ attachment: fs.createReadStream(path) }, tid, () => fs.unlinkSync(path), mid);
        });
      } else {
        return api.sendMessage("فشل في جلب صورة عشوائية لشخصية أنمي. يرجى المحاولة مرة أخرى.", tid, mid);
      }
    } catch (e) {
      return api.sendMessage(e.message, tid, mid);
    }
  },
};
