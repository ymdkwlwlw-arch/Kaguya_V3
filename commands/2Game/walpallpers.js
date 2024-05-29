import axios from "axios";
import fs from "fs";
import path from "path";

const animeImageLinks = [

 "https://i.imgur.com/dsGmHbh.jpeg",
"https://i.imgur.com/2JclVYu.jpeg",
"https://i.imgur.com/MsRaDuy.jpeg",
"https://i.imgur.com/iX7o4hr.jpeg",
"https://i.imgur.com/MlnBmmy.jpeg",
"https://i.imgur.com/S9GqxOW.jpeg",
"https://i.imgur.com/YslL55P.jpeg",
"https://i.imgur.com/Hvl96lN.jpeg",
"https://i.imgur.com/pS5xWdp.jpeg",
"https://i.imgur.com/3v6z0es.jpeg",
"https://i.imgur.com/CGhixJi.jpeg",
"https://i.imgur.com/Tn7TbGr.jpeg",
"https://i.imgur.com/XOmf4Ss.jpeg",
"https://i.imgur.com/XBLBQgW.jpeg",
"https://i.imgur.com/0UjnMGo.jpeg",
"https://i.imgur.com/BXz4GY1.jpeg",
"https://i.imgur.com/dyytnN2.jpeg",
"https://i.imgur.com/dI2fKYm.jpeg",
"https://i.imgur.com/GFu9kw2.jpeg",
"https://i.imgur.com/xyYRFFR.jpeg",
"https://i.imgur.com/kAj4Bbc.jpeg",
"https://i.imgur.com/9kJ2rQ8.jpeg",
"https://i.imgur.com/Az1Btdp.jpeg",
"https://i.imgur.com/OI4e5Hf.jpeg",
"https://i.imgur.com/cG6Cyvd.jpeg",
"https://i.imgur.com/YQFS82d.jpeg",
"https://i.imgur.com/DqNEArx.jpeg",
"https://i.imgur.com/HLqpQiF.jpeg",
"https://i.imgur.com/RH4thfK.jpeg",
"https://i.imgur.com/cqLZNWd.jpeg",    
"https://i.imgur.com/x530Ctz.jpeg",
"https://i.imgur.com/Jg3FVBq.jpeg",    
"https://i.imgur.com/jbOF4oF.jpeg",
"https://i.imgur.com/WI3AisL.jpeg",
"https://i.imgur.com/wLLhk1f.jpeg",
"https://i.imgur.com/rsPHT9h.jpeg", 
"https://i.imgur.com/2RlOq1S.jpeg",
"https://i.imgur.com/JxUB3a6.jpeg",  
"https://i.imgur.com/QUiCliK.jpeg",
"https://i.imgur.com/2WrmJ3C.jpeg",    
"https://i.imgur.com/jKjcDSa.jpeg",
"https://i.imgur.com/FNXdyVx.jpeg",    
"https://i.imgur.com/Ybipw8x.jpeg",
"https://i.imgur.com/UetOfpQ.jpeg",
"https://i.imgur.com/WG9Jryp.jpeg",
"https://i.imgur.com/834fmcj.jpeg", 
"https://i.imgur.com/tZX4Qkl.jpeg",
"https://i.imgur.com/EWzZL8P.jpeg",
"https://i.postimg.cc/gj0fnpb0/1708894464-437cec2165dbe01a2e90a706655ce462.jpg",    
"https://i.postimg.cc/ZRwQkQvz/1708894464-54a540e1f7c5b5ec92c56205c70f1b27.jpg",
"https://i.postimg.cc/02MB3c8h/1708894464-63b7970725745e0abf39ad25cfede6b7.jpg",
"https://i.postimg.cc/rmRfbpTx/1708894464-87f1f618999777b3e0f7a8007e066984.jpg",
"https://i.postimg.cc/PJh14f5t/1708894464-92ae1214a4a623b3bd1d2bde3dd61fe5.jpg"
];

export default {
  name: "خلفيات",
  author: "Kaguya Project",
  role: "member",
  description: "يقوم بعرض صورة عشوائية لخلفيات ذات جودة عالية",
  async execute({ api, event }) {
    try {
      const randomIndex = Math.floor(Math.random() * animeImageLinks.length);
      const imageUrl = animeImageLinks[randomIndex];

      const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const tempImagePath = path.join(process.cwd(), `./cache/anime_image_${randomIndex + 1}.jpeg`);

      fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));

      api.setMessageReaction("🌟", event.messageID, () => {}, true);

      const message = {
        body: "✿━━━━━━━━━━━━━━━━━✿\n👑 | تفضل إليك صورة الخلفية \n✿━━━━━━━━━━━━━━━━━✿",
        attachment: fs.createReadStream(tempImagePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(tempImagePath); // حذف الملف المؤقت للصورة بعد إرسال الرسالة
      });
    } catch (error) {
      console.error("حدث خطأ: ", error);
      api.sendMessage("❌ | حدث خطأ أثناء جلب صورة أنمي.", event.threadID);
    }
  },
};