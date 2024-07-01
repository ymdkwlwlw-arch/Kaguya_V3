import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "تخيلي4",
  author: "سمير",
  role: "member",
  description: "إنشاء صور باستخدام AI بناءً على الوصف المدخل.",
  
  execute: async function ({ api, event, args }) {
    let prompt = args.join(" ") || "cute girl";
    let aspectRatio = "1:1";
    let style = 1;
    let presets = 3;

    args.forEach((arg, index) => {
      switch (arg) {
        case '--ar':
          aspectRatio = args[index + 1];
          break;
        case '--style':
          style = parseInt(args[index + 1]);
          break;
        case '--presets':
          presets = parseInt(args[index + 1]);
          break;
      }
    });

    // تحويل النص من العربية إلى الإنجليزية
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
    const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

    const startTime = Date.now();
    const processingMessage = await api.sendMessage("𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐 𝚈𝚘𝚞𝚛 𝚁𝚎𝚚𝚞𝚎𝚜𝚝... 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝...⏳", event.threadID);

    try {
      const apiUrl = `https://samirxpikachu.onrender.com/mageV2?prompt=${encodeURIComponent(translatedPrompt)}&style=${encodeURIComponent(style)}&aspect_ratio=${encodeURIComponent(aspectRatio)}`;
      const imgurResponse = await axios.get(`${apiUrl}&senderId=${event.senderID}`);

      if (!imgurResponse.data.success) {
        const errorMessage = imgurResponse.data.error;
        if (errorMessage === 'Limit Exceeded') {
          return api.sendMessage('𝙻𝚒𝚖𝚒𝚝 𝚎𝚡𝚌𝚎𝚎𝚍𝚎𝚍, 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚊𝚏𝚝𝚎𝚛 2 𝚑𝚘𝚞𝚛𝚜', event.threadID, event.messageID);
        }
      }

      const imgurLink = imgurResponse.data.result.link;
      const url = await global.utils.uploadImgbb(imgurLink);
      const pattern1 = /-\d+/;
      const pattern2 = /-\d+?-n-png-stp-dst-png-p\d+x\d+-nc-cat-\d+-ccb-\d+-\d+-nc-sid/;
      const filteredUrl = url.image.url.replace(pattern1, "").replace(pattern2, "");

      const downloadDirectory = process.cwd();
      const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.jpg`);
      
      const imageResponse = await axios({
        url: imgurLink,
        method: 'GET',
        responseType: 'stream'
      });

      const fileStream = fs.createWriteStream(filePath);
      imageResponse.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        await api.sendMessage({
          body: `☘ 𝙿𝚛𝚘𝚖𝚙𝚝: ${translatedPrompt}\n\n✨ 𝙻𝚒𝚗𝚔: ${filteredUrl}\n\n⏰ 𝙸𝚖𝚊𝚐𝚎 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎𝚍 𝚒𝚗 ${duration} 𝚜𝚎𝚌𝚘𝚗𝚍𝚜 ⏳ `,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });

      fileStream.on('error', (error) => {
        console.error("Error downloading image:", error);
        api.sendMessage("Failed to download the image. Please try again later.", event.threadID);
      });
    } catch (error) {
      console.error(error);
      await api.sendMessage("Failed to retrieve image.", event.threadID);
    } finally {
      await api.unsendMessage(processingMessage.messageID);
    }
  }
};
