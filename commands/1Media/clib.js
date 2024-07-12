import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function video({ api, event, args, message }) {
    api.setMessageReaction("🕢", event.messageID, (err) => {}, true);
    try {
        let title = '';
        let shortUrl = '';
        let videoId = '';

        const extractShortUrl = async () => {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type === "video" || attachment.type === "audio") {
                return attachment.url;
            } else {
                throw new Error("Invalid attachment type.");
            }
        };

        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            shortUrl = await extractShortUrl();
            const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
            title = musicRecognitionResponse.data.title;
            const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }

            shortUrl = await shortenURL(shortUrl);
        } else if (args.length === 0) {
            kaguya.reply(" ❕ | قم بإدخال اسم المقطع او رد على مرفق");
            return;
        } else {
            title = args.join(" ");
            const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }

            const videoUrlResponse = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}`);
            if (videoUrlResponse.data.length > 0) {
                shortUrl = await shortenURL(videoUrlResponse.data[0]);
            }
        }

        if (!videoId) {
            kaguya.reply(" [❕] | لم يتم العثور على المقطع");
            return;
        }

        const downloadResponse = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}`);
        const videoUrl = downloadResponse.data[0];

        if (!videoUrl) {
            message.reply("Failed to retrieve download link for the video.");
            return;
        }

        const videoPath = path.join(process.cwd(), 'temp', `${videoId}.mp4`);
        const writer = fs.createWriteStream(videoPath);
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            const videoStream = fs.createReadStream(videoPath);
            api.sendMessage({ body: `📹 | تشغيل الآن : ${title}`, attachment: videoStream }, event.threadID, () => {
                fs.unlinkSync(videoPath); // Remove the temporary file
                api.setMessageReaction("✅", event.messageID, () => {}, true);
            });
        });

        writer.on('error', (error) => {
            console.error("Error:", error);
            kaguya.reply("❌ | حدث خطأ أثناء تنزيل المقطع.");
        });
    } catch (error) {
        console.error("Error:", error);
        message.reply("An error occurred.");
    }
}

export default {
        name: "مقطع",
        version: "1.0",
        author: "Kshitiz",
        countDown: 10,
        role: "member",
        Description: "play video from youtube"
    },
    execute: video
};
