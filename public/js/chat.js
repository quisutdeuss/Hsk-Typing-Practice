class AIChat {
    constructor() {
        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.submitButton = document.getElementById('chat-submit');
        this.messages = [];  // 存储对话历史
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // AI聊天的输入事件
        this.input.addEventListener('input', () => {
            this.submitButton.disabled = !this.input.value.trim();
        });

        // AI聊天的提交事件
        this.submitButton.addEventListener('click', () => this.sendMessage());
        
        // AI聊天的键盘事件 - 修改这部分
        this.input.addEventListener('keydown', (e) => {  // 改为 keydown
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                if (this.input.value.trim()) {
                    this.sendMessage();
                }
            }
        }, true);  // 添加 true 使用事件捕获
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // 添加用户消息到界面和历史
        this.addMessage(message, 'user');
        this.messages.push({ role: "user", content: message });
        
        this.input.value = '';
        this.submitButton.disabled = true;

        try {
            // 发送API请求
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: this.messages
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const aiResponse = data.choices[0].message.content;
                this.addMessage(aiResponse, 'ai');
                this.messages.push({ role: "assistant", content: aiResponse });
            }
        } catch (error) {
            console.error('API调用失败:', error);
            this.addMessage('抱歉，发生了错误，请稍后重试。', 'ai');
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// 初始化AI聊天
document.addEventListener('DOMContentLoaded', () => {
    const aiChat = new AIChat();
});
