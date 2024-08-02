import fs from 'fs';
import path from 'path'; // تأكد من استيراد مكتبة path

class RestrictCommand {
  name = "تقييد";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "تقييد أو إلغاء تقييد البوت";
  role = "admin"; // Only admins can execute this command
  aliases = [];

  async execute({api, event, args }) {
    try {
      const [action] = args;
      const isAdmin = global.client.config.ADMIN_IDS.includes(event.senderID);

      if (!isAdmin) {
        return api.sendMessage("⚠️ | ليس لديك الإذن لاستخدام هذا الأمر!", event.threadID); // تأكد من استخدام api.sendMessage
      }

      if (action === "تفعيل") {
        global.client.setConfig({ botEnabled: true });
        await this.updateBotNickname("》✅《 ❃ ➠ بوت مفعل", event.threadID, event.senderID);
        return api.sendMessage("✅ | تم تفعيل إستخدام البوت !", event.threadID);
      }

      if (action === "تعطيل") {
        global.client.setConfig({ botEnabled: false });
        await this.updateBotNickname("》❌《 ❃ ➠ بوت مقيد", event.threadID, event.senderID);
        return api.sendMessage("❌ | تم تعطيل إستخدام البوت !", event.threadID);
      }

      return api.sendMessage("⚠️ | استخدم الأمر بشكل صحيح: تقييد تفعيل | تعطيل", event.threadID);
    } catch (err) {
      console.log(err);
    }
  }

  async updateBotNickname(nickname, threadID, senderID) {
    try {
      await api.changeNickname(nickname, threadID, senderID); // تأكد من أن api.changeNickname موجود ومتعرف
    } catch (err) {
      console.error("Error updating bot nickname:", err);
    }
  }

  // Update the configuration file
  async setConfig(newConfig) {
    try {
      const configPath = path.join(process.cwd(), 'config.js');
      const configContent = `export default ${JSON.stringify(newConfig, null, 2)};`;
      fs.writeFileSync(configPath, configContent);
    } catch (err) {
      console.error("Error updating configuration file:", err);
    }
  }
}

export default new RestrictCommand();
