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
    
    const threadInfo = await api.getThreadInfo(event.threadID);
    const members = threadInfo.participantIDs.filter(id => id !== event.senderID);

    // الحصول على جنس المرسل
    const senderInfo = await api.getUserInfo(event.senderID);
    const senderGender = senderInfo[event.senderID].gender;
    
    // فلترة الأعضاء حسب الجنس
    const eligibleMembers = members.filter(memberID => {
      return api.getUserInfo(memberID).then(info => {
        const memberGender = info[memberID].gender;
        // في حالة كان الجنس هو أنثى، اختر الأعضاء الذكور
        if (senderGender === 1) {
          return memberGender === 2;
        }
        // في حالة كان الجنس هو ذكر، اختر الأعضاء الإناث
        return memberGender === 1;
      });
    });

    if (eligibleMembers.length === 0) {
      return api.sendMessage('لا يوجد أعضاء من الجنس الآخر في المجموعة ☹️💕😢', event.threadID);
    }

    const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
    const randomMemberID = eligibleMembers[randomIndex];
    const randomMemberInfo = await api.getUserInfo(randomMemberID);
    const randomMemberName = randomMemberInfo[randomMemberID].name;
    const randomMemberGender = randomMemberInfo[randomMemberID].gender;
    const randomMemberGenderText = randomMemberGender === 1 ? 'فتاة 👩' : 'ولد 🧑';

    // الاستمرار في الكود الأصلي بعد اختيار العضو المناسب
    const dataa = await api.getUserInfo(event.senderID);
    const namee = dataa[event.senderID].name;

    const Avatar = (await axios.get(`https://graph.facebook.com/${randomMemberID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(`${process.cwd()}/cache/avt.png`, Buffer.from(Avatar, "utf-8"));
    const Avatar2 = (await axios.get(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(`${process.cwd()}/cache/avt2.png`, Buffer.from(Avatar2, "utf-8"));

    const imglove = [
      fs.createReadStream(`${process.cwd()}/cache/avt.png`),
      fs.createReadStream(`${process.cwd()}/cache/avt2.png`)
    ];

    const tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    const tle = tl[Math.floor(Math.random() * tl.length)];

    const msg = {
      body: `✅ | إكتمل الإقتران \n وشريكك هو : ${randomMemberGenderText}\nتقييم العلاقة الرابطة بينكم: ${tle}\n${namee} ❤️ ${randomMemberName}`,
      mentions: [
        { id: event.senderID, tag: namee },
        { id: randomMemberID, tag: randomMemberName }
      ],
      attachment: imglove
    };

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
