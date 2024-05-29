import fs from 'fs';

async function execute({ api, event, args }) {
  const action = args[0];
  const petName = args[1];

  if (!action) {
    return api.sendMessage("أرجوك بإدخال فعل من أجل البدأ:\n⌲ إنشاء\n⌲ إطعام\n⌲ لعب\n⌲ راحة\n⌲ الحالة\n⌲ الرصيد\n⌲ إعادة", event.threadID, event.messageID);
  }

  if (action === "إنشاء") {
    if (userPets[event.senderID]) {
      return api.sendMessage(`أنت بالفعل لديك حيوان أليف إسمه  "${userPets[event.senderID].name}". لا يمكنك إنشاء واحد آخر يسمح لك فقك بإمتلاك واحد.`, event.threadID, event.messageID);
    }

    if (!petName) {
      return api.sendMessage("يرجى تحديد اسم لحيوانك الأليف عند إنشاء واحد.", event.threadID, event.messageID);
    }

    userPets[event.senderID] = new VirtualPet(petName);
    savePetData();
    return api.sendMessage(`لقد قمت بإنشاء حيوان أليف بنجاح و إسمه ${petName}.`, event.threadID, event.messageID);
  }

  if (!userPets[event.senderID]) {
    return api.sendMessage("تحتاج لإنشاء حيوان أليف أولا. إستخدم *حيوان إنشاء [الإسم].", event.threadID, event.messageID);
  }

  const pet = userPets[event.senderID];
  let result = "";

  switch (action) {
    case "إنشاء":
      result = `لقد قمت للتو بإنشاء حيوان أليف و إسمه هو ${pet.name}.`;
      break;
    case "إطعام":
      result = pet.feed();
      break;
    case "لعب":
      result = pet.play();
      break;
    case "راحة":
      result = pet.rest();
      break;
    case "الحالة":
      result = pet.getStatus();
      break;
    case "الرصيد":
      result = `رصيدك من تربية  ${pet.name} هو: $${pet.coins}`;
      break;
    case "إعادة":
      if (!petName) {
        return api.sendMessage("يرجى تحديد اسم الحيوان الأليف لإعادة التعيين.", event.threadID, event.messageID);
      }
      if (pet.name !== petName) {
        return api.sendMessage(`يمكنك فقط لمالك الحيوان الأليف إعادة ضبط الحيوان الأليف. و تسمية حيوانك الأليف "${pet.name}".`, event.threadID, event.messageID);
      }
      delete userPets[event.senderID];
      savePetData();
      return api.sendMessage(`الحيوان "${petName}" تم إعادة تعيينه إلى الحالة الأولى. أستخدن ®حيوان_ألسف إنشاء [الإسم] لأنشاء حيوان أليف جديد.`, event.threadID, event.messageID);
    default:
      result = "حركة أو فعل مجهول. إستخدم الأفعال المتاحةالتالية:\n\n⌲ إنشاء\n⌲ إطعام\n⌲ لعب\n⌲ راحة\n⌲ الحالة\n⌲ الرصيد\n⌲ إعادة";
  }

  savePetData();
  return api.sendMessage(result, event.threadID, event.messageID);
}

class VirtualPet {
  constructor(name) {
    this.name = name;
    this.happiness = 50;
    this.hunger = 50;
    this.energy = 100;
    this.coins = 0;
    this.lastRestTime = null;
    this.foods = ["🍒", "🍎", "🍉", "🍑", "🍊", "🥭", "🍍", "🌶️", "🍋", "🍈", "🍏", "🍐", "🥝", "🍇", "🥥", "🍅", "🥕", "🍠", "🌽", "🥦", "🥒", "🥬", "🥑", "🍆", "🥔", "🌰", "🥜", "🍞", "🥐", "🥖", "🥯", "🥞", "🍳", "🥚", "🧀", "🥓", "🥩", "🍗", "🍖", "🍔", "🌭","🥪", "🥨", "🍟", "🍕", "🌮", "🌯", "🥙", "🥘", "🍝", "🥫", "🥣", "🥗", "🍲", "🍛", "🍜", "🦞", "🍣", "🍤", "🥡", "🍚", "🥟", "🍢", "🍙", "🍘", "🍥", "🍡", "🥠", "🥮", "🍧", "🍨", "🍦", "🥧", "🍰", "🍮", "🎂", "🧁", "🍭", "🍫", "🍫", "🍩", "🍪", "🍯", "🧂", "🍿", "🥤", "🥛", "🍵", "☕", "🍹", "🍶"];
                    }

                    feed() {
                      if (this.hunger >= 10) {
                        const randomFood = this.foods[Math.floor(Math.random() * this.foods.length)];
                        this.hunger -= 10;
                        this.happiness += 5;
                        this.energy += 2;
                        return `${this.name} سعدت بهذا ${randomFood}!\n\nالجوع: ${this.hunger}\nالسعادة: ${this.happiness}\nالطاقة: ${this.energy}`;
                      } else {
                        return `${this.name} هو بالفعل ممتلئ`;
                      }
                    }

                    play() {
                      if (this.energy >= 10) {
                        this.happiness += 10;
                        this.energy -= 5;
                        this.coins += 5;
                        return `${this.name} لقد إستمتع الحيوان الأليف بوقته!\n\nسعادة: ${this.happiness}\nالطاقة: ${this.energy}\n\nتهانينا لقد قمت بكسب 5 دولار💰`;
                      } else {
                        return `${this.name} متعب للعب الآن عد لاحقا.`;
                      }
                    }

                    rest() {
                      const currentTime = Date.now();
                      if (!this.lastRestTime || (currentTime - this.lastRestTime) >= 7200000) {
                        this.energy += 10;
                        this.lastRestTime = currentTime;
                        return `${this.name} لقد حصل على راحة جيدة واستعاد الطاقة.\n\nالطاقة: ${this.energy}`;
                      } else {
                        const remainingTime = Math.floor((7200000 - (currentTime - this.lastRestTime)) / 60000);
                        return `${this.name}الحيوان  الأليف لازال متعبا دعه يرتاع و عد لاحقا بعد ${remainingTime} دقيقة.`;
                      }
                    }

                    getStatus() {
                      return `حالة ${this.name} \n\nالجوع: ${this.hunger}\nالسعادة: ${this.happiness}\nالطاقة: ${this.energy}\nالعملات: $${this.coins}`;
                    }
                  }

                  const petDataFile = "petData.json";
                  const userPets = loadPetData();

                  function loadPetData() {
                    try {
                      const data = fs.readFileSync(petDataFile);
                      return JSON.parse(data);
                    } catch (error) {
                      return {};
                    }
                  }

                  function savePetData() {
                    fs.writeFileSync(petDataFile, JSON.stringify(userPets, null, 2));
                  }

                  export default {
                    name: "حيوان",
                    description: "يدير نظامًا للحيوانات الأليفة الافتراضية.",
                    execute,
                  };