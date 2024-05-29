export default {
  name: "غادري",
  author: "kaguya project",
  role: "admin",
  description: "إزالة مستخدم من المجموعة",
  execute: async ({ api, event, args }) => {
    const permission = [`100076269693499`];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("مش لك", event.threadID, event.messageID);
    }

    if (!args[0]) {
      return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    }

    if (!isNaN(args[0])) {
      return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
    }
  },
};