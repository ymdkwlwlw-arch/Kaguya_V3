export default {
  name: "تصفية",
  author: "Hussein Yacoubi",
  role: "admin",
  description: "تصفية المستخدمين في المجموعة الذين لديهم 0 رسالة.",

  execute: async function ({ api, event }) {
    try {
      const { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);
      let successCount = 0;
      let failCount = 0;
      const filteredUsers = [];

      // جمع المستخدمين الذين لديهم 0 رسالة
      for (const user of userInfo) {
        if (user.messageCount === 0) {
          filteredUsers.push(user.id);
        }
      }

      // تحقق إذا كان البوت هو آدمن في المجموعة
      const isBotAdmin = adminIDs.map((a) => a.id).includes(api.getCurrentUserID());

      if (filteredUsers.length === 0) {
        api.sendMessage("🛡️ | مجموعتك لا تحتوي على أي أعضاء غير نشطين.", event.threadID);
      } else {
        api.sendMessage(`تصفية ${filteredUsers.length} أعضاء غير نشطين (0 رسالة).`, event.threadID, async () => {
          if (isBotAdmin) {
            api.sendMessage("🧹 | جاري بدء التصفية...\n\n", event.threadID, async () => {
              for (const userID of filteredUsers) {
                try {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  await api.removeUserFromGroup(parseInt(userID), event.threadID);
                  successCount++;
                } catch (error) {
                  failCount++;
                }
              }

              api.sendMessage(`✅ | تم تصفية ${successCount} عضو بنجاح.`, event.threadID, () => {
                if (failCount !== 0) {
                  api.sendMessage(`❌ | فشل في تصفية ${failCount} عضو.`, event.threadID);
                }
              });
            });
          } else {
            api.sendMessage("❌ | البوت ليس آدمن، لذا لا يمكنه بدء عملية التصفية.", event.threadID);
          }
        });
      }
    } catch (error) {
      console.error('Error during filtering:', error);
      api.sendMessage("حدث خطأ أثناء التصفية. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
    }
  }
};