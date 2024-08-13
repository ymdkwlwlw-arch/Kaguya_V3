import sleep from "time-sleep";

// دالة للتحقق من حالة الحظر
const find = async (uid) => {
  try {
    let user;

    if (databaseType === "json") {
      user = Users.find((i) => i?.uid === uid);
    } else if (databaseType === "mongodb") {
      user = await Users.find({ uid });
    }

    return {
      status: Boolean(user),
      data: user || null,
      banned: user?.data?.banned?.status ?? false, // التحقق من حالة الحظر
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      data: "Đã xảy ra lỗi hệ thống!",
      banned: false, // عند حدوث خطأ، قم بإرجاع حالة الحظر كـ false
    };
  }
};

export default {
  name: "kick",
  author: "YourName",
  role: "admin",
  description: "Kick users based on message count or blocked status.",
  execute: async function ({ api, args, event, Threads, Users }) {
    // جلب جميع معلومات المحادثات
    const threadData = (await Threads.find(event.threadID))?.data?.data;

    if (!threadData || !threadData.adminIDs.includes(api.getCurrentUserID())) {
      return api.sendMessage("⚠️ | يحتاج البوت أن يكون آدمن لإستخدام هذه الميزة", event.threadID);
    }

    if (!isNaN(args[0])) {
      return api.sendMessage(`⚠️ | هل أنت متأكد أنك تريد طرد أعضاء المجموعة الذين لديهم أقل من ${args[0]} رسائل?\nقم بالرد على هذه الرسالة ب "تم" من أجل التأكيد`, event.threadID, (err, info) => {
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
      const membersBlocked = threadData.userInfo.filter(user => user.type !== "User");
      const errors = [];
      const success = [];

      for (const user of membersBlocked) {
        if (user.type !== "User" && !threadData.adminIDs.includes(user.id)) {
          try {
            const userData = await find(user.id);
            if (userData.banned) {
              continue; // تخطي الأعضاء المحظورين
            }
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
      return api.sendMessage(msg, event.threadID);
    } else {
      return api.sendMessage("❌ | استخدام غير صحيح. يرجى تقديم عدد الرسائل أو 'die'.", event.threadID);
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

        const minimum = parseInt(reply.messageID.split("_")[1], 10); // Assuming the minimum messages are encoded in the reply.messageID

        const membersCountLess = thread.userInfo.filter(member =>
          member.count < minimum &&
          member.inGroup &&
          member.userID !== api.getCurrentUserID() &&
          !thread.adminIDs.includes(member.userID)
        );

        const errors = [];
        const success = [];

        for (const member of membersCountLess) {
          try {
            const userData = await find(member.userID);
            if (userData.banned) {
              continue; // تخطي الأعضاء المحظورين
            }
            await api.removeUserFromGroup(member.userID, event.threadID);
            success.push(member.userID);
          } catch (e) {
            errors.push(member.userID);
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
        return api.sendMessage(msg, event.threadID);
      } else {
        return api.sendMessage("❌ | تم الرفض: رد غير صحيح", event.threadID);
      }
    } else {
      return api.sendMessage("❌ | تم الرفض: ليست لديك الصلاحيات للوصول الى هذا الأمر", event.threadID);
    }
  }
};
