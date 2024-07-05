import axios from "axios";
import request from "request";
import fs from "fs";
import path from "path";

export default {
  name: "تحميل",
  author: "kaguya project",
  role: "member",
  description: "تنزيل مقاطع الفيديو من تيك توك.",

  execute: async ({ api, event, args, Economy }) => {
    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 500;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً من اجل تنزيل مقطع واحد يمكنك تنزيل مقاطع من تيك توك ، فيسبوك ، بنتريست ، يوتيوب`, event.threadID);
    }

    // الخصم من الرصيد
    await Economy.decrease(cost, event.senderID);

    try {
      const link = args[0];
      if (!link) {
        return api.sendMessage("[!] يجب تقديم رابط تيك توك للمتابعة.", event.threadID, event.messageID);
      }

      // Fetch user data to get the user's name
      const userInfo = await api.getUserInfo(event.senderID);
      const senderName = userInfo[event.senderID].name;

      // Send initial message asking for reaction
      const sentMessage = await api.sendMessage(
        `🕟 | مرحبًا @${senderName}، الرجاء التفاعل مع هذه الرسالة ب 👍 لمتابعة تنزيل الفيديو.`,
        event.threadID
      );

      // Listen for reactions
      const reactionListener = (reactionEvent) => {
        if (reactionEvent.messageID === sentMessage.messageID && reactionEvent.senderID === event.senderID && reactionEvent.reaction === '👍') {
          api.removeListener('message_reaction', reactionListener);

          // Proceed with video download
          downloadVideo(link, event, api, sentMessage.messageID);
        }
      };

      api.on('message_reaction', reactionListener);

    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء تنزيل الفيديو. يرجى المحاولة مرة أخرى.", event.threadID);
    }
  }
};

async function downloadVideo(link, event, api, sentMessageID) {
  try {
    const response = await axios.get(`https://joshweb.click/anydl?url=${encodeURIComponent(link)}`);
    const videoData = response.data;

    if (!videoData || !videoData.result) {
      return api.sendMessage("⚠️ | لم أتمكن من الحصول على رابط الفيديو. يرجى المحاولة مرة أخرى.", event.threadID);
    }

    const videoUrl = videoData.result;
    const filePath = path.join(process.cwd(), 'cache', 'tikdl.mp4');

    // تأكد من أن الرابط صالح بالتحقق من استجابة HTTP
    request.head(videoUrl, (err, res) => {
      if (err || res.statusCode !== 200) {
        return api.sendMessage("⚠️ | الرابط الذي تم الحصول عليه غير صالح أو الفيديو غير متاح.", event.threadID);
      }

      // قم بتنزيل الفيديو وإرساله من المسار المؤقت
      const videoStream = request(videoUrl).pipe(fs.createWriteStream(filePath));
      videoStream.on("close", async () => {
        await api.unsendMessage(sentMessageID); // حذف رسالة التفاعل
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        const messageBody = `༈ تـم تـحـمـيـل الـفـيـديـو ✅ ༈
        `;

        await api.sendMessage(
          {
            body: messageBody,
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          () => fs.unlinkSync(filePath) // حذف الملف بعد الإرسال
        );
      });
    });
  } catch (error) {
    console.error(error);
    api.sendMessage("⚠️ | حدث خطأ أثناء تنزيل الفيديو. يرجى المحاولة مرة أخرى.", event.threadID);
  }
  }
