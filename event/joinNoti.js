import axios from 'axios';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import jimp from 'jimp';

async function execute({ api, event, Users, Threads }) {
  switch (event.logMessageType) {
    case "log:unsubscribe": {
      const { leftParticipantFbId, reason } = event.logMessageData;
      if (leftParticipantFbId == api.getCurrentUserID()) {
        return;
      }
      const userInfo = await api.getUserInfo(leftParticipantFbId);
      const profileName = userInfo[leftParticipantFbId]?.name || "Unknown";
      const type = event.author == leftParticipantFbId ? "غادر المجموعة من تلقاء نفسه" : "تم طرده من قبل آدمن المجموعة";
      const farewellReason = getFarewellReason(reason);
      const membersCount = await api.getThreadInfo(event.threadID).then(info => info.participantIDs.length).catch(error => {
        console.error('Error getting members count:', error);
        return "Unknown";
      });
      const farewellMessage = `❏ إسم العضو 👤 : 『${profileName}』 \n❏ السبب 📝 : 『${type} - ${farewellReason}』\n❏ عدد الأعضاء الآن في المجموعة: ${membersCount}`;
      const profilePicturePath = await getProfilePicture(leftParticipantFbId);
      await sendWelcomeOrFarewellMessage(api, event.threadID, farewellMessage, profilePicturePath);
      break;
    }
    case "log:subscribe": {
      const { addedParticipants } = event.logMessageData;
      const botUserID = api.getCurrentUserID();
      const botAdded = addedParticipants.some(participant => participant.userFbId === botUserID);
      if (botAdded) {
        // إضافة البوت إلى مجموعة جديدة، لا تقم بإرسال رسالة الترحيب
        return;
      }

      // إرسال رسالة الترحيب للمستخدمين الآخرين
      let threadName = "Unknown";
      let membersCount = "Unknown";
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        if (threadInfo) {
          threadName = threadInfo.threadName || "Unknown";
          membersCount = threadInfo.participantIDs.length;
        }
      } catch (error) {
        console.error('Error getting thread info:', error);
      }

      const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
      const participantNames = [];
      for (const participant of addedParticipants) {
        const userInfo = await api.getUserInfo(participant.userFbId);
        const profileName = userInfo[participant.userFbId]?.name || "Unknown";
        participantNames.push(`『${profileName}』`);
      }
      const welcomeMessage = `✿━━━━━━━━━━━━━━━✿\n❏ أعضاء جدد إنضموا إلى المجموعة 🎉:\n${participantNames.join("\n")}\n❏ ترتيبك 🔢 : 『${membersCount}』\n❏ إسم المجموعة 🧭 : 『${threadName}』\n❏ 📅 | تاريخ الإنضمام : ${moment().tz("Africa/Casablanca").format("YYYY-MM-DD")}
❏ ⏰ | وقت الإنضمام : ${moment().tz("Africa/Casablanca").format("HH:mm:ss")}\n🔖 | لا تسئ اللفظ وإن ضاق بك الرد\n✿━━━━━━━━━━━━━━━✿`;
      await sendWelcomeOrFarewellMessage(api, event.threadID, welcomeMessage, "cache12/hello.gif");
      break;
    }
  }
}

async function sendWelcomeOrFarewellMessage(api, threadID, message, attachmentPath) {
  try {
    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(attachmentPath),
    }, threadID);
  } catch (error) {
    console.error('Error sending welcome or farewell message:', error);
  }
}

async function getProfilePicture(userID) {
  const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const img = await jimp.read(url);
  const profilePath = path.join(process.cwd(), 'cache', `profile_${userID}.png`);
  await img.writeAsync(profilePath);
  return profilePath;
}

function getFarewellReason(reason) {
  return reason === "leave" ? "ناقص واحد ناقص مشكلة 😉" : "لاتنسى تسكر الباب وراك 🙂";
}

export default {
  name: "ترحيب_ومغادرة",
  description: "يتم استدعاء هذا الأمر عندما ينضم شخص جديد إلى المجموعة أو يغادرها.",
  execute,
};
