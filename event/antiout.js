import axios from 'axios';

export default {
  name: "Re-add User",
  author: "مشروع كاغويا",
  role: "admin",
  description: "إعادة إضافة عضو إلى المجموعة عند مغادرتهم.",
  
  execute: async function ({ api, event }) {
    // Exit early if the bot itself has left the group
    if (event.logMessageData?.leftParticipantFbId === api.getCurrentUserID()) return;

    // Check if a participant has left the group
    if (event.logMessageData?.leftParticipantFbId) {
      const userId = event.logMessageData.leftParticipantFbId;
      const threadId = event.threadID;

      try {
        // Fetch user info
        const info = await api.getUserInfo(userId);
        const userName = info[userId]?.name;

        if (!userName) {
          throw new Error(`User name not found for ID: ${userId}`);
        }

        // Attempt to re-add the user to the group
        api.addUserToGroup(userId, threadId, (error) => {
          if (error) {
            api.sendMessage(`🚫 | فشل إعادة اضافة ${userName} الى المجموعة ❗`, threadId);
          } else {
            api.sendMessage(`✅ | تم اعادة اضافة  ${userName} الى المجموعة بنجاح !`, threadId);
          }
        });
      } catch (error) {
        console.error("Error fetching user info or re-adding user:", error);
        api.sendMessage(`An error occurred while trying to re-add the member.`, threadId);
      }
    }
  }
};
