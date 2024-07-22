import axios from 'axios';
import tinyurl from 'tinyurl';
import fs from 'fs';
import path from 'path';

export default {
  name: "جودة",
  author: "Kaguya Project",
  role: "member",
  aliases:["تحسين"],
  description: "رفع و تحسين جودة الصور",
  async execute({ api, event }) {
    api.setMessageReaction("📷", event.messageID, (err) => {}, true);
    const args = event.body.split(/\s+/).slice(1); // Use slice to skip the first element
    const { threadID, messageID, messageReply } = event;
    const tempImagePath = path.join(process.cwd(), 'tmp', 'enhanced_image.jpg');

    // Check if there's a message reply and if it has attachments
    if (!messageReply || !messageReply.attachments || !(messageReply.attachments[0] || args[0])) {
      return api.sendMessage("┐⁠(⁠￣⁠ヘ⁠￣⁠)⁠┌ | رد على صورة او ادخل رابطها", threadID, messageID);
    }

    // Determine the photo URL from the reply or command arguments
    const photoUrl = messageReply.attachments[0] ? messageReply.attachments[0].url : args.join(" ");

    // Check if a valid photo URL is present
    if (!photoUrl) {
      return api.sendMessage("┐⁠(⁠￣⁠ヘ⁠￣⁠)⁠┌ | رد على صورة او ادخل رابطها", threadID, messageID);
    }

    // Notify user to wait
    await api.sendMessage("⊂⁠(⁠・⁠﹏⁠・⁠⊂⁠) | Please wait...", threadID, messageID);

    try {
      // Shorten the photo URL using TinyURL
      const shortenedUrl = await tinyurl.shorten(photoUrl);

      // Fetch the upscaled image using the upscale API
      const response = await axios.get(`https://www.api.vyturex.com/upscale?imageUrl=${shortenedUrl}`);
      const processedImageUrl = response.data.resultUrl;

      // Fetch the processed image
      const enhancedImageResponse = await axios.get(processedImageUrl, { responseType: "arraybuffer" });

      // Save the processed image to a temporary file
      fs.writeFileSync(tempImagePath, enhancedImageResponse.data);

      // Send the enhanced image as a reply
      api.setMessageReaction("📸", event.messageID, (err) => {}, true);
      await api.sendMessage({
        body: "<⁠(⁠￣⁠︶⁠￣⁠)⁠> | 𝚃𝙷𝙴 𝚀𝙺𝙰𝙻𝙸𝚃𝚈 𝙷𝙰𝚂 𝙱𝙴𝙴𝙽 𝚂𝙺𝙲𝙲𝙴𝚂𝚂𝙵𝙺𝙻𝙻𝚈 𝙸𝙽𝙲𝚁𝙴𝙰𝚂𝙴𝙳",
        attachment: fs.createReadStream(tempImagePath)
      }, threadID, () => {
        // Delete the temporary image file after sending
        fs.unlinkSync(tempImagePath);
      }, messageID);
    } catch (error) {
      // Handle errors gracefully
      api.sendMessage(`(⁠┌⁠・⁠。⁠・⁠)⁠┌ | Api Dead...: ${error.message}`, threadID, messageID);
    }
  }
};
