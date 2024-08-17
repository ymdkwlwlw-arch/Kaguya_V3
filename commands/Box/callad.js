import fs from "fs-extra";
import path from "path";

export default {
  name: "تطقيم",
  author: "Kaguya Project 1",
  description: "جلب صورة لزوجين أنمي",
  role: "member",
  execute: async ({ api, event, Economy }) => {
    try {
      const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 500;
      if (userMoney < cost) {
        return api.sendMessage(`🔖 | سيكلفك ذالك ${cost} دولار للتطقيم الواحد`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID);

      // مجموعة روابط الصور للأنثى والذكر
      const femaleImages = [
        "https://ibb.co/tCrf2FF",
        "https://ibb.co/W5JSQ0R",
        "https://ibb.co/3kbpvxz",
        "https://ibb.co/tpVp0jH",
        "https://ibb.co/m9wgmdx",
        "https://ibb.co/K0SXRb4",
        "https://ibb.co/pf2TWT9",
        "https://ibb.co/pQj02jW",
        "https://ibb.co/X3rs5J7",
        "https://ibb.co/TPKyx2Z",
        "https://ibb.co/3cpbznr",
        "https://ibb.co/850rFQ9",
        "https://ibb.co/7StNq1p",
        "https://ibb.co/9nWs5Qf",
        "https://ibb.co/z217MMx",
        "https://ibb.co/JdTdR3w",
        "https://ibb.co/d2T6TXg",
        "https://ibb.co/8r728pc",
        "https://ibb.co/SwBjVVZ",
        "https://ibb.co/Sddbs90",
        "https://ibb.co/S0XPHR4",
        "https://ibb.co/VvCzStj",
        "https://ibb.co/x1gF1MD",
        "https://ibb.co/fpzrp63",
        "https://ibb.co/TYyy2jk",
        "https://ibb.co/n0cBxMY",
        "https://ibb.co/nfZ2XKz",
        "https://ibb.co/KjB00JP",
        "https://ibb.co/xJ7N9CQ",
        "https://ibb.co/KxKp0rz",
        "https://ibb.co/gPW7q26",
        "https://ibb.co/xX7Nntd",
        "https://ibb.co/yPLFd4c",
        "https://ibb.co/h8mJ96n",
        "https://ibb.co/3MGqydM",
        "https://ibb.co/4JNY550",
        "https://ibb.co/Q6fRr48",
        "https://ibb.co/5k4KT7X",
        "https://ibb.co/G2gHx0j",
        "https://ibb.co/hKz5DqT",
        "https://ibb.co/Nn2c6bF",
           "https://ibb.co/mHB0v5M",
        "https://ibb.co/x1fSkFh",
        "https://ibb.co/3YSVQN2",
        "https://ibb.co/6JH6HpM",
        "https://ibb.co/6vvqgHf",
        "https://ibb.co/QpcWwC3",
        "https://ibb.co/Wp8pNzq",
        "https://ibb.co/fHbVX2y",
        "https://ibb.co/2kTwX50",

"https://ibb.co/Wy5YnJP"
        // أضف المزيد من الروابط هنا
      ];

      const maleImages = [
        "https://ibb.co/xChdfs1",
        "https://ibb.co/VJ808B5",
        "https://ibb.co/mtV1yCR",
        "https://ibb.co/RPgHnsP",
        "https://ibb.co/qgXmLXw",
        "https://ibb.co/7pPPm3S",
        "https://ibb.co/B33dtp1",
        "https://ibb.co/ZLPnPDM",
        "https://ibb.co/F3Y5Pmt",
        "https://ibb.co/N7Hmj3J", 
        "https://ibb.co/8jH2qfd",
        
"https://ibb.co/R4yy8Qb",       
        "https://ibb.co/NFjCbT0",
        "https://ibb.co/mGZXC4j",
        "https://ibb.co/ThsYH02",
        "https://ibb.co/hgGXxFW",
        "https://ibb.co/mH6r3HC",
        "https://ibb.co/JcnHbN9",
        "https://ibb.co/1fMgnZz",
        "https://ibb.co/kDvY115",
        "https://ibb.co/jfMvwY0",
        "https://ibb.co/cynq03T",
        "https://ibb.co/wNcHQSy",
        "https://ibb.co/p27KBXq",
        "https://ibb.co/pP27CrZ",
        "https://ibb.co/ypLDL4T",
        "https://ibb.co/RNshfWG",
           "https://ibb.co/VjD3wRY",
        "https://ibb.co/KbYxBv0",
        "https://ibb.co/qpCN4sB",
        "https://ibb.co/XzcfCv0",
        "https://ibb.co/jDz4fxq",
        "https://ibb.co/VwRdS6Z",
        "https://ibb.co/nkKCwxP",
        "https://ibb.co/MRXjRJz",
        "https://ibb.co/3MGqydM",
        "https://ibb.co/dbCnJKx",
        "https://ibb.co/GCpnz4h",
        "https://ibb.co/KsnGMRT",
        "https://ibb.co/w4rn4QD",
        "https://ibb.co/5vwmm1h",
           "https://ibb.co/sHqfRMj",
        "https://ibb.co/8gBwydY",
        "https://ibb.co/Vx0q72v",
        "https://ibb.co/XyndZWc",
        "https://ibb.co/ZSMTjr9",
        "https://ibb.co/hWN1RNH",
        "https://ibb.co/2vsFFDJ",
        "https://ibb.co/6v9tp70",
        "https://ibb.co/j63bMbb",
        "https://ibb.co/K9DzJY7",


        "https://ibb.co/Yf4D3SH"
        
        // أضف المزيد من الروابط هنا
      ];

      // اختيار فهرس عشوائي للصور
      const index = Math.floor(Math.random() * femaleImages.length);

      // اختيار الصورة بناءً على الفهرس العشوائي
      const imageUrl1 = femaleImages[index];
      const imageUrl2 = maleImages[index];

      // تحميل الصور
      const image1Response = await axios.get(imageUrl1, { responseType: "arraybuffer" });
      const image2Response = await axios.get(imageUrl2, { responseType: "arraybuffer" });

      // حفظ الصور مؤقتًا
      const path1 = path.join(process.cwd(), "cache", "anime_pair_1.jpg");
      const path2 = path.join(process.cwd(), "cache", "anime_pair_2.jpg");
      fs.writeFileSync(path1, Buffer.from(image1Response.data, "binary"));
      fs.writeFileSync(path2, Buffer.from(image2Response.data, "binary"));

      // إرسال الصور إلى المستخدم
      await api.sendMessage(
        {
          body: '◆❯━━━━━▣✦▣━━━━━❮◆\n\t「إليك التطقيم الخاص بك ✨」\n◆❯━━━━━▣✦▣━━━━━❮◆',
          attachment: [
            fs.createReadStream(path1),
            fs.createReadStream(path2)
          ],
        },
        event.threadID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء جلب الصور.", event.threadID);
    }
  },
};
