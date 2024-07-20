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

const downloadMusic = async (downloadUrl) => {
    const downloadApiUrl = `https://spdl-v1.onrender.com/download?q=${encodeURIComponent(downloadUrl)}`;
    try {
        const downloadLinkResponse = await axios.get(downloadApiUrl);
        const downloadLink = downloadLinkResponse.data;
        const filePath = path.join(process.cwd(), 'cache', `${Date.now()}.mp3`);
        const writeStream = fs.createWriteStream(filePath);

        const audioResponse = await axios.get(downloadLink, { responseType: 'stream' });
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
    aliases:["غني","أغنية"],
    description: "يبحث عن الموسيقى على Spotify ويسمح للمستخدمين بتنزيلها.",
    execute: async function ({ api, event, args }) {
        const listensearch = args.join(" ");
        if (!listensearch) {
            return api.sendMessage("حدث خطأ", event.threadID, event.messageID);
        }

        try {
            api.sendMessage("🎵 | جاري البحث عن أغنيتك على سبوتيفاي. انتظر من فضلك...", event.threadID, event.messageID);
            const tracks = await searchMusicOnSpotify(listensearch);

            if (tracks.length > 0) {
                const topTracks = tracks.slice(0, 10);
                let message = "🎶 𝗦𝗽𝗼𝘁𝗶𝗳𝘆\n\n━━━━━━━━━━━━━\n🎶 | إليك توب 10 أغاني على سبوتيفاي\n\n";

                topTracks.forEach((track, index) => {
                    message += `🆔 المعرف : ${index + 1}\n`;
                    message += `📝 العنوان : ${track.name}\n`;
                    message += `📅 تاريخ الرفع : ${track.release_date}\n`;
                    message += `⏱️ المدة : ${formatDuration(track.duration_ms)}\n`;
                    message += `📀 الالبوم : ${track.album}\n`;
                    message += `🎧 الرابط الظاهر : ${track.preview_url}\n`;
                    message += `⚙️ عنوان URL : ${track.external_url}\n`;
                    message += "━━━━━━━━━━━━━\n";
                });
                message += "\nقم بالرد برقم الأغنية التي تريد تنزيلها.";

                api.sendMessage(message, event.threadID, (err, info) => {
                    if (err) {
                        console.error(err);
                        return api.sendMessage("❓ | عذرًا، لم أتمكن من العثور على الموسيقى المطلوبة على Spotify.", event.threadID);
                    }

                    global.client.handler.reply.set(info.messageID, {
                        author: event.senderID,
                        type: "reply",
                        name: "اغنية",
                        unsend: false
                    });
                });
            } else {
                api.sendMessage("❓ | عذرًا، لم أتمكن من العثور على الموسيقى المطلوبة على Spotify.", event.threadID);
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
        }
    },

    onReply: async function ({ api, event, reply }) {
        if (reply.type === "reply") {
            if (event.senderID !== global.client.handler.reply.get(reply.messageID)?.author) {
                return;
            }

            try {
                const tracks = global.client.handler.reply.get(reply.messageID)?.tracks;
                if (isNaN(reply.body) || reply.body < 1 || reply.body > tracks.length) {
                    throw new Error("Invalid selection. Please reply with a number corresponding to the track.");
                }

                const selectedTrack = tracks[reply.body - 1];
                const filePath = await downloadMusic(selectedTrack.external_url);

                if (fs.statSync(filePath).size > 26214400) {
                    fs.unlinkSync(filePath);
                    return api.sendMessage('⚠️ |تعذر إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
                }

                api.unsendMessage(reply.messageID);
                api.sendMessage({ 
                    body: `🎶 𝗦𝗽𝗼𝘁𝗶𝗳𝘆\n\n━━━━━━━━━━━━━\nتفضل اغنيتك ${selectedTrack.name} من سبوتيفاي.\n\nEnjoy listening!\n\n📝 العنوان : ${selectedTrack.name}\n👑 الفنان : ${selectedTrack.artists.join(', ')}\n📅 تاريخ الرفع : ${selectedTrack.release_date}\n⏱️ | المدة : ${formatDuration(selectedTrack.duration_ms)}\n📀 | الالبوم : ${selectedTrack.album}\n🎧 |رابط الظاهر : ${selectedTrack.preview_url}\nتنزيل الأغنية : ${selectedTrack.external_url}`,
                    attachment: fs.createReadStream(filePath)
                }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

            } catch (error) {
                console.error(error);
                api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID);
            }
        }
    }
};
