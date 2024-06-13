import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "ثعلب",
  author: "kaguya project",
  role: "member",
  description: "يحضر صورة عشوائية لثعلب",
  async execute({ api, event }) {
    const apiUrl = 'https://randomfox.ca/floof/';
    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.image) {
        api.sendMessage("لم يتم العثور على صورة من الـ API.", event.threadID, event.messageID);
        return;
      }

      const imageUrl = data.image;
      const cacheFolderPath = path.join(process.cwd(), 'cache');

      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, 'randomfox.jpg');
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await fs.promises.writeFile(imagePath, imageResponse.data);

      api.sendMessage({
        body: `◆❯━━━━━▣✦▣━━━━━━❮◆\nإليك صورة عشوائية لثعلب 🦊\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => {
        fs.unlinkSync(imagePath);
        api.setMessageReaction("🦊", event.messageID, (err) => {}, true);
      });
      
    } catch (error) {
      console.error("Error fetching fox image:", error.message);
      api.sendMessage("حدث خطأ أثناء جلب صورة الثعلب.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  }
};
