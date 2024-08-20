import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
    name: "صور",
    author: "HUSSEIN YACOUBI",
    role: "member",
    aliases:["بنتريست"],
    description: "Searches Pinterest and returns related images based on the keyword.",
    execute: async function({ api, event, args }) {
        const keySearch = args.join(" ");
        
        // React with ⏱️ to indicate the search has started
        api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

        // API request to fetch Pinterest images
        const pinterestResponse = await axios.get(`https://www.noobs-api.000.pe/dipto/pinterest?search=${encodeURIComponent(keySearch)}&limit=9`);
        const data = pinterestResponse.data.data;

        const imgData = [];
        const cacheDir = path.join(process.cwd(), 'cache');

        for (let i = 0; i < data.length; i++) {
            const imgPath = path.join(cacheDir, `jj${i + 1}.jpg`);
            const imageResponse = await axios.get(data[i], { responseType: 'arraybuffer' });
            fs.writeFileSync(imgPath, Buffer.from(imageResponse.data, 'binary'));
            imgData.push(fs.createReadStream(imgPath));
        }

        // Send the images in the chat
        api.sendMessage({
            attachment: imgData,
            body: '[⚜️] هذه عمليات البحث ذات الصلة'
        }, event.threadID, (err, info) => {
            if (err) console.error(err);

            // Clean up the cache by removing the downloaded images
            for (let i = 0; i < data.length; i++) {
                fs.unlinkSync(path.join(cacheDir, `jj${i + 1}.jpg`));
            }

            // React with ✅ to indicate the operation was successful
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        });
    }
};
