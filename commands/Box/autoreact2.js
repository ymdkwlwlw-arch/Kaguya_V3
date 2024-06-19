import fs from 'fs';
import axios from 'axios';
import path from 'path';

async function translateText(text) {
    try {
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
        return translationResponse?.data?.[0]?.[0]?.[0];
    } catch (error) {
        console.error('Error in translation:', error);
        return text; // In case of error, return the original text
    }
}

export default {
    name: "تشابه",
    author: "kaguya project",
    description: "يقوم بالبحث عن معلومات حول الصورة المرسلة أو رابط الصورة.",
    role: "member",
    execute: async ({ api, args, message, event }) => {
        let imageUrl;

        if (event.messageReply && event.messageReply.attachments.length > 0) {
            imageUrl = event.messageReply.attachments[0].url;
        } else if (args.length > 0) {
            imageUrl = args[0];
        } else {
            return api.sendMessage("الرجاء الرد على صورة أو تقديم رابط صورة.", event.threadID, event.messageID);
        }

        try {
            const response = await axios.get(`https://samirxpikachu.onrender.com/glens?url=${encodeURIComponent(imageUrl)}`);
            const results = response.data.results[0].content.results.organic.slice(0, 6);

            if (results.length > 0) {
                const translatedResults = await Promise.all(results.map(async (result, index) => {
                    const translatedTitle = await translateText(result.title);
                    return {
                        index: index + 1,
                        title: translatedTitle,
                        url: result.url,
                        thumbnail: result.url_thumbnail
                    };
                }));

                const trackInfo = translatedResults.map(result => 
                    `${result.index}. ${result.title}\nURL: ${result.url}`
                ).join("\n\n");

                const attachments = await Promise.all(
                    translatedResults.map(async (result, index) => {
                        const thumbnailResponse = await axios.get(result.thumbnail, { responseType: 'stream' });
                        const filePath = path.resolve(process.cwd(), 'cache', `thumbnail_${index}.jpg`);
                        const writer = fs.createWriteStream(filePath);
                        thumbnailResponse.data.pipe(writer);

                        return new Promise((resolve, reject) => {
                            writer.on('finish', () => resolve(fs.createReadStream(filePath)));
                            writer.on('error', reject);
                        });
                    })
                );

                await api.sendMessage({
                    body: `${trackInfo}`,
                    attachment: attachments
                }, event.threadID, event.messageID);

                // Clean up cache files
                attachments.forEach(stream => {
                    const filePath = stream.path;
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            } else {
                api.sendMessage("لم يتم العثور على نتائج للصورة المقدمة.", event.threadID, event.messageID);
            }
        } catch (error) {
            console.error(error);
            api.sendMessage("حدث خطأ أثناء جلب نتائج البحث عن الصورة.", event.threadID, event.messageID);
        }
    }
};
