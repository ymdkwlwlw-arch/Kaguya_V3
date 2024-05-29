async function handleMention({ api, event }) {
  if (event.senderID !== "100076269693499") {
    const mentionedIDs = Object.keys(event.mentions);
    const myID = "100076269693499";

    if (mentionedIDs.includes(myID)) {
      const messages = [
        "لا تقم بعمل منشن على سيدي، فهو مشغول 😗",
        "سيدي غير متوفر حاليا 🤧",
        "آسف ، سيدي غير متصل حاليا لكنه يكون متصلا عندما أكون أنا متصل، لذلك ليس في كل الأوقات 😪",
        "هل يروقك سيدي لهذا قمت بعمل منشن عليه ؟ 😏",
        "منشن أخرى على سيدي وسألكم على وجهك 🙂"
      ];

      api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      return api.sendMessage({ body: randomMessage }, event.threadID, event.messageID);
    }
  }
}

export default {
  name: "رد_الآدمن",
  author: "kaguya project",
  role: "member",
  description: "يتعامل مع منشن على السيدي",
  execute: handleMention
};