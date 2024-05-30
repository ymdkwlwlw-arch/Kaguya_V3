import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

const configFilePath = path.join(cwd(), 'setup', 'config.json');

function loadConfig() {
  try {
    const data = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { ADMIN_IDS: [] };
  }
}

async function restart(event, api) {
  const config = loadConfig();
  const admins = config.ADMIN_IDS;
  const senderID = event.senderID;

  api.setMessageReaction("🚫", event.messageID, (err) => {}, true);

  if (!admins.includes(senderID)) {
    api.sendMessage('⛔️ | تم الرفض. أنت غير مسموح لك بإستخدام هذا الأمر.', event.threadID);
    return;
  }

  api.sendMessage('⚙️ | يتم الآن إعادة التشغيل...', event.threadID);
  setTimeout(() => {
    api.sendMessage('✅ | تم إعادة تشغيل البوت بنجاح.', event.threadID);
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }, 4000);
}

export default {
  name: "رستر",
  version: "1.0.0",
  author: "kaguya project",
  description: "إعادة تشغيل البوت",
  role: "member",
  cooldowns: 5,
  execute: async ({ api, event }) => {
    await restart(event, api);
  }
};
