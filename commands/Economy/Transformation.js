export default {
  name: "تحويل",
  author: "Thiệu Trung Kiên",
  cooldowns: 50,
  description: "يحاول تحويل المال من مستخدم إلى آخر.",
  role: "member",
  aliases: ["trans", "ارسال"],
  execute: async ({ api, event, Users, Threads, Economy }) => {
    // استخراج البيانات من الرسالة
    const args = event.body.split(' ');
    const coins = parseInt(args[1], 10);

    // التحقق من صحة عدد العملات
    if (isNaN(coins) || coins <= 0) {
      return api.sendMessage(" ⚠️ | يرحى إدخال كمية المال التي تريد ان تحولها \nمثال تحويل رد هلى رسالة\nتحويل @منشن كمية المال", event.threadID, event.messageID);
    }

    // تحديد المستخدم المستقبل بناءً على الرد أو المنشن
    const targetUID = event.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);

    if (targetUID === event.senderID) {
      return api.sendMessage("❌ | لا يمكنك ارسال المال لنفصديك قم بعمل منشن او رد على رسالته بمبلغ المال اللذي تريد تحويله", event.threadID, event.messageID);
    }

    try {
      // الحصول على أسماء المستخدمين
      const [senderInfo, receiverInfo] = await Promise.all([
        api.getUserInfo(event.senderID),
        api.getUserInfo(targetUID)
      ]);

      const senderName = senderInfo[event.senderID]?.name || "مجهول";
      const receiverName = receiverInfo[targetUID]?.name || "مجهول";

      // تنفيذ عملية التحويل
      const response = await Economy.pay(coins, targetUID);

      // إرسال رسالة تأكيد
      return api.sendMessage(
        `${response.data} \n\n✅ | تم تحويل ${formatCurrency(coins)} دولار من طرف ${senderName} إلى ${receiverName} بنجاح`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.log(error);
      return api.sendMessage("حدث خطأ أثناء محاولة تحويل المال.", event.threadID, event.messageID);
    }
  },
  events: async ({ api, event, Users, Threads, Economy }) => {
    // يمكن إضافة معالجة للأحداث هنا إذا لزم الأمر
  },
  onReply: async ({ api, event, reply, Users, Threads, Economy }) => {
    // يمكن إضافة معالجة للردود هنا إذا لزم الأمر
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // يمكن إضافة معالجة للتفاعلات هنا إذا لزم الأمر
  },
};
