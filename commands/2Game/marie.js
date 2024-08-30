import axios from "axios";
import fs from "fs";

export default {
  name: "زواج",
  author: "kaguya project",
  role: "member",
  description: "يقوم بعملية الإقتران بين مستخدمين في المجموعة.",
  async execute({ api, event, args, Users, Threads, Economy }) {

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;

    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | تحتاج أولا أن تعطي المهر اللذي يقدر ب ${cost} دولار جرب هدية ربما يكون يوم حظك 🙂`, event.threadID);
    }

    // الخصم من الرصيد
    await Economy.decrease(cost, event.senderID);
    
    const cwd = process.cwd();
    const data = await Economy.getBalance(event.senderID);
    const money = data.money;

    if (money < 1000) {
      return api.sendMessage("⚠️ | تحتاج أولا أن تعطي المهر اللذي يقدر ب 1000 دولار جرب هدية ربما يكون يوم حظك 🙂", event.threadID, event.messageID);
    }

    const tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    const tle = tl[Math.floor(Math.random() * tl.length)];

    // الحصول على معلومات المرسل
    const senderInfo = await api.getUserInfo(event.senderID);
    const namee = senderInfo[event.senderID].name;
    const senderGender = senderInfo[event.senderID].gender;

    // الحصول على معلومات المجموعة
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs;

    // تصفية الأعضاء بناءً على الجنس المختلف
    const eligibleMembers = [];
    for (const memberId of members) {
      if (memberId !== event.senderID) {  // استبعاد المرسل
        const memberInfo = await api.getUserInfo(memberId);
        const memberGender = memberInfo[memberId].gender;
        if (memberGender !== senderGender) {
          eligibleMembers.push(memberId);
        }
      }
    }

    if (eligibleMembers.length === 0) {
      return api.sendMessage("لا يوجد أعضاء من الجنس الآخر في المجموعة ☹️💕😢", event.threadID, event.messageID);
    }

    // اختيار عضو عشوائي من الجنس الآخر
    const randomMemberId = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
    const randomMemberInfo = await api.getUserInfo(randomMemberId);
    const name = randomMemberInfo[randomMemberId].name;
    const gender = randomMemberInfo[randomMemberId].gender == 2 ? "ولد 🧑" : "فتاة 👩";

    // تنزيل صور المستخدمين
    const Avatar = (await axios.get(`https://graph.facebook.com/${randomMemberId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(`${cwd}/cache/avt.png`, Buffer.from(Avatar, "utf-8"));
    
    const Avatar2 = (await axios.get(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(`${cwd}/cache/avt2.png`, Buffer.from(Avatar2, "utf-8"));
    
    const imglove = [
      fs.createReadStream(`${cwd}/cache/avt.png`),
      fs.createReadStream(`${cwd}/cache/avt2.png`)
    ];

    // تحضير الرسالة والرد
    const arraytag = [
      { id: event.senderID, tag: namee },
      { id: randomMemberId, tag: name }
    ];

    const msg = {
      body: `✅ | إكتمل الإقتران \n وشريكك هو : ${gender}\nتقييم العلاقة الرابطة بينكم: ${tle}\n${namee} ❤️ ${name}`,
      mentions: arraytag,
      attachment: imglove
    };

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
