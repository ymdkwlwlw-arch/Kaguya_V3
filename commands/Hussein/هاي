import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

export default {
  name: "ارت2",
  author: "Your Name",
  role: "member",
  description: "معالجة صورة باستخدام نموذج محدد وتحويلها إلى صورة جديدة.",
  execute: async ({ bot, chatId, msg, args, apiKeys }) => {
    if (!msg.reply_to_message || !msg.reply_to_message.photo) {
      return bot.sendMessage(chatId, 'Please reply to an image message with this command.');
    }

    const model = args[0]?.trim();
    if (!model || isNaN(model) || model < 1 || model > 25) {
      return bot.sendMessage(chatId, 'Invalid model number. Please use a number between 1 and 25.');
    }

    const photoArray = msg.reply_to_message.photo;
    const largestPhoto = photoArray[photoArray.length - 1];
    const fileId = largestPhoto.file_id;

    let currentApiKeyIndex = 0;
    let responseReceived = false;

    while (!responseReceived && currentApiKeyIndex < apiKeys.length) {
      const apikey = apiKeys[currentApiKeyIndex];

      try {
        const processingMessage = await bot.sendMessage(chatId, `Processing your image with model ${model}. Please wait...`);

        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

        const formData = new FormData();
        formData.append('image', Buffer.from(response.data, 'binary'), 'image.jpg');

        const apiResponse = await axios.post(`https://loopsie-art.onrender.com/process-image?model=model${model}&apikey=${apikey}`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          responseType: 'json'
        });

        if (apiResponse.data.status && apiResponse.data.status.output && apiResponse.data.status.output.fileUrl) {
          responseReceived = true;

          const { delayTime, executionTime } = apiResponse.data.status;
          const processingTime = (delayTime + executionTime) / 1000;

          const imageUrl = apiResponse.data.status.output.fileUrl;
          const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(imageResponse.data, 'binary');
          const imagePath = path.join(process.cwd(), 'cache', 'generated-image.jpg');
          fs.writeFileSync(imagePath, imageBuffer);

          await bot.sendPhoto(chatId, imagePath, {
            caption: `✅ | تم تحويل الصورة بنجاح\nالموديل : ${model}\nوقت المعالجة : ${processingTime.toFixed(2)} seconds`
          });

          await bot.deleteMessage(chatId, processingMessage.message_id);
          fs.unlinkSync(imagePath);
        } else {
          throw new Error('Image URL not found in API response');
        }

      } catch (error) {
        if (error.response && error.response.status === 403) {
          if (error.response.data.error && error.response.data.error.includes('Api Key Has Expired')) {
            await bot.sendMessage(chatId, 'API Key has expired. Please update the API Key.');
          } else {
            await bot.sendMessage(chatId, error.response.data.error);
          }
          currentApiKeyIndex++;
        } else if (error.response && error.response.status === 502) {
          await bot.sendMessage(chatId, 'API is currently unavailable. Contact Owner');
          break;
        } else {
          console.error('Error:', error);
          await bot.sendMessage(chatId, 'An error occurred while generating the image.');
          break;
        }
      }
    }
  }
};
