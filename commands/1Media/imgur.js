import axios from 'axios';

export default {
  name: "رابط2",
  author: "Hussein Yacoubi",
  role: "member",
  description: "رفع صورة إلى Imgur عند الرد على صورة في الرسالة.",

  execute: async function ({ api, event }) {
    try {
      // تحقق من وجود مرفق في الرسالة المستلمة
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage('⚠️ |يرجى الرد على صورة.', event.threadID, event.messageID);
      }

      // الحصول على رابط الصورة
      const imageUrl = event.messageReply.attachments[0].url;
      if (!imageUrl) {
        return api.sendMessage('لم يتم العثور على رابط للصورة.', event.threadID, event.messageID);
      }

      // طلب رفع الصورة إلى Imgur
      const response = await axios.get(`https://api.kenliejugarap.com/imgur/?imageLink=${encodeURIComponent(imageUrl)}`);

      // التعامل مع الخطأ إذا وجد
      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      // الحصول على رابط Imgur
      const imgurLink = response.data.link;
      return api.sendMessage(`${imgurLink}`, event.threadID, event.messageID);

    } catch (error) {
      console.error('Error uploading to Imgur:', error);
      return api.sendMessage('حدث خطأ أثناء رفع الصورة إلى Imgur. يرجى المحاولة مرة أخرى لاحقًا.', event.threadID, event.messageID);
    }
  }
};