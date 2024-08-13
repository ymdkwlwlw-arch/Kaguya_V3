import sleep from "time-sleep";

export default {
  name: "طرد",
  author: "YourName",
  role: "admin",
  description: "Kick users based on message count or blocked status.",
  execute: async function ({ api, args, event, Threads, Users }) {
    const threadData = (await Threads.find(event.threadID))?.data?.data;

    if (!threadData || !threadData.adminIDs.includes(api.getCurrentUserID())) {
      return api.sendMessage("⚠️ | يحتاج البوت أن يكون آدمن لإستخدام هذه الميزة", event.threadID);
    }

    if (!isNaN(args[0])) {
      return api.sendMessage(`⚠️ | هل أنت متأكد أنك تريد طرد أعضاء المجموعة الذين لديهم أقل من ${args[0]} رسائل؟\nقم بالرد على هذه الرسالة ب "تم" من أجل التأكيد`, event.threadID, (err, info) => {
        if (err) {
          console.error("Error sending confirmation message:", err);
        } else {
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "تصفية",
            unsend: true,
          });
        }
      });
    } else if (args[0] === "die") {
      // استخدم Users.find للحصول على معلومات المستخدمين
      const usersData = await Users.find();

      const membersBlocked = usersData.filter(user => user.data.banned.status === true);
      const errors = [];
      const success = [];

      for (const user of membersBlocked) {
        if (!threadData.adminIDs.includes(user.uid)) {
          try {
            await api.removeUserFromGroup(user.uid, event.threadID);
            success.push(user.uid);
          } catch (e) {
            errors.push(user.data.name);
          }
          await sleep(700);
        }
      }

      let msg = "";
      if (success.length > 0)
        msg += `✅ | تمت الإزالة بنجاح ${success.length} حساب من الأعضاء المحظورين\n`;
      if (errors.length > 0)
        msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
      if (msg === "")
        msg += "✅ | لا يوجد أعضاء محظورين";
      return api.sendMessage(msg, event.threadID);
    } else {
      return api.sendMessage("❌ | استخدام غير صحيح. يرجى تقديم عدد الرسائل أو 'die'.", event.threadID);
    }
  },

  onReply: async ({ api, event, reply, Threads, Users }) => {
    if (reply.type === "pick" && event.senderID === reply.author) {
      if (event.body.trim().toLowerCase() === "تم") {
        const threadData = (await Threads.find(event.threadID))?.data?.data;

        if (!threadData || !threadData.adminIDs.includes(event.senderID)) {
          return api.sendMessage("❌ | تم الرفض: ليست لديك الصلاحيات للوصول الى هذا الأمر", event.threadID);
        }

        const minimum = parseInt(reply.messageID.split("_")[1], 10);

        // استخدم Users.find للحصول على معلومات المستخدمين
        const usersData = await Users.find();

        const membersCountLess = usersData.filter(member =>
          member.data.exp < minimum &&
          member.data.type === "friend" && // استخدم نوع الصداقة لتصفية الأعضاء
          !threadData.adminIDs.includes(member.uid)
        );

        const errors = [];
        const success = [];

        for (const member of membersCountLess) {
          try {
            await api.removeUserFromGroup(member.uid, event.threadID);
            success.push(member.uid);
          } catch (e) {
            errors.push(member.data.name);
          }
          await sleep(700);
        }

        let msg = "";
        if (success.length > 0)
          msg += `✅ | تمت الإزالة بنجاح ${success.length} من الأعضاء الذين لديهم أقل من ${minimum} رسالة\n`;
        if (errors.length > 0)
          msg += `❌ | حدث خطأ وتعذر طرد ${errors.length} من الأعضاء:\n${errors.join("\n")}\n`;
        if (msg === "")
          msg += `✅ | لا يوجد أعضاء لديهم أقل من ${minimum} رسالة`;
        return api.sendMessage(msg, event.threadID);
      } else {
        return api.sendMessage("❌ | تم الرفض: رد غير صحيح", event.threadID);
      }
    } else {
      return api.sendMessage("❌ | تم الرفض: ليست لديك الصلاحيات للوصول الى هذا الأمر", event.threadID);
    }
  }
};
