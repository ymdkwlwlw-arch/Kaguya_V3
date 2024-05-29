export default {
  name: "عمري",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "يقوم بحساب العمر بناءً على تاريخ الميلاد المقدم.",
  execute: async ({ api, event, args }) => {
    const birthday = args[0];

    if (!birthday) {
      return api.sendMessage(" ⚠️ | يرجى إدخال تاريخ ميلادك بالصيغة الصحيحة (السنة-الشهر-اليوم).", event.threadID);
    }

    const currentDate = new Date();
    const birthDate = new Date(birthday);
    const age = currentDate.getFullYear() - birthDate.getFullYear();

    birthDate.setFullYear(currentDate.getFullYear());
    const isBeforeBirthday = currentDate < birthDate;

    const finalAge = isBeforeBirthday ? age - 1 : age;

    api.sendMessage(` ✅ | عمرك هو ${finalAge} سنة\nهل أنا على صواب؟ 🙂`, event.threadID);
  }
};