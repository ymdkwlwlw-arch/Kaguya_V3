import axios from 'axios';

export default {
  name: "احسب",
  author: "Kaguya Project",
  role: "member",
  description: "يعرض إحصاءات مختلفة حول المجموعة الحالية.",
  
  async execute({ api, Threads, Users, event, args }) {
    const { threadID, messageID, participantIDs } = event;
    const input = args.join();
    const nameMen = [];
    const gendernam = [];
    const gendernu = [];
    const nope = [];

    try {
      let threadInfo = await api.getThreadInfo(threadID);
      for (let z in threadInfo.userInfo) {
        const gioitinhone = threadInfo.userInfo[z].gender;
        if (gioitinhone == "MALE") {
          gendernam.push(gioitinhone);
        } else if (gioitinhone == "FEMALE") {
          gendernu.push(gioitinhone);
        } else {
          nope.push(gioitinhone);
        }
      }

      const threadList = [];
      const inbox = await api.getThreadList(150, null, ['INBOX']);
      const list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
      for (const groupInfo of list) {
        threadList.push({ id: groupInfo });
      }

      const listLeave = [];
      const archivedInbox = await api.getThreadList(100, null, ['ARCHIVED']);
      for (const groupInfo of archivedInbox) {
        listLeave.push({ id: groupInfo });
      }

      const threadData = (await Threads.getData(threadID)).threadInfo;
      const boxget = await Threads.getAll(['threadID']);
      const userget = await Users.getAll(['userID']);

      const sendMessage = (msg) => api.sendMessage(msg, threadID, messageID);

      if (!input) {
        sendMessage(`أرجوك قم بإدخال بعض الفئات \n\nكيفية الإستعمال ؟\nاحسب الفئات*\n\nالفئات المتوفرة:\n\nالرسائل, المسؤولين, الأعضاء, ذكور, إناث, ألوان, الجميع, كل_المستخدمين, بيانات_المجموعة, عدد_المغادرات`);
      } else if (input === "الرسائل") {
        sendMessage(`هذه المجموعة لديها ${threadInfo.messageCount} رسالة`);
      } else if (input === "المسؤولين") {
        sendMessage(`المجموعة لديها  ${threadData.adminIDs.length} مسؤول`);
      } else if (input === "الأعضاء") {
        sendMessage(`هذه المجموعة لديها ${participantIDs.length} عضو`);
      } else if (input === "ذكور") {
        sendMessage(`هذه المجموعة لديها ${gendernam.length} ذكر`);
      } else if (input === "إناث") {
        sendMessage(`هذه المجموعة لديها ${gendernu.length} أنثى`);
      } else if (input === "ألوان") {
        sendMessage(`هذه المجموعة لديها ${nope.length} عضو شاذ`);
      } else if (input === "الجميع") {
        sendMessage(`الإجمالي: ${threadList.length} مجموعة تستعمل البوت`);
      } else if (input === "كل_المستخدمين") {
        sendMessage(`الإجمالي: ${userget.length} مستخدم يستعمل البوت`);
      } else if (input === "بيانات_المجموعة") {
        sendMessage(`الإجمالي ${boxget.length} مجموعة دردشة[البيانات] التي إستخدمها البوت`);
      } else if (input === "عدد_المغادرات") {
        sendMessage(`الإجمالي هو: ${listLeave.length} شخص قد غادر من المجموعة`);
      } else {
        sendMessage("الفئة غير معروفة. يرجى إدخال فئة صحيحة.");
      }
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.", threadID, messageID);
    }
  }
};
