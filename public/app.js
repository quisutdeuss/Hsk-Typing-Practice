// 在文件开头添加主题相关代码
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// 存储当前HSK词汇数据
let currentWords = [];
let currentIndex = 0;
let score = 0;
let totalWords = 20; // 每轮练习词数

// 加载HSK词汇数据
async function loadHSKData(level) {
    console.log(`正在加载 HSK ${level} 级词汇...`);
    try {
        const response = await fetch(`/data/HSK_${level}.json`);  // 修改这里的路径
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`成功加载 HSK ${level} 级词汇，共 ${data.length} 个词`);
        
        // 数据验证
        if (!Array.isArray(data)) {
            throw new Error('数据格式错误：预期是数组');
        }
        
        // 随机选择20个词
        currentWords = shuffleArray(data).slice(0, totalWords);
        currentIndex = 0;
        score = 0;
        updateStats();
        showCurrentWord();
        
        // 启用输入框
        document.getElementById('hanzi-input').disabled = false;
    } catch (error) {
        console.error('加载HSK数据失败:', error);
        const t = translations[currentLanguage];
        document.querySelector('.word-card').innerHTML = `
            <div class="hanzi">${t.loadError}</div>
            <div class="pinyin">${t.checkError}</div>
        `;
    }
}

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// 显示当前词
function showCurrentWord() {
    if (currentIndex >= currentWords.length) {
        showComplete();
        return;
    }

    const word = currentWords[currentIndex];
    document.querySelector('.hanzi').textContent = word.simplified || '';
    if (word.forms && word.forms[0] && word.forms[0].transcriptions) {
        document.querySelector('.pinyin').textContent = word.forms[0].transcriptions.pinyin || '';
    }
    
    // 重置输入框和按钮
    const input = document.getElementById('hanzi-input');
    const submitBtn = document.getElementById('submit-btn');
    input.value = '';
    input.focus();
    input.classList.remove('error');
    submitBtn.disabled = true;  // 重置按钮为禁用状态
}

// 更新统计信息
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('progress').textContent = `${currentIndex}/${totalWords}`;
}

// 检查答案
function checkAnswer(input) {
    const currentWord = currentWords[currentIndex];
    if (input === currentWord.simplified) {
        score++;
        currentIndex++;
        updateStats();
        showCurrentWord();
        return true;
    } else {
        // 显示错误提示
        showError(input, `正确答案：${currentWord.simplified}`);
        return false;
    }
}

// 显示完成信息
function showComplete() {
    document.querySelector('.word-card').innerHTML = `
        <div class="hanzi">练习完成!</div>
        <div class="pinyin">最终得分: ${score}/${totalWords}</div>
    `;
    document.getElementById('hanzi-input').disabled = true;
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题
    initTheme();
    
    // 主题切换按钮事件
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // 加载HSK 1级词汇
    loadHSKData(1);

    // HSK级别选择
    document.querySelectorAll('.level-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.level-btn').forEach(btn => 
                btn.classList.remove('active'));
            e.target.classList.add('active');
            const level = e.target.dataset.level;
            loadHSKData(level);
        });
    });

    // 输入框事件
    const input = document.getElementById('hanzi-input');
    const submitBtn = document.getElementById('submit-btn');

    input.addEventListener('input', (e) => {
        // 当输入框有内容时启用按钮
        submitBtn.disabled = e.target.value.length === 0;
    });

    // 提交按钮事件
    submitBtn.addEventListener('click', () => {
        const input = document.getElementById('hanzi-input');
        if (!checkAnswer(input.value)) {
            input.classList.add('error');
        }
    });
});

// 添加键盘事件支持
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('hanzi-input');
        if (!checkAnswer(input.value)) {
            input.classList.add('error');
        }
    }
});

// 添加一个新的函数来处理错误提示
function showError(input, message) {
    const inputElement = document.getElementById('hanzi-input');
    inputElement.classList.add('error');
    
    // 创建或更新错误提示
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.input-section').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    
    // 5秒后移除错误提示
    setTimeout(() => {
        errorDiv.remove();
        inputElement.classList.remove('error');
    }, 5000);
}

// 在文件开头添加
let currentLanguage = localStorage.getItem('language') || 'zh';

function initLanguage() {
    document.getElementById('language-select').value = currentLanguage;
    updatePageText();
}

function updatePageText() {
    const t = translations[currentLanguage];
    
    // 更新所有需要翻译的文本
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.getElementById('hanzi-input').placeholder = t.inputPlaceholder;
    document.getElementById('submit-btn').textContent = t.submitButton;
    
    // 更新统计信息标签
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels[0].textContent = t.score;
    statLabels[1].textContent = t.progress;

    // 如果有错误提示，也更新错误提示
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        const currentWord = currentWords[currentIndex];
        errorMessage.textContent = `${t.correctAnswer}${currentWord.simplified}`;
    }

    // 如果练习已完成，更新完成信息
    if (currentIndex >= totalWords) {
        document.querySelector('.word-card').innerHTML = `
            <div class="hanzi">${t.complete}</div>
            <div class="pinyin">${t.finalScore}: ${score}/${totalWords}</div>
        `;
    }
}

// 确保在DOMContentLoaded事件中正确初始化语言
document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言
    initLanguage();
    
    // 语言切换事件
    document.getElementById('language-select').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        localStorage.setItem('language', currentLanguage);
        updatePageText();
    });

    // ... 其他初始化代码 ...
});

// 修改showError函数
function showError(input, message) {
    const inputElement = document.getElementById('hanzi-input');
    inputElement.classList.add('error');
    
    // 创建或更新错误提示
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.input-section').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    
    // 5秒后移除错误提示
    setTimeout(() => {
        errorDiv.remove();
        inputElement.classList.remove('error');
    }, 5000);
}

// 修改showComplete函数
function showComplete() {
    const t = translations[currentLanguage];
    document.querySelector('.word-card').innerHTML = `
        <div class="hanzi">${t.complete}</div>
        <div class="pinyin">${t.finalScore}: ${score}/${totalWords}</div>
    `;
    document.getElementById('hanzi-input').disabled = true;
}

// 添加语言切换相关代码
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('language-btn');
    const langDropdown = document.getElementById('language-dropdown');
    const currentLangSpan = document.querySelector('.current-lang');
    
    // 切换下拉菜单
    langBtn.addEventListener('click', () => {
        langDropdown.classList.toggle('show');
    });
    
    // 选择语言
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.dataset.lang;
            currentLanguage = lang;
            localStorage.setItem('language', lang);
            currentLangSpan.textContent = item.textContent;
            updatePageText();
            langDropdown.classList.remove('show');
        });
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
        }
    });
});
