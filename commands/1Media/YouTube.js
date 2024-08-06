import fs from 'fs';
import axios from 'axios';
import Prodia from 'prodia.js'; // Ensure the Prodia SDK is correctly imported

export default {
  name: 'مزج',
  author: 'YourName',
  role: 'member',
  description: 'مزج بين صورتين.',
  async execute({ api, event }) {
    const reply = (message) => api.sendMessage(message, event.threadID, event.messageID);

    if (event.type === "message_reply") {
      const attachments = event.messageReply.attachments.filter(attachment => attachment.type === "photo");

      if (attachments.length >= 2) {
        const [url1, url2] = attachments.map(attachment => attachment.url);
        const path = `${process.cwd()}/cache/swapped_image.jpg`;

        api.sendMessage("🔮 | جاري المزج ، يرجى الإنتظار...", event.threadID, event.messageID);

        try {
          const prodia = Prodia("32c2d71f-1820-4103-a7c6-4a8f5845a951");

          const result = await prodia.faceSwap({
            sourceUrl: url1,
            targetUrl: url2,
          });

          const job = await prodia.wait(result);

          if (job.status === "succeeded") {
            const imageResponse = await axios.get(job.imageUrl, { responseType: 'stream' });
            const writer = fs.createWriteStream(path);
            imageResponse.data.pipe(writer);

            writer.on('finish', () => {
              api.sendMessage({
                body: "🔮 | تم مزج الصورتين بنجاح ",
                attachment: fs.createReadStream(path)
              }, event.threadID, (err) => {
                if (err) {
                  api.sendMessage("🤖 𝙴𝚛𝚛𝚘𝚛 𝚜𝚎𝚗𝚍𝚒𝚗𝚐 𝚖𝚎𝚜𝚜𝚊𝚐𝚎: " + err, event.threadID);
                } else {
                  fs.unlinkSync(path);
                }
              });
            });
          } else {
            api.sendMessage("🤖 𝙸𝚖𝚎𝚍𝚎 𝚙𝚛𝑜𝚌𝚎𝚜𝚜𝚒𝚗𝚐 𝚏𝚊𝚒𝚕𝚎𝚍.", event.threadID);
          }
        } catch (error) {
          api.sendMessage(`🤖 𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐 𝚒𝚍𝚎𝚜: ${error.message}`, event.threadID);
        }
      } else {
        api.sendMessage("🔮 | كيفية الإستخدام : مزج [رد على صورتين ب مزج]", event.threadID);
      }
    }
  },
};
