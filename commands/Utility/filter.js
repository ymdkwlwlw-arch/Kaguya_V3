import axios from 'axios';
import fs from 'fs'; // استخدام fs.promises لتحسين الكود
import path from 'path';

export default {
  name: 'اڤتار',
  author: 'Your Name',
  role: 'member',
  description: 'قم بتوايد افتار لشخصيتك المفضلة معواسمك و توقيعك',
  cooldowns: 60,
  aliases: ['av', 'avatar'],
  execute: async ({ api, event, args }) => {
    try {
      const input = args.join(" ");
      const [id, bgname, signature, color] = input.split(" | ");

      if (!id || !bgname || !signature || !color) {
        return api.sendMessage("⚠️ يرجى تقديم جميع المعلمات المطلوبة بالتنسيق : اڤتار id | bgname | signature | color يمكن ان يكون id بالارقام من 1 إلى 10", event.threadID, event.messageID);
      }

      const userProfileUrl = `https://graph.facebook.com/${event.senderID}/picture?type=large`;
      const profilePicPath = path.join(process.cwd(), "profilePic.jpg");

      // Download profile picture
      const profilePicResponse = await axios({
        url: userProfileUrl,
        method: 'GET',
        responseType: 'stream'
      });
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(profilePicPath);
        profilePicResponse.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Generate cover photo
      const apiUrl = `https://joshweb.click/canvas/avatar?id=${encodeURIComponent(id)}&bgname=${encodeURIComponent(bgname)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;

      api.sendMessage("📸 | جاري تهيئة الأڤتار الخاص بك يرجى الانتظار...", event.threadID, event.messageID);

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const coverPhotoPath = path.join(process.cwd(), "fbCover.jpg");

      await fs.writeFile(coverPhotoPath, response.data);

      // Send cover photo
      await api.sendMessage({
        body: "✅ | تم توليد الأڤتار الخاص بك بنجاح:",
        attachment: fs.createReadStream(coverPhotoPath)
      }, event.threadID);

      // Clean up temporary files
      await fs.unlink(profilePicPath);
      await fs.unlink(coverPhotoPath);

    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("❌ An error occurred while processing the request.", event.threadID, event.messageID);
    }
  },
  onReply: async ({ api, event, reply, client }) => {
    // Add any specific handling for replies if needed
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // Add any specific handling for reactions if needed
  }
};
