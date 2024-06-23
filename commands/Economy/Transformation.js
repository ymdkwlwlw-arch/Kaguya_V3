import axios from "axios";

export default {
  name: "تحويل",
  author: "kaguya project",
  role: "member",
  description: "تحويل الأموال بين المستخدمين",

  execute: async ({ api, event, args, Economy }) => {
    const { increase, decrease, getBalance } = Economy;
    const { senderID } = event;

    // جلب بيانات المرسل
    const senderData = await getBalance(senderID);
    if (!senderData) {
      return api.sendMessage("Error: Sender data not found.", event.threadID, event.messageID);
    }
    
    // التحقق من مبلغ التحويل
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage(" ⚠️ | المرجو إدخال مبلغ صالح و إيجابي.", event.threadID, event.messageID);
    } else if (amount > senderData.data.money) {
      return api.sendMessage(" ⚠️ | تفقد رصيدك.", event.threadID, event.messageID);
    }
    
    // جلب معرف المستقبل
    const recipientUID = args[1];
    if (!recipientUID) {
      return api.sendMessage("Error: Please provide a recipient UID.", event.threadID, event.messageID);
    }
    
    // جلب بيانات المستقبل
    const recipientData = await getBalance(recipientUID);
    if (!recipientData) {
      return api.sendMessage(" ❌ | فشلت العملية والسبب عدم إيجاد المستقبل.", event.threadID, event.messageID);
    }

    // جلب اسم المستقبل
    let recipientName;
    try {
      const userInfo = await api.getUserInfo(recipientUID);
      recipientName = userInfo[recipientUID].name;
    } catch (error) {
      console.error("Error fetching user info:", error);
      recipientName = recipientUID; // Fallback to UID if name is not available
    }
    
    // تنفيذ التحويل
    await decrease(senderID, amount);
    await increase(recipientUID, amount);
    
    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    
    // إرسال رسالة النجاح
    return api.sendMessage(`✅ | تمت بنجاح عملية التحويل ل مبلغ دولار 💵『${amount}』 إلى الشخص مع الآيدي : ${recipientName}.`, event.threadID, event.messageID);
  },
};
