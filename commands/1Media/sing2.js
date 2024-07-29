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
    role: "member",
    aliases:["سمعيني"،"موسيقى"],
    description: 'البحث عن أغاني على يوتيوب وتحميلها.',
    
    execute: async function ({ api, event, args }) {
        if (args.length === 0) {
            return api.sendMessage("❗ | يرجى إدخال اسم الأغنية للبحث عنها.", event.threadID, event.messageID);
        }

        const searchQuery = encodeURIComponent(args.join(" "));
        const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;

        try {
            const waitingMessageID = await api.sendMessage("🎵 | جاري البحث عن الموسيقى. يرجى الانتظار...", event.threadID, event.messageID);
            const response = await axios.get(apiUrl);
            const tracks = response.data;

            if (tracks.length > 0) {
                const topTracks = tracks.slice(0, 6);
                let message = "🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n❍─────────────❍\n\n🎶 | إليك أفضل 6 نتائج على يوتيوب\n\n";

                for (const track of topTracks) {
                    message += `🆔 الرقم: ${topTracks.indexOf(track) + 1}\n`;
                    message += `📝 العنوان: ${track.title}\n`;
                    message += `📅 تاريخ الرفع: ${new Date(track.publishDate).toLocaleDateString()}\n`;
                    message += `👤 القناة: ${track.channelTitle}\n`;
                    message += `👁 عدد المشاهدات: ${track.viewCount}\n`;
                    message += `👍 اللايكات: ${track.likeCount}\n`;
                    message += "❍─────────────❍\n";
                }

                message += "\nرد برقم الأغنية التي تريد تحميلها.";

                api.sendMessage({ body: message }, event.threadID, (err, info) => {
                    if (err) {
                        console.error('خطأ في إرسال الرسالة:', err);
                        return api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
                    }

                    api.unsendMessage(waitingMessageID);
                    
                    global.client.handler.reply.set(info.messageID, {
                        author: event.senderID,
                        type: "pick",
                        name: "اغنية",
                        tracks: topTracks,
                        unsend: true,
                    });
                });
            } else {
                api.sendMessage("❓ | عذرًا، لم أتمكن من العثور على الأغنية.", event.threadID);
            }
        } catch (error) {
            console.error('خطأ أثناء البحث:', error.message);
            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
        }
    },

    onReply: async function ({ api, event, reply, args }) {
        const replyIndex = parseInt(args[0]);
        const { author, tracks } = reply;

        if (event.senderID !== author) return;

        try {
            if (isNaN(replyIndex) || replyIndex < 1 || replyIndex > tracks.length) {
                throw new Error("اختيار غير صالح. يرجى الرد برقم يطابق الأغنية.");
            }

            const selectedTrack = tracks[replyIndex - 1];
            const videoUrl = selectedTrack.videoUrl;
            const downloadApiUrl = `https://c-v1.onrender.com/yt/d?url=${encodeURIComponent(videoUrl)}`;

            api.sendMessage("⏳ | جاري تحميل الأغنية. يرجى الانتظار...", event.threadID, async (err, info) => {
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
                            body: `࿇ ══━━✥◈✥━━══ ࿇\n ✅ | تم تحميل الأغنية بنجاح \n 🎧 | استمتع بأغنيتك: ${selectedTrack.title}.\n📒 | العنوان: ${selectedTrack.title}\n📅 | تاريخ النشر: ${new Date(selectedTrack.publishDate).toLocaleDateString()}\n👀 | عدد المشاهدات: ${selectedTrack.viewCount}\n👍 | عدد اللايكات: ${selectedTrack.likeCount}\n࿇ ══━━✥◈✥━━══ ࿇`,
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

        } catch (error) {
            console.error('خطأ في التعامل مع الرد:', error.message);
            api.sendMessage(`🚧 | حدث خطأ أثناء معالجة الطلب: \n ${error.message}`, event.threadID);
        }
    }
};
