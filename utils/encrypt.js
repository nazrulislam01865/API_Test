const CryptoJS = require("crypto-js");

const encryptSession = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), process.env.SESSION_SECRET).toString();
const decryptSession = (encryptedData) => JSON.parse(CryptoJS.AES.decrypt(encryptedData, process.env.SESSION_SECRET).toString(CryptoJS.enc.Utf8));

module.exports = { encryptSession, decryptSession };
