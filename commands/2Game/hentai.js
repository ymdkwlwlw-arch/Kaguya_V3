import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

const tmpDir = path.join(cwd(), 'cache');
const configFilePath = path.join(cwd(), 'setup', 'config.js');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

async function takeScreenshot({ api, event, args }) {
    const url = args.join(" ");
    if (!url) {
        return api.sendMessage("Please provide a URL.", event.threadID, event.messageID);
    }
    try {
        const response = await axios.get(`https://nobs-api.onrender.com/dipto/ss?url=${encodeURIComponent(url)}`, {
            responseType: "arraybuffer",
        });

        const screenshotPath = path.join(tmpDir, `${Date.now()}_screenshot.png`);
        fs.writeFileSync(screenshotPath, Buffer.from(response.data, 'binary'));

        api.sendMessage({
            body: "╼╾─────⊹⊱⊰⊹─────╼╾\nتم بنجاح التقاط شاشة ! 📸\n╼╾─────⊹⊱⊰⊹─────╼╾",
            attachment: fs.createReadStream(screenshotPath)
        }, event.threadID, event.messageID);

        // Optionally, clean up the temporary screenshot file
        fs.unlinkSync(screenshotPath);
    } catch (error) {
        console.error("Error taking screenshot:", error);
        api.sendMessage("Failed to take a screenshot.", event.threadID, event.messageID);
    }
}

export default {
    name: "لقطة_شاشة",
    author: "ChatGPT",
    role: "member",
    description: "Take a screenshot of a webpage.",
    execute: takeScreenshot
};
