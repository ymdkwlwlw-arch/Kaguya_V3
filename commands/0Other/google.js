export default {
   name: "نرد",
   author: "حسين اليعقوبي",
   role: "HUSSEIN YACOUBI",
   description: "لعب النرد وتحديد المكافأة أو الخسارة بناءً على النتيجة",
   execute: async (client, message, args) => {
      const userID = message.author.id;
      const userBalance = await Economy.getBalance(userID);

      if (!userBalance) {
         await Economy.create({
            userID: userID,
            money: 0,
            user: message.author.tag,
            GuildID: message.guild.id,
            accountage: message.createdTimestamp,
            attemptgmar: 0,
         }).catch(err => {
            return api.sendMessage('Something went wrong', message.channel.id);
         });
      }

      const inv = parseInt(args[0]);
      if (isNaN(inv) || inv < 100) {
         return api.sendMessage('يرجى كتابة الامر بالطريقة الصحيحة \n> \نرد المبلغ#\``', message.channel.id);
      }

      if (inv > userBalance) {
         return api.sendMessage('اطلب الله مامعك المبلغ هذاذا', message.channel.id);
      }

      if (inv < 100) {
         return api.sendMessage('ماتقدر تلعب بأقل من 100 دولار', message.channel.id);
      }

      // إرسال رسالة "جاري تقليب النر
      api.setMessageReaction("🎲", event.messageID, (err) => {}, true);
  
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
         api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
         await Economy.increase(amount, userID);
         resultMessage = `**فزت!** 🎉\nقلبت النرد: ${rolledNumber}\nفزت بمبلغ قدره ${amount.toLocaleString()} ريال`;
      } else { // إذا كان العدد أقل من 5
         amount = 100;
         api.setMessageReaction("❌", event.messageID, (err) => {}, true);
  
         await Economy.decrease(amount, userID);
         resultMessage = `**خسرت!** 💔\nقلبت النرد: ${rolledNumber}\nخسرت ${amount.toLocaleString()} ريال`;
      }

      // إرسال الرسالة النهائية مع نتيجة النرد والمكافأة أو الخسارة
      await api.sendMessage(resultMessage, message.channel.id);

      // حذف رسالة "جاري تقليب النرد"
      api.unsendMessage(sentMessage.messageID, message.channel.id);
   }
};
