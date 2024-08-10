export default {
  name: "مستواي",
  author: "اسمك هنا",
  cooldowns: 5,
  description: "يعرض نقاط الخبرة الخاصة بك أو لأي شخص آخر!",
  role: "member",
  aliases: ["الخبرة"],
  async execute({ api, event, Exp, args }) {
    try {
      let targetID = event.senderID; // افتراضيًا، نبدأ بنقاط الخبرة للمستخدم الحالي

      // التحقق مما إذا كان هناك رد على شخص آخر
      if (event.messageReply) {
        targetID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        // التحقق مما إذا تم ذكر شخص آخر في الرسالة
        targetID = Object.keys(event.mentions)[0];
      }

      // جلب نقاط الخبرة
      const expResponse = await Exp.check(targetID);

      if (!expResponse.status) {
        return api.sendMessage(`❌ | حدث خطأ: ${expResponse.data}`, event.threadID);
      }

      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID].name;
      const exp = expResponse.data; // نقاط الخبرة للمستخدم

      let replyMessage = `نقاط الخبرة الخاصة بـ ${targetID === event.senderID ? "ك" : ` ${userName}`} هي: ${exp}`;

      // قم بإرسال الرد
      return api.sendMessage(replyMessage, event.threadID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ | لقد حدث خطأ، رجاءً أعد المحاولة لاحقًا!", event.threadID);
    }
  },
};
