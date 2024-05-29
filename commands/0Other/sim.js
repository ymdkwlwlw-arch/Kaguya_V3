import axios from 'axios';

export default {
  name: "بريد",
  version: "1.0.0",
  role: "member",
  author: "Your Name",
  description: "قم بتوليد بريد مؤقت عن طريق 'انشاء' وقم ب معرفة محتواه عن طريق 'وارد'",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const subCommand = args[0];

    if (subCommand === 'انشاء') {
      try {
        const tempEmail = await generateTempEmail();
        api.sendMessage(`✅ | تم انشاء يريدك الالكتروني المؤقت بنجاح :\n\n${tempEmail}`, event.threadID, event.messageID);
      } catch (error) {
        api.sendMessage(`❌ |فشل في إنشاء البريد الإلكتروني المؤقت: ${error.message}`, event.threadID, event.messageID);
        console.error(error);
      }
    } else if (subCommand === 'وارد') {
      const email = args[1];

      if (!email) {
        api.sendMessage('⚠️ |يرجى  تقديم بريد إلكتروني للتحقق من صندوق الوارد.', event.threadID, event.messageID);
        return;
      }

      try {
        const inboxMessages = await getInbox(email);
        let inboxText = 'رسائل صندوق الوارد: 📬\n\n';

        inboxMessages.forEach(message => {
          inboxText += `📩 |المرسل: ${message.from}\n📨 الموضوع: ${message.subject}\n📝 الرسالة: ${message.body}\n\n========================================\n\n`;
        });

        api.sendMessage(inboxText, event.threadID, event.messageID);
      } catch (error) {
        api.sendMessage(`فشل في جلب رسائل صندوق الوارد: ${error.message}`, event.threadID, event.messageID);
        console.error(error);
      }
    } else {
      api.sendMessage(`أمر فرعي غير صالح. الاستخدام: ${module.exports.config.usages}`, event.threadID, event.messageID);
    }
  }
};

async function generateTempEmail() {
  try {
    const { data } = await axios.get('https://apis-samir.onrender.com/tempmail/get');

    if (data && data.email) {
      return data.email;
    } else {
      throw new Error('فشل في إنشاء البريد الإلكتروني المؤقت: استجابة غير صالحة من API');
    }
  } catch (error) {
    throw new Error('فشل في إنشاء البريد الإلكتروني المؤقت: ' + error.message);
  }
}

async function getInbox(email) {
  try {
    const { data } = await axios.get(`https://apis-samir.onrender.com/tempmail/inbox/${encodeURIComponent(email)}`);

    if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('فشل في جلب رسائل صندوق الوارد: استجابة غير صالحة من API');
    }
  } catch (error) {
    throw new Error('فشل في جلب رسائل صندوق الوارد: ' + error.message);
  }
}