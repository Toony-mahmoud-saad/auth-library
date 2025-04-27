const CryptoJS = require('crypto-js');

// Enhanced encryption configuration for author field only
const encryptionConfig = {
  key: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars',
  iv: CryptoJS.enc.Utf8.parse(process.env.ENCRYPTION_IV || 'default-iv-16-chars'),
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
};

// Encrypt data (specifically for author)
exports.encryptData = (data) => {
  if (!data) return data;
  
  const encrypted = CryptoJS.AES.encrypt(
    data.toString(),
    encryptionConfig.key,
    { 
      iv: encryptionConfig.iv,
      mode: encryptionConfig.mode,
      padding: encryptionConfig.padding
    }
  );
  
  return encrypted.toString();
};

// Decrypt data (specifically for author)
exports.decryptData = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(
      ciphertext.toString(),
      encryptionConfig.key,
      { 
        iv: encryptionConfig.iv,
        mode: encryptionConfig.mode,
        padding: encryptionConfig.padding
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return ciphertext; // Return original if decryption fails
  }
};