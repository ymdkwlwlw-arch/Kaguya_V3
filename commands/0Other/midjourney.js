import fs from 'fs';
import path from 'path';

// الوظائف المساعدة
function generateRandomNumber() {
  let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let number = "";

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    const digit = digits[randomIndex];
    digits.splice(randomIndex, 1);
    number += digit;
  }

  return number;
}

function isValidGuess(guess) {
  return /^\d{4}$/.test(guess);
}

function checkGuess(secret, guess) {
  let correct = 0;
  let totalCorrect = 0;
  const secretCounts = {};
  const guessCounts = {};

  for (let i = 0; i < secret.length; i++) {
    const digit = secret[i];
    secretCounts[digit] = (secretCounts[digit] || 0) + 1;
  }

  for (let i = 0; i < guess.length; i++) {
    const digit = guess[i];
    guessCounts[digit] = (guessCounts[digit] || 0) + 1;
    if (secret[i] === digit) {
      correct++;
    }
  }

  for (const digit in guessCounts) {
    if (secretCounts[digit]) {
      totalCorrect += Math.min(secretCounts[digit], guessCounts[digit]);
    }
  }

  return { correct, totalCorrect };
}

// الكلاس الرئيسي
class Game {
  name = "ارقام";
  author = "YourName";
  role = "member";
  description = "لعبة التخمين بالأرقام";
  handleReply = new Map(); // استخدام Map لتخزين الردود

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;
    const commandName = "طلبات";
    const secretNumber = generateRandomNumber();
    let maxAttempts = parseInt(args[0]);
    if (isNaN(maxAttempts) || !maxAttempts) {
      maxAttempts = 10;
    }

    api.sendMessage(`📜 | أهلا بك في لعبة التخمين! أدخل توقعاتك المكونة من 4 أرقام.\n🛡️ | لديك ${maxAttempts} فرص.`, threadID, (err, info) => {
      if (err) {
        console.error("Error sending message:", err);
        return;
      }

      this.handleReply.set(info.messageID, {
        author: event.senderID,
        commandName,
        secretNumber,
        attempts: maxAttempts,
        guesses: [],
      });

      global.client.handler.reply.set(info.messageID, {
        author: event.senderID,
        type: "pick",
        name: "ارقام",
        unsend: true,
      });
    });
  }

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { senderID, body, threadID, messageID } = event;
    const replyData = this.handleReply.get(reply.messageID);

    if (!replyData) {
      console.error("No reply data found for this message ID.");
      return api.sendMessage("حدث خطأ أثناء معالجة الرد. يرجى المحاولة مرة أخرى لاحقًا.", threadID, messageID);
    }

    if (String(senderID) !== String(replyData.author)) return;

    const userGuess = body.trim();
    if (!isValidGuess(userGuess)) {
      return api.sendMessage("📜 | مسموح فقط إدخال 4 أرقام.", threadID, messageID);
    }

    const { secretNumber, attempts, guesses } = replyData;
    const result = checkGuess(secretNumber, userGuess);
    guesses.push(`[${result.correct}] ${userGuess} [${result.totalCorrect}]`);
    const remainingAttempts = attempts - 1;

    if (result.correct === 4 && result.totalCorrect === 4) {
      api.sendMessage(`✅ | توقعت الرقم (${secretNumber}). لقد فزت!`, threadID);
      this.handleReply.delete(reply.messageID);
      global.client.handler.reply.delete(reply.messageID);
    } else if (remainingAttempts > 0) {
      const replyMessage = `${guesses.join('\n')}\n\n🛡️ | تبقى لك ${remainingAttempts} فرص.\n📜 | إجمالي عدد الفرص ${attempts} فرص`;

      api.sendMessage(replyMessage, threadID, (err, info) => {
        if (err) {
          console.error("Error sending message:", err);
          return;
        }

        this.handleReply.set(info.messageID, {
          author: senderID,
          commandName: replyData.commandName,
          secretNumber,
          attempts: remainingAttempts,
          guesses,
        });

        global.client.handler.reply.set(info.messageID, {
          author: senderID,
          type: "pick",
          name: "ارقام",
          unsend: true,
        });
      });
    } else {
      api.sendMessage(`⚔️ | إنتهت اللعبة و الرقم الصحيح كان ${secretNumber}.`, threadID);
      this.handleReply.delete(reply.messageID);
      global.client.handler.reply.delete(reply.messageID);
    }
  }
}

export default new Game();