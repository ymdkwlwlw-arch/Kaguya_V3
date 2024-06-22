import axios from "axios";

export default {
  name: "تحويل",
  author: "kaguya project",
  role: "member",
  description: "تحويل الأموال بين المستخدمين",

  execute: async ({ api, event, args, Economy }) => {
    const { senderID } = event;
    const senderData = await Economy.getBalance(senderID);
    
    if (!senderData) {
      return api.sendMessage("Error: Sender data not found.", event.threadID, event.messageID);
    }
    
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage(" ⚠️ | المرجو إدخال مبلغ صالح و إيجابي.", event.threadID, event.messageID);
    } else if (amount > senderData.money) {
      return api.sendMessage(" ⚠️ | تفقد رصيدك.", event.threadID, event.messageID);
    }
    
    const recipientUID = args[1];
    if (!recipientUID) {
      return api.sendMessage("Error: Please provide a recipient UID.", event.threadID, event.messageID);
    }
    
    const recipientData = await Economy.getBalance(recipientUID);
    if (!recipientData) {
      return api.sendMessage(" ❌ | فشلت العملية والسبب عدم إيجاد المستقبل.", event.threadID, event.messageID);
    }

    // Get recipient's name
    let recipientName;
    try {
      const userInfo = await api.getUserInfo(recipientUID);
      recipientName = userInfo[recipientUID].name;
    } catch (error) {
      console.error("Error fetching user info:", error);
      recipientName = recipientUID; // Fallback to UID if name is not available
    }
    
    await Economy.decrease(senderID, amount);
    await Economy.increase(recipientUID, amount);
    
    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    
    return api.sendMessage(`✅ | تمت بنجاح عملية التحويل ل مبلغ دولار 💵『${amount}』 إلى الشخص مع الآيدي : ${recipientName}.`, event.threadID, event.messageID);
  },
};
