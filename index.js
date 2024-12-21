require('dotenv').config();
require('module-alias/register');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const log = require('./utils/logger');
const fs = require('fs');
const Table = require('ascii-table');
const db = require('@database/mongoose.js');
const app = express();
const PORT = process.env.PORT || 9000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use('/upload/avatar', express.static(path.join(__dirname, 'upload/avatar')));
app.use('/upload/product', express.static(path.join(__dirname, 'upload/product')));

// 自動加載 API 路由
const apiPath = path.join(__dirname, 'src', 'api');

// 創建表格以顯示路由狀態
const table = new Table.factory('Api Status');
table.setHeading('Path', 'Method', 'Status');
const loadRoutes = (dir, basePath) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 遞迴加載子資料夾
            loadRoutes(fullPath, `${basePath}/${file}`);
        } else if (file.endsWith('.js')) {
            try {
                // 載入路由模組
                const route = require(fullPath);
                const methods = Object.keys(route.router.stack.reduce((acc, curr) => {
                    curr.route && curr.route.methods && Object.keys(curr.route.methods).forEach(method => {
                        acc[method] = true;
                    });
                    return acc;
                }, {}));

                console.log(`Loading route: ${basePath}/${route.name}`); // 日誌
                app.use(`${basePath}`, route.router);

                // 記錄路由狀態
                methods.forEach(method => {
                    table.addRow(
                        `${basePath}/${route.name}`,
                        method.toUpperCase(),
                        '✅'
                    );
                });
            } catch (error) {
                // 錯誤處理
                table.addRow(`${basePath}`, 'N/A', '❌');
                log.error(`Failed to load route ${fullPath}: ${error.message}`);
            }
        }
    });
};

// 加載路由
loadRoutes(apiPath, '/api');

// 啟動伺服器
app.listen(PORT, () => {
    log.info(`App listening on port ${PORT}`);
    console.log(table.toString()); // 顯示路由狀態表格
    db.initializeMongoose();
});

module.exports = app;