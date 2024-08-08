import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
 // Assuming this import is correct

const regCheckURL = /^(http|https):\/\/[^ "]+$/;

async function uploadImgbb(filePath) {
  try {
    const formData = new FormData();
    formData.append('source', fs.createReadStream(filePath));
    formData.append('action', 'upload');
    
    const res_ = await axios({
      method: 'GET',
      url: 'https://imgbb.com',
    });

    const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
    const timestamp = Date.now();

    formData.append('timestamp', timestamp);
    formData.append('auth_token', auth_token);

    const res = await axios.post('https://imgbb.com/json', formData, {
      headers: formData.getHeaders(),
    });

    return res.data.image.url;
  } catch (err) {
    throw new Error(err.response ? err.response.data : err);
  }
}

class AntiboxImage {
  constructor() {
    this.name = 'حماية_الصورة';
    this.author = 'Kaguya Project';
    this.cooldowns = 60;
    this.description = 'حماية المجموعة من تغيير صورتها!';
    this.role = 'admin';
    this.aliases = [];
  }

  async execute({ event, Threads, api }) {
    try {
      const threadID = event.threadID;
      const threads = (await Threads.find(threadID))?.data?.data;
      const status = threads?.anti?.imageBox ? false : true;
      
      // Get the current image of the group
      const currentImage = await api.getGroupImage(threadID);
      const tempImagePath = path.join(process.cwd(), 'cache', 'currentImage.jpg');

      // Save the image to the cache directory
      fs.writeFileSync(tempImagePath, currentImage);

      // Upload the image and get the URL
      const newImageUrl = await uploadImgbb(tempImagePath);

      // Update thread data
      await Threads.update(threadID, {
        anti: {
          imageBox: status,
        },
      });

      // Notify the user
      api.sendMessage(`تم ${status ? 'تشغيل' : '❌ إطفاء ✅'} ميزة الحماية من تغيير صورة المجموعة`, threadID);

      // Remove temporary file
      fs.unlinkSync(tempImagePath);
    } catch (err) {
      console.error(err);
      api.sendMessage('❌ | لقد حدث خطأ غير متوقع!', event.threadID);
    }
  }
}

export default new AntiboxImage();
