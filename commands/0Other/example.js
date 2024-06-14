import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { shorten } from 'tinyurl';

export default {
  name: "نيجي",
  version: "1.0.0",
  author: "مشروع كاغويا",
  description: "جلب صورة باستخدام الذكاء الاصطناعي بناءً على النص المدخل",
  role: "member",
  usages: "<وصف الصورة> | <رقم الموديل 1-26> | <النسبة 1-4>",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const ratios = ["1:1", "16:9", "4:5", "9:16"];
    const cacheFolderPath = path.join(process.cwd(), "cache");

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    try {
      if (args.length === 0) {
        await api.sendMessage("⚠️ | يرجى تقديم وصف للصورة، رقم الموديل من 1 إلى 26، ومن أجل النسبة اختر من هذه النسب التالية: 1:1, 16:9, 4:5, 9:16. مثال: *نيجي فتاة جميلة | 2 | 1:1", event.threadID, event.messageID);
        return;
      }

      const input = args.join(" ").split("|").map(arg => arg.trim());
      if (input.length < 3) {
        await api.sendMessage("⚠️ | صيغة غير صحيحة. يرجى استخدام الصيغة التالية: *نيجي <وصف الصورة> | <رقم الموديل> | <النسبة>", event.threadID, event.messageID);
        return;
      }

      const [prompt, model, ratio] = input;
      const modelNo = parseInt(model, 10);
      const ratioIndex = parseInt(ratio, 10) - 1;

      if (isNaN(modelNo) || modelNo < 1 || modelNo > 26) {
        await api.sendMessage("⚠️ | رقم موديل غير صالح. يرجى تقديم رقم بين 1 و 26.", event.threadID, event.messageID);
        return;
      }

      if (isNaN(ratioIndex) || ratioIndex < 0 || ratioIndex > 3) {
        await api.sendMessage(`⚠️ | نسبة غير صالحة. يرجى تقديم رقم بين 1 و 4 يقابل النسب: 1:1, 16:9, 4:5, 9:16.`, event.threadID, event.messageID);
        return;
      }

      // Translate the prompt from Arabic to English
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

      const selectedRatio = ratios[ratioIndex];
      const startTime = Date.now();
      const w = await api.sendMessage(`⏳ | جاري معالجة طلبك: الوصف: ${translatedPrompt}، الموديل: ${modelNo}، نسبة العرض إلى النسبة: ${selectedRatio}، يرجى الانتظار...`, event.threadID, event.messageID);

      const apiUrl = `https://vyro-ai.onrender.com/generate-image?model=${modelNo}&aspect_ratio=${encodeURIComponent(selectedRatio)}`;
      const res = await axios.post(apiUrl, { prompt: translatedPrompt }, { responseType: 'arraybuffer' });

      if (res.status !== 200) {
        throw new Error("فشل في توليد الصورة.");
      }

      const imageBuffer = Buffer.from(res.data, 'binary');
      const imgPath = path.join(cacheFolderPath, 'generated_image.jpg');
      await fs.outputFile(imgPath, imageBuffer);

      const endTime = Date.now();
      const processingTimeInSeconds = ((endTime - startTime) / 1000).toFixed(2);

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      // Assuming we need to upload the image somewhere to get the URL
      // Here we use the assumption that image is uploaded and we have the URL
      const imageUrl = 'http://path.to.uploaded.image/generated_image.jpg'; // Replace with actual URL if you have a mechanism to upload

      shorten(imageUrl, async function (shortUrl) {
        await api.unsendMessage(w.messageID);
        await api.sendMessage({
          attachment: fs.createReadStream(imgPath),
          body: `✅ | تــــم تـــولــيــد الــصــورة بــنــجــاح \n: "${translatedPrompt}"\n❏ موديل : 『${modelNo}』\n📊 |❏ النسبة : ${selectedRatio}\n⏰ |❏ وقت المعالجة : 『${processingTimeInSeconds}』 ثانية\n📎 |❏ رابط الصورة : ${shortUrl}`,
        }, event.threadID, event.messageID);
      });
    } catch (error) {
      console.error(error);
      await api.sendMessage("⚠️ | فشل في توليد الصورة. يرجى المحاولة مرة أخرى لاحقاً.", event.threadID, event.messageID);
    } finally {
      await fs.remove(path.join(cacheFolderPath, 'generated_image.jpg'));
    }
  }
};
