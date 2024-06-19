import axios from 'axios';

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
};

async function generateFBCover({ api, event, args, Users }) {
  const dipto = args.join(" ");
  let id;
  
  if (event.type === "message_reply") {
    id = event.messageReply.senderID;
  } else {
    id = Object.keys(event.mentions)[0] || event.senderID;
  }

  var nam = await Users.getNameUser(id);

  if (!dipto) {
    return api.sendMessage(
      `❌| خطأ \nجرب *غلاف v1/v2/v3 - الاسم - العنوان - البريد الإلكتروني - الهاتف - اللون (افتراضي = أبيض)`,
      event.threadID,
      event.messageID,
    );
  } else {
    const msg = dipto.split("-");
    const v = msg[0].trim() || "v1";
    const name = msg[1].trim() || " ";
    const subname = msg[2].trim() || " ";
    const address = msg[3].trim() || " ";
    const email = msg[4].trim() || " ";
    const phone = msg[5].trim() || " ";
    const color = msg[6].trim() || "white";

    api.sendMessage(
      `جاري معالجة الغلاف الخاص بك، يرجى الانتظار... 😘`,
      event.threadID,
      (err, info) => setTimeout(() => api.unsendMessage(info.messageID), 4000),
    );

    const img = `${await baseApiUrl()}/cover/${v}?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&number=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&colour=${encodeURIComponent(color)}&uid=${id}`;

    try {
      const response = await axios.get(img, { responseType: "stream" });
      const attachment = response.data;

      api.sendMessage(
        {
          body: `✿━━━━━━━━━━━━━━━━━━━━━━━━━━━✿\n🔵 الاسم الأول: ${name}\n⚫ الاسم الثاني: ${subname}\n⚪ العنوان: ${address}\n📫 البريد الإلكتروني: ${email}\n☎️ رقم الهاتف: ${phone}\n☢️ اللون: ${color}\n💁 اسم المستخدم: ${nam}\n✅ الإصدار: ${v}\n✿━━━━━━━━━━━━━━━━━━━━━━━━━━━✿`,
          attachment,
        },
        event.threadID,
        event.messageID,
      );
    } catch (error) {
      console.error(error);
      api.sendMessage(
        "حدث خطأ أثناء توليد غلاف الفيسبوك.",
        event.threadID,
      );
    }
  }
}

export default {
  name: "غلاف",
  author: "kaguya project",
  description: "أمر لتوليد غلاف فيسبوك باستخدام الوصف، النموذج، والألوان المحددة.",
  role: "member",
  execute: generateFBCover
};
