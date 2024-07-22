import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { shortenURL, getRandomApiKey } from './utils'; // Adjust the import based on your actual utility functions

export default {
  name: "اغينة",
  author: "Your Name", // Replace with your name or bot's author
  role: "member", 
  aliases:["غني","أغنية"],
  cooldowns: 30, // Adjust cooldown if necessary
  description: "ايحث عن اغنيتك.المفضلة ",
  execute: async ({ api, event, args }) => {
    let videoId;
    let shortUrl;
    const title = args.join(" ");

    try {
      if (args.length === 0) {
        api.sendMessage("Please provide a video name or reply to a video or audio attachment.", event.threadID, event.messageID);
        return;
      }

      const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
      if (searchResponse.data.length > 0) {
        videoId = searchResponse.data[0].videoId;
      } else {
        api.sendMessage(" ⚠️ | قم بإدخال إسم الاغتية من اجل البحث عنها", event.threadID, event.messageID);
        return;
      }

      const videoUrlResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
      shortUrl = await shortenURL(videoUrlResponse.data[0]);

      if (!videoUrlResponse.data.length > 0) {
        api.sendMessage("Failed to retrieve download link for the video.", event.threadID, event.messageID);
        return;
      }

      const downloadResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
      const videoUrl = downloadResponse.data[0];

      if (!videoUrl) {
        api.sendMessage("Failed to retrieve download link for the video.", event.threadID, event.messageID);
        return;
      }

      const filePath = path.join(process.cwd(), "cache", `${videoId}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const response = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      writer.on('finish', () => {
        const videoStream = fs.createReadStream(filePath);
        api.sendMessage({ body: `${title}`, attachment: videoStream }, event.threadID, () => {
          fs.unlinkSync(filePath);
        }, event.messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on('error', (error) => {
        console.error("Error:", error);
        api.sendMessage("Error downloading the video.", event.threadID, event.messageID);
      });
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred.", event.threadID, event.messageID);
    }
  }
};
