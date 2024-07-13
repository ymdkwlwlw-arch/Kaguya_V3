import axios from 'axios';

const command = {
  name: "كاغويا",
  author: "Kaguya Project",
  role: "member",
  description: "يدردش معك ويرد برسالة مع ستيكر عند الرد عليه.",
  aliases: ["بوت"],

  async execute({ api, event, Threads, Users }) {
    const { threadID, messageID, body, senderID } = event;

    // تحقق من وجود الكلمة المفتاحية "كاغويا"
    if (body.toLowerCase().includes("كاغويا")) {
      const stickers = [
        "1747083968936188", "1747090242268894", "1747089445602307", "1747085962269322",
        "1747084572269461", "1747092188935366", "1747088982269020", "2041012539459553",
        "2041015422792598", "2041021119458695", "2041022286125245", "2041022029458604",
        "2041012539459553", "2041012692792871", "2041011836126290", "2041012262792914",
        "2041015329459274"
      ];

      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];

      const messages = [
        "أهلا كيف الحال",
        "إسمي كاغويا ماهو اسمك",
        "اكتب قائمة او اوامر",
        "اقوم بتحديث اوامري ماذا تفعل انت",
        "مرحبا,لدي حوالي 177 امر",
        "آمل أن تكون في حالة جيدة",
        "أتمنى ان اكون عند حسن ظنك",
        "اهلا انا بوت كاغويا في خدمتك 👋",
        "نعم ماذا تريد 😒",

      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      try {
        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || "عزيزي المستخدم";

        const replyMessage = `${userName}, ${randomMessage}`;

        // إرسال الرسالة مع ستيكر
        api.sendMessage(replyMessage, threadID, (error, info) => {
          if (!error) {
            api.sendMessage({ sticker: randomSticker }, threadID);
          }
        }, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
      }
    }
  }
};

export default command;
