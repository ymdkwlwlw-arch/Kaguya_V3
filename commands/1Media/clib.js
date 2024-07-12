import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function video({ api, event, args }) {
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
        } else if (args.length === 0) {
            api.sendMessage("❕ | قم بإدخال اسم المقطع أو الرد على مرفق", event.threadID);
            return;
        } else {
            title = args.join(" ");
            const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }
        }

        if (!videoId) {
            api.sendMessage("[❕] | لم يتم العثور على المقطع", event.threadID);
            return;
        }

        const downloadResponse = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}`);
        const videoUrl = downloadResponse.data[0];

        if (!videoUrl) {
            api.sendMessage("Failed to retrieve download link for the video.", event.threadID);
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
            api.sendMessage({ body: `📹 | تشغيل الآن: ${title}`, attachment: videoStream }, event.threadID, () => {
                fs.unlinkSync(videoPath); // Remove the temporary file
                api.setMessageReaction("✅", event.messageID, () => {}, true);
            });
        });

        writer.on('error', (error) => {
            console.error("Error:", error);
            api.sendMessage("❌ | حدث خطأ أثناء تنزيل المقطع.", event.threadID);
        });
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("An error occurred.", event.threadID);
    }
}

export default {
    name: "مقطع",
    version: "1.0",
    author: "Kshitiz",
    countDown: 10,
    role: "member",
    description: "Play video from YouTube",
    execute: video
};
