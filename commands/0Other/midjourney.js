const numberslst = {};

export default {
  name: "ارقام",
  author: "kaguya project",
  role: "عضو",
  description: "لعبة تخمين رقم بين 1 و 20.",

  execute: async ({ api, event }) => {
    if (!numberslst[event.threadID]) numberslst[event.threadID] = {};
    const s = event.senderID;
    numberslst[event.threadID].s = {
      a: true,
      b: getRandomNumber(1, 20),
      d: 0
    };

    // إعداد المعلومات للرد
    global.client.handler.reply.set(event.messageID, {
      author: event.senderID,
      type: "pick",
      name: "ارقام",
      unsend: false,
    });

    api.sendMessage('حسنًا، احزر رقما بين 1 و 20.', event.threadID);
  },

  onReply: async ({ api, event, reply }) => {
    const threadID = event.threadID;
    if (!numberslst[threadID] || !numberslst[threadID].s || reply.type !== "pick") return;

    const guess = parseInt(event.body);
    if (isNaN(guess) || guess < 1 || guess > 20) {
      api.sendMessage('الرجاء إدخال رقم صحيح بين 1 و 20.', threadID);
      return;
    }

    let { a, b, d } = numberslst[threadID].s;

    if (a && guess !== b) {
      numberslst[threadID].s.d = d + 1;
      if (guess > b) {
        api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);
        api.sendMessage("إحزر أقل من الرقم!", threadID);
      } else {
        api.setMessageReaction("⬆️", event.messageID, (err) => {}, true);
        api.sendMessage("إحزر أكثر من الرقم!", threadID);
      }
      return;
    }

    if (a && guess === b) {
      let rewardAmount, message;
      if (d < 10) {
        rewardAmount = 400;
        message = "عدد محاولاتك قليل جداً، أداء رائع!";
      } else {
        rewardAmount = 200;
        message = "محاولاتك كانت كثيرة قليلاً!";
      }

      await Economy.increase(rewardAmount, event.senderID);
      await Users.update(event.senderID, {
        other: {
          cooldowns: currentTime,
        },
      });

      api.setMessageReaction("🥳", event.messageID, (err) => {}, true);
      api.sendMessage(`كفوا! الرقم الصحيح هو ${b}.\n- ربحت ${rewardAmount} لأن ${message}\n- ${d} محاولة.`, threadID);

      numberslst[threadID].s = {};
    }
  }
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
