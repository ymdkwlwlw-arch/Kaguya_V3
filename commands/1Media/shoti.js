import axios from "axios";
import request from "request";
import fs from "fs";

export default {
  name: "تحميل",
  author: "kaguya project",
  role: "member",
  description: "تنزيل مقاطع الفيديو من تيك توك بناءً على الوصف.",
  
  execute: async ({ api, event, args, Economy }) => {
    api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً من أجل تنزيل مقطع واحد. يمكنك تنزيل مقاطع من تيك توك، فيسبوك، بينتريست، يوتيوب`, event.threadID);
    }

    // الخصم من الرصيد
    await Economy.decrease(cost, event.senderID);

    try {
      const url = args.join(" ");
      if (!url) {
        api.sendMessage("[!] يجب تقديم رابط الفيديو للمتابعة.", event.threadID, event.messageID);
        return;
      }

      // Fetch user data to get the user's name
      const userInfo = await api.getUserInfo(event.senderID);
      const senderName = userInfo[event.senderID].name;

      // Send initial message
      const sentMessage = await api.sendMessage(`🕟 | مرحبًا @${senderName}، جارٍ تنزيل الفيديو، الرجاء الانتظار...`, event.threadID);

      const response = await axios.get(`https://for-devs.onrender.com/api/alldl?url=${encodeURIComponent(url)}&apikey=api1`);
      const videoData = response.data;

      if (!videoData || !videoData.downloadUrls || videoData.downloadUrls.length === 0) {
        api.sendMessage("⚠️ | لم أتمكن من العثور على فيديو بناءً على الرابط المقدم. يرجى المحاولة مرة أخرى.", event.threadID);
        return;
      }

      const videoUrl = videoData.downloadUrls[0].url;
      const videoTitle = videoData.title || "فيديو بدون عنوان";
      const videoDuration = videoData.duration || "مدة غير معروفة";
      const videoSize = videoData.downloadUrls[0].size || "حجم غير معروف";
      const videoQuality = videoData.downloadUrls[0].format || "جودة غير معروفة";
      const filePath = `${process.cwd()}/cache/${event.senderID}.mp4`;

      // تأكد من أن الرابط صالح بالتحقق من استجابة HTTP
      request.head(videoUrl, (err, res) => {
        if (err || res.statusCode !== 200) {
          api.sendMessage("⚠️ | الرابط الذي تم الحصول عليه غير صالح أو الفيديو غير متاح.", event.threadID);
          return;
        }

        // قم بتنزيل الفيديو وإرساله من المسار المؤقت
        const videoStream = request(videoUrl).pipe(fs.createWriteStream(filePath));
        videoStream.on("close", () => {
          api.unsendMessage(sentMessage.messageID); // حذف الرسالة التي تم التفاعل معها ب "⬇️"
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          const messageBody = `✅ | تم تنزيل الفيديو بنجاح.\n\nالعنوان: ${videoTitle}\nالمدة: ${videoDuration}\nالحجم: ${videoSize}\nالجودة: ${videoQuality}`;

          api.sendMessage(
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
  },
};
