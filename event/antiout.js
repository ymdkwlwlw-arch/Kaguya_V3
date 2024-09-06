let autoReAddEnabled = false; // افتراضياً، الميزة معطلة

async function execute({ api, event, Users, Threads }) {
  switch (event.logMessageType) {
    case "log:unsubscribe": {
      const { leftParticipantFbId } = event.logMessageData;
      
      if (leftParticipantFbId == api.getCurrentUserID()) {
        return; // إذا غادر البوت نفسه، لا تقم بأي شيء
      }

      // إذا كانت ميزة إعادة إضافة الأعضاء مفعلة
      if (autoReAddEnabled) {
        try {
          await api.addUserToGroup(leftParticipantFbId, event.threadID);
          await api.sendMessage("📎 | تـمـت إعـادة إضـافـة الـعـضـو بـنـجـاح إلـى الـمـجـمـوعـة", event.threadID);
        } catch (error) {
          console.error('Error re-adding user:', error);
        }
      } else {
        const farewellMessage = ``;
        await api.sendMessage(farewellMessage, event.threadID);
      }
      break;
    }
  }
}

export default {
  name: "التحكم_في_المغادرة",
  description: "التحكم في إعادة إضافة الأعضاء الذين يغادرون المجموعة.",
  execute,
};
