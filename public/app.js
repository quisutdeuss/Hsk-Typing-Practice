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
    
    const pinyinElement = document.querySelector('.pinyin');
    if (word.forms && word.forms[0] && word.forms[0].transcriptions) {
        pinyinElement.textContent = word.forms[0].transcriptions.pinyin || '';
        // 保持当前的可见性状态
        const showPinyin = localStorage.getItem('showPinyin') === 'true';
        pinyinElement.style.visibility = showPinyin ? 'visible' : 'hidden';
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
    // 显示正确答案的数量
    document.getElementById('score').textContent = score;
    // 显示当前是第几个词/总共多少个词
    document.getElementById('progress').textContent = `${currentIndex + 1}/20`;
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
        // 只在打字输入框显示错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `正确答案：${currentWord.simplified}`;
        const inputSection = document.querySelector('.input-section');
        inputSection.appendChild(errorDiv);
        
        // 5秒后移除错误提示
        setTimeout(() => {
            errorDiv.remove();
            document.getElementById('hanzi-input').classList.remove('error');
        }, 5000);
        return false;
    }
}

// 显示完成信息
function showComplete() {
    document.querySelector('.word-card').innerHTML = `
        <div class="hanzi">练习完成!</div>
        <div class="pinyin">答对 ${score} 个，共 20 个</div>
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

    // 打字练习的输入框事件
    const hanziInput = document.getElementById('hanzi-input');
    const submitBtn = document.getElementById('submit-btn');

    // 输入框内容变化事件
    hanziInput.addEventListener('input', (e) => {
        submitBtn.disabled = e.target.value.length === 0;
    });

    // 打字练习的回车键事件
    hanziInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();  // 阻止事件冒泡
            e.stopPropagation(); // 确保不会触发文档级的事件
            if (hanziInput.value.trim()) {
                if (!checkAnswer(hanziInput.value)) {
                    hanziInput.classList.add('error');
                }
            }
        }
    });

    // 提交按钮点击事件
    submitBtn.addEventListener('click', () => {
        if (!checkAnswer(hanziInput.value)) {
            hanziInput.classList.add('error');
        }
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
        }
    });

    // 添加拼音显示切换功能
    const togglePinyinBtn = document.getElementById('toggle-pinyin');
    const pinyinElement = document.querySelector('.pinyin');
    
    togglePinyinBtn.addEventListener('click', () => {
        const isVisible = pinyinElement.style.visibility === 'visible';
        pinyinElement.style.visibility = isVisible ? 'hidden' : 'visible';
        togglePinyinBtn.classList.toggle('active');
        // 保存用户偏好
        localStorage.setItem('showPinyin', !isVisible);
    });

    // 恢复用户的拼音显示偏好
    const showPinyin = localStorage.getItem('showPinyin') === 'true';
    pinyinElement.style.visibility = showPinyin ? 'visible' : 'hidden';
    if (showPinyin) {
        togglePinyinBtn.classList.add('active');
    }
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
    document.querySelector('.word-card').innerHTML = `
        <div class="hanzi">练习完成!</div>
        <div class="pinyin">答对 ${score} 个，共 20 个</div>
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
