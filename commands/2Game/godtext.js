export default {
  name: "زخرفة2",
  author: "Kaguya Project",
  role: "member",
  cooldowns: 10,
  description: "زخرفة نصوص إنحليزي إلى حروف أشبه بالرموز !",
  async execute({ args }) {
    try {
      const content = args.join(" ").toLowerCase();

      if (!content) return kaguya.reply(` ⚠️ |النص الذي تحتاج إلى تحويله مفقود\nالرجاء إدخاله بالكامل!`);

      const characterMap = {
        a: "ꋫ", b: "ꃃ", c: "ꏸ", d: "ꁕ",
        e: "ꍟ", f: "ꄘ", g: "ꁍ", h: "ꑛ",
        i: "ꂑ", j: "ꀭ", k: "ꀗ", l: "꒒",
        m: "ꁒ", n: "ꁹ", o: "ꆂ", p: "ꉣ",
        q: "ꁸ", r: "꒓", s: "ꌚ", t: "꓅",
        u: "ꐇ", v: "ꏝ", w: "ꅐ", x: "ꇓ",
        y: "ꐟ", z: "ꁴ"
      };

      return kaguya.reply(content.replace(/[a-z]/g, (char) => characterMap[char] || char));
    } catch (err) {
      console.error(err);
    }
  },
};
