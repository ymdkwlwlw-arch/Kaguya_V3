import fs from "fs";

class Admin {
  name = "آدمن";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "إضافة أو إزالة أو تعيين رتبة المسؤول";
  role = "admin";
  aliases = ["اشراف"];

  async onLoad() {
    if (typeof global.client?.setConfig !== "function") {
      global.client.__proto__.setConfig = function (newConfig) {
        try {
          Object.assign(global.client.config, newConfig);
          fs.writeFileSync("./setup/config.js", `export default ${JSON.stringify(global.client.c, null, 2)};`);
        } catch (err) {
          this.emit("system:err", err);
        }
      };
    }
  }

  async execute({ event, args }) {
    try {
      var [type, tags] = args;
      tags = event.mentions && Object.keys(event.mentions).length > 0 ? event.mentions : tags && !isNaN(tags) ? { [tags]: "" } : false;

      if (["add", "remove"].includes(type) && !global.client.config.ADMIN_IDS.includes(event.senderID)) {
        return kaguya.reply(" ⚠️ | ليس لديك الإذن لاستخدام هذا الأمر!");
      }

      switch (type) {
        case "إضافة":
          return this.addAdmin(tags);

        case "إزالة":
          return this.removeAdmin(tags);

        case "قائمة":
        case "-l":
        case "-all":
          return this.listAdmins();

        default:
          var commandName = client.config.prefix + this.name;
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
      return kaguya.reply(" ⚠️ | هذا العضو لم يتم إضافته إلى قائمة الآدمنية.");
    }

    const adminList = adminIds.join(", ");
    return kaguya.reply(` 👑 | قائمة الآدمنية:\n${adminList}`);
  }

  processAdmins(tags, action) {
    const uidsToProcess = Object.keys(tags);
    const processedUids = [[], []];

    for (var uid of uidsToProcess) {
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
      message += `\n\nتمت إضافة العضو صاحب الآيدي  ${action.toLowerCase()}\n ${successUids.join(", ")} نجحت بذالك عملية التعيين`;
    }

    if (failedUids.length > 0) {
      message += `\n\n ⚠️ | موجود بالفعل في قائمة الآدمنية : ${failedUids.join(", ")} فشلت بذالك عملية التعيين`;
    }

    return message;
  }
}

export default new Admin(); 
