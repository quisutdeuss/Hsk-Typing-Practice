const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());
app.use(express.json());

// 服务静态文件
app.use(express.static('public'));

// 添加在其他路由之前
app.get('/data/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'public', 'data', filename);
        
        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Error reading HSK data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 代理 AI 聊天请求
app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || 'sk-9498af8bc55342db985bc6d0fc68ef35'}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: req.body.messages,
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 处理所有其他路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log('=================================');
});
