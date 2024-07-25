import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: 'اڤتار',
  author: 'HUSSEUN',
  role: 'member',
  description: 'Generates a customized Facebook cover photo based on user inputs.',
  cooldowns: 60, // Optionally add cooldown if needed
  aliases: ['coverphoto', 'fbcover'],
  execute: async ({ api, event, args }) => {
    try {
      const input = args.join(" ");
      const [name, gender, birthday, love, follower, location, hometown] = input.split(" | ");

      if (!name || !gender || !birthday || !love || !follower || !location || !hometown) {
        return api.sendMessage("⚠️ Please provide all required parameters in the format: fbcoverv6 name | gender | birthday | love | follower | location | hometown", event.threadID, event.messageID);
      }

      const userProfileUrl = `https://graph.facebook.com/${event.senderID}/picture?type=large`;
      const profilePicPath = path.join(process.cwd(), "profilePic.jpg");

      // Download profile picture
      const profilePicResponse = await axios({
        url: userProfileUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(profilePicPath);
      profilePicResponse.data.pipe(writer);

      writer.on('finish', async () => {
        try {
          // Generate cover photo
          const apiUrl = `https://joshweb.click/canvas/fbcoverv7?uid=${event.senderID}&name=${encodeURIComponent(name)}&gender=${encodeURIComponent(gender)}&birthday=${encodeURIComponent(birthday)}&love=${encodeURIComponent(love)}&follower=${encodeURIComponent(follower)}&location=${encodeURIComponent(location)}&hometown=${encodeURIComponent(hometown)}`;

          api.sendMessage("📸 Generating your Facebook cover photo, please wait...", event.threadID, event.messageID);

          const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
          const coverPhotoPath = path.join(process.cwd(), "fbCover.jpg");

          fs.writeFileSync(coverPhotoPath, response.data);

          // Send cover photo
          api.sendMessage({
            body: "🎨 Here is your customized Facebook cover photo:",
            attachment: fs.createReadStream(coverPhotoPath)
          }, event.threadID, () => {
            // Clean up temporary files
            fs.unlinkSync(profilePicPath);
            fs.unlinkSync(coverPhotoPath);
          });
        } catch (sendError) {
          console.error('Error sending image:', sendError);
          api.sendMessage("❌ An error occurred while sending the image.", event.threadID, event.messageID);
        }
      });

      writer.on('error', (err) => {
        console.error('Stream writer error:', err);
        api.sendMessage("❌ An error occurred while processing the request.", event.threadID, event.messageID);
      });
    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("❌ An error occurred while processing the request.", event.threadID, event.messageID);
    }
  },
  onReply: async ({ api, event, reply, client }) => {
    // Add any specific handling for replies if needed
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // Add any specific handling for reactions if needed
  }
};
