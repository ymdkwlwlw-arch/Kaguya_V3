import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "آنيا",
  author: "kaguya project",
  role: "member",
  description: "Generates voice from text using Voicevox.",
  
  execute: async function ({ api, event, args }) {
    try {
      const text = args.join(" ");
      if (!text) {
        api.sendMessage("❗ | كيفية التعامل : *آنيا <نص>", event.threadID);
        return;
      }

      // Translation from Arabic to English
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

      const waitingMessage = await api.sendMessage("⚙️ | جاري المعالجة...", event.threadID);

      const response = await axios.get(`https://joshweb.click/new/voicevox-synthesis?id=1&text=${encodeURIComponent(translatedText)}`, {
        responseType: 'arraybuffer'
      });

      const downloadDirectory = process.cwd();
      const filePath = path.join(downloadDirectory, 'cache', 'voice_message.wav');
      fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

api.setMessageReaction("🎙️", event.messageID, (err) => {}, true);

      await api.sendMessage({
        body: `voice message:`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      });

      // Remove the waiting message
      api.unsendMessage(waitingMessage.messageID);
    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
  }
};
