import axios from "axios";

async function translate(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error('Translation Error:', error.message);
    return text;
  }
}

export default {
  name: "ملصق",
  author: "kaguya project",
  role: "member",
  description: "الرد على الملصقات من خلال الرد عليها أو إرسال ملصق محدد.",
  execute: async function ({ api, event, args }) {
    try {
      if (event.type === "message_reply") {
        const attachment = event.messageReply.attachments[0];
        
        if (attachment.type === "sticker" || attachment.type === "photo") {
          const itemID = attachment.ID;
          return api.sendMessage({ body: itemID }, event.threadID);
        } else {
          return api.sendMessage(" ⚠️ | قم بالرد على ملصق أو صورة رمزية", event.threadID);
        }
      } else if (args[0]) {
        return api.sendMessage({ sticker: args[0] }, event.threadID);
      } else {
        return api.sendMessage(" فقط رد على الملصق أو الصورة الرمزية 😒", event.threadID);
      }
    } catch (error) {
      console.error('Error:', error.message);
      api.sendMessage("❌ |حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  }
};
