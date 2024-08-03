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
    const eligibleMembers = (await Promise.all(members.map(memberID => api.getUserInfo(memberID)))).filter(memberInfo => {
      const memberGender = memberInfo[Object.keys(memberInfo)[0]].gender;
      return senderGender === 1 ? memberGender === 2 : memberGender === 1;
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

    // الحصول على اسم المرسل
    const dataa = await api.getUserInfo(event.senderID);
    const namee = dataa[event.senderID].name;

    // تحميل الأڤاتار
    const avatarBuffer = (await axios.get(`https://graph.facebook.com/${randomMemberID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    const avatarBuffer2 = (await axios.get(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;

    // رابط الصورة بين الأڤاتار
    const customImageURL = args[0] || 'https://i.imgur.com/mIQ2pry.jpeg'; // استخدام الرابط الأول من args أو رابط افتراضي
    const customImageBuffer = (await axios.get(customImageURL, { responseType: "arraybuffer" })).data;

    // حفظ الأڤاتار وصورة الرابط
    fs.writeFileSync(`${process.cwd()}/cache/avt1.png`, Buffer.from(avatarBuffer));
    fs.writeFileSync(`${process.cwd()}/cache/avt2.png`, Buffer.from(avatarBuffer2));
    fs.writeFileSync(`${process.cwd()}/cache/customImage.png`, Buffer.from(customImageBuffer));

    // إعداد الرسالة
    const msg = {
      body: `✅ | إكتمل الإقتران \n وشريكك هو : ${randomMemberGenderText}\n${namee} ❤️ ${randomMemberName}`,
      mentions: [
        { id: event.senderID, tag: namee },
        { id: randomMemberID, tag: randomMemberName }
      ],
      attachment: [
        fs.createReadStream(`${process.cwd()}/cache/avt1.png`),
        fs.createReadStream(`${process.cwd()}/cache/customImage.png`),
        fs.createReadStream(`${process.cwd()}/cache/avt2.png`)
      ]
    };

    // تنظيف الملفات بعد إرسال الرسالة
    setTimeout(() => {
      fs.unlinkSync(`${process.cwd()}/cache/avt1.png`);
      fs.unlinkSync(`${process.cwd()}/cache/avt2.png`);
      fs.unlinkSync(`${process.cwd()}/cache/customImage.png`);
    }, 60000); // تأخير لتنظيف الملفات بعد 60 ثانية

    return api.sendMessage(msg, event.threadID, event.messageID);
  }
};
