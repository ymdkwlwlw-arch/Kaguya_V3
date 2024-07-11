import fs from 'fs';
import path from 'path';
import axios from 'axios';
import PDFDocument from 'pdfkit';

export default {
  name: "pdf",
  author: "Your Name",
  role: "member",
  description: "تحويل صور متعددة إلى ملف PDF.",
  execute: async ({ message, event, args, api }) => {
    try {
      if (event.type !== "message_reply") {
        return api.sendMessage("❌ || Reply to multiple images to convert them to a PDF.", event.threadID);
      }

      const attachments = event.messageReply.attachments;
      if (!attachments || attachments.length < 2 || !attachments.every(attachment => attachment.type === "photo")) {
        return api.sendMessage("❌ || Please reply to at least two images.", event.threadID);
      }

      const pdfName = args[0];
      if (!pdfName) {
        return api.sendMessage("❌ || Please provide a name for the PDF.", event.threadID);
      }

      const cacheFolder = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheFolder)) {
        fs.mkdirSync(cacheFolder);
      }

      const imagePaths = [];

      for (let i = 0; i < attachments.length; i++) {
        const imageUrl = attachments[i].url;
        const imagePath = path.join(cacheFolder, `image_${i}_${Date.now()}.jpg`);
        imagePaths.push(imagePath);

        const responseImage = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'stream'
        });
        const writerImage = fs.createWriteStream(imagePath);
        responseImage.data.pipe(writerImage);

        await new Promise((resolve, reject) => {
          writerImage.on('finish', resolve);
          writerImage.on('error', reject);
        });
      }

      const pdfPath = path.join(cacheFolder, `${pdfName}.pdf`);

      const doc = new PDFDocument();
      const pdfWriter = fs.createWriteStream(pdfPath);
      doc.pipe(pdfWriter);

      for (const imagePath of imagePaths) {
        doc.addPage().image(imagePath, {
          fit: [500, 700],
          align: 'center',
          valign: 'center'
        });
      }

      doc.end();

      await new Promise((resolve, reject) => {
        pdfWriter.on('finish', resolve);
        pdfWriter.on('error', reject);
      });

      const pdfStream = fs.createReadStream(pdfPath);

      if (!event.threadID || !event.messageID) {
        return console.error("ThreadID or MessageID is not defined or invalid.");
      }

      await api.sendMessage({
        body: `✅ || tap to download 👇`,
        attachment: pdfStream
      }, event.threadID);

      imagePaths.forEach(imagePath => fs.unlinkSync(imagePath));
      fs.unlinkSync(pdfPath);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ || An error occurred.", event.threadID);
    }
  }
};
