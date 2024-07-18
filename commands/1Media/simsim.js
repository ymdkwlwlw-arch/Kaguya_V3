import axios from 'axios';

export default {
  name: "كاغويا",
  author: "Kaguya Project",
  role: "member",
  description: "يدردش معك ويرد برسالة مع ستيكر عند الرد عليه.",
  aliases: ["بوت"],

  async execute({ api, event, client }) {
    const { threadID, messageID, body, senderID } = event;

    const stickers = [
      "1015156960280119",
      "1832681453922352",
      "772035074841442",
      "1131886254547738",
      "463741316429523",
      "360232843844379",
      "511160708070561",
      "415593244815496",
      "1176396180346210",
      "918551956701051",
      "1020001456469983",
      "463741316429523",
      "360232843844379",
      "415593244815496",
      "511160708070561",
      "1494932474483177",
      "1020001456469983",
      "360232843844379",
      "918551956701051",
      "463741316429523",
      "362102093368653",
      "1494932474483177",
      "1020001456469983",
      "918551956701051",
      "360232843844379",
      "362102093368653",
      "835833541484755",
      "1020001456469983",
      "1494932474483177",
      "1013816043428639",
      "1256779519064751",
      "467192466059605",
      "1210419519971441",
      "1006729237339750",
      "493778809973286",
      "338910962505602",
      "776875071278369",
      "2505668392967530",
      "1045092483992592",
      "7980573828726622",
      "1652267542175341",
      "1434090263966559",
      "3357489131220771",
      "1037849737939483",
      "1009939234181096",
      "861475199177282",
      "459048116977656",
      "351566904650840",
      "1122859335445571",
      "842573494102145",
      "1495567557725620",
      "1015156960280119"
    ];

    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];

    try {
      const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
      const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

      api.sendMessage(replyMessage, threadID, (error, info) => {
        if (!error) {
          api.sendMessage({ sticker: randomSticker }, threadID);
          global.client.handler.reply.set(info.messageID, {
            author: senderID,
            type: "reply",
            name: "كاغويا",
            unsend: false,
          });
        }
      }, messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
    }
  },

  async onReply({ api, event, reply, Economy, Users }) {
    const { threadID, messageID, body, senderID } = event;

    if (reply.type === "reply") {
      const stickers = [
        "1015156960280119",
        "1832681453922352",
        "772035074841442",
        "1131886254547738",
        "463741316429523",
        "360232843844379",
        "511160708070561",
        "415593244815496",
        "1176396180346210",
        "918551956701051",
        "1020001456469983",
        "463741316429523",
        "360232843844379",
        "415593244815496",
        "511160708070561",
        "1494932474483177",
        "1020001456469983",
        "360232843844379",
        "918551956701051",
        "463741316429523",
        "362102093368653",
        "1494932474483177",
        "1020001456469983",
        "918551956701051",
        "360232843844379",
        "362102093368653",
        "835833541484755",
        "1020001456469983",
        "1494932474483177",
        "1013816043428639",
        "1256779519064751",
        "467192466059605",
        "1210419519971441",
        "1006729237339750",
        "493778809973286",
        "338910962505602",
        "776875071278369",
        "2505668392967530",
        "1045092483992592",
        "7980573828726622",
        "1652267542175341",
        "1434090263966559",
        "3357489131220771",
        "1037849737939483",
        "1009939234181096",
        "861475199177282",
        "459048116977656",
        "351566904650840",
        "1122859335445571",
        "842573494102145",
        "1495567557725620",
        "1015156960280119"
      ];

      const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];

      try {
        const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
        const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

        api.sendMessage(replyMessage, threadID, (error, info) => {
          if (!error) {
            api.sendMessage({ sticker: randomSticker }, threadID);
            global.client.handler.reply.set(info.messageID, {
              author: senderID,
              type: "reply",
              name: "كاغويا",
              unsend: false,
            });
          }
        }, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
      }
    } else {
      console.error("Error sending message:", err);
    }
  }
};
