import { log } from "../logger/index.js";

export default {
  name: "threadUpdate",
  execute: async ({ api, event, Threads }) => {
    try {
      const threadsData = await Threads.find(event.threadID);
      const threads = threadsData?.data?.data || {};

      if (!threads) {
        await Threads.create(event.threadID);
      }

      if (!Object.keys(threads).length) return;

      switch (event.logMessageType) {
        case "log:thread-name":
          await handleThreadName(api, event, Threads, threads);
          break;
        case "change_thread_admins":
          await handleAdminChange(api, event, Threads, threads);
          break;
        case "change_thread_approval_mode":
          await handleApprovalModeChange(api, event, Threads, threads);
          break;
        case "log:thread-icon":
          await handleThreadIconChange(api, event, Threads, threads);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling thread update:", error);
    }
  },
};

async function handleThreadName(api, event, Threads, threads) {
  const { name: oldName = null } = threads;
  const { name: newName } = event.logMessageData;

  if (threads.anti?.nameBox) {
    await api.setTitle(oldName, event.threadID);
  }

  await Threads.update(event.threadID, {
    name: newName,
  });

  const adminName = await getUserName(api, event.author);
  api.sendMessage(
    `تم تغيير الإسم الجديد للمجموعة إلى: 🔖 |<${event.threadID}> - 『${newName}』 بواسطة: ${adminName}`,
    event.threadID
  );
}

async function handleAdminChange(api, event, Threads, threads) {
  const { adminIDs = [] } = threads;
  const { TARGET_ID, ADMIN_EVENT } = event.logMessageData;

  if (ADMIN_EVENT === "add_admin" && !adminIDs.includes(TARGET_ID)) {
    adminIDs.push(TARGET_ID);
  }

  if (ADMIN_EVENT === "remove_admin") {
    const indexOfTarget = adminIDs.indexOf(TARGET_ID);
    if (indexOfTarget > -1) {
      adminIDs.splice(indexOfTarget, 1);
    }
  }

  await Threads.update(event.threadID, {
    adminIDs,
  });

  const action = ADMIN_EVENT === "add_admin" ? "إضافة" : "❌ إزالة ✅";
  const adminName = await getUserName(api, TARGET_ID);
  api.sendMessage(
    ` 🔖 | تمت ${action} ${adminName} كآدمن في المجموعة`,
    event.threadID
  );
}

async function handleApprovalModeChange(api, event, Threads, threads) {
  const { APPROVAL_MODE } = event.logMessageData;
  await Threads.update(event.threadID, {
    approvalMode: APPROVAL_MODE === 0 ? false : true,
  });

  const action = APPROVAL_MODE === 0 ? "تفعيل" : "❌ تعطيل ✅";
  api.sendMessage(
    `تم ${action} ميزة الموافقة في المجموعة 🔖 |<${event.threadID}> - ${threads.name}`,
    event.threadID
  );
}

async function handleThreadIconChange(api, event, Threads, threads) {
  const { thread_icon } = event.logMessageData;
  await Threads.update(event.threadID, {
    emoji: thread_icon,
  });

  api.sendMessage(
    `تم تغيير أيقونة المجموعة إلى: ${thread_icon} 🔖 |<${event.threadID}> - ${threads.name}`,
    event.threadID
  );
}

async function getUserName(api, userID) {
  const userInfo = await api.getUserInfo(userID);
  return userInfo?.[userID]?.name || "Unknown";
}
