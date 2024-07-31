const cooldowns = new Map();

export default {
   name: "نرد",
   author: "kaguya project",
   role: "member",
   description: "يرجع حالة البينج في الويب سُكِيت",
   execute: async (api, Economy, args) => {
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

      const cooldown = cooldowns.get(userID);
      if (cooldown) {
         const remaining = humanTime(cooldown - Date.now());
         return api.sendMessage(`:x: | **${remaining}, انتظر لاهنت**`, message.channel.id)
            .catch(console.error);
      }

      const inv = parseInt(args[0]);
      if (isNaN(inv) || inv < 1000) {
         return api.sendMessage('يرجى كتابة الامر بالطريقة الصحيحة \n> \نرد المبلغ#\``', message.channel.id);
      }

      if (inv > userBalance) {
         return api.sendMessage('اطلب الله مامعك المبلغ هذاذا', message.channel.id);
      }

      cooldowns.set(userID, Date.now() + 300000);
      setTimeout(() => cooldowns.delete(userID), 300000);

      const pick = ["lose", "win"];
      const value = pick[Math.floor(Math.random() * pick.length)];

      if (value === "win") {
         const winAmount = inv * 2;
         await Economy.increase(winAmount, userID);
         const newBalance = await Economy.getBalance(userID);

         const messageContent = `
