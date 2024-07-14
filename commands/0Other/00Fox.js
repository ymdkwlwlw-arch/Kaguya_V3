import fs from 'fs';
import path from 'path';
import axios from 'axios';

const imageLinks = [
  "https://i.ibb.co/47nfDbG/image.jpg",
  "https://i.ibb.co/Fb1qBS4/image.jpg",
  "https://i.ibb.co/8YrQQ1h/image.jpg",
  "https://i.ibb.co/vhFFLW6/image.jpg",
  "https://i.ibb.co/5YGvG4N/image.jpg",
  "https://i.ibb.co/SfSh5w5/image.jpg",
  "https://i.ibb.co/wr0v4JX/image.jpg",
  "https://i.ibb.co/7nfnB5T/image.jpg",
  "https://i.ibb.co/7b80McW/image.jpg",
  "https://i.ibb.co/Yt4kgbQ/image.jpg",
  "https://i.ibb.co/cbsG4j8/image.jpg",
  "https://i.ibb.co/b6W7cLr/image.jpg",
  "https://i.ibb.co/svCLpWy/image.jpg",
  "https://i.ibb.co/n8PvJCq/image.jpg",
  "https://i.ibb.co/hDPn5TZ/image.jpg",
  "https://i.ibb.co/728pvCF/image.jpg",
  "https://i.ibb.co/hYMf6KD/image.jpg",
  "https://i.ibb.co/wgbQRHC/image.jpg",
  "https://i.ibb.co/fdmnxvv/image.jpg",
  "https://i.ibb.co/4jYnffr/image.jpg",
  "https://i.ibb.co/cXztRYx/image.jpg",
  "https://i.ibb.co/fdDKFGV/image.jpg",
  "https://i.ibb.co/YWmm9cQ/image.jpg",
  "https://i.ibb.co/2q08N1B/image.jpg",
  "https://i.ibb.co/2q08N1B/image.jpg",
  "https://i.ibb.co/3fyRPfT/image.jpg",
  "https://i.ibb.co/Nyg8f40/image.jpg",
  "https://i.ibb.co/cTjTN01/image.jpg",
  "https://i.ibb.co/JRYw9dH/image.jpg",
  "https://i.ibb.co/DrvgBBQ/image.jpg",
  "https://i.ibb.co/D7DFw2x/image.jpg",
  "https://i.ibb.co/D7DFw2x/image.jpg",
  "https://i.ibb.co/g7YKCyP/image.jpg",
  "https://i.ibb.co/QJZswXn/image.jpg",
  "https://i.ibb.co/rQKh7Fg/image.jpg",
  "https://i.ibb.co/27q0Gf4/image.jpg",
  "https://i.ibb.co/rQKh7Fg/image.jpg",
  "https://i.ibb.co/DGH26YT/image.jpg",
  "https://i.ibb.co/ZWb0K8p/image.jpg",
  "https://i.ibb.co/DGH26YT/image.jpg",
  "https://i.ibb.co/1621n5w/image.jpg",
  "https://i.ibb.co/jTtbLQD/image.jpg",
  "https://i.ibb.co/tXrWcXN/image.jpg",
  "https://i.ibb.co/0hPb4Lp/image.jpg",
  "https://i.ibb.co/0stdvfm/image.jpg",
  "https://i.ibb.co/F60VLJy/image.jpg",
  "https://i.ibb.co/F60VLJy/image.jpg",
  "https://i.ibb.co/554pYLj/image.jpg",
  "https://i.ibb.co/fXSKmtj/image.jpg",
  "https://i.ibb.co/bRt3CyN/image.jpg",
  "https://i.ibb.co/WnGLKrS/image.jpg",
  "https://i.ibb.co/gZh5RBj/image.jpg",
  "https://i.ibb.co/Rgw6D6D/image.jpg",
  "https://i.ibb.co/6g5g4JK/image.jpg",
  "https://i.ibb.co/vjVTNzJ/image.jpg",
  "https://i.ibb.co/87FWY0C/image.jpg",
  "https://i.ibb.co/ByLn6f6/image.jpg",
  "https://i.ibb.co/6YskKJc/image.jpg",
  "https://i.ibb.co/d62kp3G/image.jpg",
  "https://i.ibb.co/5KhFbqB/image.jpg",
  "https://i.ibb.co/NKB9Zvd/image.jpg",
  "https://i.ibb.co/FwVjsXc/image.jpg",
  "https://i.ibb.co/rmtvD98/image.jpg",
  "https://i.ibb.co/47QHm7v/image.jpg",
  "https://i.ibb.co/4dyZkQ2/image.jpg",
  "https://i.ibb.co/4dyZkQ2/image.jpg",
  "https://i.ibb.co/QkLP5hs/image.jpg",
  "https://i.ibb.co/N34mwh2/image.jpg"
];

export default {
  name: 'شيكيمارو',
  author: 'YourName',
  role: 'member',
  description: 'Send a random image from a predefined list',
  async execute({ api, event, Economy }) {
    try {
      const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 100;
      if (userMoney < cost) {
        return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً.`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID);
      const cacheDir = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // اختيار رابط صورة عشوائي
      const imgUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];
      const imgName = imgUrl.split('/').pop();
      const imgPath = path.join(cacheDir, imgName);

      // إذا كانت الصورة غير موجودة، قم بتنزيلها
      if (!fs.existsSync(imgPath)) {
        const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(imgPath, response.data);
      }
      api.setMessageReaction("🎯", event.messageID, () => {}, true);

      // إرسال الصورة
      api.sendMessage({
        body: '◆❯━━━━━━▣✦▣━━━━━━━❮◆\n𒈞SHIKAMARU𒈞\n $100 deducted \n◆❯━━━━━━▣✦▣━━━━━━━❮◆',
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error sending image:', error);
      api.sendMessage('حدث خطأ أثناء محاولة إرسال الصورة.', event.threadID, event.messageID);
    }
  }
};
