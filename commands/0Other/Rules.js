import axios from "axios";
import request from "request";
import fs from "fs-extra";
import path from "path";

const ZiaReinRules = `●═══════❍═══════●
الــصَـداقَــة هِــي أنْ تَــذهَـبْ وَتَــعُـود وَتَــجــد لِــ نَــفــسَـكْ “ مَــكـانـاً ” بِـيـنَـهُـمْ
قواعد وشروط الجروب♥
1- احترام آراء الآخرين وعدم التلفظ بألفاظ تخدش الحياء
2- الحفاظ على القيم والعادات والتقاليد
3- الحفاظ على تعاليم الدين الاسلامي
4- المرجو التعامل مع المنشورات الجديه بكل حزم وجد والمنشورات الاخرى يتعامل فيها كل عضو بمايريد مع العلم ان التعليق يعبر عن شخصيتك
5 - عدم وضع صور إباحية ومثيرة جدا وذلك تفاديا لإثارة المشاكل من قبل بعض الأعضاء
6- عدم إزعاج البنات بطلبات الأضافة داخل الجروب أو الرسائل غير اللائقة.....يتم تنبيه العضو لمره واحده واذا لم يستجب العضو المعني يحذف على الفور
7- عدم نشر اي صفحه في هذا للجروب
تنبيه العضو لمره واحده واذا لم يستجب العضو المعني يحذف على الفور
8- التشهير والتشويه لعضو ما او إنسان ما ؟ داخل الجروب يمنع منعا باتا ويتحمل صاحب الموضوع الجزاء وهوا الحذف النهائي
9- يرجى عدم نشر المنشورات السياسية لكافة الدول العربية و اى عضو سينشر اى منشور سياسى سيتم تحذيره مرة واحدة و بعد ذلك سيتم طرد العضو
10- أرجو الابلاغ فوراً عن أي شيء مخالف داخل الجروب
11- ممنوع نشر الصور الشخصيه على الجروب او كتابه ارقام الهواتف الخاصه بكم
12- السياسه ممنوعه منعا باتا ..................... وبكرر منمنوع السياسه منعا باتا
13- اى شاب يحاول الدخول باسم بنت مصيره #الطرد
.......اي شخص يسيء للجروب سيتم حظره
...... ? فأتمنى أن نبقى اخوة ? .....
لن نجبر أحداً على دخول المجموعة ولا على البقاء فيها !!!
ولكني ألتمس من الموجودين فيها إحترام قوانينها.
المجموعه منكم ولكم وانتم من يتصرف بمجريات الامور وكلنا تقة فيكم
ارجوا من الجميع الالتزام ولكم خالص الشكر والتقدير على التعاون
●═══════❍═══════●`;

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

  const imageUrl = process.cwd() + "/cache/ZiaRein.jpg";
  return request(encodeURI("https://i.imgur.com/huumLca.jpg"))
    .pipe(fs.createWriteStream(imageUrl))
    .on("close", () => {
      api.sendMessage({ body: ZiaReinRules + "\n\nيرجى التفاعل مع هذه الرسالة ب  للموافقة على القواعد.", attachment: fs.createReadStream(imageUrl) }, event.threadID, (err, info) => {
        if (!err) {
          fs.unlinkSync(imageUrl);
          global.client.handler.events.set(info.messageID, {
            author: event.senderID,
            type: "rules",
            name: "قواعد",
            unsend: true,
          });
        }
      }, event.messageID);
    });
};

const events = async ({ api, event }) => {
  const reaction = ["✅"];
  const userListPath = path.join(process.cwd(), "rules.json");
  let userList = [];

  if (fs.existsSync(userListPath)) {
    const data = fs.readFileSync(userListPath, "utf8");
    userList = JSON.parse(data);
  }

  if (event.reaction && reaction.includes(event.reaction) && event.senderID !== api.getCurrentUserID()) {
    userList.push(event.senderID);
    fs.writeFileSync(userListPath, JSON.stringify(userList, null, 2));

    api.getUserInfo(event.senderID, (err, userInfo) => {
      if (err) return console.error(err);
      const userName = userInfo[event.senderID].name;

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(`تهانينا يا ${userName} أنت الآن قد وافقت على شروط مجموعتنا ، أهلا بك معنا ☺️`, event.threadID, event.messageID);
    });

    global.client.handler.events.delete(event.messageID);
  }
};

export default {
  name: "قواعد",
  author: "Hussein Yacoubi",
  role: "member",
  description: "Sends a random image with group rules.",
  execute,
  events,
};
