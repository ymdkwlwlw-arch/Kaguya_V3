export default {
  name: "تعديل",
  author: "Your Name",
  role: "member",
  description: "يقوم بإرسال رسالة ثم يعدلها بعد 5 ثوانٍ.",
  
  async execute({ api, event }) {
    // دالة تعديل الرسالة
    const editMessage = (messageID, newMessageContent) => {
      api.editMessage({ body: newMessageContent }, messageID, (err) => {
        if (err) {
          api.sendMessage("فشل في تعديل الرسالة!", event.threadID);
        } else {
          api.sendMessage("تم تعديل الرسالة بنجاح!", event.threadID);
        }
      });
    };

    // دالة الإرسال
    const sendMessage = (message) => {
      api.sendMessage(message, event.threadID, (err, messageInfo) => {
        if (err) {
          api.sendMessage("فشل في إرسال الرسالة!", event.threadID);
        } else {
          // تعديل الرسالة بعد 5 ثوانٍ كمثال
          setTimeout(() => {
            editMessage(messageInfo.messageID, "تم تعديل هذه الرسالة بعد 5 ثوانٍ.");
          }, 5000);
        }
      });
    };

    // تنفيذ الكود
    sendMessage("هذه رسالة سيتم تعديلها بعد 5 ثوانٍ.");
  }
};
