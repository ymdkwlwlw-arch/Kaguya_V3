class antiboxnickname {
  name = "حماية_الكنية";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "حماية المجموعة من تغيير كنية الأعضاء!";
  role = "admin";
  aliases = [];

  async execute({ event, Threads }) {
    try {
      // العثور على بيانات المجموعة
      var threads = (await Threads.find(event.threadID))?.data?.data;

      // تحديد حالة الحماية الحالية وتبديلها
      var status = threads?.anti?.nicknameBox ? false : true;
      await Threads.update(event.threadID, {
        anti: {
          nicknameBox: status,
        },
      });

      // إرسال رسالة تأكيد
      return kaguya.reply(`تم ${status ? "تشغيل" : "❌ إطفاء ✅"} ميزة الحماية من تغيير كنية الأعضاء`);
    } catch (err) {
      console.error(err);
      return kaguya.reply("❌ | لقد حدث خطأ غير متوقع!");
    }
  }
}

export default new antiboxnickname();
