import fs from "fs";
import path from "path";
import axios from "axios";
import Jimp from "jimp";

export default {
  name: "ألوان",
  version: "1.2",
  author: "حسين يعقوبي",
  role: "member",
  description: "Randomly selects a user from the group and generates a 'gay' image for fun.",
  execute: async ({ api, event }) => {
    const participantIDs = event.participantIDs;
    const randomUserID = participantIDs[Math.floor(Math.random() * participantIDs.length)];

    try {
      api.getUserInfo(randomUserID, async (err, userInfo) => {
        if (err) {
          console.error("Error fetching user info:", err.message);
          return api.sendMessage("An error occurred while fetching user info.", event.threadID, event.messageID);
        }

        const avatarURL = userInfo[randomUserID].thumbSrc;
        const userName = userInfo[randomUserID].name;

        // Download the user's avatar
        const response = await axios({
          url: avatarURL,
          responseType: 'arraybuffer'
        });
        const avatarBuffer = Buffer.from(response.data);

        // Load the avatar image using Jimp
        const avatar = await Jimp.read(avatarBuffer);

        // Create a new image with the same dimensions as the avatar
        const width = avatar.bitmap.width;
        const height = avatar.bitmap.height;

        const rainbow = await Jimp.read('https://i.imgur.com/Bi0NMGX.png'); // Your rainbow image URL
        rainbow.resize(width, height); // Resize the rainbow image to match the avatar size

        // Apply the rainbow overlay
        avatar.composite(rainbow, 0, 0, {
          mode: Jimp.BLEND_MULTIPLY,
          opacitySource: 0.5,
          opacityDest: 1
        });

        // Save the resulting image
        const pathSave = path.join(process.cwd(), "tmp", `${randomUserID}_gay.png`);
        await avatar.writeAsync(pathSave);

        // Send the image
        api.sendMessage({
          body: `لقد تم إيجاد أن العضو المسمى ب ${userName} على أنه 💯 ألوان 👇`,
          attachment: fs.createReadStream(pathSave)
        }, event.threadID, () => {
          fs.unlinkSync(pathSave);
        }, event.messageID);
      });
    } catch (error) {
      console.error("Error generating image:", error.message);
      api.sendMessage("An error occurred while generating the image.", event.threadID, event.messageID);
    }
  }
};
