import moment from "moment-timezone";

const kickCommand = {
  name: "تصفية",
  version: "1.0",
  author: "kaguya project",
  role: "admin",
  description: "تصفية أعضاء المجموعة بناءً على عدد الرسائل أو حالة الحظر.",
  aliases: [""],
  execute: async ({ api, event, args, threadsData, message }) => {
    const threadData = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();

    // التأكد من أن البوت هو مسؤول
    if (!threadData.adminIDs.includes(botID)) {
      return api.sendMessage("⚠️ | الرجاء إضافة الروبوت كمسؤول للمجموعة لاستخدام هذا الأمر", event.threadID, event.messageID);
    }

    // التحقق إذا كان المدخل رقم للتصفية بناءً على عدد الرسائل
    if (!isNaN(args[0])) {
      api.sendMessage(`⚠️ | هل أنت متأكد أنك تريد حذف أعضاء المجموعة الذين لديهم أقل من ${args[0]} رسائل?\nقم بالتفاعل على هذه الرسالة للتأكيد`, event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "reply",
          name: "تصفية",
          unsend: false,
          minimum: Number(args[0])
        });
      });
    } 
    // التصفية بناءً على حالة الحظر
    else if (args[0] == "حظر") {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");
      const errors = [];
      const success = [];

      for (const user of membersBlocked) {
        if (user.type !== "User" && !threadInfo.adminIDs.some(id => id == user.id)) {
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
      if (success.length > 0) {
        msg += `✅ | تمت الإزالة بنجاح ${success.length} حساب الأعضاء الذين تمت إزالتهم\n`;
      }
      if (errors.length > 0) {
        msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
      }
      if (msg === "") {
        msg += "✅ | لا يوجد أعضاء الذين تم تأمينهم";
      }
      api.sendMessage(msg, event.threadID, event.messageID);
    } else {
      api.sendMessage("⚠️ | الرجاء إدخال قيمة صحيحة لتصفية الأعضاء بناءً على عدد الرسائل أو 'حظر' لتصفية الأعضاء المحظورين.", event.threadID, event.messageID);
    }
  },

  events: async ({ api, event }) => {
    var reaction = ["✅"];
    if (event.reaction && event.senderID == api.getCurrentUserID() && reaction.includes(event.reaction)) {
      kaguya.unsend(event.messageID);
    }
  },

  onReply: async ({ api, event, Reaction, threadsData }) => {
    const { minimum = 1, author } = Reaction;
    if (event.userID != author) {
      return;
    }

    const threadData = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();
    const membersCountLess = threadData.members.filter(member =>
      member.count < minimum &&
      member.inGroup == true &&
      member.userID != botID &&
      !threadData.adminIDs.some(id => id == member.userID)
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
    if (success.length > 0) {
      msg += `✅ | تمت الإزالة بنجاح ${success.length} الأعضاء الذين لديهم أقل من ${minimum} رسالة\n`;
    }
    if (errors.length > 0) {
      msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
    }
    if (msg === "") {
      msg += `✅ | لا يوجد أعضاء لديهم أقل من ${minimum} رسالة`;
    }
    api.sendMessage(msg, event.threadID, event.messageID);
  }
};

export default kickCommand;

// Helper function to add delay between API calls
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
                                                              }
