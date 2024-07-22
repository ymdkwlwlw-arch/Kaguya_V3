import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function audio({ api, event, args }) {
    api.setMessageReaction("🕢", event.messageID, (err) => {}, true);
    try {
        let title = '';
        let shortUrl = '';
        let videoId = '';

        const extractShortUrl = async () => {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type === "audio") {
                return attachment.url;
            } else {
                throw new Error("Invalid attachment type. Must be audio.");
            }
        };

        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            shortUrl = await extractShortUrl();
            const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
            title = musicRecognitionResponse.data.title;
            const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}&type=music`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }
        } else if (args.length === 0) {
            api.sendMessage("❕ | قم بإدخال اسم الأغنية أو الرد على مرفق صوتي", event.threadID);
            return;
        } else {
            title = args.join(" ");
            const searchResponse = await axios.get(`https://youtube-kshitiz.vercel.app/youtube?search=${encodeURIComponent(title)}&type=music`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }
        }

        if (!videoId) {
            api.sendMessage("[❕] | لم يتم العثور على الأغنية", event.threadID);
            return;
        }

        const downloadResponse = await axios.get(`https://youtube-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}`);
        const audioUrl = downloadResponse.data[0];

        if (!audioUrl) {
            api.sendMessage("Failed to retrieve download link for the audio.", event.threadID);
            return;
        }

        const audioPath = path.join(process.cwd(), 'temp', `${videoId}.mp3`);
        const writer = fs.createWriteStream(audioPath);
        const response = await axios({
            url: audioUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            const audioStream = fs.createReadStream(audioPath);
            api.sendMessage({ body: `🎵 | تشغيل الآن: ${title}`, attachment: audioStream }, event.threadID, () => {
                fs.unlinkSync(audioPath); // Remove the temporary file
                api.setMessageReaction("✅", event.messageID, () => {}, true);
            });
        });

        writer.on('error', (error) => {
            console.error("Error:", error);
            api.sendMessage("❌ | حدث خطأ أثناء تنزيل الأغنية.", event.threadID);
        });
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("حدث خطأ أثناء تنفيذ الأمر.", event.threadID);
    }
}

export default {
    name: "اغنية",
    version: "1.0",
    author: "Kshitiz",
    countDown: 10,
    role: "member",
    aliases:["غني","سمعيني"],
    description: "تشغيل أغنية من YouTube",
    execute: audio
};
