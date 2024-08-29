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
    var data = await Economy.getBalance(event.senderID);
    var money = data.money;
    if (money < 1000) {
      api.sendMessage("⚠️ | تحتاج أولا أن تعطي المهر اللذي يقدر ب 1000 دولار جرب هدية ربما يكون يوم حظك 🙂", event.threadID, event.messageID);
    } else {
      var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
      var tle = tl[Math.floor(Math.random() * tl.length)];

      let dataa = await api.getUserInfo(event.senderID);
      let namee = await dataa[event.senderID].name;

      let loz = await api.getThreadInfo(event.threadID);
      var participants = loz.participantIDs;

      // احصل على جنس المرسل
      var senderGender = dataa[event.senderID].gender;

      // اختر الجنس المعاكس
      var oppositeGender = senderGender == 2 ? 1 : senderGender == 1 ? 2 : null;

      // قم بتصفية المشاركين استنادًا إلى الجنس المعاكس
      var potentialMatches = [];
      for (let id of participants) {
        let userData = await api.getUserInfo(id);
        let gender = userData[id].gender;

        if (gender == oppositeGender && id !== event.senderID && id !== api.getCurrentUserID()) {
          potentialMatches.push(id);
        }
      }

      // إذا لم نجد أي شريك مناسب، أعد محاولة
      if (potentialMatches.length === 0) {
        return api.sendMessage("⚠️ | لم أتمكن من العثور على شريك مناسب لك في المجموعة 😢", event.threadID, event.messageID);
      }

      var id = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
      let name = await (await api.getUserInfo(id))[id].name;

      var arraytag = [];
      arraytag.push({ id: event.senderID, tag: namee });
      arraytag.push({ id: id, tag: name });

      var gender = oppositeGender == 2 ? "ولد 🧑" : oppositeGender == 1 ? "فتاة 👩" : "ألوان";

      await Economy.decrease(event.senderID, { money: money - 500 });

      let Avatar = (await axios.get(`https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(`${cwd}/cache/avt.png`, Buffer.from(Avatar, "utf-8"));
      
      let Avatar2 = (await axios.get(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(`${cwd}/cache/avt2.png`, Buffer.from(Avatar2, "utf-8"));

      var imglove = [];
      imglove.push(fs.createReadStream(`${cwd}/cache/avt.png`));
      imglove.push(fs.createReadStream(`${cwd}/cache/avt2.png`));

      var msg = {
        body: `✅ | إكتمل الإقتران \n『💗』وشريكك هو 『💗』: ${gender}\n 『🔗』تقييم العلاقة الرابطة بينكم 『🔗』: ${tle}\n` + namee + " " + "💗" + " " + name,
        mentions: arraytag,
        attachment: imglove
      };

      return api.sendMessage(msg, event.threadID, event.messageID);
    }
  }
};
