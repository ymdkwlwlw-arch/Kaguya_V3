import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "سبوتيفاي",
  author: "Kaguya Project",
  role: "member",
  aliases:["اغنية"],
  description: "Fetches and manages Spotify tracks.",
  async execute({ api, event, args }) {
    try {
      const query = args.join(" ");
      if (!query) {
        return api.sendMessage("⚠️ | ادخل اسم الاغنية", event.threadID);
      }

      const url = `${global.api.samirApi}/spotifysearch?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      const tracks = response.data;

      if (tracks.length === 0) {
        return api.sendMessage("⚠️ | لم يتم ايجاد الاغنية", event.threadID);
      }

      const shuffledTracks = tracks.sort(() => Math.random() - 0.5);
      const top6Tracks = shuffledTracks.slice(0, 6);
      const trackInfo = top6Tracks.map((track, index) => 
        `${index + 1}. ${track.title}\nالمدة : ${formatDuration(track.durationMs)}\nالفنان: ${track.artist}`
      ).join("\n\n");

      const thumbnails = top6Tracks.map(track => track.thumbnail);
      const attachments = await Promise.all(thumbnails.map(thumbnail => global.utils.getStreamFromURL(thumbnail)));

      const replyMessage = await api.sendMessage({
        body: `${trackInfo}\n\nرد برقم حتى تحمل الاغتية او رد ب 'التالي' لترى مزيد من الاغاني`,
        attachment: attachments,
      }, event.threadID);

      // Setup for reply tracking
      client.handler.reply.set(replyMessage.messageID, {
        author: event.senderID,
        type: "reply",
        name: "سبوتيفاي",
        correctMusicName: top6Tracks[0]?.title, // Assuming you want to track the first track's name for example
        unsend: true
      });

    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
  },
  onReply: async function({ api, event, reply, Economy }) {
    if (reply && reply.type === "reply" && reply.name === "سبوتيفاي") {
      client.handler.reply.set(reply.messageID, {
        author: event.senderID,
        type: "reply",
        name: "سبوتيفاي",
        correctMusicName: reply.correctMusicName, // Add the correct music name
        unsend: true
      });

      const userInput = event.body.trim();
      const { tracks } = reply;
      const selectedIndex = parseInt(userInput, 10) - 1;

      if (userInput.toLowerCase() === 'next') {
        // Fetch more tracks and resend the message
        const nextUrl = `${global.api.samirApi}/spotifysearch?q=${encodeURIComponent(reply.originalQuery)}`;
        try {
          const response = await axios.get(nextUrl);
          const nextTracks = response.data.slice(reply.currentIndex, reply.currentIndex + 6);

          if (nextTracks.length === 0) {
            return api.sendMessage("No more tracks found for the given query.", event.threadID);
          }

          const trackInfo = nextTracks.map((track, index) =>
            `${reply.currentIndex + index + 1}. ${track.title}\nDuration: ${formatDuration(track.durationMs)}\nArtist: ${track.artist}`
          ).join("\n\n");

          const thumbnails = nextTracks.map(track => track.thumbnail);
          const attachments = await Promise.all(thumbnails.map(thumbnail => global.utils.getStreamFromURL(thumbnail)));

          await api.sendMessage({
            body: `${trackInfo}\n\nReply with a number to choose a track or type 'next' to see more tracks.`,
            attachment: attachments,
          }, event.threadID);

          // Update reply data
          client.handler.reply.set(reply.messageID, {
            ...reply,
            tracks: response.data,
            currentIndex: reply.currentIndex + 6
          });

        } catch (error) {
          console.error('Error:', error);
          api.sendMessage("An error occurred while fetching more tracks.", event.threadID);
        }
      } else if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < tracks.length) {
        const selectedTrack = tracks[selectedIndex];
        const downloadingMessage = await api.sendMessage(`Downloading track "${selectedTrack.title}"`, event.threadID);
        const downloadUrl = `https://samirxpikachuio.onrender.com/spotifydl?url=${encodeURIComponent(selectedTrack.url)}`;

        try {
          const apiResponse = await axios.get(downloadUrl);

          if (apiResponse.data.success) {
            const metadata = apiResponse.data.metadata;
            const audioUrl = apiResponse.data.link;
            const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            const audioPath = path.join(process.cwd(), 'cache', 'spotify.mp3');

            fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

            await api.sendMessage({
              body: `• Title: ${metadata.title}\n• Album: ${metadata.album}\n• Artist: ${metadata.artists}\n• Released: ${metadata.releaseDate}`,
              attachment: fs.createReadStream(audioPath)
            }, event.threadID);

            fs.unlinkSync(audioPath);

          } else {
            api.sendMessage("Sorry, the Spotify content could not be downloaded.", event.threadID);
          }

        } catch (error) {
          console.error('Error:', error);
          api.sendMessage("Sorry, an error occurred while processing your request.", event.threadID);
        }

        api.unsendMessage(downloadingMessage.messageID);
      }
    }
  }
};

function formatDuration(durationMs) {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(value) {
  return value.toString().padStart(2, '0');
}
