export default {
  "prefix": "*",
  "language": "ar_MA",
  "BOT_NAME": "ⓀⒶⒼⓊⓎⒶ",
  "ADMIN_IDS": [
    "100076269693499",
    "100065328385465",
    "100089781891448",
    "61561651712194"
  ],
  "options": {
    "forceLogin": true,
    "listenEvents": true,
    "listenTyping": false,
    "logLevel": "silent",
    "updatePresence": true,
    "selfListen": false,
    "userAgent": "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 OPR/84.0.4316.21"
  },
  "database": {
    "type": "json",
    "mongodb": {
      "uri": "mongodb://0.0.0.0:27017"
    }
  },
  "port": 3000,
  "mqtt_refresh": 1200000
};
