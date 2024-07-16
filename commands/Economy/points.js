import fs from "fs";
import path from "path";

const userDataFile = path.join(process.cwd(), 'pontsData.json');

export default {
    name: "نقاط",
    author: "Your Name",
    role: "member",
    description: "عرض نقاطك.",
    aliases : ["نقاطي"],
    execute: async function ({ api, event }) {
        try {
            // تأكد من وجود ملف البيانات قبل قراءته
            if (!fs.existsSync(userDataFile)) {
                throw new Error("ملف البيانات غير موجود");
            }

            // قراءة بيانات المستخدم من ملف البيانات
            const userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
            const userPoints = userData[event.senderID]?.points || 0; // احصل على نقاط المستخدم إذا كانت متوفرة
            const userName = userData[event.senderID]?.name || "المستخدم"; // احصل على اسم المستخدم إذا كان متوفرًا

            api.sendMessage(`👥 | الإسم ${userName} \n🔖 | الرصيد ${userPoints} نقطة.`, event.threadID);
        } catch (error) {
            console.error("حدث خطأ أثناء جلب نقاط المستخدم:", error);
            api.sendMessage(`حدث خطأ أثناء جلب نقاطك، يرجى المحاولة مرة أخرى`, event.threadID);
        }
    }
};
