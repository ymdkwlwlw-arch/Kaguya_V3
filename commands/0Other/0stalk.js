import jimp from 'jimp';
import fs from 'fs';
import path from 'path';

async function getProfilePicture(userID) {
    const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const img = await jimp.read(url);
    const profilePath = path.join(process.cwd(), 'cache', `profile_${userID}.png`);
    await img.writeAsync(profilePath);
    return profilePath;
}

export default {
  name: "ايدي",
  author: "Kaguya Project",
  role: "member",
  description: "جلب معلومات العضو.",
  execute: async function({ api, event, args, Economy, Exp }) {
    try {
      const uid = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);
      const userInfo = await api.getUserInfo(parseInt(uid));
      
      if (!userInfo[uid]) {
        api.sendMessage(`⚠️ | قم بعمل منشن للشخص ما.`, event.threadID, event.messageID);
        return;
      }
      
      const { firstName, name, gender, profileUrl } = userInfo[uid];
      const userIsFriend = userInfo[uid].isFriend ? "✅ نعم" : "❌ لا";
      const isBirthdayToday = userInfo[uid].isBirthdayToday ? "✅ نعم" : "❌ لا";
      const profilePath = await getProfilePicture(uid);

      // استخدام Economy.getBalance لجلب الرصيد
      const balanceResult = await Economy.getBalance(uid);
      const money = balanceResult.data;

      // استخدام Exp.check لجلب نقاط الخبرة والمستوى
      const expResult = await Exp.check(uid);
      const userLevel = expResult.data.currentLevel;
      const userExp = expResult.data.exp;

      // تحديد التصنيف بناءً على مستوى الخبرة
      const rank = getRank(userLevel);

      const message = `
•——[معلومات]——•\n\n✨ مــﻋــڷــﯡمــاٺ ؏ــن : 『${firstName}』\n❏اسمك👤: 『${name}』\n❏جنسك♋: 『${gender === 1 ? "أنثى" : "ذكر"}』\n❏💰 رصيدك : 『${money}』 دولار\n❏🎖️ نقاط الخبرة : 『${userExp}』 نقطة\n❏📈 المستوى الحالي : 『${userLevel}』\n❏صديق؟: 『${userIsFriend}』\n❏عيد ميلاد اليوم؟: 『${isBirthdayToday}』\n❏🌟 المعرف  : 『${uid}』\n❏رابط البروفايل🔮: ${profileUrl}\n❏تصنيفك🧿: 『${rank}』`;

      api.sendMessage({
        body: message,
        attachment: fs.createReadStream(profilePath)
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error('Error:', err);
      api.sendMessage('❌ | حدث خطأ أثناء جلب المعلومات. الرجاء معاودة المحاولة في وقت لاحق.', event.threadID, event.messageID);
    }
  }
}

// دالة لتحديد تصنيف المستخدم بناءً على مستوى الخبرة
function getRank(level) {
  if (level >= 50) return 'خارق🥇';
  if (level >= 40) return '🥈عظيم';
  if (level >= 35) return '👑أسطوري';
  if (level >= 30) return 'نشط🔥 قوي';
  if (level >= 25) return '🌠نشط';
  if (level >= 20) return 'متفاعل🏅 قوي';
  if (level >= 15) return '🎖️متفاعل جيد';
  if (level >= 10) return '🌟متفاعل';
  if (level >= 8) return '✨لا بأس';
  if (level >= 6) return '👾مبتدأ';
  if (level >= 3) return '🗿صنم';
  return 'ميت⚰️';
}
