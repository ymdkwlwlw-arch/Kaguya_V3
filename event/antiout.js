import axios from 'axios';

export default {
  name: "إعادة_إضافة_الأعضاء",
  description: "يتم استدعاء هذا الأمر لإعادة إضافة الأعضاء الذين يغادرون المجموعة.",
  async execute({ api, event }) {
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
            api.sendMessage(`✅ | وضع الحماية النشطة، تم إعادة إضافة ${name} إلى المجموعة بنجاح!`, threadID);
          }
        });
      } catch (err) {
        console.error('Error:', err);
        api.sendMessage('❌ | حدث خطأ أثناء محاولة إعادة إضافة العضو.', threadID);
      }
    }
  }
};
