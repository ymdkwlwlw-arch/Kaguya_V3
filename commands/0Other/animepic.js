import axios from 'axios';
import fs from 'fs';
import path from 'path';

let isEnabled = true; // متغير للتحكم في تشغيل/إيقاف الميزة

// الدالة لتنفيذ الأوامر بناءً على حالة الميزة
async function execute({ api, event }) {
  if (!isEnabled) {
    return api.sendMessage("🔒 | ميزة إعادة إضافة الأعضاء غير مفعلّة في الوقت الحالي.", event.threadID);
  }

  const { logMessageData, threadID } = event;
  const leftParticipantFbId = logMessageData?.leftParticipantFbId;

  // التحقق مما إذا كان العضو الذي غادر هو البوت نفسه
  if (leftParticipantFbId === api.getCurrentUserID()) return;

  if (leftParticipantFbId) {
    try {
      // الحصول على معلومات العضو الذي غادر
      const info = await api.getUserInfo(leftParticipantFbId);
      const name = info[leftParticipantFbId]?.name || "Unknown";

      // محاولة إعادة إضافة العضو إلى المجموعة
      api.addUserToGroup(leftParticipantFbId, threadID, (error) => {
        if (error) {
          api.sendMessage(`❌ | فشل في إعادة إضافة العضو ${name} إلى المجموعة!`, threadID);
        } else {
          api.sendMessage(`✅ | وضع الحماية مفعلة ، تم إعادة إضافة ${name} إلى المجموعة بنجاح!`, threadID);
        }
      });
    } catch (err) {
      console.error('Error:', err);
      api.sendMessage('❌ | حدث خطأ أثناء محاولة إعادة إضافة العضو.', threadID);
    }
  }
}

// الأمر لتفعيل أو تعطيل الميزة
async function toggleFeature({ api, event, args }) {
  const { threadID, messageID } = event;
  const command = args[0];

  if (!command || !['enable', 'disable'].includes(command)) {
    return api.sendMessage("⚠️ | استخدم الأمر بشكل صحيح: `تفعيل` لتفعيل الميزة أو `تعطيل` لتعطيلها.", threadID, messageID);
  }

  if (command === 'enable') {
    isEnabled = true;
    return api.sendMessage("✅ | ميزة إعادة إضافة الأعضاء تم تفعيلها.", threadID, messageID);
  } else if (command === 'disable') {
    isEnabled = false;
    return api.sendMessage("🚫 | ميزة إعادة إضافة الأعضاء تم تعطيلها.", threadID, messageID);
  }
}

export default {
  name: "قفل",
  description: "يتم استدعاء هذا الأمر لإعادة إضافة الأعضاء الذين يغادرون المجموعة.",
  execute,
  toggleFeature
};
