// Author: ChatGPT
// Role: Generate Password Command
// Description: This command generates a random password of specified length.
// Execute: api.sendMessage

import axios from 'axios';

export default {
    name: "كلمة_السر",
    author: "ChatGPT",
    role: "member",
    description: "يقوم بتوليد كلما سر عشوائية من اجل طول مخصص.",
    async execute({ api, message, args }) {
        try {
            let length = args[0] || 5;
            length = Math.min(Math.max(length, 1), 30); // Ensure length is between 1 and 30
            
            const url = `https://hassan-password-api.onrender.com/generate-password?length=${length}`;
            
            const response = await axios.get(url);
            const password = response.data.random_password;
    
            // Send the generated password as a reply
            await api.sendMessage({
                body: `╼╾─────⊹⊱⊰⊹─────╼╾\n🔑 | اليك كلمة السر المقترحة\n"${password}"\n╼╾─────⊹⊱⊰⊹─────╼╾`,
                threadID: message.threadID,
                messageID: message.messageID
            });
        } catch (error) {
            console.error("Error generating password:", error);
            await api.sendMessage("🧲 Couldn't fetch a password at the moment.", message.threadID);
        }
    }
};
