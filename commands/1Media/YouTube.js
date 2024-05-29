import axios from "axios";
import fs from "fs";
import { Innertube, UniversalCache } from 'youtubei.js';

export default {
  name: "يوتيوب",
  author: "Kaguya Project",
  description: "يجلب مقاطع من اليوتيوب بواسطة كلمة البحث",
  role: "member",
  execute: async ({ args, api, event }) => {
    const songTitle = args.join(" ");
    const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });

    try {
      const search = await yt.music.search(songTitle, { type: 'video' });

      if (!search.results[0]) {
        api.sendMessage("⚠️ | لم يتم العثور على المقطع!", event.threadID, event.messageID);
        return;
      }

      api.sendMessage(`🔍 | جاري البحث عن الفيديو : ${songTitle}\n ⏱️ |يرجى الانتظار......`, event.threadID, event.messageID);

      const info = await yt.getBasicInfo(search.results[0].id);
      const url = info.streaming_data?.formats[0].decipher(yt.session.player);
      const stream = await yt.download(search.results[0].id, {
        type: 'video+audio', // audio, video or video+audio
        quality: 'best', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
        format: 'mp4' // media container format 
      });

      const file = fs.createWriteStream(`./temp/video.mp4`);

      async function writeToStream(stream) {
        const startTime = Date.now();
        let bytesDownloaded = 0;

        for await (const chunk of stream) {
          await new Promise((resolve, reject) => {
            file.write(chunk, (error) => {
              if (error) {
                reject(error);
              } else {
                bytesDownloaded += chunk.length;
                resolve();
              }
            });
          });
        }

        const endTime = Date.now();
        const downloadTimeInSeconds = (endTime - startTime) / 1000;
        const downloadSpeedInMbps = (bytesDownloaded / downloadTimeInSeconds) / (1024 * 1024);

        return new Promise((resolve, reject) => {
          file.end((error) => {
            if (error) {
              reject(error);
            } else {
              resolve({ downloadTimeInSeconds, downloadSpeedInMbps });
            }
          });
        });
      }

      async function main() {
        const { downloadTimeInSeconds, downloadSpeedInMbps } = await writeToStream(stream);
        const fileSizeInMB = file.bytesWritten / (1024 * 1024);

        const messageBody = `حجم الفيديو ⚙️: ${fileSizeInMB.toFixed(2)} ميجابايت\nسرعة التحميل 💹: ${downloadSpeedInMbps.toFixed(2)} ميغابايت في الثانية\nمدة التحميل ⏰: ${downloadTimeInSeconds.toFixed(2)} ثانية`;

        const titleMessage = ` ✅ | تم تحميل الفيديو بنجاح\nعنوان الفيديو 📋 : ${info.basic_info['title']}\n`;
        api.sendMessage({
          body: `${titleMessage}${messageBody}`,
          attachment: fs.createReadStream(`./temp/video.mp4`)
        }, event.threadID, event.messageID);
      }

      main();
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | حدث خطأ أثناء جلب الفيديو من اليوتيوب. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID);
    }
  }
};