import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import axios from "axios";

export default {
  name: "كاغويا",
  version: "1.0",
  author: "YourName",
  role: "member",
  description: "ترسل رسالة ترحيب عشوائية مع ملصق بناءً على الوقت الحالي.",
  aliases : ["بوت","أهلا"],
  execute: async ({ api, event }) => {
    const data = [
     
      "1747083968936188", 
      "1747090242268894",
      "1747089445602307",
      "1747085962269322",
      "1747084572269461",
      "1747092188935366", 
      "1747088982269020", "2041012539459553", "2041015422792598", "2041021119458695", "2041022286125245",
"2041022029458604",
"2041012539459553",
"2041012692792871",
"2041011836126290",
"2041012262792914",
  "2041015329459274" 
    ];
    const sticker = data[Math.floor(Math.random() * data.length)];
    const juswa = [
      "كيف الحال",
      "إسمي كاغويا ماهو اسمك",
      "اكتب قائمة أو أوامر",
      "أقوم بتحديث أوامري ماذا تفعل أنت",
      "لدي حوالي 177 أمر",
      "آمل أن تكون في حالة جيدة",
      "أتمنى أن أكون عند حسن ظنك",
      "أنا أعمل بدون رمز",
      "اكتب قائمة أو أوامر",
      "تفاعل معي بأمر شات",
      "مالذي تريد فعله تاليا",
      "أحبك، لا أعرف حقاً ماذا أقول",
      "استخدم تقرير للتواصل مع مطوري",
      "أنا كاغويا الكيوتة في خدمتك ☺️\nتفقد أوامري بكتابة قائمة أو أوامر",
      "هل تعرف أن اسم كاغويا مقتبس من أنمي {love is war}؟",
      "كاغويا تسلم عليك",
      "كاغويا عمتك تذكر هذا"
    ];
    const juswa1 = juswa[Math.floor(Math.random() * juswa.length)];

    const hours = moment.tz('Africa/Casablanca').format('HHmm');
    const session = (
      hours > "0001" && hours <= "0400" ? "صباح مشرق سعيد" : 
      hours > "0401" && hours <= "0700" ? "صباح سعيد" :
      hours > "0701" && hours <= "1000" ? "صباح سعيد" :
      hours > "1001" && hours <= "1100" ? "صباح سعيد" : 
      hours > "1100" && hours <= "1500" ? "مابعد ظهر سعيد" : 
      hours > "1501" && hours <= "1800" ? "مساء سعيد" : 
      hours > "1801" && hours <= "2100" ? "مساء سعيد" : 
      hours > "2101" && hours <= "2400" ? "نوم هانئ وخفيف وبدون كوابيس 😌" : 
      "خطأ"
    );

    try {
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;

      const msg = {
        body: `أهلاً يا ${userName}, أتمنى لك ${session}, ${juswa1}`,
        mentions: [{ tag: userName, id: event.senderID }]
      };

      api.sendMessage(msg, event.threadID, (e, info) => {
        if (e) {
          console.error("Error sending message:", e.message);
        } else {
          setTimeout(() => {
            api.sendMessage({ sticker }, event.threadID);
          }, 100);
        }
      }, event.messageID);
    } catch (error) {
      console.error("Error fetching user info:", error.message);
      api.sendMessage("حدث خطأ أثناء جلب معلومات المستخدم.", event.threadID, event.messageID);
    }
  }
};
