import fs from 'fs';
import path from 'path';
import axios from 'axios';

const formatDuration = (duration_ms) => {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const searchMusicOnSpotify = async (query) => {
    const apiUrl = `https://spdl-v1.onrender.com/search?q=${encodeURIComponent(query)}`;
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching data from Spotify.');
    }
};

const downloadMusic = async (previewUrl) => {
    if (!previewUrl) {
        throw new Error('No preview URL available for this track.');
    }

    const filePath = path.join(process.cwd(), 'cache', `${Date.now()}.mp3`);
    const writeStream = fs.createWriteStream(filePath);

    try {
        const audioResponse = await axios.get(previewUrl, { responseType: 'stream' });
        audioResponse.data.pipe(writeStream);

        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(filePath));
            writeStream.on('error', reject);
        });
    } catch (error) {
        throw new Error('Error downloading the music.');
    }
};

export default {
    name: "اغنية",
    author: "Kaguya Project",
    role: "member",
    aliases: ["غني", "أغنية"],
    description: "يبحث عن الموسيقى على Spotify ويسمح للمستخدمين بتنزيلها.",
    execute: async function ({ api, event, args }) {
        const listensearch = args.join(" ");
        if (!listensearch) {
            return api.sendMessage("❓ | حدث خطأ، يرجى إدخال اسم الأغنية.", event.threadID, event.messageID);
        }

        try {
            api.sendMessage("🎵 | جاري البحث عن أغنيتك على سبوتيفاي. انتظر من فضلك...", event.threadID, event.messageID);
            const tracks = await searchMusicOnSpotify(listensearch);

            if (tracks.length > 0) {
                const topTrack = tracks[0]; // نأخذ أول نتيجة فقط

                if (!topTrack.preview_url) {
                    return api.sendMessage('❓ | لا يوجد رابط تحميل متاح للأغنية المطلوبة.', event.threadID);
                }

                const filePath = await downloadMusic(topTrack.preview_url);

                if (fs.statSync(filePath).size > 26214400) {
                    fs.unlinkSync(filePath);
                    return api.sendMessage('⚠️ | تعذر إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
                }

                api.sendMessage({
                    body: `🎶 𝗦𝗽𝗼𝘁𝗶𝗳𝘆\n\n━━━━━━━━━━━━━\nتفضل اغنيتك ${topTrack.name} من سبوتيفاي.\n\nEnjoy listening!\n\n📝 العنوان : ${topTrack.name}\n👑 الفنان : ${topTrack.artists.join(', ')}\n📅 تاريخ الرفع : ${topTrack.release_date}\n⏱️ | المدة : ${formatDuration(topTrack.duration_ms)}\n📀 | الالبوم : ${topTrack.album}\n🎧 | الرابط الظاهر : ${topTrack.preview_url}\nرابط تحميل الأغنية : ${topTrack.external_url}`,
                    attachment: fs.createReadStream(filePath)
                }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
            } else {
                api.sendMessage("❓ | عذرًا، لم أتمكن من العثور على الموسيقى المطلوبة على Spotify.", event.threadID);
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
        }
    }
};
