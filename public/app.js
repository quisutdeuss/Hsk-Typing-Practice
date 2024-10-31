// 在文件开头添加主题相关代码
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// 存储当前HSK词汇数据
let currentWords = [];
let currentIndex = 0;
let score = 0;

// 加载HSK词汇数据
async function loadHSKData(level) {
  // 显示加载状态
  document.querySelector(".word-card").innerHTML = `
        <div class="hanzi">加载中...</div>
        <div class="pinyin">正在加载 HSK ${level} 级词库</div>
    `;

  console.log(`正在加载 HSK ${level} 级词汇...`);
  try {
    // 修改文件名逻辑以支持 7+
    const fileName = level === "7+" ? "HSK_7+.json" : `HSK_${level}.json`;
    const response = await fetch(`/data/${fileName}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 检查数据是否正确加载
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("词库数据格式错误或为空");
    }

    console.log(`成功加载 HSK ${level} 级词汇，共 ${data.length} 个词`);

    // 使用完整词库并打乱顺序
    currentWords = shuffleArray([...data]);
    currentIndex = 0;
    score = 0;

    // 重置统计并显示第一个词
    updateStats();
    showCurrentWord();

    document.getElementById("hanzi-input").disabled = false;
  } catch (error) {
    console.error("加载HSK数据失败:", error);
    document.querySelector(".word-card").innerHTML = `
            <div class="hanzi">加载失败</div>
            <div class="pinyin">请检查数据文件: ${fileName}</div>
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

  // 修改这部分，保持HTML结构
  document.querySelector(".word-card").innerHTML = `
        <div class="hanzi">${word.simplified || ""}</div>
        <div class="pinyin-container">
            <div class="pinyin" style="visibility: hidden">${
              word.forms?.[0]?.transcriptions?.pinyin || ""
            }</div>
            <button id="toggle-pinyin" class="toggle-pinyin-btn" title="显示/隐藏拼音">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `;

  // 重新添加拼音切换事件监听
  const togglePinyinBtn = document.getElementById("toggle-pinyin");
  const pinyinElement = document.querySelector(".pinyin");

  if (togglePinyinBtn && pinyinElement) {
    togglePinyinBtn.addEventListener("click", () => {
      const isVisible = pinyinElement.style.visibility === "visible";
      pinyinElement.style.visibility = isVisible ? "hidden" : "visible";
      togglePinyinBtn.classList.toggle("active");
      localStorage.setItem("showPinyin", !isVisible);
    });

    // 恢复用户的拼音显示偏好
    const showPinyin = localStorage.getItem("showPinyin") === "true";
    pinyinElement.style.visibility = showPinyin ? "visible" : "hidden";
    if (showPinyin) {
      togglePinyinBtn.classList.add("active");
    }
  }

  // 重置输入框
  const input = document.getElementById("hanzi-input");
  input.value = "";
  input.focus();
  input.classList.remove("error");
}

// 更新统计信息
function updateStats() {
  document.getElementById("score").textContent = score;
  // 使用实际的词库大小
  document.getElementById("progress").textContent = `${currentIndex + 1}/${
    currentWords.length
  }`;
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
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = `正确答案：${currentWord.simplified}`;
    const inputSection = document.querySelector(".input-section");
    inputSection.appendChild(errorDiv);

    // 5秒后移除错误提示
    setTimeout(() => {
      errorDiv.remove();
      document.getElementById("hanzi-input").classList.remove("error");
    }, 5000);
    return false;
  }
}

// 显示完成信息
function showComplete() {
  // 显示完成信息
  document.querySelector(".word-card").innerHTML = `
        <div class="hanzi">本轮练习完成!</div>
        <div class="pinyin">答对 ${score} 个，共 ${currentWords.length} 个</div>
    `;

  // 延迟2秒后重新开始
  setTimeout(() => {
    // 重新打乱词库
    currentWords = shuffleArray([...currentWords]);
    currentIndex = 0;
    score = 0;

    // 更新统计并显示新的词
    updateStats();
    showCurrentWord();

    // 重新启用输入框
    document.getElementById("hanzi-input").disabled = false;
  }, 2000);
}

// 事件监听器
document.addEventListener("DOMContentLoaded", () => {
  // 初始化主题
  initTheme();

  // 主题切换按钮事件
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

  // 加载HSK 1级词汇
  loadHSKData(1);

  // HSK级别选择
  document.querySelectorAll(".level-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      document
        .querySelectorAll(".level-btn")
        .forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      const level = e.target.dataset.level;
      loadHSKData(level);
    });
  });

  // 打字练习的输入框事件
  const hanziInput = document.getElementById("hanzi-input");


  // 打字练习的回车键事件
  hanziInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 阻止事件冒泡
      e.stopPropagation(); // 确保不会触发文档级的事件
      if (hanziInput.value.trim()) {
        if (!checkAnswer(hanziInput.value)) {
          hanziInput.classList.add("error");
        }
      }
    }
  });

  // 在这里添加跳过按钮的事件监听
  const skipBtn = document.getElementById("skip-btn");
  if (skipBtn) {
      skipBtn.addEventListener('click', () => {
      currentIndex++;
      showCurrentWord();
      updateStats();
    });
  }
});

// 修改showError函数
function showError(input, message) {
  const inputElement = document.getElementById("hanzi-input");
  inputElement.classList.add("error");

  // 创建或更新错误提示
  let errorDiv = document.querySelector(".error-message");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    document.querySelector(".input-section").appendChild(errorDiv);
  }
  errorDiv.textContent = message;

  // 5秒后移除错误提示
  setTimeout(() => {
    errorDiv.remove();
    inputElement.classList.remove("error");
  }, 5000);
}

// 修改showComplete函数
function showComplete() {
  // 显示完成信息
  document.querySelector(".word-card").innerHTML = `
        <div class="hanzi">本轮练习完成!</div>
        <div class="pinyin">答对 ${score} 个，共 ${currentWords.length} 个</div>
    `;

  // 延迟2秒后重新开始
  setTimeout(() => {
    // 重新打乱词库
    currentWords = shuffleArray([...currentWords]);
    currentIndex = 0;
    score = 0;

    // 更新统计并显示新的词
    updateStats();
    showCurrentWord();

    // 重新启用输入框
    document.getElementById("hanzi-input").disabled = false;
  }, 2000);
}
