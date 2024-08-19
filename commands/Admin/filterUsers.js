import sleep from "time-sleep";

class LocBox {
  constructor() {
    this.name = "تصفية";
    this.author = "Arjhil Dacayanan";
    this.cooldowns = 60;
    this.description = "تصفية الأعضاء حسب عدد محدد";
    this.role = "owner";
    this.aliases = [];
  }

  async execute({ api, event, Threads, args }) {
    try {
      // الحصول على بيانات المجموعة الحالية والتحقق من صلاحيات البوت
      const threadData = (await Threads.find(event.threadID))?.data?.data;
      if (!threadData.adminIDs.includes(api.getCurrentUserID())) {
        return api.sendMessage(" ⚠️ | يحتاج البوت أن يكون آدمن لإستخدام هذه الميزة", event.threadID);
      }

      // التحقق من صحة الرقم المدخل
      const [length] = args.map(Number);
      if (isNaN(length) || length <= 0) {
        return kaguya.reply(" ⚠️ | ادخل عدد الأعضاء المراد تصفيتهم");
      }

      // البحث عن المجموعات التي تحتوي على أقل من العدد المحدد من الأعضاء
      const threads = (await Threads.getAll()).data;
      const findThreads = threads.filter((thread) => thread.data.members < length);

      // إذا لم يتم العثور على أي مجموعة تتطابق مع الشرط
      if (!findThreads.length) {
        return kaguya.reply(` ⚠️ | لم يتم إيجاد في المجموعة اقل من ${length} عضو`);
      }

      // إزالة البوت من المجموعات التي تحتوي على أقل من العدد المحدد من الأعضاء
      for (const threadData of findThreads) {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadData.threadID);
        await sleep(1000);
      }
    } catch (error) {
      console.error(error);
      return kaguya.reply("An unexpected error occurred!");
    }
  }
}

export default new LocBox();
