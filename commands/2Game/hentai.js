import { join } from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import { createReadStream } from 'fs';

export default {
  name: "ألبوم",
  author: "kaguya project",
  role: "member",
  description: "إدارة ألبومات الوسائط. يمكن إضافة، عرض، وحذف الوسائط.",

  async execute({ api, event, args }) {
    const senderID = event.senderID;
    const command = args[0];
    const title = args.slice(1).join(" ");

    try {
      const albumPath = join(process.cwd(), 'albums', senderID.toString());
      const imagePath = join(albumPath, 'images');
      const videoPath = join(albumPath, 'videos');
      const audioPath = join(albumPath, 'audios');

      await fs.ensureDir(albumPath);
      await fs.ensureDir(imagePath);
      await fs.ensureDir(videoPath);
      await fs.ensureDir(audioPath);

      if (command === "إضافة" && title && event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        const attachmentType = attachment.type.split("/")[0]; 
        const attachmentURL = attachment.url;
        let filePath = '';

        if (attachmentType === 'photo') {
          filePath = join(imagePath, `${title}.png`);
        } else if (attachmentType === 'video') {
          filePath = join(videoPath, `${title}.mp4`);
        } else if (attachmentType === 'audio') {
          filePath = join(audioPath, `${title}.mp3`);
        } else {
          await api.sendMessage(` ❗ | ملف غير معوم`, event.threadID, event.messageID);
          return;
        }

        if (await fs.existsSync(filePath)) {
          await api.sendMessage(`⚠️ | ملف بمثل هذا الإسم "${title}" موجود مسبقا في الالبوم`, event.threadID, event.messageID);
          return;
        }

        const response = await axios.get(attachmentURL, { responseType: "stream" });
        const fileStream = fs.createWriteStream(filePath);
        response.data.pipe(fileStream);

        return new Promise((resolve, reject) => {
          fileStream.on("finish", async () => {
            await api.sendMessage(`✅ | تم حفظ الملف بنجاح مع الإسم "${title}".`, event.threadID, event.messageID);
            resolve();
          });
          fileStream.on("error", (err) => {
            reject(err);
          });
        });
      }

      if (["audio", "video", "image"].includes(command)) {
        const files = await fs.readdir(join(albumPath, command + "s"));

        if (files.length === 0) {
          await api.sendMessage(` ❗ |هذا فارغ حاليا.`, event.threadID, event.messageID);
          return;
        }

        let message = "";
        files.forEach((file, index) => {
          message += `${index + 1}. ${file.replace(/\.[^/.]+$/, "")}\n`;
        });

        await api.sendMessage(message, event.threadID, event.messageID);
      } else if (command === "رؤية" || command === "عرض") {
        let found = false;
        for (let type of ["audio", "video", "image"]) {
          const filePath = join(albumPath, type + "s", `${title}.${type === "image" ? "png" : type === "video" ? "mp4" : "mp3"}`);
          if (await fs.pathExists(filePath)) {
            await api.sendMessage({
              attachment: createReadStream(filePath)
            }, event.threadID, event.messageID);
            found = true;
            break; 
          }
        }
        if (!found) {
          await api.sendMessage(`⚠️ | لم يتم إيجاد اي شيء حول الإسم "${title}".`, event.threadID, event.messageID);
          return;
        }
      } else if (command === "حذف") {
        let deleted = false;
        for (let type of ["audio", "video", "image"]) {
          const filePath = join(albumPath, type + "s", `${title}.${type === "image" ? "png" : type === "video" ? "mp4" : "mp3"}`);
          if (await fs.pathExists(filePath)) {
            await fs.unlink(filePath);
            await api.sendMessage(` ✅ | الملف مع الإسم "${title}" تم حذفه بنجاح`, event.threadID, event.messageID);
            deleted = true;
            break; 
          }
        }
        if (!deleted) {
          await api.sendMessage(`✅ | لم بتم إيجاد اي ملف بالنسبة ل "${title}".`, event.threadID, event.messageID);
          return;
        }
      } else if (command === "الكل") {
        let message = "";
        for (let type of ["audio", "video", "image"]) {
          const files = await fs.readdir(join(albumPath, type + "s"));
          if (files.length > 0) {
            message += `[${type}]\n`;
            files.forEach((file, index) => {
              message += `${index + 1}. ${file.replace(/\.[^/.]+$/, "")}\n`;
            });
          }
        }
        if (message === "") {
          message = " ❗ | كل الالبومات فارغة";
        }
        await api.sendMessage(message, event.threadID, event.messageID);
      } else {
        await api.sendMessage("╼╾─────⊹⊱⊰⊹─────╼╾\nمن اجل ان تخزن فيديو ، أغنية ، صورة يكفي فقط الرد عليها ومن ثم كتابة : *ألبوم {إسم ذالك الصوت او الصورة او الفيديو اللذي تم الرد عليه}\nمن أجل ان ترى الفيديو او الصوت او الصورة اللتي فمت بحفظها اكتب: *ألبوم صوت / *ألبوم فيديو / *ألبوم صورة\nإستخدم عرض من اجل روية الصوت او الفيديو او الصورة اكتب: {p}ألبوم عرض {إسم الملف اللذي اسميته قبل الحفظ}\n╼╾─────⊹⊱⊰⊹─────╼╾", event.threadID, event.messageID);
      } 
    } catch (err) {
      console.error(err);
      await api.sendMessage("An error occurred.", event.threadID, event.messageID);
    }
  },
};
