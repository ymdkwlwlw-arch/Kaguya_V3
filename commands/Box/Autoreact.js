export default {
  name: "الرياكط",
  author: "YourName",
  role: "admin",
  description: "التفاعل مع الرسائل حسب الكلمات المفتاحية",
  handleEvent: async function() {
    const { api, event } = this.arguments;
    const { body, threadID, messageID } = event;
    const react = body.toLowerCase();

    // التفاعل مع الكلمات الإيجابية
    if (
      react.includes("الله") ||
      react.includes("النبي") ||
      react.includes("الحب") ||
      react.includes("كيف") ||
      react.includes("دومك") ||
      // أضف بقية الكلمات هنا...
      react.includes("حبي") ||
      react.includes("الزواج") ||
      react.includes("🤭") ||
      react.includes("🌚")
    ) {
      const lab = { body: "شكرًا لك!" };
      await api.sendMessage(lab, threadID, messageID);
      api.setMessageReaction("❤️", messageID, (err) => {}, true);
    }

    // التفاعل مع الكلمات الحزينة
    if (
      react.includes("حزن") ||
      react.includes("وجع") ||
      react.includes("قرف") ||
      react.includes("تبا") ||
      react.includes("😕") ||
      // أضف بقية الكلمات هنا...
      react.includes("بكا") ||
      react.includes("ببكي") ||
      react.includes("حنيت")
    ) {
      const sad = { body: "آسف لسماع ذلك." };
      await api.sendMessage(sad, threadID, messageID);
      api.setMessageReaction("🙁", messageID, (err) => {}, true);
    }

    // التفاعل مع كلمات الصباح والمساء
    if (
      react.includes("صباح") ||
      react.includes("مساء") ||
      // أضف بقية الكلمات هنا...
      react.includes("ليل") ||
      react.includes("نهار")
    ) {
      const heart = { body: "صباح الخير!" };
      await api.sendMessage(heart, threadID, messageID);
      api.setMessageReaction("💖", messageID, (err) => {}, true);
    }

    // التفاعل مع الكلمات الساخرة
    if (
      react.includes("ضحك") ||
      react.includes("وسخ") ||
      react.includes("غبي") ||
      react.includes("🤡") ||
      // أضف بقية الكلمات هنا...
      react.includes("حيوان") ||
      react.includes("الحياه")
    ) {
      const jokeResponse = { body: "هههه، هذا مضحك!" };
      await api.sendMessage(jokeResponse, threadID, messageID);
      api.setMessageReaction("😂", messageID, (err) => {}, true);
    }
  }
};
