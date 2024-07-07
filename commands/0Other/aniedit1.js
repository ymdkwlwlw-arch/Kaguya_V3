import axios from 'axios';

const command = {
  name: "وصف",
  author: "Kaguya Project",
  role: "member",
  description: "يقوم بمعالجة الفيديو باستخدام API خارجية ويرد بالنص المعالج.",

  async execute({  args, api, event }) {
    api.setMessageReaction("✨", event.messageID, (err) => {}, true);
    try {
      if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
        return kaguya.reply("يرجى الرد على فيديو.");
      }

      const prompt = args.join(" ");
      const repliedVideoUrl = event.messageReply.attachments[0].url;

      const firstApiUrl = `https://vex-kshitiz.onrender.com/kshitiz?video=${encodeURIComponent(repliedVideoUrl)}`;
      const response1 = await axios.get(firstApiUrl);
      if (!response1.data || !response1.data.videoUrl) {
        throw new Error("فشل في استرجاع رابط الفيديو المعالج من API الأولى.");
      }
      const processedVideoUrl = response1.data.videoUrl;

      const secondApiUrl = `https://gemini-video.onrender.com/kshitiz?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(processedVideoUrl)}`;
      const response2 = await axios.get(secondApiUrl);
      if (!response2.data || !response2.data.answer) {
        throw new Error("فشل في استرجاع النص المعالج من API الثانية.");
      }
      const answerText = response2.data.answer;

      kaguya.reply(answerText);
    } catch (error) {
      console.error("Error:", error);
      kaguya.reply("حدث خطأ أثناء معالجة الفيديو. يرجى المحاولة مرة أخرى.");
    }
  },

  // دالة للحصول على الوصف باللغة العربية
  async getArabicDescription(text) {
    try {
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return translationResponse?.data?.[0]?.[0]?.[0];
    } catch (error) {
      console.error("Error in translation:", error);
      return text;
    }
  }
};

export default command;
