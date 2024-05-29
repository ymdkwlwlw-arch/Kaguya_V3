
const joinGroupCommand = async ({ api, event, args }) => {
  try {
    if (!args[0]) {
      const groupList = await api.getThreadList(10, null, ['INBOX']);
      const filteredList = groupList.filter(group => group.name !== null);

      if (filteredList.length === 0) {
        api.sendMessage('No group chats found.', event.threadID);
      } else {
        const formattedList = filteredList.map((group, index) =>
          `│${index + 1}. ${group.name}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
        );
        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${formattedList.map(line => `${line}`).join("\n")}\n╰───────────ꔪ\nالحد الأقصى للأعضاء = 250\n\nقم بالرد برقم إحدى المجموعات حتى تتم إضافتك في إحداهن`;

        api.sendMessage(message, event.threadID, (err, info) => {
          if (err) return console.error(err);
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "إنضمام",
            groupList: filteredList,
            unsend: true,
          });
        });
      }
    } else {
      api.sendMessage('يرجى الرد برقم المجموعة من القائمة.', event.threadID);
    }
  } catch (error) {
    console.error("Error joining group chat", error);
    api.sendMessage('حدث خطأ أثناء الانضمام إلى الدردشة الجماعية.\nيرجى المحاولة مرة أخرى لاحقًا.', event.threadID);
  }
};

async function onReply({ api, event, reply }) {
  if (reply.type !== 'pick') return;

  const { author, groupList } = reply;

  if (event.senderID !== author) return;

  const selectedNumber = parseInt(event.body);

  if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > groupList.length) {
    api.sendMessage("رقم غير صالح. يرجى الرد برقم مجموعة صحيح من القائمة.", event.threadID);
    return;
  }

  const selectedGroup = groupList[selectedNumber - 1];

  try {
    const memberList = await api.getThreadInfo(selectedGroup.threadID);
    if (memberList.participantIDs.includes(event.senderID)) {
      api.sendMessage(` ⚠️ | لا أستطيع إضافتك الى هذه المجموعة : \n${selectedGroup.name}`, event.threadID);
      return;
    }

    if (memberList.participantIDs.length >= 250) {
      api.sendMessage(` ❗ | لا يمكن إضافتك إلى هذه المجموعة لانها ممتلئة: \n${selectedGroup.name}`, event.threadID);
      return;
    }

    await api.addUserToGroup(event.senderID, selectedGroup.threadID);
    api.sendMessage(` ✅ | تمت إضافتك بنجاح الى هذه المجموعة : ${selectedGroup.name}`, event.threadID);
  } catch (error) {
    console.error("Error joining group chat", error);
    api.sendMessage('حدث خطأ أثناء الانضمام إلى الدردشة الجماعية.\nيرجى المحاولة مرة أخرى لاحقًا.', event.threadID);
  }
  await api.unsendMessage(reply.messageID);
}

export default {
  name: "إنضمام",
  author: "Kshitiz",
  role: 1,
  description: "الإنضمام الى مجموعة محددة",
  execute: joinGroupCommand,
  onReply,
};