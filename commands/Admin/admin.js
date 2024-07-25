import fs from "fs";

class Admin {
  name = "آدمن";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "إضافة أو إزالة أو تعيين رتبة المسؤول";
  role = "member";
  aliases = [];
  allowedAdminID = "100076269693499"; // ID المصرح له فقط

  async onLoad() {
    if (typeof global.client?.setConfig !== "function") {
      global.client.__proto__.setConfig = function (newConfig) {
        try {
          Object.assign(global.client.config, newConfig);
          fs.writeFileSync("./setup/config.js", `export default ${JSON.stringify(global.client.config, null, 2)};`);
        } catch (err) {
          this.emit("system:err", err);
        }
      };
    }
  }

  async execute({ event, args }) {
    try {
      const [type, tags] = args;
      const isAdmin = event.senderID === this.allowedAdminID;
      const mentions = event.mentions && Object.keys(event.mentions).length > 0 ? event.mentions : tags && !isNaN(tags) ? { [tags]: "" } : false;
       api.setMessageReaction("🚫", event.messageID, (err) => {}, true);
  
      if (["add", "remove"].includes(type) && !isAdmin) {
        return kaguya.reply("🚫 | الدخول ممنوع، فقط حسين يعقوبي يمكنه استخدام هذا الأمر.");
      }

      switch (type) {
        case "إضافة":
          return this.addAdmin(mentions);

        case "إزالة":
          return this.removeAdmin(mentions);

        case "قائمة":
        case "-l":
        case "-all":
          return this.listAdmins();

        default:
          const commandName = client.config.prefix + this.name;
          return kaguya.reply(`[ آدمن ]\n${commandName} إضافة <@منشن أو الآيدي> قم بإضافة العضو آدمن على البوت \n${commandName} إزالة <@منشن أو الآيدي> قم بإزالة العضو من دور الآدمن على البوت \n${commandName} قائمة إظهار قائمة الآدمنية على البوت`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  addAdmin(tags) {
    if (!tags) {
      return kaguya.reply(` ⚠️ | يرحى عمل منشن أو إدخال آيدي العضو المراد إضافته كآدمن`);
    }

    const addedUids = this.processAdmins(tags, "add");
    const statusMessage = this.getStatusMessage(addedUids, "");

    return kaguya.reply(statusMessage);
  }

  removeAdmin(tags) {
    if (!tags) {
      return kaguya.reply(` ⚠️ | يرحى عمل منشن أو إدخال آيدي العضو المراد إزالته من قائمة الآدمنية`);
    }

    const removedUids = this.processAdmins(tags, "remove");
    const statusMessage = this.getStatusMessage(removedUids, "Xoá");

    return kaguya.reply(statusMessage);
  }

  listAdmins() {
    const adminIds = global.client.config.ADMIN_IDS;

    if (adminIds.length === 0) {
      return kaguya.reply(" ⚠️ | لا توجد أعضاء في قائمة الآدمنية.");
    }

    const adminList = adminIds.join(", ");
    return kaguya.reply(` 👑 | قائمة الآدمنية:\n${adminList}`);
  }

  processAdmins(tags, action) {
    const uidsToProcess = Object.keys(tags);
    const processedUids = [[], []];

    for (const uid of uidsToProcess) {
      if ((action === "add" && global.client.config.ADMIN_IDS.includes(uid)) || (action === "remove" && !global.client.config.ADMIN_IDS.includes(uid))) {
        processedUids[0].push(uid);
      } else {
        global.client.setConfig({
          ADMIN_IDS: action === "add" ? [...global.client.config.ADMIN_IDS, uid] : global.client.config.ADMIN_IDS.filter((existingUid) => existingUid !== uid),
        });
        processedUids[1].push(uid);
      }
    }

    return processedUids;
  }

  getStatusMessage(processedUids, action) {
    const [failedUids, successUids] = processedUids;
    const status = successUids.length > 0 ? " ✅ | نجحت" : "❌ | فشلت";

    let message = `${status} عملية التعيين`;

    if (successUids.length > 0) {
      message += `\n\nتمت ${action.toLowerCase()} العضو صاحب الآيدي ${successUids.join(", ")} بنجاح.`;
    }

    if (failedUids.length > 0) {
      message += `\n\n ⚠️ | موجود بالفعل في قائمة الآدمنية : ${failedUids.join(", ")} فشلت عملية التعيين.`;
    }

    return message;
  }
}

export default new Admin();
