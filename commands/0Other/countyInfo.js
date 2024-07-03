import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: 'دولة',
  author: 'Vex_Kshitiz',
  role: 0,
  description: 'البحث عن معلومات الدول بناءً على الاسم المدخل وإرسالها.',

  execute: async function ({ api, event, args }) {
    async function checkAuthor(authorName) {
      try {
        const response = await axios.get('https://author-check.vercel.app/name');
        const apiAuthor = response.data.name;
        return apiAuthor === authorName;
      } catch (error) {
        console.error("Error checking author:", error);
        return false;
      }
    }

    const isAuthorValid = await checkAuthor(module.exports.author);
    if (!isAuthorValid) {
      await api.sendMessage("Author changer alert! this cmd belongs to Vex_Kshitiz.", event.threadID, event.messageID);
      return;
    }

    if (args.length === 0) {
      return api.sendMessage(' ❗ | يرجى إدخال اسم الدولة.', event.threadID, event.messageID);
    }

    const countryName = args.join(" ");

    // Translate input from Arabic to English
    const translationResponseToEn = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(countryName)}`);
    const translatedCountryName = translationResponseToEn.data[0][0][0];

    const countryApiUrl = `https://country-info-eta.vercel.app/kshitiz?name=${encodeURIComponent(translatedCountryName)}`;

    try {
      const response = await axios.get(countryApiUrl);
      const {
        name,
        officialName,
        capital,
        region,
        subregion,
        population,
        area,
        languages,
        flag,
        coatOfArms,
        currency
      } = response.data;

      const infoTextEn = `╼╾─────⊹⊱⊰⊹─────╼╾\n
        إسم الدولة : ${name}
        الإسم الرسمي : ${officialName}
        العاصمة : ${capital}
        المنطقة : ${region}
        المنطقة الفرعية : ${subregion}
        تعداد السكان : ${population}
        المساحة : ${area} كيلومتر مربع 
        اللغة الرسمية : ${languages}
        العملة : ${currency}
      ╼╾─────⊹⊱⊰⊹─────╼╾\n`;

      // Translate output from English to Arabic
      const translationResponseToAr = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(infoTextEn)}`);
      const translatedInfoText = translationResponseToAr.data[0][0][0];

      const cacheDir = path.join(process.cwd(), 'cache');
      await fs.ensureDir(cacheDir);

      const images = [flag, coatOfArms];
      const imgData = [];

      for (let i = 0; i < images.length; i++) {
        try {
          const imgResponse = await axios.get(images[i], { responseType: 'arraybuffer' });
          const extension = path.extname(images[i]) || '.jpg';
          const imgPath = path.join(cacheDir, `${i + 1}${extension}`);
          await fs.outputFile(imgPath, imgResponse.data);
          imgData.push(fs.createReadStream(imgPath));
        } catch (error) {
          console.error(error);
        }
      }

      await api.sendMessage({
        attachment: imgData,
        body: translatedInfoText.trim(),
      }, event.threadID, event.messageID);

      // Clean up cache directory
      await fs.remove(cacheDir);
    } catch (error) {
      console.error(error);
      await api.sendMessage("عذرًا، حدث خطأ أثناء معالجة طلبك.", event.threadID, event.messageID);
    }
  },
};
