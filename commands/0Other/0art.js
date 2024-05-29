import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function execute({ api, event }) {
  if (event.type !== "message_reply" || !["photo", "sticker"].includes(event.messageReply.attachments[0].type)) {
    return api.sendMessage("الرجاء الرد على صورة أو ملصق.", event.threadID);
  }

  api.setMessageReaction("⚙️", event.messageID, null, true);

  const { width, height, url } = event.messageReply.attachments[0];
  const encodedUrl = encodeURIComponent(url);
  const artUrl = `https://app-lana-art-ec3a51aaff2b.herokuapp.com/caera/art?wid=${width}&hid=${height}&url=${encodedUrl}`;

  try {
    const response = await axios.get(artUrl, { responseType: "stream" });
    const imagePath = path.join(process.cwd(), "cache", "ccuy.png");
    const writer = fs.createWriteStream(imagePath);

    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: "✅ | تم تحويل الصورة بنجاح",
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, event.messageID);

      api.setMessageReaction("✅", event.messageID, null, true);
    });
  } catch (error) {
    console.error("Error processing image:", error);
    api.sendMessage("حدث خطأ أثناء معالجة الصورة.", event.threadID);
  }
}

export default {
  name: "ارت",
  author: "kaguya project",
  description: "يقوم بتحويل الصورة المرسلة إلى انمي.",
  execute,
};