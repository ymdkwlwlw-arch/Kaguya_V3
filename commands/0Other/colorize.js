import axios from "axios";
import { getStreamFromURL } from global.utils;

export default {
  name: "غني",
  version: "1.0.0",
  role: "member",
  author: "Your Name",
  description: "Search and play a song from YouTube.",
  commandCategory: "Music",
  cooldowns: 5,

  async execute({ api, event, args, getLang }) {
    const { threadID, messageID } = event;
    const songName = args.join(" ");
    
    if (!songName) {
      return api.sendMessage(getLang('syntaxError'), threadID, messageID);
    }

    // Set loading reaction
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // Make request to API to fetch song data
      const url = `https://smfahim.onrender.com/ytb/audio?search=${encodeURIComponent(songName)}`;
      const { data: { audioUrl, title } } = await axios.get(url);

      // Send song details with audio attachment
      await api.sendMessage({
        body: title,
        attachment: await getStreamFromURL(audioUrl, "music.mp3")
      }, threadID);

      // Set success reaction
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
      // Log error and send error message
      console.error(error);
      api.sendMessage(getLang('fetchError'), threadID, messageID);
    }
  }
};
