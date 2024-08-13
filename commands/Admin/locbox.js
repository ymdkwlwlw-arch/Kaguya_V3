import sleep from "time-sleep";

export default {
  name: "تصفية",
  author: "YourName",
  role: "admin",
  description: "Kick users based on message count or blocked status.",
  execute: async function ({ api, args, event, Threads, Users }) {
    // جلب جميع معلومات المحادثات
    const { data } = await Threads.getAll();
    const thread = data.find(t => t.threadID === event.threadID);

    if (!thread || !thread.adminIDs.includes(api.getCurrentUserID())) {
      return api.sendMessage("⚠️ | الرجاء إضافة البوت كآدمن في المجموعة لاستخدام هذا الأمر", event.threadID);
    }

    if (!isNaN(args[0])) {
      const minimumMessages = parseInt(args[0], 10);
      return api.sendMessage(`⚠️ | هل أنت متأكد أنك تريد طرد أعضاء المجموعة الذين لديهم أقل من ${minimumMessages} رسالة ؟\nقم بالرد على هذه الرسالة ب "تم" من أجل التأكيد`, event.threadID, (err, info) => {
        if (err) {
          console.error("Error sending confirmation message:", err);
        } else {
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "تصفية",
            minimumMessages: minimumMessages, // تخزين الحد الأدنى للرسائل
            unsend: true,
          });
        }
      });
    } else if (args[0] === "die") {
      const membersBlocked = thread.userInfo.filter(user => user.type !== "User");
      const errors = [];
      const success = [];

      for (const user of membersBlocked) {
        if (user.type !== "User" && !thread.adminIDs.includes(user.id)) {
          try {
            // تحقق من حالة الحظر قبل الطرد
            const userData = await Users.get(user.id);
            if (userData && userData.isBanned) {
              await api.removeUserFromGroup(user.id, event.threadID);
              success.push(user.id);
            } else {
              errors.push(user.name);
            }
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
      return api.sendMessage(msg, event.threadID);
    } else {
      return api.sendMessage("❌ | استخدام غير صحيح. يرجى تقديم عدد الرسائل أو \"موت\".", event.threadID);
    }
  },

  onReply: async ({ api, event, reply, Threads, Users }) => {
    // التحقق من أن الشخص الذي يرد هو نفس الشخص الذي أرسل الأمر الأصلي
    if (reply.type === "pick" && event.senderID === reply.author) {
      if (event.body.trim().toLowerCase() === "تم") {
        const { data } = await Threads.getAll();
        const thread = data.find(t => t.threadID === event.threadID);

        if (!thread || !thread.adminIDs.includes(event.senderID)) {
          return api.sendMessage("❌ | تم الرفض: ليست لديك الصلاحيات للوصول الى هذا الأمر", event.threadID);
        }

        const minimumMessages = reply.minimumMessages; // استخدام الحد الأدنى للرسائل المخزنة

        const membersCountLess = thread.userInfo.filter(member =>
          member.count < minimumMessages &&
          member.inGroup &&
          member.userID !== api.getCurrentUserID() &&
          !thread.adminIDs.includes(member.userID)
        );

        const errors = [];
        const success = [];

        for (const member of membersCountLess) {
          try {
            await api.removeUserFromGroup(member.userID, event.threadID);
            success.push(member.userID);
          } catch (e) {
            errors.push(member.userID);
          }
          await sleep(700);
        }

        let msg = "";
        if (success.length > 0)
          msg += `✅ | تمت الإزالة بنجاح ${success.length} الأعضاء الذين لديهم أقل من ${minimumMessages} رسالة\n`;
        if (errors.length > 0)
          msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
        if (msg === "")
          msg += `✅ | لا يوجد أعضاء لديهم أقل من ${minimumMessages} رسالة`;
        return api.sendMessage(msg, event.threadID);
      } else {
        return api.sendMessage("❌ | تم الرفض: رد غير صحيح", event.threadID);
      }
    } else {
      return api.sendMessage("❌ | تم الرفض: ليست لديك الصلاحيات للوصول الى هذا الأمر", event.threadID);
    }
  }
};
