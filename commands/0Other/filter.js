import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

async function getPairDp({ api, event, args }) {
    
    try {
        // Fetch the data from the API
        const { data } = await axios.get("https://tanjiro-api.onrender.com/cdp?api_key=tanjiro");

        // Fetch male image
        const maleImg = await axios.get(data.male, { responseType: "arraybuffer" });
        const maleImgPath = path.join(process.cwd(), "tmp", "img1.png");
        await fs.ensureDir(path.dirname(maleImgPath)); // Ensure the directory exists
        await fs.writeFile(maleImgPath, Buffer.from(maleImg.data, "utf-8"));

        // Fetch female image
        const femaleImg = await axios.get(data.female, { responseType: "arraybuffer" });
        const femaleImgPath = path.join(process.cwd(), "tmp", "img2.png");
        await fs.writeFile(femaleImgPath, Buffer.from(femaleImg.data, "utf-8"));

        // Prepare the message and attachments
        const msg = "✿━━━━━━━━━━━━━━━━━✿\n「 إليك التطقيم الخاص بك✨ 」\n✿━━━━━━━━━━━━━━━━━✿";
        const allImages = [
            fs.createReadStream(maleImgPath),
            fs.createReadStream(femaleImgPath)
        ];

        // Send the message with attachments
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        return api.sendMessage({
            body: msg,
            attachment: allImages
        }, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("❌ | An error occurred while processing your request.", event.threadID, event.messageID);
    }
}

export default {
    name: "تطقيم2",
    author: "kaguya project",
    role: "member",
    description: "يولد زوج من صور العرض.",
    execute: getPairDp
};