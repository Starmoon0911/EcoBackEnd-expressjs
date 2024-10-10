const winston = require('winston');
const path = require('path');
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1; // 月份需要加 1
const day = date.getDate();

const logDir = `./logs/${year}-${month}-${day}`;

// 確保目錄存在
const fs = require('fs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const log = winston.createLogger({
    level: 'info',
    format: winston.format.cli(),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'Errors.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'Logs.log') }),
        new winston.transports.Console()
    ]
});


module.exports = log;
