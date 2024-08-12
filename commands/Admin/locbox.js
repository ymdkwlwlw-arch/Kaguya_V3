import sleep from "time-sleep";

export default {
  name: "تصفية",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "طرد الأعضاء بناءً على عدد الرسائل أو من قائمة الحظر",
  role: "admin",
  aliases: ["تصفية"],

  async execute({ api, args, event, message }) {
    const threadData = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();
    
    if (!threadData.adminIDs.includes(botID))
      return api.sendMessage("⚠️ | الرجاء إضافة البوت كآدمن في المجموعة لاستخدام هذا الأمر", event.threadID);

    if (!isNaN(args[0])) {
      api.sendMessage(`⚠️ | هل أنت متأكد أنك تريد طرد أعضاء المجموعة الذين لديهم أقل من ${args[0]} رسائل؟\nقم بالرد على هذه الرسالة ب "تم" من أجل التأكيد`, event.threadID, (err, info) => {
        if (!err) {
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "تصفية",
            unsend: true,
          });
        } else {
          console.error("Error sending message:", err);
        }
      });
    } else if (args[0] === "die") {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");
      const errors = [];
      const success = [];
      
      for (const user of membersBlocked) {
        if (user.type !== "User" && !threadInfo.adminIDs.includes(user.id)) {
          try {
            await api.removeUserFromGroup(user.id, event.threadID);
            success.push(user.id);
          } catch (e) {
            errors.push(user.name);
          }
          await sleep(700);
        }
      }

      let msg = "";
      if (success.length > 0)
        msg += `✅ | تمت الإزالة بنجاح ${success.length} حساب الأعضاء الذين تمت إزالتهم\n`;
      if (errors.length > 0)
        msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
      if (msg === "")
        msg += "✅ | لا يوجد أعضاء الذين تم تأمينهم";

      api.sendMessage(msg, event.threadID);
    } else {
      message.SyntaxError();
    }
  },

  onReply: async ({ api, event, reply }) => {
    if (reply.type === "pick" && event.senderID === reply.author) {
      if (event.body.trim().toLowerCase() === "تم") {
        const threadData = await threadsData.get(event.threadID);
        const botID = api.getCurrentUserID();
        const minimum = parseInt(reply.messageID.split(" ")[1]); // Extract minimum value from messageID or modify as needed
        const membersCountLess = threadData.members.filter(member =>
          member.count < minimum &&
          member.inGroup === true &&
          member.userID !== botID &&
          !threadData.adminIDs.includes(member.userID)
        );
        const errors = [];
        const success = [];
        
        for (const member of membersCountLess) {
          try {
            await api.removeUserFromGroup(member.userID, event.threadID);
            success.push(member.userID);
          } catch (e) {
            errors.push(member.name);
          }
          await sleep(700);
        }

        let msg = "";
        if (success.length > 0)
          msg += `✅ | تمت الإزالة بنجاح ${success.length} الأعضاء الذين لديهم أقل من ${minimum} رسالة\n`;
        if (errors.length > 0)
          msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
        if (msg === "")
          msg += `✅ | لا يوجد أعضاء لديهم أقل من ${minimum} رسالة`;

        api.sendMessage(msg, event.threadID);
      } else {
        api.sendMessage("⚠️ | تم الرفض، ليست لديك الصلاحيات للوصول إلى هذا الأمر.", event.threadID);
      }
    } else {
      api.sendMessage("⚠️ | تم الرفض، ليست لديك الصلاحيات للوصول إلى هذا الأمر.", event.threadID);
    }
  }
};
