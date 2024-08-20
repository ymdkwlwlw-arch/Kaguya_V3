import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "لقطة",
  author: "HUSSEIN",
  role: "member",
  description: "Convert image to cartoon style.",

  execute: async ({ api, event }) => {
    
    api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
    // Get the input from the message body
    const inputLink = event.body.trim();

    // Check if the input starts with 'http' indicating it is a URL
    if (!inputLink.startsWith('http')) {
      return api.sendMessage('🛡️ | أرجوك أدخل رابط صورة صحيح.', event.threadID, event.messageID);
    }

    const apiURL = `https://www.noobs-api.000.pe/dipto/ss?url=${encodeURIComponent(inputLink)}`;
    const outPath = path.join(process.cwd(), 'generated_image.jpg');

    try {
      const response = await axios.get(apiURL, { responseType: 'arraybuffer' });
      fs.writeFileSync(outPath, response.data);
      console.log(`Image saved to ${outPath}`);
      
          api.setMessageReaction("📸", event.messageID, (err) => {}, true);
  
      api.sendMessage({
        body: '❍───────────────❍\n𝐷𝑂𝑁𝐸 𝑆𝑈𝐶𝐶𝐸𝑆𝑆𝐹𝑈𝐿𝐿𝑌\n❍───────────────❍',
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath)); // Clean up the file after sending

    } catch (error) {
      console.error('Error processing image:', error.message);
      api.sendMessage('🚧 | حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.', event.threadID, event.messageID);
    }
  }
};
