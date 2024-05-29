import fs from "fs";
import axios from "axios";
import path from "path";

const tempImageFilePath = process.cwd() + "/cache/tempImage.jpg";
const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "سورة",
    author: "حسين يعقوبي",
    role: "member",
    description: "احزر السورة إنطلاقا من صور الآيات",
    execute: async function ({ api, event, Economy }) {
        try {
            const characters = [


      { image: "https://i.imgur.com/DtXE7kT.jpg", name: "سورة الكوثر" },
        { image: "https://i.imgur.com/dUpgEJY.jpg",  name: "سورة الفلق" },
        { image: "https://i.imgur.com/pos6a03.jpg",  name: "سورة القدر" },
        { image: "https://i.imgur.com/z5b1QrM.jpg",  name: "سورة العصر" },
      { image: "https://i.imgur.com/Fd6iDCb.jpg",  name: "سورة البينة" },
      { image: "https://i.imgur.com/oSN2tYj.jpg",  name: "سورة الناس" },
      { image: "https://i.imgur.com/awiWfPe.jpg",  name: "سورة الإخلاص" },
      { image: "https://i.imgur.com/I65oQjB.jpg",  name: "سورة الماعون" },
      { image: "https://i.imgur.com/fA1mDnL.jpg",  name: "سورة العصر" },
      { image: "https://i.imgur.com/NCqOLFT.jpg",  name: "سورة الفاتحة" }
    
];

            const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

            const imageResponse = await axios.get(randomCharacter.image, { responseType: "arraybuffer" });
            fs.writeFileSync(tempImageFilePath, Buffer.from(imageResponse.data, "binary"));

            const attachment = [fs.createReadStream(tempImageFilePath)];
            const message = `✿━━━━━━━━━━━━━━━━━✿\n🌟 | ماهو إسم السورة الكريمة ؟\n✿━━━━━━━━━━━━━━━━━✿`;

            api.sendMessage({ body: message, attachment }, event.threadID, async (error, info) => {
                if (!error) {
                    try {
                        await Economy.getBalance(event.senderID); // Check user's economy info
                        client.handler.reply.set(info.messageID, {
                            author: event.senderID,
                            type: "reply",
                            name: "سورة",
                            correctName: randomCharacter.name, // Add the correct name
                            unsend: true
                        });
                    } catch (e) {
                        console.error("Error checking user's economy info:", e);
                    }
                } else {
                    console.error("Error sending message:", error);
                }
            });
        } catch (error) {
            console.error("Error executing the game:", error);
            api.sendMessage(`An error occurred while executing the game. Please try again.`, event.threadID);
        }
    },
    onReply: async function ({ api, event, reply, Economy }) {
        if (reply && reply.type === "reply" && reply.name === "سورة") {
            const userGuess = event.body.trim();
            const correctName = reply.correctName;

            if (userGuess === correctName) {
                try {
                    // Handle winning action here, like increasing points

                    
                        const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
                        const userPoints = pointsData[event.senderID] || { name: userName, points: 0 }; // تحقق من وجود بيانات المستخدم، وإذا لم يكن موجودًا، قم بإنشاء بيانات جديدة
                        userPoints.points += 50; // زيادة عدد النقاط
                        pointsData[event.senderID] = userPoints; // تحديث بيانات المستخدم في الكائن
                        fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

                    const userInfo = await api.getUserInfo(event.senderID);
                    const userName = userInfo ? userInfo[event.senderID].name : 'الفائز'; 

                    api.sendMessage(`✅ | تهانينا يا ${userName}! 🥳لقد قمت بتخمين إسم السورة بشكل صحيح. و حصلت بذالك على 200 نقطة.`,
                    event.threadID);

                    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                    api.unsendMessage(reply.messageID);
                } catch (e) {
                    console.error("Error handling winning action:", e);
                }
            } else {
                api.sendMessage(`❌ | آسفة، لقد أخطأت في تخمين إسم السورة، حاول مرة أخرى.`, event.threadID);

                api.setMessageReaction("❌", event.messageID, (err) => {}, true);

            }
        }
        fs.unlinkSync(tempImageFilePath);
    }
};