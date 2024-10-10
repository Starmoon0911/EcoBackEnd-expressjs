require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const log = require('./utils/logger');
const fs = require('fs');
const Table = require('ascii-table');

const app = express();
const PORT = process.env.PORT || 9000;

app.use(bodyParser.json());

// 存放路由資訊的陣列
const apiRoutes = [];

// 自動加載 API 路由
const apiPath = path.join(__dirname, 'src', 'api');

// 創建表格以顯示路由狀態
const table = new Table.factory('Api Status');
table.setHeading('Path', 'method', 'status')
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
                const methods = Object.keys(route.stack.reduce((acc, curr) => {
                    curr.route && curr.route.methods && Object.keys(curr.route.methods).forEach(method => {
                        acc[method] = true;
                    });
                    return acc;
                }, {}));

                // 註冊路由
                app.use(`${basePath}`, route);

                // 記錄路由狀態
                methods.forEach(method => {
                    table.addRow(
                        `${basePath}/${file
                            .toString()
                            .replace('.js', '')}`,
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
});
