const translations = {
    zh: {
        title: 'HSK 打字练习',
        subtitle: '提高你的中文打字水平',
        inputPlaceholder: '输入汉字...',
        submitButton: '提交 →',
        score: '得分',
        progress: '进度',
        complete: '练习完成!',
        finalScore: '最终得分',
        correctAnswer: '正确答案：',
        loadError: '加载失败',
        checkError: '请检查数据文件是否存在'
    },
    en: {
        title: 'HSK Typing Practice',
        subtitle: 'Improve your Chinese typing skills',
        inputPlaceholder: 'Type Chinese characters...',
        submitButton: 'Submit →',
        score: 'Score',
        progress: 'Progress',
        complete: 'Practice Complete!',
        finalScore: 'Final Score',
        correctAnswer: 'Correct answer: ',
        loadError: 'Loading Failed',
        checkError: 'Please check if data files exist'
    },
    vi: {
        title: 'Luyện gõ HSK',
        subtitle: 'Cải thiện kỹ năng gõ tiếng Trung của bạn',
        inputPlaceholder: 'Nhập ký tự Hán...',
        submitButton: 'Gửi →',
        score: 'Điểm',
        progress: 'Tiến độ',
        complete: 'Hoàn thành!',
        finalScore: 'Điểm số cuối cùng',
        correctAnswer: 'Câu trả lời đúng: ',
        loadError: 'Tải thất bại',
        checkError: 'Vui lòng kiểm tra tệp dữ liệu có tồn tại không'
    }
};

// 添加更新页面文本的函数
function updatePageText() {
    const t = translations[currentLanguage];
    
    // 更新所有文本元素
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.getElementById('hanzi-input').placeholder = t.inputPlaceholder;
    document.getElementById('submit-btn').textContent = t.submitButton;
    document.querySelector('.stat-label:nth-child(1)').textContent = t.score;
    document.querySelector('.stat-label:nth-child(2)').textContent = t.progress;
}
