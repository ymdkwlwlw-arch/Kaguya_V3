export default {
  name: "تحويل",
  author: "Thiệu Trung Kiên",
  cooldowns: 50,
  description: "يحاول تحويل المال من مستخدم إلى آخر.",
  role: "member",
  aliases: ["trans", "إرسال"],
  execute: async ({ api, event, Users, Threads, Economy }) => {
    let targetUID;
    const args = event.body.split(' ');

    // التحقق مما إذا كان هناك رد على رسالة
    if (event.messageReply) {
      targetUID = event.messageReply.senderID; // الحصول على معرف المرسل للرسالة التي يتم الرد عليها
    } else {
      targetUID = args[1]; // الحصول على معرف المستخدم من الرسالة نفسها
    }

    const coins = parseInt(args[0], 10); // افتراض أن الكمية هي العنصر الأول

    // التحقق من صحة المدخلات
    if (isNaN(coins) || coins <= 0 || !targetUID) {
      return api.sendMessage("⚠️ | يرحى ادخالها بالتنسيق التالي \nتحويل <الكمية> <معرف المستخدم>\nأو الرد على رسالة المستخدم لتحديده.", event.threadID, event.messageID);
    }

    try {
      // تنفيذ عملية التحويل
      const response = await Economy.pay(coins, targetUID);

      // الحصول على معلومات المستخدمين
      const userinfoSender = await api.getUserInfo(event.senderID);
      const userinfoTarget = await api.getUserInfo(targetUID);

      const senderName = userinfoSender[event.senderID]?.name || "المرسل";
      const targetName = userinfoTarget[targetUID]?.name || "المستلم";

      // إرسال رسالة نجاح
      const successMessage = `✅ | تم بنجاح تحويل مبلغ ${coins} دولار من طرف ${senderName} إلى ${targetName} بنجاح.`;
      return api.sendMessage(successMessage, event.threadID, event.messageID);
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
