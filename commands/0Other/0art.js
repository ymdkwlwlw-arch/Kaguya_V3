import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "ارت",
  author: "Samir Œ",
  role: "member",
  description: "Convert image to cartoon style.",
  
  execute: async function ({ api, args, event }) {
    try {
      const imageLink = event.messageReply?.attachments?.[0]?.url;

      if (!imageLink) {
        return api.sendMessage('Please reply to an image.', event.threadID, event.messageID);
      }

      try {
        const imgurResponse = await axios.get(`https://samirxpikachu.onrender.com/telegraph?url=${encodeURIComponent(imageLink)}&senderId=${event.senderID}`);

        if (!imgurResponse.data.success) {
          const errorMessage = imgurResponse.data.error;

          if (errorMessage === 'Limit Exceeded') {
            return api.sendMessage('Limit exceeded, try again after 2 hours.', event.threadID, event.messageID);
          } else if (errorMessage === 'Access Forbidden') {
            return api.sendMessage('You are banned because of trying to change credits. Contact admin: [Admin ID](https://www.facebook.com/samir.oe70)', event.threadID, event.messageID);
          }
        }

        const imgur = imgurResponse.data.result.link;
        const filter = args[0];
        const apiUrl = `https://samirxpikachu.onrender.com/cartoon?url=${encodeURIComponent(imgur)}&model=${filter || 5}&apikey=richixsamir`;

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        const downloadDirectory = process.cwd();
        const filePath = path.join(downloadDirectory, 'cache', 'cartoonized_image.png');
        fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

        const imageStream = fs.createReadStream(filePath);

        await api.sendMessage({ attachment: imageStream }, event.threadID, event.messageID);
        
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(error);
        return api.sendMessage('Skill issues', event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage('Unknown error', event.threadID, event.messageID);
    }
  }
};
