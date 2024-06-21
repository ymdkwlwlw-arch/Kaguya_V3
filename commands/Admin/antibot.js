import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "إضافة أمر جديد",
  author: "kaguya project",
  role: "admin",
  description: "يضيف أمرًا جديدًا من خلال تنزيل كوده من رابط معين وحفظه في ملف معين.",

  execute: async ({ api, event, args }) => {
    if (args.length !== 2) {
      api.sendMessage("يرجى تقديم الرابط واسم ملف الأمر.", event.threadID, event.messageID);
      return;
    }

    const url = args[0];
    const fileName = args[1];
    const filePath = path.join(process.cwd(), 'commands', '0Other', fileName);

    try {
      const response = await axios.get(url);
      const code = response.data;

      fs.writeFile(filePath, code, (err) => {
        if (err) {
          console.error('Error writing file:', err);
          api.sendMessage("فشل في إضافة الأمر.", event.threadID, event.messageID);
        } else {
          api.sendMessage(`تم إضافة الأمر "${fileName}" بنجاح!`, event.threadID, event.messageID);
        }
      });
    } catch (error) {
      console.error('Error downloading code:', error);
      api.sendMessage("فشل في تنزيل كود الأمر.", event.threadID, event.messageID);
    }
  }
};
