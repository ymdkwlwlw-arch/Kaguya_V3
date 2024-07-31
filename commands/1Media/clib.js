import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

const API_URL = "https://yt-music-7ind.onrender.com/search?query=";

async function downloadVideo(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

export default {
    name: "فيديو",
    author: "YourName",
    role: "member",
    aliases: ["فيديو", "مقطع"],
    description: "ابحث عن مقطع فيديو عبر كتابة عنوانه أو الرد على فيديو أو مقطع صوتي.",

    async execute({ api, event, args, message }) {
        api.setMessageReaction("🕢", event.messageID, () => {}, true);

        try {
            let title = '';
            let videoUrl = '';

            const extractShortUrl = async () => {
                const attachment = event.messageReply?.attachments[0];
                if (attachment?.type === "video" || attachment?.type === "audio") {
                    return attachment.url;
                } else {
                    throw new Error("Invalid attachment type.");
                }
            };

            if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
                const shortUrl = await extractShortUrl();
                const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
                title = musicRecognitionResponse.data.title;
                const searchResponse = await axios.get(`${API_URL}${encodeURIComponent(title)}`);
                videoUrl = searchResponse.data.videoUrl;
            } else if (args.length === 0) {
                api.sendMessage("⚠️ | يرجى إدخال عنوان الفيديو أو الرد على فيديو أو مقطع صوتي.", event.threadID, event.messageID);
                return;
            } else {
                title = args.join(" ");
                const searchResponse = await axios.get(`${API_URL}${encodeURIComponent(title)}`);
                videoUrl = searchResponse.data.videoUrl;
            }

            if (!videoUrl) {
                api.sendMessage("❓ | لم يتم العثور على فيديو للبحث المحدد.", event.threadID, event.messageID);
                return;
            }

            const cachePath = path.join(process.cwd(), 'cache', 'video.mp4');
            await downloadVideo(videoUrl, cachePath);

            const videoStream = fs.createReadStream(cachePath);
            api.sendMessage({ body: `📹 | جاري تشغيل: ${title}`, attachment: videoStream }, event.threadID, (err) => {
                if (err) console.error("Error sending message:", err);
                fs.unlinkSync(cachePath); // Clean up the cache file after sending
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

        } catch (error) {
            console.error("Error:", error);
            api.sendMessage("🚧 | حدث خطأ أثناء المعالجة. يرجى المحاولة مرة أخرى لاحقاً.", event.threadID, event.messageID);
        }
    }
};
