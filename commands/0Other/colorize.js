import moment from "moment-timezone";

async function handleApprove(api, targetUID) {
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
}

export default {
  name: "قبول",
  author: "kaguya project",
  role: "admin",
  description: "قبول الأصدقاء على فيسبوك",
  execute: async function ({ api, event, args }) {
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
    const filteredList = [];
    for (const user of listRequest) {
      i++;
      msg +=
        `\n${i}. الإسم: ${user.node.name}` +
        `\nالمعرف: ${user.node.id}` +
        `\nالرابط: ${user.node.url.replace("www.facebook", "fb")}` +
        `\nالوقت: ${moment(user.time * 1009)
          .tz("Africa/Casablanca")
          .format("DD/MM/YYYY HH:mm:ss")}\n`;
      filteredList.push(user.node.id);
    }

    const info = await api.sendMessage(
      `${msg}\nالأصدقاء اللذين ينتظرون قبول طلب الصداقه : الرد برقم لقبول`,
      event.threadID,
      event.messageID,
    );

    global.client.handler.reply.set(info.messageID, {
      author: event.senderID,
      type: "pick",
      name: "قبول",
      groupList: filteredList,
      unsend: true,
    });
  },

  onReply: async function ({ api, event, reply }) {
    if (reply.type !== "pick") return;

    const { author, groupList } = reply;

    if (event.senderID !== author) return;

    const number = parseInt(event.body);
    if (isNaN(number) || number < 1 || number > groupList.length) {
      return api.sendMessage("⚠️ | الرقم غير صحيح", event.threadID, event.messageID);
    }

    const targetUID = groupList[number - 1];
    const { success, failed } = await handleApprove(api, targetUID);

    if (success.length > 0) {
      const userInfo = await api.getUserInfo(targetUID);
      const userName = userInfo[targetUID].name;
      api.sendMessage(
        `✅ | تم قبول العضو ${userName} بنجاح`,
        event.threadID,
        event.messageID,
      );
    }
    if (failed.length > 0) {
      api.sendMessage(
        `❌ | فشل قبول العضو ${failed.join(", ")}`,
        event.threadID,
        event.messageID,
      );
    }
  },
};
