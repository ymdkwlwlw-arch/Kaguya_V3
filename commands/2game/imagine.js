import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "تخيلي5",
  author: "HUSSEIN YACOUBI",
  role: "member",
  description: "قم بتوليد صور بالذكاء الاصطناعي حسب الموديل.",
  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const info = args.join(" ");
    
    if (!info) {
      return api.sendMessage("❗ | يرجى إدخال نص لتوليد الصورة بهذه الطريقة \n تخيلي5 | قط | هنا اكتب رقم من 1 الى 8", threadID, messageID);
    }

    const msg = info.split("|");
    const text = msg[0];
    const model = msg[1] || '1'; 
    const timestamp = new Date().getTime();

    try {
      let msgSend = await api.sendMessage("⏱️ | يرجى الانتظار...", threadID);
      
      // Translate the text from Arabic to English
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0] || text;

      const { data } = await axios.get(
        `https://www.samirxpikachu.run.place/sdxl/generate?prompt=${encodeURIComponent(translatedText)}&model=${model}`
      );

      const imageUrls = data.imageUrls[0];
      const imagePath = path.join(process.cwd(), 'cache', `image_${timestamp}.jpg`);

      // Create cache directory if not exists
      if (!fs.existsSync(path.dirname(imagePath))) {
        fs.mkdirSync(path.dirname(imagePath), { recursive: true });
      }

      // Download and save the image
      const response = await axios({
        url: imageUrls,
        responseType: 'stream'
      });
      response.data.pipe(fs.createWriteStream(imagePath));

      // Wait for the image to be fully downloaded
      await new Promise((resolve) => response.data.on('end', resolve));

      await api.unsendMessage(msgSend.messageID);

      if (fs.existsSync(imagePath)) {
        await api.sendMessage({
          body: `࿇ ══━━━✥◈✥━━━══ ࿇\n ✅ | تم توليد الصورة بنجاح\n📋 | البرومبت : "${text}" \n📎 | رابط الصورة بجودة HD : ${imageUrls}\n࿇ ══━━━✥◈✥━━━══ ࿇`,
          attachment: await global.utils.getStreamFromPath(imagePath)
        }, threadID, messageID);
      } else {
        throw new Error("فشل في جلب الصورة المولدة. يرجى التواصل مع مجموعة الإدارة لحل المشكلة. رابط المجموعة: https://www.facebook.com/groups/761805065901067/?ref=share");
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(" ❌ | حدث خطأ، يرجى المحاولة في وقت لاحق.", threadID, messageID);
    }
  },
};
