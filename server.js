const express = require('express');
const path = require('path');
const config = require('./config');
require('dotenv').config();  // 添加这行

const app = express();

// 添加日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// 添加JSON解析中间件
app.use(express.json());

// 服务静态文件
app.use(express.static('public'));
app.use('/data', express.static(path.join(__dirname, 'data')));

// 添加API代理路由
app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: req.body.messages
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('API调用失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 添加错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log('=================================');
});
