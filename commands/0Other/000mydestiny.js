import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function generateImages({ api, event, args }) {
    try {
        if (args.length < 3) {
            await api.sendMessage("⚠️ | أرجوك قم بإدخال وصف ثم ادخل موديل. استخدم الفاصلة '|' للفصل بين الوصف والموديل.", event.threadID, event.messageID);
            return;
        }

        const input = args.join(" ").split("|").map(arg => arg.trim());
        const [prompt, model] = input;

        if (prompt.split(" ").length < 10) {
            await api.sendMessage("⚠️ | أرجوك قم بكتابة وصف اكثر من 10 كلمات", event.threadID, event.messageID);
            return;
        }

        const availableModels = ["v1", "v2", "v2-beta", "v3", "lexica", "prodia", "simurg", "animefy", "raava", "shonin"];

        if (!availableModels.includes(model)) {
            await api.sendMessage(`⚠️ | الموديل المدخل غير صحيح. الموديلات المتاحة هي: ${availableModels.join(", ")}.`, event.threadID, event.messageID);
            return;
        }

        // ترجمة الوصف من اللغة العربية إلى الإنجليزية
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
        const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0];

        if (!translatedPrompt) {
            await api.sendMessage("⚠️ | حدث خطأ أثناء الترجمة.", event.threadID, event.messageID);
            return;
        }

        const waitingMessage = await api.sendMessage(`⏳ | جاري المعالجة يرجى الانتظار...`, event.threadID);

        // استدعاء API لتوليد الصور
        const apiUrl = `https://openapi-idk8.onrender.com/imagen?prompt=${encodeURIComponent(translatedPrompt)}&model=${encodeURIComponent(model)}`;
        const response = await axios.get(apiUrl);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch images from API. Status: ${response.status}`);
        }

        const images = response.data.generated_images;
        const attachments = [];

        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i];
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');
            const tempFilePath = path.join(process.cwd(), `temp`, `generated_image_${i + 1}.jpg`);
            fs.writeFileSync(tempFilePath, imageBuffer);
            attachments.push(fs.createReadStream(tempFilePath));
        }

        await api.unsendMessage(waitingMessage.messageID);

        await api.sendMessage({
            attachment: attachments,
            body: `╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم توليد الصورة بنجاح\n
الوصف : "${prompt}"
الموديل : ${model}\n╼╾─────⊹⊱⊰⊹─────╼╾`,
        }, event.threadID);

        // حذف الملفات المؤقتة بعد إرسالها
        for (let i = 0; i < images.length; i++) {
            const tempFilePath = path.join(process.cwd(), `temp`, `generated_image_${i + 1}.jpg`);
            fs.unlinkSync(tempFilePath);
        }

    } catch (error) {
        console.error('Error in generateImages command:', error);
        await api.sendMessage("⚠️ | Failed to generate or send images. Please try again later.", event.threadID, event.messageID);
    }
}

export default {
    name: "ارسمي3",
    author: "Kaguya Project",
    role: "member",
    description: "Generates images based on the provided description and model.",
    execute: generateImages
};
