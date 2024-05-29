import axios from 'axios';

const command = {
  name: "كاغويا",
  author: "Kaguya Project",
  role: "member",
  description: "يرد برسالة عشوائية مع ستيكر عند كتابة كلمة كاغويا.",

  async execute({ api, event, Threads }) {
    const { threadID, messageID, senderID, body } = event;

    // جلب معلومات المستخدم
    const userInfo = await api.getUserInfo(senderID);
    const senderName = userInfo[senderID]?.name || "عزيزي";

    // تحقق من وجود الكلمة المفتاحية "كاغويا"
    console.log("Checking for keyword in execute function"); // تتبع
    if (body.toLowerCase().includes("كاغويا")) {
      console.log("Keyword found in execute function"); // تتبع

      const stickers = [
        "1747083968936188", "1747090242268894", "1747089445602307", "1747085962269322",
        "1747084572269461", "1747092188935366", "1747088982269020", "2041012539459553",
        "2041015422792598", "2041021119458695", "2041022286125245", "2041022029458604",
        "2041012539459553", "2041012692792871", "2041011836126290", "2041012262792914",
        "2041015329459274"
      ];
      const messages = [
        "هل أكلت شيئا؟", "ماذا تفعل؟", "كيف حالك؟", "أنا كاغويا البوت، تشرفت بلقائك",
        "أقوم بتحديث أوامري، ماذا تفعل؟", "هل يمكنك التفاعل معي باستخدام أمر شات؟",
        "أنت جميلة جدا / أنت وسيم يا سيدتي/ يا سيدي", "أحبك مواححح */قبلة على جبهتك.",
        "هل أنت تشعر بالملل؟ تحدث مع المطور الخاص بي", "كيف حالك عزيزي",
        "تناول بعض الحلويات", "هل أنت بخير؟", "كن آمنا", "كن جيد"
      ];

      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // إرسال الرسالة العشوائية مع ستيكر
      api.sendMessage({
        body: `أهلا يا ${senderName}, ${randomMessage}`,
        mentions: [{
          tag: senderName,
          id: senderID
        }]
      }, threadID, (error, info) => {
        if (!error) {
          api.sendMessage({ sticker: randomSticker }, threadID);
        }
      }, messageID);
    }
  },

  handleEvent: async ({ event, api, Threads }) => {
    const { threadID, messageID, body, senderID } = event;

    // تحقق من وجود الكلمة المفتاحية "كاغويا"
    console.log("Checking for keyword in handleEvent function"); // تتبع
    if (body.toLowerCase().includes("كاغويا")) {
      console.log("Keyword found in handleEvent function"); // تتبع

      const stickers = [
        "1747083968936188", "1747090242268894", "1747089445602307", "1747085962269322",
        "1747084572269461", "1747092188935366", "1747088982269020", "2041012539459553",
        "2041015422792598", "2041021119458695", "2041022286125245", "2041022029458604",
        "2041012539459553", "2041012692792871", "2041011836126290", "2041012262792914",
        "2041015329459274"
      ];
      const messages = [
        "هل أكلت شيئا؟", "ماذا تفعل؟", "كيف حالك؟", "أنا كاغويا البوت، تشرفت بلقائك",
        "أقوم بتحديث أوامري، ماذا تفعل؟", "هل يمكنك التفاعل معي باستخدام أمر شات؟",
        "أنت جميلة جدا / أنت وسيم يا سيدتي/ يا سيدي", "أحبك مواححح */قبلة على جبهتك.",
        "هل أنت تشعر بالملل؟ تحدث مع المطور الخاص بي", "كيف حالك عزيزي",
        "تناول بعض الحلويات", "هل أنت بخير؟", "كن آمنا", "كن جيد"
      ];

      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // جلب معلومات المستخدم
      const userInfo = await api.getUserInfo(senderID);
      const senderName = userInfo[senderID]?.name || "عزيزي";

      // إرسال الرسالة العشوائية مع ستيكر
      api.sendMessage({
        body: `أهلا يا ${senderName}, ${randomMessage}`,
        mentions: [{
          tag: senderName,
          id: senderID
        }]
      }, threadID, (error, info) => {
        if (!error) {
          api.sendMessage({ sticker: randomSticker }, threadID);
        }
      }, messageID);
    }
  }
};

export default command;