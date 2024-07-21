import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

export default {
    name: "موسيقى",
    author: "Kaguya Project",
    role: "member",
    description: "Searches for a song on YouTube and sends the audio file.",
    execute: async function ({ api, event, args }) {
        const chatId = event.threadID;
        const input = args.join(" ");
        const searchTerm = input.substring(input.indexOf(" ") + 1);

        if (!searchTerm) {
            return api.sendMessage(`Please provide a search query. Usage: ${global.config.prefix}music [title]`, chatId, event.messageID);
        }

        try {
            api.sendMessage(`🔍 | جاري البحث عن الاغنية المطلوبة : ${searchTerm}\n ⏱️ | يرجى الانتظار....`, chatId, event.messageID);

            const searchResults = await yts(searchTerm);
            if (!searchResults.videos.length) {
                return api.sendMessage("No music found for your query.", chatId, event.messageID);
            }

            const music = searchResults.videos[0];
            const musicUrl = music.url;

            const stream = ytdl(musicUrl, { filter: "audioonly" });

            stream.on('info', (info) => {
                console.info('[DOWNLOADER]', `Downloading music: ${info.videoDetails.title}`);
            });

            const fileName = `${music.title}.mp3`;
            const filePath = path.join(process.cwd(), 'cache', fileName);

            stream.pipe(fs.createWriteStream(filePath));

            stream.on('end', () => {
                console.info('[DOWNLOADER] Downloaded');

                const stats = fs.statSync(filePath);
                if (stats.size > 26214400) { // Check if file is larger than 25MB
                    fs.unlinkSync(filePath);
                    return api.sendMessage('❌ The file could not be sent because it is larger than 25MB.', chatId, event.messageID);
                }

                api.sendMessage({ 
                    body: `࿇ ══━━━✥◈✥━━━══ ࿇\n${music.title}\n࿇ ══━━━✥◈✥━━━══ ࿇`, 
                    attachment: fs.createReadStream(filePath)
                }, chatId, () => fs.unlinkSync(filePath), event.messageID);
            });

        } catch (error) {
            console.error('[ERROR]', error);
            api.sendMessage('An error occurred while processing the command.', chatId, event.messageID);
        }
    }
};
