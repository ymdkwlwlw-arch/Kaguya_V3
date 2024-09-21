import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "تخيلي2",
  author: "Your Name",
  role: "admin",
  description: "توليد الصور باستخدام الذكاء الاصطناعي بروديا باستعمال برومبت و رقم الموديل",
  aliases:["prodia"],
  execute: async ({ message, api, args, event }) => {
    const text = args.join(' ');

    if (!text) {
      return api.sendMessage("⚠️ | قم بادخال وصف بعدها | ثم رقم الموديل لديك من 1 إلى 56", event.threadID, event.messageID);
    }

    // Translate Arabic input to English
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const translatedText = translationResponse?.data?.[0]?.[0]?.[0] || text;

    const [prompt, model] = translatedText.split('|').map((text) => text.trim());
    const models = model || "2";
    let baseURL = `https://c-v3.onrender.com/v1/prodia?prompt=${prompt}&model=${models}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(baseURL);
      const images = response.data.results;

      if (!images || images.length === 0) {
        throw new Error("No images found in the response");
      }

      const cacheDir = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const imagePaths = await Promise.all(images.map(async (img, index) => {
        const imagePath = path.join(cacheDir, `generated_image_${index}.jpg`);
        const imageStream = await global.utils.getStreamFromPath(imagePath);
        fs.writeFileSync(imagePath, imageStream);
        return fs.createReadStream(imagePath);
      }));

      api.sendMessage({
        body: `✅ | تـم بـنـجـاح \n🧿 | رقـم الـمـوديـل : ${models}`,
        attachment: imagePaths
      }, event.threadID, event.messageID, async (err) => {
        if (err) console.error(err);
      });

    } catch (error) {
      console.error("Error processing request: ", error);
      api.sendMessage("There was an error processing your request.", event.threadID, event.messageID);
    } finally {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  }
};
