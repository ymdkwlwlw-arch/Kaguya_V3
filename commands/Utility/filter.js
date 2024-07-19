import axios from "axios";
import fs from "fs";
import path from "path";

async function execute({ api, event }) {
  const text = event.body.trim().split(" ");
  
  if (text.length < 4) {
    return api.sendMessage("⚠️ | يرجى توفير جميع المعلمات المطلوبة: [اسم الخلفية] [التوقيع] [اللون]", event.threadID, event.messageID);
  }

  const [bgname, signature, color] = text.slice(1);
  const id = Math.floor(Math.random() * 1000000).toString();  // توليد رقم عشوائي كـ ID

  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const response = await axios.get(`https://joshweb.click/canvas/avatar`, {
      params: { id, bgname, signature, color },
      responseType: 'arraybuffer' // Ensure we get the image data
    });

    const imagePath = path.join(process.cwd(), "cache", "avatar.png");
    await fs.promises.writeFile(imagePath, response.data);

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    return api.sendMessage({
      body: "🌟 | هنا الصورة الرمزية المولدة:",
      attachment: fs.createReadStream(imagePath)
    }, event.threadID, event.messageID);
  } catch (error) {
    console.error(`❌ | خطأ في توليد الصورة الرمزية: ${error.message}`);
    return api.sendMessage("❌ | فشل في توليد الصورة الرمزية. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
  }
}

export default {
  name: "اڤتار",
  author: "حسين يعقوبي",
  role: "member",
  description: "يولد صورة رمزية بناءً على المعلمات المقدمة.",
  execute
};
