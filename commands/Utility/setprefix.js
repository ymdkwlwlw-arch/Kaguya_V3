import jimp from "jimp"
export default {
  name: "ضبط_البادئة",
  author: "Thiệu Trung Kiên",
  cooldowns: 60,
  description: "Lấy UID của người dùng",
  role: "member",
  aliases: ["prefix"],
  execute: async ({ event, Threads, args }) => {
    if (!event.isGroup) {
      return kaguya.reply(" ⚠️ |لا يمكن استخدام هذا الأمر إلا في مجموعات!");
    }

    const getThread = await Threads.find(event.threadID);

    const responses = {
      true: () => {
        if (args[0]) {
          Threads.update(event.threadID, { prefix: args[0] }).then(() => {
            kaguya.reply(" ✅ |تم تغيير بادئة مجموعتك إلى : " + args[0]);
          });
        } else {
          kaguya.reply(` 🧭 |البادئة الحالية لمجموعتك هي : ${getThread.data?.data?.prefix || client.config.prefix}`);
        }
      },
      false: () => kaguya.reply(" ❌ |لم يتم العثور على معلومات مجموعة الأصدقاء في قاعدة البيانات"),
    };

    responses[getThread?.status || false]();
  },
};
