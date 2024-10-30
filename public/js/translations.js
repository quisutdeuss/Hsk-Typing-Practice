const translations = {
    zh: {
        welcome: "你好! ",  // 中文欢迎语
        logout: "退出登录",
        title: 'HSK 打字练习',
        subtitle: '提高你的中文打字水平',
        inputPlaceholder: '输入汉字...',
        chatPlaceholder: '输入问题...',
        submit: '提交 →',
        score: '得分',
        progress: '进度',
        complete: '练习完成!',
        finalScore: '最终得分',
        correctAnswer: '正确答案：',
        loadError: '加载失败',
        checkError: '请检查数据文件是否存在',
        langIcon: "文A",
        skip: "跳过"
    },
    en: {
        welcome: "Hi! ",    // 英文欢迎语
        logout: "Logout",
        title: 'HSK Typing Practice',
        subtitle: 'Improve your Chinese typing skills',
        inputPlaceholder: 'Type Chinese characters...',
        chatPlaceholder: 'Type your question...',
        submit: 'Submit →',
        score: 'Score',
        progress: 'Progress',
        complete: 'Practice Complete!',
        finalScore: 'Final Score',
        correctAnswer: 'Correct answer: ',
        loadError: 'Loading Failed',
        checkError: 'Please check if data files exist',
        langIcon: "文A",
        skip: "Skip"
    },
    vi: {
        welcome: "Xin chào! ",  // 越南语欢迎语
        logout: "Đăng xuất",
        title: 'Luyện gõ HSK',
        subtitle: 'Cải thiện kỹ năng gõ tiếng Trung của bạn',
        inputPlaceholder: 'Nhập ký tự Hán...',
        chatPlaceholder: 'Nhập câu hỏi của bạn...',
        submit: 'Gửi →',
        score: 'Điểm',
        progress: 'Tiến độ',
        complete: 'Hoàn thành!',
        finalScore: 'Điểm số cuối cùng',
        correctAnswer: 'Câu trả lời đúng: ',
        loadError: 'Tải thất bại',
        checkError: 'Vui lòng kiểm tra tệp dữ liệu có tồn tại không',
        langIcon: "文A",
        skip: "Bỏ qua"
    }
};

// 更新页面文本的函数
function updatePageText(lang) {
    // 更新欢迎文本和退出按钮
    const greetingText = document.querySelector('.greeting-text');
    const logoutBtn = document.querySelector('.logout-btn');
    const userName = document.getElementById('userName')?.textContent;

    if (greetingText && userName) {
        // 清除现有内容
        greetingText.textContent = '';
        // 设置新的欢迎语
        setTimeout(() => {
            greetingText.textContent = translations[lang].welcome;
            const userNameSpan = document.getElementById('userName');
            if (userNameSpan) {
                userNameSpan.textContent = userName.trim();
            }
        }, 0);
    }
    
    if (logoutBtn) {
        logoutBtn.textContent = translations[lang].logout;
    }

    // 更新其他页面文本
    const elements = {
        'h1': translations[lang].title,
        '.subtitle': translations[lang].subtitle,
        '#hanzi-input': { placeholder: translations[lang].inputPlaceholder },
        '#submit-btn': translations[lang].submit,
        '.stat-label:first-child': translations[lang].score,
        '.stat-label:nth-child(2)': translations[lang].progress,
        '#chat-input': { placeholder: translations[lang].chatPlaceholder }
    };

    // 遍历更新所有元素
    for (const [selector, value] of Object.entries(elements)) {
        const element = document.querySelector(selector);
        if (element) {
            if (typeof value === 'object') {
                Object.assign(element, value);
            } else {
                element.textContent = value;
            }
        }
    }

    // 更新语言图标
    const langIcon = document.querySelector('.lang-icon');
    if (langIcon) {
        langIcon.textContent = translations[lang].langIcon;
    }

    // 更新跳过按钮的文本
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.textContent = translations[lang].skip;
    }
}

// 初始化语言切换功能
function initLanguageSwitch() {
    const langBtn = document.querySelector('.language-btn');
    const langDropdown = document.querySelector('.language-dropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    if (langBtn && langDropdown) {
        // 切换下拉菜单
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('show');
        });

        // 语言选择
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = item.getAttribute('data-lang');
                const currentLang = document.querySelector('.current-lang');
                
                // 更新显示的语言文本
                if (currentLang) {
                    currentLang.textContent = item.textContent;
                }

                // 更新激活状态
                dropdownItems.forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                // 切换语言
                switchLanguage(lang);
                
                // 关闭下拉菜单
                langDropdown.classList.remove('show');
            });
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            langDropdown.classList.remove('show');
        });
    }
}

// 切换语言的函数
function switchLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('preferred-language', lang);
    
    // 强制更新页面文本
    setTimeout(() => {
        updatePageText(lang);
    }, 0);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化语言切换功能
    initLanguageSwitch();
    
    // 立即加载保存的语言设置
    const savedLang = localStorage.getItem('preferred-language') || 'zh';
    
    // 立即更新页面文本
    updatePageText(savedLang);
    
    // 设置当前语言的激活状态
    const currentItem = document.querySelector(`.dropdown-item[data-lang="${savedLang}"]`);
    if (currentItem) {
        document.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
        currentItem.classList.add('active');
        const currentLang = document.querySelector('.current-lang');
        if (currentLang) {
            currentLang.textContent = currentItem.textContent;
        }
    }

    // 设置语言属性
    document.documentElement.setAttribute('lang', savedLang);
});

// 修改主题切换函数
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const currentLang = localStorage.getItem('preferred-language') || 'zh';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 强制更新页面文本
    requestAnimationFrame(() => {
        updatePageText(currentLang);
    });
}
