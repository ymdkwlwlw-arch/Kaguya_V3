import { MessageEmbed } from 'discord.js';

export default {
   name: "نرد",
   author: "اسمك",
   role: "مطور",
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
         const remaining = humanizeDuration(cooldown - Date.now());
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

         const embed = new MessageEmbed()
            .setThumbnail("https://cdn.discordapp.com/attachments/947898070845247529/968207531220566157/dice.png?size=4096")
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setTitle("نرد 🎲")
            .setFooter(`${message.guild.name}`, message.guild.iconURL())
            .setDescription(`**يامجننننون فزت !**
لعبت بـ: ${inv.toLocaleString()} ريال وربحت ${winAmount.toLocaleString()} !
رصيدك السابق 💸: ${userBalance.toLocaleString()} ريال
رصيدك الحالي 💸: ${newBalance.toLocaleString()} ريال`)
            .setColor("#35ba74");
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  

         api.sendMessage({ embeds: [embed] }, message.channel.id);
      } else {
         await Economy.decrease(inv, userID);
         const newBalance = await Economy.getBalance(userID);

         const embed = new MessageEmbed()
            .setThumbnail("https://cdn.discordapp.com/attachments/947898070845247529/968207531220566157/dice.png?size=4096")
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setTitle("نرد 🎲")
            .setFooter(`${message.guild.name}`, message.guild.iconURL())
            .setDescription(`**القمممم فزت عليك**
لعبت بـ: ${inv.toLocaleString()} ريال وخسرتهم !
رصيدك السابق 💸: ${userBalance.toLocaleString()} ريال
رصيدك الحالي 💸: ${newBalance.toLocaleString()} ريال`)
            .setColor("#3e0001");
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
  

         api.sendMessage({ embeds: [embed] }, message.channel.id);
      }
   }
};
