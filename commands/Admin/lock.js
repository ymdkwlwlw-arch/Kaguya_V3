async function execute({ api, event, args }) {
  const command = args[0];
  
  if (command === "تشغيل") {
    autoReAddEnabled = true;
    api.setMessageReaction("🔒", event.messageID, (err) => {}, true);
  
    await api.sendMessage(" ✅ | تم تفعيل ميزة عدم المغادرة", event.threadID);
  } else if (command === "إيقاف") {
    autoReAddEnabled = false;
    api.setMessageReaction("🔓", event.messageID, (err) => {}, true);
  
    await api.sendMessage(" 🚫 | تم تعطيل ميزة عدم مغادرة المجموعة", event.threadID);
  } else {
    await api.sendMessage(" ⚠️ | يرجى استخدام إما 'تشغيل' أو 'إيقاف' للتحكم في الميزة.", event.threadID);
  }
}

export default {
  name: "قفل",
  role:"admin",
  description: "تشغيل أو إيقاف ميزة إعادة الأعضاء الذين يغادرون.",
  execute,
};
