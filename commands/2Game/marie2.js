import axios from "axios";
import fs from "fs-extra";
import jimp from "jimp";

export default {
  name: "زواج2",
  version: "1.0.1",
  role: "member",
  author: "Md Rajib",
  description: "يقوم بإقتران عشوائي بين المستخدمين في المجموعة مع نسبة توافق.",
  cooldowns: 5,

  async onLoad() {
    const { resolve } = global.nodemodule["path"];
    const { existsSync, mkdirSync } = fs;
    const { downloadFile } = global.utils;
    const dirMaterial = `${process.cwd()}/cache/`;
    const path = resolve(dirMaterial, 'pairing.png');

    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) {
      await downloadFile("https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png", path);
    }
  },

  async execute({ api, event, Users, Threads, Economy }) {
    const { threadID, messageID, senderID } = event;

    const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    const matchPercentage = percentages[Math.floor(Math.random() * percentages.length)];

    const senderInfo = await api.getUserInfo(senderID);
    const senderName = senderInfo[senderID].name;

    const threadInfo = await api.getThreadInfo(threadID);
    const randomID = threadInfo.participantIDs[Math.floor(Math.random() * threadInfo.participantIDs.length)];

    const targetInfo = await api.getUserInfo(randomID);
    const targetName = targetInfo[randomID].name;

    const gender = targetInfo[randomID].gender == 2 ? "Male🧑" : targetInfo[randomID].gender == 1 ? "Female👩" : "Tran Duc Bo";

    const one = senderID, two = randomID;
    
    const imagePath = await makeImage({ one, two });
    
    const message = {
      body: `✅ | تـم الإقـتـران بـنـجـاح\n〘💖〙 تـم الإقـتـران بـ ${senderName} مـع ${targetName} 〘💖〙\n〘📎〙 الإحـتـمـالات : ${matchPercentage} 〘📎〙`,
      mentions: [{ id: senderID, tag: senderName }, { id: randomID, tag: targetName }],
      attachment: fs.createReadStream(imagePath)
    };

    api.sendMessage(message, threadID, () => fs.unlinkSync(imagePath), messageID);
  }
};

async function makeImage({ one, two }) {
  const pathImg = `${process.cwd()}/cache/pairing_${one}_${two}.png`;
  const avatarOne = `${process.cwd()}/cache/avt_${one}.png`;
  const avatarTwo = `${process.cwd()}/cache/avt_${two}.png`;
  const pairingImg = await jimp.read(`${process.cwd()}/cache/pairing.png`);

  const getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=YOUR_ACCESS_TOKEN`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  const getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=YOUR_ACCESS_TOKEN`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  const circleOne = await jimp.read(await circle(avatarOne));
  const circleTwo = await jimp.read(await circle(avatarTwo));
  
  pairingImg.composite(circleOne.resize(150, 150), 980, 200)
            .composite(circleTwo.resize(150, 150), 140, 200);

  const raw = await pairingImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}
