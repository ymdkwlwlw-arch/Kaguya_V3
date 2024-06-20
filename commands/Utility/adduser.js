import axios from "axios";

export default {
  name: "ضفي",
  author: "kaguya project",
  role: "admin",
  description: "إضافة مستخدم إلى المجموعة أو الدردشة الجماعية باستخدام معرف المستخدم أو رابط الملف الشخصي.",
  
  execute: async ({ api, event, args }) => {
    try {
      if (args.length === 0) {
        return api.sendMessage("⚠️ | يرجى تقديم معرف المستخدم أو رابط لإضافة مستخدم إلى المجموعة.", event.threadID, event.messageID);
      }

      const target = args[0].trim(); // نفترض أن معرف المستخدم أو الرابط هو أول عنصر في القائمة

      // التحقق مما إذا كان الهدف هو معرف مستخدم أو رابط
      const userIDPattern = /^[0-9]+$/;
      const linkPattern = /\/(user|profile|groups)\/([a-zA-Z0-9._]+)\/?/;

      let userID;
      if (userIDPattern.test(target)) {
        userID = target;
      } else {
        const match = target.match(linkPattern);
        if (!match || match.length < 3) {
          return api.sendMessage("⚠️ | تنسيق معرف المستخدم أو الرابط غير صالح.", event.threadID, event.messageID);
        }
        userID = match[2];
      }

      // إضافة المستخدم إلى المجموعة أو الدردشة الجماعية
      api.addUserToGroup(userID, event.threadID, err => {
        if (err) {
          console.warn("فشل في إضافة المستخدم:", err);
          api.sendMessage("⚠️ | فشل في إضافة المستخدم. يرجى التحقق من معرف المستخدم أو الرابط والمحاولة مرة أخرى.", event.threadID, event.messageID);
        } else {
          api.sendMessage("✅ | تم إضافة المستخدم بنجاح.", event.threadID, event.messageID);
        }
      });
    } catch (error) {
      console.error("حدث خطأ غير متوقع:", error);
      api.sendMessage("⚠️ | حدث خطأ غير متوقع أثناء محاولة إضافة المستخدم. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    }
  }
};
