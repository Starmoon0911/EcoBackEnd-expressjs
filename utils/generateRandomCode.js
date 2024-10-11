function generateRandomCode(options) {
    const { upper, lower, num, sign, length } = options;

    let charSet = '';
    if (upper) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) charSet += 'abcdefghijklmnopqrstuvwxyz';
    if (num) charSet += '0123456789';
    if (sign) charSet += '!@#$%^&*()-_=+[]{}|;:,.<>?';

    if (charSet.length === 0) {
        throw new Error('至少選擇一種字符類型');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        password += charSet[randomIndex];
    }

    return password;
}


module.exports = generateRandomCode