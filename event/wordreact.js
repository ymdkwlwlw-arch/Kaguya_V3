export default {
  name: "wordReact",
  author: "Thiệu Trung Kiên",
  description: "التفاعل مع كلمات معينة في الجملة",
  role: "member",
  events: async ({ api, event }) => {
    // كلمات محددة وردودها المحتملة
    const words = {
      "مرحبا": ["أهلاً بك!", "مرحباً بك!", "كيف حالك؟"],
      "مساعدة": ["كيف يمكنني مساعدتك؟", "هل تحتاج إلى مساعدة؟", "يمكنك كتابة ©مساعدة لرؤية الأوامر المتاحة."],
      "بوت": ["نعم، أنا هنا!", "أنا بوت لخدمتك.", "ما الذي تحتاجه؟"]
      // يمكنك إضافة المزيد من الكلمات والردود هنا
    };

    // تحقق من وجود أي من الكلمات المستهدفة في الرسالة
    for (const word in words) {
      if (event.body.includes(word)) {
        const responses = words[word];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        api.sendMessage(randomResponse, event.threadID, event.messageID);
        break; // توقف بعد العثور على الكلمة المستهدفة الأولى
      }
    }
  },
  execute: async ({ api, event }) => {
    // هذا القسم يظل فارغًا أو يستخدم لأوامر معينة إذا لزم الأمر
  },
  onReply: async ({ api, event, reply }) => {
    // هنا يمكن إضافة منطق إضافي للردود إذا لزم الأمر
  },
  onReaction: async ({ api, event, reaction }) => {
    // هنا يمكن إضافة منطق إضافي للتفاعلات إذا لزم الأمر
  },
};
