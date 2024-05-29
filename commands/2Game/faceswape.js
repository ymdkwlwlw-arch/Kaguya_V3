import fs from 'fs';
import path from 'path';
import axios from 'axios';

const fetchTrendingAnime = async () => {
  try {
    const response = await axios.get("https://anime-trending-six.vercel.app/kshitiz");
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch trending anime list");
  }
}

const fetchTrailerDownloadUrl = async (videoId) => {
  try {
    const response = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${videoId}`);
    return response.data[0];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch trailer download URL");
  }
}

const downloadTrailer = async (videoUrl, fileName) => {
  try {
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const response = await axios.get(videoUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(fileName);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(fileName));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to download video");
  }
}

const translateText = async (text) => {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error('Error translating text:', error);
    return text;
  }
};

export default {
  name: "توب_انمي",
  author: "Hussein Yacoubi",
  role: "member",
  description: "يجلب قائمة الأنمي الرائج ويعرض معلوماته.",
  execute: async ({ api, event }) => {
    api.setMessageReaction("🕐", event.messageID, () => {}, true);

    try {
      const animeList = await fetchTrendingAnime();

      if (!Array.isArray(animeList) || animeList.length === 0) {
        api.sendMessage({ body: "لم يتم العثور على أنمي رائج." }, event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return;
      }

      const top10Anime = animeList.slice(0, 10);
      const translatedAnimeNames = await Promise.all(
        top10Anime.map(async (anime, index) => {
          const translatedName = await translateText(anime.name);
          return `${index + 1}. ${translatedName}`;
        })
      );
      const message = `✿━━━━━━━━━━━━━━━━━✿\nإليك توب 10 أنميات رائجة :\n\n${translatedAnimeNames.join("\n")}\n✿━━━━━━━━━━━━━━━━━✿`;

      api.sendMessage({ body: message }, event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
          commandName: "توب_انمي",
          messageID: info.messageID,
          author: event.senderID,
          animeList: top10Anime,
          type: "anime",
          unsend: true,
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: "حدث خطأ. يرجى المحاولة لاحقاً." }, event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async ({ api, event, reply }) => {
    if (event.senderID !== reply.author || !reply.animeList) {
      return;
    }

    const animeIndex = parseInt(event.body.trim(), 10);

    if (isNaN(animeIndex) || animeIndex <= 0 || animeIndex > reply.animeList.length) {
      api.sendMessage({ body: "إدخال غير صالح. يرجى تقديم رقم صحيح." }, event.threadID, event.messageID);
      return;
    }

    const selectedAnime = reply.animeList[animeIndex - 1];
    const trailerId = selectedAnime.trailer && selectedAnime.trailer.id;

    if (!trailerId) {
      api.sendMessage({ body: "العرض الدعائي لهذا الأنمي غير متوفر." }, event.threadID, event.messageID);
      global.client.handler.reply.delete(reply.messageID);
      return;
    }

    try {
      const downloadUrl = await fetchTrailerDownloadUrl(trailerId);
      const videoFileName = path.join(process.cwd(), 'cache', `anitrend.mp4`);
      await downloadTrailer(downloadUrl, videoFileName);
      const videoStream = fs.createReadStream(videoFileName);

      api.sendMessage({ body: `${selectedAnime.name}`, attachment: videoStream }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: "حدث خطأ." }, event.threadID, event.messageID);
    } finally {
      global.client.handler.reply.delete(reply.messageID);
    }
  }
};