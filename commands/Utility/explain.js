import fs from "fs-extra";
import path from "path";

class Explain {
  constructor() {
    this.name = "شرح";
    this.author = "Your Name";
    this.role = "admin";
    this.description = "يجلب معلومات عن أمر محدد بناءً على اسمه.";
  }

  async execute({ api, event, args }) {
    const [commandName] = args;
    if (!commandName) {
      return api.sendMessage("⚠️ | الرجاء تحديد اسم الأمر.", event.threadID, event.messageID);
    }

    const pluginPath = this.findCommandPath(commandName);

    if (!pluginPath) {
      return api.sendMessage(" ⚠️ |لم يتم العثور على هذا الأمر!", event.threadID, event.messageID);
    }

    try {
      const plugin = await this.loadPlugin(pluginPath);

      if (!plugin || typeof plugin.execute !== "function") {
        return api.sendMessage(" ⚠️ | هذا الأمر غير مؤهل للتحميل!", event.threadID, event.messageID);
      }

      const roleText = this.getRoleText(plugin.role);

      const message = `
➭ الإسم: 『${plugin.name}』
➭ المؤلف: 『${plugin.author}』
➭ الدور:  『${roleText}』
➭ الوصف: 『${plugin.description}』
      `;

      api.sendMessage(message, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ | لا يمكن جلب معلومات الأمر.", event.threadID);
    }
  }

  findCommandPath(commandName) {
    const dir = fs.readdirSync("./commands");
    for (const dirName of dir) {
      const commandsInDir = fs.readdirSync(`./commands/${dirName}`);
      for (const fileName of commandsInDir) {
        if (fileName === `${commandName}.js`) {
          return path.join("commands", dirName, fileName);
        }
      }
    }
    return null;
  }

  async loadPlugin(pluginPath) {
    try {
      const plugin = await import("../../" + pluginPath);
      return plugin.default;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  getRoleText(role) {
    switch (role) {
      case "admin":
        return "المشرفين";
      case "owner":
        return "المالك";
      default:
        return "الجميع";
    }
  }
}

export default new Explain();