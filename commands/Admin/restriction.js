import fs from 'fs-extra';
import path from 'path';

export default {
  name: "تقييد",
  author: "Your Name",
  cooldowns: 5,
  description: "تفعيل أو تعطيل البوت",
  role: "admin", // هذا الأمر يجب أن يكون متاحًا فقط للأدمن
  aliases: ["togglebot", "activate"],

  execute: async ({ api, event }) => {
    const { threadID, senderID, messageID, body } = event;
    const isEnabled = body.includes("تفعيل");

    // قراءة وتحديث حالة التفعيل في ملف الإعدادات
    const configFilePath = path.join(process.cwd(), 'config.json');
    const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    config.botEnabled = isEnabled;
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

    // تحديد اسم البوت بناءً على الحالة
    const botName = isEnabled ? "》✅《 ❃ ➠ بوت مفعل" : "》❌《 ❃ ➠ بوت مقيد";

    try {
      await api.changeNickname(botName, threadID, senderID);
      const status = isEnabled ? " ✅ | تم تفعيل تقييد استخدام البوت" : " ❌ | تم تعطيل استخدام البوت";
      return 

        api.setMessageReaction("🚫", event.messageID, (err) => {}, true);
  
     api.sendMessage(`${status}`, threadID, messageID);
    } catch (error) {
      console.error('Error changing nickname:', error);
      return api.sendMessage('🚧 | حدث خطأ أثناء تغيير كنية البوت.', threadID, messageID);
    }
  },
};
