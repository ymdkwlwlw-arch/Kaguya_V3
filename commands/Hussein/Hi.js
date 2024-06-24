import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

const nm = ["⓪", "⓵", "⓶", "⓷", "⓸", "⓹", "⓺", "⓻", "⓼", "⓽"];
const tmpDir = path.join(cwd(), 'cache');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

async function getStreamFromPath(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = path.join(tmpDir, `${Date.now()}_image.png`);
    fs.writeFileSync(filePath, response.data);
    return fs.createReadStream(filePath);
}

async function execute({ api, event, args }) {
    const q = args.join(" ");
    let p = 1;
    const nan = q.split("-");
    if (nan.length > 1) {
        const am = nan[1];
        if (!isNaN(am)) {
            p = am;
        } else {
            return api.sendMessage("يرجى إدخال رقم صالح.", event.threadID, event.messageID);
        }
    }
    if (!q) {
        return api.sendMessage("يرجى إدخال اسم الهنتاي.", event.threadID, event.messageID);
    }

    try {
        api.setMessageReaction("🍭", event.messageID, (err) => {}, true);
        const response = await axios.get(`https://issam-dev-v1.onrender.com/api/nhentai/search?q=${encodeURIComponent(q)}&page=${p}`);
        const res = response.data.result;

        if (res.length === 0) {
            api.setMessageReaction("🚫", event.messageID, (err) => {}, true);
            return api.sendMessage("لم يتم العثور على نتائج.", event.threadID, event.messageID);
        }

        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        const r6 = res.slice(0, 6);
        let msg = "◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕\n";

        for (let i = 0; i < r6.length; i++) {
            const { name, code } = r6[i];
            const index = (i + 1).toString().split('').map(num => nm[parseInt(num)]).join('');
            msg += `\n◕◕◕◕◕◕◕◕✧${index}✧◕◕◕◕◕◕◕◕\n\n✧◝${name}◜✧\n`;
        }

        const img = await Promise.all(r6.map(async j => await getStreamFromPath(j.coverScr)));
        let ne = "»»» ✧◝التالي";
        if (res.length <= 6) {
            ne = "◍•ᴗ•◍✧*حسنا*";
        }
        await api.sendMessage({
            body: msg + `\n◕◕◕◕◕◕◕◕◕◕◕◕${ne}`,
            attachment: img
        }, event.threadID, event.messageID);

        global.client.handler.reply.set(event.messageID, {
            author: event.senderID,
            type: "nx",
            name: "هينتاي",
            unsend: true,
            data: response.data.slice(0, 5)
        });
    } catch (e) {
        console.error("Error fetching data:", e);
        return api.sendMessage("حدث خطأ أثناء جلب البيانات.", event.threadID, event.messageID);
    }
}

async function onReply({ api, event, reply }) {
    const { senderID, messageID, threadID, body } = event;

    if (reply.type === "nx" && reply.name === "هينتاي" && reply.author === senderID) {
        const selectedIndex = parseInt(body, 10) - 1;
        const messageBody = event.body.trim().toLowerCase();

        if (messageBody === "التالي") {
            const nextPage = reply.page + 1;
            const start = (nextPage - 1) * 6;
            const end = start + 6;

            if (start >= reply.total) {
                return api.sendMessage("لم يتم العثور على نتائج أخرى.", threadID, messageID);
            }

            const nextResults = reply.data.slice(start, end);
            let msg = "◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕◕\n";

            for (let i = 0; i < nextResults.length; i++) {
                const { name } = nextResults[i];
                const index = (start + i + 1).toString().split('').map(num => nm[parseInt(num)]).join('');
                msg += `\n◕◕◕◕◕◕◕◕✧${index}✧◕◕◕◕◕◕◕◕\n\n✧◝${name}◜✧\n`;
            }

            const attachments = await Promise.all(nextResults.map(async j => await getStreamFromPath(j.coverScr)));
            let ne = "»»» ✧◝التالي";
            if (end >= reply.total) {
                ne = "◍•ᴗ•◍✧*حسنا*";
            }
            await api.sendMessage({
                body: msg + `◕◕◕◕◕◕◕◕◕◕◕◕${ne}`,
                attachment: attachments
            }, threadID, messageID);

            global.client.handler.reply.set(messageID, {
                author: senderID,
                type: "nx",
                name: "هينتاي",
                unsend: true,
                data: reply.data,
                page: nextPage,
                total: reply.total
            });
        } else if (!isNaN(messageBody)) {
            const index = parseInt(messageBody, 10) - 1;
            if (index < 0 || index >= reply.data.length) {
                return api.sendMessage(`يرجى الرد برقم صالح. الأرقام المتاحة: ${reply.data.length}`, threadID, messageID);
            }

            const sRe = reply.data[index];
            const { code } = sRe;

            try {
                const res = await axios.get(`https://issam-dev-v1.onrender.com/api/nhentai/view/${code}`);
                const dt = res.data.result;
                const title = dt.nativeTitle || 'nothing';
                let msg = `العنوان: ${dt.title}\nالعنوان الأصلي: ${title}\n`;

                const pages = dt.pages;
                let curBch = 1;

                const send = async (batch) => {
                    const start = (batch - 1) * 12;
                    const end = start + 12;

                    if (start >= pages.length) {
                        return api.sendMessage("لا توجد صور أخرى.", threadID, messageID);
                    }

                    const pgs = await Promise.all(pages.slice(start, end).map(async url => await getStreamFromPath(url)));
                    let ne = "»»» ✧◝التالي";
                    if (end >= pages.length) {
                        ne = "◍•ᴗ•◍✧*حسنا*";
                    }

                    await api.sendMessage({
                        body: msg + `\n${ne}`,
                        attachment: pgs
                    }, threadID, messageID);

                    global.client.handler.reply.set(messageID, {
                        author: senderID,
                        type: "imagePagination",
                        name: "هينتاي",
                        unsend: true,
                        data: {
                            pages,
                            curBch: batch
                        }
                    });
                };

                await send(curBch);

            } catch (e) {
                console.error("Error fetching data:", e);
                return api.sendMessage("حدث خطأ أثناء جلب البيانات.", threadID, messageID);
            }
        }
    } else if (reply.type === "imagePagination" && messageBody === "التالي") {
        const { curBch, pages } = reply.data;
        const nextBatch = curBch + 1;
        const start = (nextBatch - 1) * 12;
        const end = start + 12;

        if (start >= pages.length) {
            return api.sendMessage("لا توجد صور أخرى.", threadID, messageID);
        }

        const pgs2 = await Promise.all(pages.slice(start, end).map(async url => await getStreamFromPath(url)));
        let ne = "»»» ✧◝التالي";
        if (end >= pages.length) {
            ne = "◍•ᴗ•◍✧*حسنا*";
        }

        await api.sendMessage({
            body: `\n${ne}`,
            attachment: pgs2
        }, threadID, messageID);

        global.client.handler.reply.set(messageID, {
            author: senderID,
            type: "imagePagination",
            name: "هينتاي",
            unsend: true,
            data: {
                pages,
                curBch: nextBatch
            }
        });
    }
}

export default {
    name: "هينتاي",
    version: "1.0.0",
    author: "مشروع كاجويا",
    description: "البحث عن الهنتاي وعرض نتائجه",
    role: "admin",
    cooldowns: 5,
    execute,
    onReply
};
