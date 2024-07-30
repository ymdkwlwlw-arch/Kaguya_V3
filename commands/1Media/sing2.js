import fs from 'fs';
import axios from 'axios';
import path from 'path';

const cacheDir = path.join(process.cwd(), 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

export default {
    name: 'اغنية',
    author: 'kaguya project',
    role: 'member',
    aliases: ['سمعيني', 'موسيقى'],
    description: 'البحث عن أغاني على يوتيوب وتحميلها.',
    
    execute: async function ({ api, event, args }) {
        if (args.length === 0) {
            
            api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
            return api.sendMessage("❗ | يرجى إدخال اسم الأغنية للبحث عنها.", event.threadID, event.messageID);
        }

        const searchQuery = encodeURIComponent(args.join(' '));
        const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;

        try {
            const waitingMessageID = await api.sendMessage("", event.threadID, event.messageID);
            const response = await axios.get(apiUrl);
            const tracks = response.data;

            if (tracks.length > 0) {
                const firstTrack = tracks[0];
                const videoUrl = firstTrack.videoUrl;
                const downloadApiUrl = `https://c-v1.onrender.com/yt/d?url=${encodeURIComponent(videoUrl)}`;

                api.sendMessage("", event.threadID, async (err, info) => {
                    if (err) {
                        console.error('خطأ في إرسال رسالة التحميل:', err);
                        return api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
                    }

                    try {
                        const downloadLinkResponse = await axios.get(downloadApiUrl);
                        const downloadLink = downloadLinkResponse.data.result.audio;

                        if (!downloadLink) {
                            throw new Error("فشل في الحصول على رابط التحميل.");
                        }

                        const filePath = path.join(cacheDir, `${Date.now()}.mp3`);
                        const writer = fs.createWriteStream(filePath);

                        const response = await axios({
                            url: downloadLink,
                            method: 'GET',
                            responseType: 'stream'
                        });

                        response.data.pipe(writer);

                        writer.on('finish', () => {
                            api.setMessageReaction("✅", info.messageID);
                            api.sendMessage({
                                body: `࿇ ══━━━✥◈✥━━━══ ࿇\n ✅ | تم تحميل الأغنية بنجاح \n 🎧 | استمتع بأغنيتك: ${firstTrack.title}.\n📒 | العنوان: ${firstTrack.title}\n📅 | تاريخ النشر: ${new Date(firstTrack.publishDate).toLocaleDateString()}\n👀 | عدد المشاهدات: ${firstTrack.viewCount}\n👍 | عدد اللايكات: ${firstTrack.likeCount}\n࿇ ══━━━✥◈✥━━━══ ࿇`,
                                attachment: fs.createReadStream(filePath),
                            }, event.threadID, () => fs.unlinkSync(filePath));
                        });

                        writer.on('error', (err) => {
                            console.error('خطأ في حفظ الملف:', err);
                            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
                        });
                    } catch (error) {
                        console.error('خطأ أثناء تحميل الأغنية:', error.message);
                        api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: \n ${error.message}`, event.threadID);
                    }
                });

            } else {
                api.sendMessage("❓ | عذرًا، لم أتمكن من العثور على الأغنية.", event.threadID);
            }
        } catch (error) {
            console.error('خطأ أثناء البحث:', error.message);
            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
        }
    }
};
