import axios from "axios";
import request from "request";
import fs from "fs-extra";
import path from "path";

const ZiaRein3Part1 = `●═══════❍═══════●\nالــصَـداقَــة هِــي أنْ تَــذهَـبْ وَتَــعُـود وَتَــجــد لِــ نَــفــسَـكْ “ مَــكـانـاً ” بِـيـنَـهُـمْ
قواعد وشروط الجروب♥
1-احترام آراء الآخرين وعدم التلفظ بألفاظ تخدش الحياء
2- الحفاظ على القيم والعادات والتقاليد
3- الحفاظ على تعاليم الدين الاسلامي
4- المرجو التعامل مع المنشورات الجديه بكل حزم وجد والمنشورات الاخرى
يتعامل فيها كل عضو بمايريد مع العلم ان التعليق يعبر عن شخصيتك
5 - عدم وضع صور إباحية ومثيرة جدا وذلك تفاديا لإثارة المشاكل من قبل بعض
الأعضاء`;

const ZiaRein3Part2 = `6- عدم إزعاج البنات بطلبات الأضافة داخل الجروب أو الرسائل غير اللائقة.....يتم تنبيه العضو لمره واحده واذا لم يستجب العضو المعني يحذف على الفور
7- عدم نشر اي صفحه في هذا للجروب
تنبيه العضو لمره واحده واذا لم يستجب العضو المعني يحذف على الفور
8- التشهير والتشويه لعضو ما او إنسان ما ؟ داخل الجروب يمنع منعا باتا
ويتحمل صاحب الموضوع الجزاء وهوا الحذف النهائي`;

const ZiaRein3Part3 = `9- يرجى عدم نشر المنشورات السياسية لكافة الدول العربية و اى عضو سينشر اى
منشور سياسى سيتم تحذيره مرة واحدة و بعد ذلك سيتم طرد العضو
10- أرجو الابلاغ فوراً عن أي شيء مخالف داخل الجروب
11- ممنوع نشر الصور الشخصيه على الجروب او كتابه ارقام الهواتف الخاصه بكم
11_السياسه ممنوعه منعا باتا ..................... وبكرر منمنوع السياسه
منعا باتا`;

const ZiaRein3Part4 = `12_ اى شاب يحاول الدخول باسم بنت مصيره #الطرد
.......اي شخص يسيء للجروب سيتم حظره
...... ? فأتمنى أن نبقى اخوة ? .....
لن نجبر أحداً على دخول المجموعة ولا على البقاء فيها !!!
ولكني ألتمس من الموجودين فيها إحترام قوانينها.
المجموعه منكم ولكم وانتم من يتصرف بمجريات الامور وكلنا تقة فيكم
ارجوا من الجميع الالتزام ولكم خالص الشكر والتقدير على التعاون\n●═══════❍═══════●`;

const ZiaReinImages = [
  "https://i.imgur.com/huumLca.jpg",
  "https://i.imgur.com/EcryTGh.jpg",
  "https://i.imgur.com/tu12HrQ.jpg",
  "https://i.imgur.com/Vx25FHG.jpg",
  "https://i.imgur.com/NcbC8Pn.jpg",
];

const sendRulesPart = (api, event, part, instruction, replyData) => {
  const imageUrl = process.cwd() + "/cache/ZiaRein1.jpg";
  api.sendMessage({ body: `${part}\n\n${instruction}`, attachment: fs.createReadStream(imageUrl) }, event.threadID, (err, info) => {
    if (!err) {
      global.client.handler.reply.set(info.messageID, replyData);
      fs.unlinkSync(imageUrl);
    }
  }, event.messageID);
};

const execute = async ({ api, event }) => {
  const userListPath = path.join(process.cwd(), "rules.json");
  let userList = [];

  if (fs.existsSync(userListPath)) {
    const data = fs.readFileSync(userListPath, "utf8");
    userList = JSON.parse(data);
  }

  if (userList.includes(event.senderID)) {
    api.setMessageReaction("🚫", event.messageID, () => {}, true);
    return api.sendMessage("❌ | أنت بالفعل وافقت على شروط المجموعة وتم إدراج اسمك بين الأعضاء الرسميين.", event.threadID, event.messageID);
  }

  return request(encodeURI(ZiaReinImages[Math.floor(Math.random() * ZiaReinImages.length)]))
    .pipe(fs.createWriteStream(process.cwd() + "/cache/ZiaRein1.jpg"))
    .on("close", () => {
      sendRulesPart(api, event, ZiaRein3Part1, "رد على هذه الرسالة بـ 'التالي' لمتابعة القراءة", {
        author: event.senderID,
        type: "rulesPart1",
        name: "قواعد",
        unsend: true,
      });
    });
};

const onReply = async ({ api, event, reply }) => {
  const userListPath = path.join(process.cwd(), "rules.json");
  let userList = [];

  if (fs.existsSync(userListPath)) {
    const data = fs.readFileSync(userListPath, "utf8");
    userList = JSON.parse(data);
  }

  if (reply.author !== event.senderID) {
    api.setMessageReaction("🚫", event.messageID, () => {}, true);
    return api.sendMessage("❌ | لا يمكنك تأكيد الموافقة على القواعد. هذا الرد مخصص للشخص الذي طلب القواعد فقط.", event.threadID, event.messageID);
  }

  if (reply.type === "rulesPart1") {
    if (event.body.trim().toLowerCase() === "التالي") {
      sendRulesPart(api, event, ZiaRein3Part2, "رد على هذه الرسالة بـ 'مفهوم' لمتابعة القراءة", {
        author: event.senderID,
        type: "rulesPart2",
        name: "قواعد",
        unsend: true,
      });
    } else {
      api.setMessageReaction("🚫", event.messageID, () => {}, true);
      api.sendMessage("⚠️ | يجب الرد بـ 'التالي' لمتابعة القراءة.", event.threadID, event.messageID);
    }
  } else if (reply.type === "rulesPart2") {
    if (event.body.trim().toLowerCase() === "مفهوم") {
      sendRulesPart(api, event, ZiaRein3Part3, "رد على هذه الرسالة بـ 'تم' لتأكيد الموافقة على القواعد.", {
        author: event.senderID,
        type: "confirmRules",
        name: "قواعد",
        unsend: true,
      });
    } else {
      api.setMessageReaction("🚫", event.messageID, () => {}, true);
      api.sendMessage("⚠️ | يجب الرد بـ 'مفهوم' لمتابعة القراءة.", event.threadID, event.messageID);
    }
  } else if (reply.type === "confirmRules") {
    if (event.body.trim().toLowerCase() === "تم") {
      userList.push(event.senderID);
      fs.writeFileSync(userListPath, JSON.stringify(userList, null, 2));

      api.getUserInfo(event.senderID, (err, userInfo) => {
        if (err) {
          return console.error(err);
        }
        const userName = userInfo[event.senderID].name;

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage(`تهانينا يا ${userName} أنت الآن قد وافقت على شروط مجموعتنا ، أهلا بك معنا ☺️`, event.threadID, event.messageID);
      });
    } else {
      api.setMessageReaction("🚫", event.messageID, () => {}, true);
      api.sendMessage("⚠️ | يجب الرد بـ 'تم' لتأكيد الموافقة على القواعد.", event.threadID, event.messageID);
    }
  }
};

export default {
  name: "قواعد",
  author: "Hussein Yacoubi",
  role: "member",
  description: "Sends a random image with group rules.",
  execute,
  onReply,
};
