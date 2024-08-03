class antiboximage {
  name = "حماية_الصورة";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "حماية المجموعة من تغيير صورتها!";
  role = "admin";
  aliases = [];

  async execute({ event, Threads }) {
    try {
      // العثور على بيانات المجموعة باستخدام معرّف المجموعة
      var threads = (await Threads.find(event.threadID))?.data?.data;

      // التحقق من حالة حماية الصورة وتبديلها
      var status = threads?.anti?.imageBox ? false : true;

      // تحديث بيانات المجموعة مع الحالة الجديدة
      await Threads.update(event.threadID, {
        anti: {
          imageBox: status,
        },
      });

      // إرسال رسالة تأكيد بالنتيجة
      return kaguya.reply(`تم ${status ? "تشغيل" : "❌ إطفاء ✅"} ميزة حماية الصورة للمجموعة`);
    } catch (err) {
      console.error(err);
      return kaguya.reply("❌ | لقد حدث خطأ غير متوقع!");
    }
  }
}

export default new antiboximage();
