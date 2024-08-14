export default {
  name: "وقت",
  author: "Kaguya Project",
  role: "member",
  description: "يعرض الوقت الحالي لموقع محدد",
  execute: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const location = args.join(' '); // الحصول على الموقع من الوسائط

    // التحقق من صحة الموقع
    if (!location) {
      return api.sendMessage("⚠️ | يرجى تحديد موقع. مثال: 'New York', 'لندن', 'المغرب'", threadID, messageID);
    }

    const url = `https://romeo-time.onrender.com/timezone?location=${encodeURIComponent(location)}`;

    try {
      // استرجاع الوقت من الـ API
      const response = await axios.get(url);
      const { date_time_txt, time_24, timezone } = response.data;

      if (!date_time_txt || !time_24) {
        return api.sendMessage("لم يتم العثور على الوقت للموقع المحدد. يرجى التحقق من اسم الموقع.", threadID, messageID);
      }

      // تنسيق الاستجابة
      const responseMessage = `●═══════❍═══════●\n🌍 الموقع: ${location}\n` +
        `🕒 الوقت: ${time_24}\n` +
        `📅 التاريخ: ${date_time_txt}\n` +
        `🌐 المنطقة الزمنية: ${timezone}\n●═══════❍═══════●`;

      // إرسال الاستجابة
      await api.sendMessage(responseMessage, threadID, messageID);

    } catch (error) {
      console.error("فشل في استرجاع الوقت:", error);
      await api.sendMessage("⚠️ | حدث خطأ أثناء استرجاع الوقت.", threadID, messageID);
    }
  }
};
