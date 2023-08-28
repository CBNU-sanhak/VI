const crypto = require('crypto');

function createHashPassword (password) {
    return crypto.createHash("sha512").update(password).digest("base64");
};

module.exports = createHashPassword;