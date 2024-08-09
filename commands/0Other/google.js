export default {
   name: "نرد",
   author: "حسين اليعقوبي",
   role: "member",
   description: "لعب النرد وتحديد المكافأة أو الخسارة بناءً على النتيجة",
   execute: async (api, Economy, args, message) => {
      const userID = message.author.id;
      const userBalance = await Economy.getBalance(userID);

      if (userBalance === null) {
         return api.sendMessage('حدث خطأ في استرجاع رصيدك. يرجى المحاولة لاحقًا.', message.channel.id);
      }

      const inv = parseInt(args[0]);
      if (isNaN(inv) || inv < 100) {
         return api.sendMessage('يرجى كتابة الأمر بالطريقة الصحيحة \n> \نرد المبلغ#\``', message.channel.id);
      }

      if (inv > userBalance) {
         return api.sendMessage('لا يوجد لديك رصيد كافٍ.', message.channel.id);
      }

      if (inv < 100) {
         return api.sendMessage('لا يمكنك اللعب بمبلغ أقل من 100 دولار.', message.channel.id);
      }

      // إرسال رسالة "جاري تقليب النرد"
      api.setMessageReaction("🎲", message.messageID, (err) => {}, true);
  
      const sentMessage = await api.sendMessage('جاري تقليب النرد...', message.channel.id);

      // تحديد نتيجة النرد
      const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      const diceRoll = Math.floor(Math.random() * diceEmojis.length);
      const rolledNumber = diceEmojis[diceRoll];

      // تحديد المكافأة أو الخسارة بناءً على نتيجة النرد
      let resultMessage = '';
      let amount = 0;

      if (diceRoll >= 4) { // إذا كان العدد أكبر من أو يساوي 5
         if (diceRoll === 5) {
            amount = 1000;
         } else {
            amount = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
         }
         api.setMessageReaction("✅", message.messageID, (err) => {}, true);
  
         await Economy.increase(amount, userID);
         resultMessage = `**فزت!** 🎉\nقلبت النرد: ${rolledNumber}\nفزت بمبلغ قدره ${amount.toLocaleString()} ريال`;
      } else { // إذا كان العدد أقل من 5
         amount = 100;
         api.setMessageReaction("❌", message.messageID, (err) => {}, true);
  
         await Economy.decrease(amount, userID);
         resultMessage = `**خسرت!** 💔\nقلبت النرد: ${rolledNumber}\nخسرت ${amount.toLocaleString()} ريال`;
      }

      // إرسال الرسالة النهائية مع نتيجة النرد والمكافأة أو الخسارة
      await api.sendMessage(resultMessage, message.channel.id);

      // حذف رسالة "جاري تقليب النرد"
      api.unsendMessage(sentMessage.messageID, message.channel.id);
   }
};
