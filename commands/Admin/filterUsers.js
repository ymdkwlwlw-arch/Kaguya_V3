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
      const [length] = args.map(Number);

      if (isNaN(length) || length <= 0) {
        return kaguya.reply(" ⚠️ | ادخل عدد الأعضاء المراد تصفيتهم");
      }

      const threads = (await Threads.getAll()).data;
      const findThreads = threads.filter((thread) => thread.data.members < length);

      if (!findThreads.length) {
        return kaguya.reply(` ⚠️ | لم يتم إيجاد في المجموعة اقل من ${length} عضو`);
      }

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
