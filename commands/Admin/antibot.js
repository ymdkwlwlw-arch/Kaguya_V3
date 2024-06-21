import axios from "axios";
import fs from "fs";

export default {
  name:"ضبط",
  author: "kaguya project",
  role: "admin",
  description: "يضيف أمرًا جديدًا من خلال تنزيل كوده من رابط معين وحفظه في ملف معين.",

  execute: async ({ api, event, args }) => {
    // التحقق من عدد الوسائط المقدمة
    if (args.length !== 1 && (event.type !== "message_reply" || event.messageReply.body.trim() === "")) {
      api.sendMessage("يرجى تقديم الرابط واسم الملف (إما عن طريق الرد على رسالة تحتوي على الرابط أو إدخالها مباشرة كوسائط).", event.threadID, event.messageID);
      return;
    }

    // الحصول على معرف المستخدم الحالي
    const currentUserID = api.getCurrentUserID();

    // إذا لم يكن هناك رد، افترض أن الوسائط تحتوي على الرابط واسم الملف
    let url, fileName;
    if (event.type === "message_reply" && event.messageReply.senderID === currentUserID) {
      url = event.messageReply.body.trim();
      fileName = args[0].trim();
    } else if (args.length === 2) {
      url = args[0].trim();
      fileName = args[1].trim();
    } else {
      api.sendMessage("يرجى تقديم الرابط واسم الملف بشكل صحيح.", event.threadID, event.messageID);
      return;
    }

    // تنزيل الكود وحفظه في ملف
    try {
      const response = await axios.get(url);
      const code = response.data;
      const filePath = `./commands/0Other/${fileName}`;

      fs.writeFile(filePath, code, (err) => {
        if (err) {
          console.error('Error:', err);
          api.sendMessage("فشل في إضافة الأمر.", event.threadID, event.messageID);
        } else {
          api.sendMessage(`تم إضافة الأمر "${fileName}" بنجاح!`, event.threadID, event.messageID);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("فشل في تنزيل كود الأمر.", event.threadID, event.messageID);
    }
  }
};
