import axios from "axios";
import FormData from "form-data";

export default {
  name: "رابط3",
  author: "kaguya project",
  role: "member",
  description: "يقوم برفع الصورة المرفقة إلى imgbb وإرجاع رابط الصورة.",
  async execute({ api, event }) {
    const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25"; // Replace "YOUR_API_KEY_HERE" with your actual API key
    const linkanh = event.messageReply?.attachments[0]?.url;
    if (!linkanh) {
      return api.sendMessage(' ⚠️ |الرجاء الرد على الصورة.', event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(linkanh, { responseType: 'arraybuffer' });
      const formData = new FormData();
      formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });
      const res = await axios.post('https://api.imgbb.com/1/upload', formData, {
        headers: formData.getHeaders(),
        params: {
          key: imgbbApiKey
        }
      });
      const imageLink = res.data.data.url;
      return api.sendMessage(imageLink, event.threadID, event.messageID);
    } catch (error) {
      console.log(error);
      return api.sendMessage('فشل تحميل الصورة إلى imgbb.', event.threadID, event.messageID);
    }
  }
};