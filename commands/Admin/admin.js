import fs from 'fs';

class Admin {
  name = "آدمن";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "إضافة أو إزالة أو تعيين رتبة المسؤول وتفعيل أو تعطيل البوت";
  role = "member";
  aliases = [];

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
      const isAdmin = global.client.config.ADMIN_IDS.includes(event.senderID);

      if (!isAdmin) {
        return kaguya.reply(" ⚠️ | ليس لديك الإذن لاستخدام هذا الأمر!");
      }

      if (type === "تفعيل") {
        global.client.setConfig({ botEnabled: true });
        await this.updateBotNickname("》 《 ❃ ➠ بوت مفعل", event.threadID, event.senderID);
        return kaguya.reply(" ✅ | تم تفعيل البوت بنجاح!");
      }

      if (type === "تعطيل") {
        global.client.setConfig({ botEnabled: false });
        await this.updateBotNickname("》 《 ❃ ➠ بوت معطل", event.threadID, event.senderID);
        return kaguya.reply(" ❌ | تم تعطيل البوت بنجاح!");
      }

      if (type === "إضافة") {
        return this.addAdmin(tags);
      }

      if (type === "إزالة") {
        return this.removeAdmin(tags);
      }

      if (type === "قائمة" || type === "-l" || type === "-all") {
        return this.listAdmins();
      }

      const commandName = client.config.prefix + this.name;
      return kaguya.reply(`[ آدمن ]\n${commandName} تفعيل لتفعيل البوت\n${commandName} تعطيل لتعطيل البوت\n${commandName} إضافة <@منشن أو الآيدي> لإضافة العضو كآدمن\n${commandName} إزالة <@منشن أو الآيدي> لإزالة العضو من قائمة الآدمنية\n${commandName} قائمة لإظهار قائمة الآدمنية`);
    } catch (err) {
      console.log(err);
    }
  }

  async updateBotNickname(botName, threadID, senderID) {
    try {
      await global.client.api.changeNickname(botName, threadID, senderID);
    } catch (error) {
      console.error("Error updating bot nickname:", error);
    }
  }

  addAdmin(tags) {
    if (!tags) {
      return kaguya.reply(` ⚠️ | يرجى عمل منشن أو إدخال آيدي العضو المراد إضافته كآدمن`);
    }

    const addedUids = this.processAdmins(tags, "add");
    const statusMessage = this.getStatusMessage(addedUids, "إضافة");

    return kaguya.reply(statusMessage);
  }

  removeAdmin(tags) {
    if (!tags) {
      return kaguya.reply(` ⚠️ | يرجى عمل منشن أو إدخال آيدي العضو المراد إزالته من قائمة الآدمنية`);
    }

    const removedUids = this.processAdmins(tags, "remove");
    const statusMessage = this.getStatusMessage(removedUids, "إزالة");

    return kaguya.reply(statusMessage);
  }

  listAdmins() {
    const adminIds = global.client.config.ADMIN_IDS;

    if (adminIds.length === 0) {
      return kaguya.reply(" ⚠️ | لا يوجد أعضاء في قائمة الآدمنية.");
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

    let message = `${status} عملية ${action}`;

    if (successUids.length > 0) {
      message += `\n\nتمت ${action} العضو صاحب الآيدي: ${successUids.join(", ")}`;
    }

    if (failedUids.length > 0) {
      message += `\n\n ⚠️ | موجود بالفعل في قائمة الآدمنية: ${failedUids.join(", ")}`;
    }

    return message;
  }
}

export default new Admin();
