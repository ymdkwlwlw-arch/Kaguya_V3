import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "ارسمي2",
  author: "kaguya project",
  role: "admin",
  description: "Generate images based on a prompt using an external service.",

  execute: async ({ api, commandName, event, args }) => {
    try {
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // Function to translate Arabic text to English
      const translateToEnglish = async (text) => {
        try {
          const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
          return translationResponse?.data?.[0]?.[0]?.[0];
        } catch (error) {
          console.error("Translation Error:", error);
          return text; // Return original text in case of translation failure
        }
      };

      // Extract prompt and ratio from arguments
      let prompt = args.join(' ');
      let ratio = '1:1';

      if (args.length > 0 && args.includes('-')) {
        const parts = args.join(' ').split('-').map(part => part.trim());
        if (parts.length === 2) {
          prompt = parts[0];
          ratio = parts[1];
        }
      }

      // Translate prompt from Arabic to English
      const englishPrompt = await translateToEnglish(prompt);

      // Fetch image URLs based on the translated prompt and ratio
      const response = await axios.get(`https://imagine-kshitiz-9vpt.onrender.com/kshitiz?prompt=${encodeURIComponent(englishPrompt)}&ratio=${encodeURIComponent(ratio)}`);
      const imageUrls = response.data.imageUrls;

      // Download and send images
      const imgData = [];
      const numberOfImages = 4;

      for (let i = 0; i < Math.min(numberOfImages, imageUrls.length); i++) {
        const imageUrl = imageUrls[i];
        const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.jpg`);
        await fs.promises.writeFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      // Send the images as attachments
      await api.sendMessage({ body: '╼╾─────⊹⊱⊰⊹─────╼╾\n𝔤𝔢𝔫𝔢𝔯𝔞𝔱𝔢𝔡 𝔰𝔲𝔠𝔠𝔢𝔰𝔰𝔣𝔲𝔩𝔩𝔶 ✅\n╼╾─────⊹⊱⊰⊹─────╼╾', attachment: imgData }, event.threadID, event.messageID);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
    }
  }
};