async function getUID(url, api) {
  const regexName = new RegExp(/"title":"(.*?)"/s);
  
  // التحقق من كون الرابط خاص بـ Facebook
  if (url.includes("facebook.com") || url.includes("fb.com")) {
    try {
      // إذا كان الرابط لا يحتوي على بروتوكول، قم بإضافته
      if (url.indexOf("https://") === -1 && url.indexOf("http://") === -1) url = "https://" + url;
      
      // معالجة رابط البروفايل إذا كان في شكل URL
      if (/facebook\.com/.test(url)) {
        var match = url.match(/\b(?:https?:\/\/)?(?:www\.)?(?:m\.|mbasic\.)?facebook\.com\/(?!profile\.php)([a-zA-Z0-9.-]+)(?:\/)?/);
        if (match) url = match[1];
      }

      // الحصول على البيانات من الرابط
      let data = await api.httpGet(url);

      // استخراج بيانات إعادة التوجيه إذا كانت موجودة
      let regex = /for (;;);{"redirect":"(.*?)"}/.exec(data);
      if (data.includes('"ajaxify":"')) {
        data = await api.httpGet(regex[1].replace(/\\/g, '').replace(/(?<=\?\s*)(.*)/, '').slice(0, -(0x1 * 0x1f) || undefined));
      }

      // استخراج ID المستخدم والاسم من البيانات
      let regexid = /"userID":"(\d+)"/.exec(data);
      let name = JSON.parse('{"name":"' + data.match(regexName)[1] + '"}')['name'] || null;

      return [+regexid[1], name, false];
    } catch {
      return [null, null, true];
    }
  } else {
    return ["Invalid URL", null, true];
  }
}

export default {
  name: "ضفي",
  author: "kaguya project",
  aliases:["ضيفي","add"],
  description: "أمر لإضافة عضو إلى المجموعة",
  role: "admin",
  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const botID = api.getCurrentUserID();
    const out = msg => api.sendMessage(msg, threadID, messageID);
    var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
    var participantIDs = participantIDs.map(e => parseInt(e));

    if (!args[0]) return out("⚠️ | الرجاء إدخال معرّف العضو من أجل إضافته إلى المجموعة.");

    if (!isNaN(args[0])) return addUser(args[0], undefined);
    else {
      try {
        var [id, name, fail] = await getUID(args[0], api);
        if (fail && id !== null) return out(id);
        else if (fail && id === null) return out("❗ |لم يتم العثور على معرّف المستخدم.");
        else {
          await addUser(id, name || "عضو في فيسبوك");
        }
      } catch (e) {
        return out(`${e.name}: ${e.message}.`);
      }
    }

    async function addUser(id, name) {
      id = parseInt(id);
      if (participantIDs.includes(id)) return out(` ⚠️ | ${name ? name : "العضو"} موجود بالفعل في المجموعة.`);
      else {
        var admins = adminIDs.map(e => parseInt(e.id));
        try {
          await api.addUserToGroup(id, threadID);
        } catch {
          return out(` 🚫 |لا يمكن إضافة ${name ? name : "العضو"} إلى المجموعة.`);
        }
        if (approvalMode && !admins.includes(botID)) return out(` ✅ | تمت إضافة ${name ? name : "العضو"} إلى قائمة الموافقة.`);
        else return out(`✅ |تمت إضافة ${name ? name : "العضو"} إلى المجموعة.`);
      }
    }
  },
};
