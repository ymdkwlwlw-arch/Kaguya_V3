import fs from 'fs';
import axios from 'axios';
import request from 'request';

class GroupImageProtection {
  name = "حماية_الصورة";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "حماية المجموعة من تغيير صورتها!";
  role = "admin";
  aliases = [];

  async fetchGroupImage({ api, event }) {
    try {
      let threadInfo = await api.getThreadInfo(event.threadID);
      let { imageSrc } = threadInfo;

      if (imageSrc) {
        // تحميل الصورة من مصدرها وتخزينها
        let callback = async function() {
          fs.writeFileSync(process.cwd() + '/cache/thread.png', await axios.get(imageSrc, { responseType: 'arraybuffer' }).then(res => res.data));
        };

        request(imageSrc).pipe(fs.createWriteStream(process.cwd() + '/cache/thread.png')).on('close', callback);
        api.sendMessage(`` , event.threadID);
      } else {
        api.sendMessage(`معرف المجموعة : ${event.threadID}\n ⁉️ | هذه المجموعة لا تمتلك صورة`, event.threadID);
      }
    } catch (error) {
      console.error("Error fetching group image:", error.message);
      api.sendMessage("❌ | Error fetching group image.", event.threadID);
    }
  }

  async updateGroupImage({ api, event }) {
    try {
      if (event.type !== "message_reply") return api.sendMessage("⚠️ | يجب عليك الرد على صورة معينة", event.threadID);
      if (event.messageReply.attachments.length !== 1) return api.sendMessage("⚠️ | الرجاء الرد على صورة واحدة فقط!", event.threadID);

      var avatar = (await axios.get(event.messageReply.attachments[0].url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(`./cache/${event.senderID}_${event.threadID}.png`, Buffer.from(avatar));

      return api.changeGroupImage(fs.createReadStream(`./cache/${event.senderID}_${event.threadID}.png`), event.threadID, () => {
        fs.unlinkSync(`./cache/${event.senderID}_${event.threadID}.png`);
      });
    } catch (err) {
      console.log(err);
      api.sendMessage("❌ | Error updating group image.", event.threadID);
    }
  }

  async protectGroupImage({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const currentImageSrc = threadInfo.imageSrc;
      
      if (!fs.existsSync(process.cwd() + '/cache/thread.png')) {
        // إذا لم تكن الصورة موجودة، فاحفظها
        await this.fetchGroupImage({ api, event });
      }

      const cachedImageSrc = fs.readFileSync(process.cwd() + '/cache/thread.png');

      const currentImage = (await axios.get(currentImageSrc, { responseType: 'arraybuffer' })).data;

      if (Buffer.compare(cachedImageSrc, currentImage) !== 0) {
        // إذا كانت الصورة مختلفة، أعد تعيين الصورة
        await this.updateGroupImage({ api, event });
        api.sendMessage("⚠️ | تم كشف تغيير في صورة المجموعة. تم إعادة الصورة إلى حالتها السابقة.", event.threadID);
      }
    } catch (err) {
      console.error("Error protecting group image:", err.message);
      api.sendMessage("❌ | Error protecting group image.", event.threadID);
    }
  }
}

export default new GroupImageProtection();
