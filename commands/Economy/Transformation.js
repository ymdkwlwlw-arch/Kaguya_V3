import axios from "axios";
import fs from "fs";

export default {
  name: "تحويل",
  author: "kaguya project",
  role: "admin",
  description: "يحول الأموال بين المستخدمين مع خصم ضريبة 15%.",
  
  execute: async ({ api, event, Economy, Users, args }) => {
    const { increaseMoney, decreaseMoney, getData } = Economy;
    const { threadID, messageID, senderID } = event;
    let targetID = String(args[0]);
    let moneyPay = (args.slice(1).join(" ")) || null;

    if (isNaN(targetID)) {
      const mention = Object.keys(event.mentions);
      if (mention.length === 0) {
        return api.sendMessage("[ عملية التحويل ] لا مستقبل ممنشن قم بعمل منشن أرجوك ❌.", threadID, messageID);
      }
      if (mention.length > 1) {
        return api.sendMessage("[ عملية التحويل ] يجب أن تقوم بعمل منشن على شخص واحد.", threadID, messageID);
      }
      targetID = String(mention[0]);
      moneyPay = (args.slice(args.indexOf(event.mentions[mention[0]]) + (event.mentions[mention[0]] || "").length + 1).join(" ")) || null;
    }

    if (!global.data.allCurrenciesID.includes(targetID)) {
      return api.sendMessage("[ عملية التحويل ] مستقبل غير صالح ولايستحق تحويل المال إليه.", threadID, messageID);
    }

    if (isNaN(moneyPay) || moneyPay < 1) {
      return api.sendMessage("[ عملية التحويل ] مبلغ غير صالح.", threadID, messageID);
    }
    const taxed = (parseInt(moneyPay) * 15) / 100;

    try {
      const payerData = await getData(senderID);
      const moneyPayer = payerData.money;
      if (moneyPayer === undefined) {
        return api.sendMessage("[ عملية التحويل ] من فضلك انتظر 5 ثواني ليتم تسجيلك بالكامل لأنك لست عضوا بعد.", threadID, messageID);
      }
      if (moneyPayer < moneyPay) {
        return api.sendMessage("[ عملية التحويل ] رصيدك غير كاف. يرجى التحقق من المبلغ الخاص بك.", threadID, messageID);
      }
      // Get the name of the target user
      const userInfo = await api.getUserInfo(targetID);
      const nameTarget = userInfo[targetID].name;

      await decreaseMoney(senderID, parseInt(moneyPay));
      await increaseMoney(targetID, parseInt(moneyPay) - taxed);
      return api.sendMessage(`[ عملية التحويل ] تم بنجاح تحويل ${parseInt(moneyPay) - taxed} إلى ${nameTarget} (15% الضريبة المتضمنة على ذالك)`, threadID, messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("[ عملية التحويل ] حدث خطأ غير معروف، يرجى الاتصال بالمسؤول إستخدم الأمر *نداء.", threadID, messageID);
    }
  }
};
