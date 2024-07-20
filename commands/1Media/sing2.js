import axios from "axios";
import fs from "fs";
import path from "path";

const API_KEYS = [
    'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
    '719775e815msh65471c929a0203bp10fe44jsndcb70c04bc42',
    '0c162a35d2msh1999dc27302c23bp15ac06jsnb872ad3d865a',
    'a2743acb5amsh6ac9c5c61aada87p156ebcjsnd25f1ef87037',
];

const getRandomApiKey = () => {
    const randomIndex = Math.floor(Math.random() * API_KEYS.length);
    return API_KEYS[randomIndex];
};

const shortenURL = async (url) => {
    // Replace this function with actual URL shortening logic if needed
    return url;
};

const execute = async ({ api, event, text }) => {
    api.setMessageReaction("🕢", event.messageID, () => {}, true);

    try {
        const args = text.trim().split(" ");
        let title = '';
        let videoId = '';
        let shortUrl = '';

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
            const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }

            shortUrl = await shortenURL(shortUrl);
        } else if (args.length === 0) {
            api.sendMessage("⚠️ | إستعمال غير صالح \n💡كيفية الإستخدام: اغنية [عنوان الأغنية 📀]\n مثال 📝: اغنية fifty fifty copied", event.threadID);
            return;
        } else {
            title = args.join(" ");
            const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
            if (searchResponse.data.length > 0) {
                videoId = searchResponse.data[0].videoId;
            }

            const videoUrlResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
            if (videoUrlResponse.data.length > 0) {
                shortUrl = await shortenURL(videoUrlResponse.data[0]);
            }
        }

        if (!videoId) {
            api.sendMessage("⚠️ | لم يتم ايجاد أغنية بالنسبة لإسن الأغنية المغطاه .", event.threadID);
            return;
        }

        const downloadResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
        const videoUrl = downloadResponse.data[0];

        if (!videoUrl) {
            api.sendMessage("⚠️ | Failed to retrieve download link for the video.", event.threadID);
            return;
        }

        const filePath = path.join(process.cwd(), "cache", `${videoId}.mp3`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            const videoStream = fs.createReadStream(filePath);
            const messageBody = `━━━━━◈✿◈━━━━━\n🎤 | تشغيل الآن : ${title}\n━━━━━◈✿◈━━━━━`;
            api.sendMessage({ body: messageBody, attachment: videoStream }, event.threadID, () => {
                api.setMessageReaction("✅", event.messageID, () => {}, true);
            });
        });

        writer.on('error', (error) => {
            console.error("Error:", error);
            api.sendMessage("❌ | حدث خطأ أثناء تنزيل الاوديو .", event.threadID);
        });
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❌ | حدث خطأ .", event.threadID);
    }
};

export default {
    name: "غني",
    author: "khizits",
    role: "member",
aliases:["اغنية","أغنية"],
    description: "قم بالبحث عن اغاني او رد على مقطع او أغنية من أجل الحصول على اغتيتك.",
    execute,
};
