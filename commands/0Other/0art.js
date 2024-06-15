import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import FormData from 'form-data';

export default {
  name: "ارت",
  author: "kaguya project",
  role: "member",
  description: "توليد صورة أنمي بناء على النص المعطى وصورة مرفقة.",
  usages: "الرد على صورة مع النص التالي: ارت <وصف> | <موديل> | <التحكم>",
  cooldowns: 5,
  async execute({ api, event }) {
    const cacheFolderPath = path.join(process.cwd(), "cache");

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    try {
      // التأكد من وجود رد على رسالة تحتوي على صورة
      if (!event.messageReply) {
        await api.sendMessage("⚠️ | أرجوك ، قم بالرد على صورة من أجل المتابعة في عملية تحويل الصورة إلى ارت.", event.threadID, event.messageID);
        return;
      }

      const repliedMessage = event.messageReply;
      if (!repliedMessage.attachments.length) {
        await api.sendMessage("⚠️ | هذه ليست صورة أرجوك ، رد على صورة المرة المقبلة.", event.threadID, event.messageID);
        return;
      }

      const imageUrl = repliedMessage.attachments[0].url;
      const commandText = event.body.trim();
      const commandParts = commandText.split("|").map(part => part.trim());

      if (commandParts.length !== 3) {
        await api.sendMessage("⚠️ | صيغة خاطئة ، استخدم  : ارت <وصف> | <موديل> | <التحكم> \n ملاحظة لديك موديل من 1 إلى 3 و التحكم من 1 إلى 5", event.threadID, event.messageID);
        return;
      }

      const prompt = commandParts[0].trim();
      const model = parseInt(commandParts[1].trim());
      const control = parseInt(commandParts[2].trim());

      if (isNaN(model) || model < 1 || model > 3) {
        await api.sendMessage("⚠️ | الموديل يجب ان يكون بين  1 و 3.", event.threadID, event.messageID);
        return;
      }

      if (isNaN(control) || control < 1 || control > 5) {
        await api.sendMessage("⚠️ | التحكم يجب ان يكون بين  1 و 5.", event.threadID, event.messageID);
        return;
      }

      // ترجمة الوصف من العربية إلى الإنجليزية
      const translatedPrompt = await translateToEnglish(prompt);

      // تنزيل الصورة المرفقة
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      const formData = new FormData();
      formData.append('model', model);
      formData.append('control', control);
      formData.append('prompt', translatedPrompt);
      formData.append('image', Buffer.from(response.data, 'binary'), 'image.jpg');

      // طلب إنشاء الصورة
      const apiResponse = await axios.post('https://beb-anime-convert.onrender.com/generate-image', formData, {
        headers: { ...formData.getHeaders() },
        responseType: 'arraybuffer'
      });

      const imageBuffer = Buffer.from(apiResponse.data, 'binary');
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.jpg`);
      await fs.outputFile(imagePath, imageBuffer);

      // إرسال الصورة المولدة
      await api.sendMessage({
        attachment: fs.createReadStream(imagePath),
        body: `Generated image based on: ${translatedPrompt}`
      }, event.threadID, event.messageID);

      // حذف الصورة المؤقتة
      await fs.remove(imagePath);

    } catch (error) {
      console.error('Error processing art command:', error);
      await api.sendMessage("⚠️ | Error processing art command. Please try again later.", event.threadID, event.messageID);
    }
  }
};

// دالة الترجمة
async function translateToEnglish(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error("خطأ في ترجمة النص:", error);
    return text; // إرجاع النص كما هو في حالة وجود خطأ في الترجمة
  }
    }
