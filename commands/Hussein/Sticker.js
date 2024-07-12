import fs from 'fs';
import axios from 'axios';
import path from 'path';

async function translateText(text) {
    try {
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        return translationResponse?.data?.[0]?.[0]?.[0];
    } catch (error) {
        console.error('Error in translation:', error);
        return text; // In case of error, return the original text
    }
}

async function generateSticker({ api, event, args }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
        const baseUrl = "https://kshitiz-t2i-fjfq.onrender.com/sdxl";
        let prompt = '';
        const model_id = 39;

        if (args.length > 0) {
            prompt = args.join(" ").trim();
            // Translate prompt from Arabic to English
            prompt = await translateText(prompt);
        } else {
            return api.sendMessage("❌ | ارجوك قم بادخال اسم الشخصية", event.threadID, event.messageID);
        }

        const apiResponse = await axios.get(baseUrl, {
            params: {
                prompt: prompt,
                model_id: model_id
            }
        });

        if (apiResponse.data.imageUrl) {
            const imageUrl = apiResponse.data.imageUrl;
            const imagePath = path.join(process.cwd(), "cache", `sticker.png`);
            const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
            const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));
            imageStream.on("finish", () => {
                const stream = fs.createReadStream(imagePath);
                api.sendMessage({
                    body: "",
                    attachment: stream
                }, event.threadID, event.messageID);
            });
        } else {
            throw new Error("Image URL not found in response");
        }
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("❌ | حدث خطأ ، المرجو اعادة المحاولة في مرة اخرى", event.threadID, event.messageID);
    }
}

export default {
    name: "استيكر",
    author: "kaguya project",
    description: "إنشاء ملصق باستخدام موجه نصي",
    role: "member",
    execute: generateSticker
};
