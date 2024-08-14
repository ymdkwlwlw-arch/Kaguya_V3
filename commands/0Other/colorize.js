import moment from "moment-timezone";

export default {
  name: "قبول",
  author: "kaguya project",
  role: "admin",
  description: "قبول الأصدقاء على فيسبوك",
  execute: async function ({ api, event, args }) {
    const handleApprove = async (targetUID) => {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
        doc_id: "3147613905362928",
        variables: JSON.stringify({
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            friend_requester_id: targetUID,
            client_mutation_id: Math.round(Math.random() * 19).toString(),
          },
          scale: 3,
          refresh_num: 0,
        }),
      };
      const success = [];
      const failed = [];
      try {
        const friendRequest = await api.httpPost(
          "https://www.facebook.com/api/graphql/",
          form,
        );
        if (JSON.parse(friendRequest).errors) failed.push(targetUID);
        else success.push(targetUID);
      } catch (e) {
        failed.push(targetUID);
      }
      return { success, failed };
    };

    if (args[0] === "موافقة") {
      if (args.length !== 2 || isNaN(args[1])) {
        return api.sendMessage(
          `⚠️ | إستعمال خاطئ للكود . إستخدم : قبول موافقة <المعرف>`,
          event.threadID,
          event.messageID,
        );
      }
      const targetUID = args[1];
      const { success, failed } = await handleApprove(targetUID);
      if (success.length > 0) {
        api.sendMessage(
          `✅ | تم قبول الصديق ${success.join(", ")}`,
          event.threadID,
          event.messageID,
        );
      }
      if (failed.length > 0) {
        api.sendMessage(
          `❌ | فشل قبول الصديق ${failed.join(", ")}`,
          event.threadID,
          event.messageID,
        );
      }
      return;
    }

    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name:
        "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } }),
    };

    const listRequest = JSON.parse(
      await api.httpPost("https://www.facebook.com/api/graphql/", form),
    ).data.viewer.friending_possibilities.edges;

    let msg = "";
    let i = 0;
    for (const user of listRequest) {
      i++;
      msg +=
        `\n${i}. الإسم: ${user.node.name}` +
        `\nالمعرف: ${user.node.id}` +
        `\nالرابط: ${user.node.url.replace("www.facebook", "fb")}` +
        `\nالوقت: ${moment(user.time * 1009)
          .tz("Africa/Casablanca")
          .format("DD/MM/YYYY HH:mm:ss")}\n`;
    }

    api.sendMessage(
      `${msg}\nالاصدقاء اللذين ينتظرون قبول طلب الصداقه : استخدم قبول موافقة <المعرف>`,
      event.threadID,
      event.messageID,
    );
  },
};
