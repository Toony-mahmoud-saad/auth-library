const { encryptData, decryptData } = require('../config/encryption');

exports.encryptResponse = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (process.env.NODE_ENV === 'production' && data) {
      const encryptedData = encryptData(data);
      originalSend.call(res, { encrypted: true, data: encryptedData });
    } else {
      originalSend.call(res, data);
    }
  };
  next();
};