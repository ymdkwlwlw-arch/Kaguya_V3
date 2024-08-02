import fs from 'fs';

class RestrictCommand {
  name = "تقييد";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "تقييد أو إلغاء تقييد البوت";
  role = "admin"; // Only admins can execute this command
  aliases = [];

  async execute({ event, args }) {
    try {
      const [action] = args;
      const isAdmin = global.client.config.ADMIN_IDS.includes(event.senderID);

      if (!isAdmin) {
        return kaguya.reply(" ⚠️ | ليس لديك الإذن لاستخدام هذا الأمر!");
      }

      if (action === "تفعيل") {
        global.client.setConfig({ botEnabled: true });
        await this.updateBotNickname("》✅《 ❃ ➠ بوت مفعل", event.threadID, event.senderID);
        return kaguya.reply(" ❌ | تم تعطيل تقييد إستخدام البوت !");
      }

      if (action === "تعطيل") {
        global.client.setConfig({ botEnabled: false });
        await this.updateBotNickname("》❌《 ❃ ➠ بوت مقيد", event.threadID, event.senderID);
        return kaguya.reply(" ✅ | تم تفعيل تقييد إستخدام البوت !");
      }

      return kaguya.reply(" ⚠️ | استخدم الأمر بشكل صحيح: تقييد تفعيل | تعطيل");
    } catch (err) {
      console.log(err);
    }
  }

  async updateBotNickname(nickname, threadID, senderID) {
    try {
      // Update the bot's nickname using api.changeNickname
      await api.changeNickname(nickname, threadID, senderID);
    } catch (err) {
      console.error("Error updating bot nickname:", err);
    }
  }
}

export default new RestrictCommand();
