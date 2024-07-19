import fs, { createWriteStream } from "fs";
import axios from "axios";

async function execute({ api, event }) {
  const data = event.body.trim().split(" ");
  const isLyricsIncluded = data.includes('كلمات');
  const songTitle = isLyricsIncluded ? data.slice(2).join(" ") : data.slice(1).join(" ");

  if (songTitle.length === 0) {
    api.sendMessage(`⚠️ | إستعمال غير صالح \n💡كيفية الإستخدام: اغنية [عنوان الأغنية 📀]\n مثال 📝: اغنية fifty fifty copied`, event.threadID);
    return;
  }

  api.sendMessage(`🔍 |جاري البحث عن أغنية : ${songTitle}\n ⏱️ | المرحو الإنتظار`, event.threadID, event.messageID);

  try {
    const response = await axios.get(`https://joshweb.click/search/spotify?q=${encodeURIComponent(songTitle)}`);
    const searchResults = response.data.result;

    if (searchResults.length === 0) {
      api.sendMessage("⚠️ | لم يتم إيجاد الأغنية", event.threadID, event.messageID);
      return;
    }

    const song = searchResults[0];
    const { title, artist, duration, direct_url } = song;

    const stream = await axios.get(direct_url, { responseType: 'stream' });

    const file = createWriteStream(`${process.cwd()}/temp/music.mp3`);

    async function writeToStream(stream) {
      const startTime = Date.now();
      let bytesDownloaded = 0;

      for await (const chunk of stream.data) {
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

    async function getLyrics(title) {
      return axios.get(`https://sampleapi-mraikero-01.vercel.app/get/lyrics?title=${title}`)
        .then(response => response.data.result)
        .catch(error => {
          console.error(error);
          return null;
        });
    }

    async function main() {
      const { downloadTimeInSeconds, downloadSpeedInMbps } = await writeToStream(stream);
      const fileSizeInMB = file.bytesWritten / (1024 * 1024);

      const messageBody = `🎵 | تم تحميل الأغنية بنجاح ✅!\n\nحجم الملف : ${fileSizeInMB.toFixed(2)} ميغابايت \nسرعة التحميل : ${downloadSpeedInMbps.toFixed(2)} ميغابت في الثانية\nمدة التحميل : ${downloadTimeInSeconds.toFixed(2)} ثانية`;

      if (isLyricsIncluded) {
        const lyricsData = await getLyrics(songTitle);
        if (lyricsData) {
          const lyricsMessage = `عنوان الأغنية 📃 : "${lyricsData.s_title}"\n من طرف  : ${lyricsData.s_artist}:\n\n${lyricsData.s_lyrics}`;

          api.sendMessage({
            body: `${lyricsMessage}`,
            attachment: fs.createReadStream(`${process.cwd()}/temp/music.mp3`)
          }, event.threadID);
          return;
        }
      }

      const titleMessage = isLyricsIncluded ? '' : `عنوان الأغنية 📃: ${title} من طرف ${artist}\nمدة الأغنية: ${(duration / 1000).toFixed(2)} ثانية\n\n`;
      api.sendMessage({
        body: `${titleMessage}${messageBody}`,
        attachment: fs.createReadStream(`${process.cwd()}/temp/music.mp3`)
      }, event.threadID, event.messageID);
    }

    main();
  } catch (error) {
    console.error(error);
    api.sendMessage("⚠️ | حدث خطأ أثناء البحث عن الأغنية", event.threadID, event.messageID);
  }
}

export default { 
  name: "غني", 
  author: "حسين يعقوبي", 
  role: "member", 
  description: "تشغيل الأغاني وعرض كلماتها إذا توفرت.",
  aliases: ["اغنية"],
  execute: execute 
};
