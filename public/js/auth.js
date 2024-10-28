const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 处理登录状态变化
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // 用户已登录
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = user.email.split("@")[0];
    }

    // 如果在登录页面，重定向到主页
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "index.html";
    }
  } else {
    // 用户未登录
    if (
      !window.location.pathname.includes("login.html") &&
      !window.location.pathname.includes("register.html")
    ) {
      window.location.href = "login.html";
    }
  }
});

// 邮箱密码登录
async function emailLogin(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    alert("登录失败：" + error.message);
  }
}

// 邮箱密码注册
async function emailSignup(email, password) {
  try {
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    alert("注册失败：" + error.message);
  }
}

// 谷歌登录
async function googleLogin() {
  try {
    await auth.signInWithPopup(googleProvider);
  } catch (error) {
    alert("谷歌登录失败：" + error.message);
  }
}

// 修改退出登录函数为最简单的形式
function logout() {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch((error) => {
      alert('退出失败: ' + error.message);
    });
}

// 添加密码验证函数
function validatePassword(password) {
  // 至少8个字符
  if (password.length < 8) {
    return {
      isValid: false,
      message: "密码长度至少需要8个字符",
    };
  }

  // 必须包含大写字母
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "密码必须包含至少一个大写字母",
    };
  }

  // 必须包含小写字母
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "密码必须包含至少一个小写字母",
    };
  }

  // 必须包含数字
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "密码必须包含至少一个数字",
    };
  }

  // 必须包含特殊字符
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: '密码必须包含至少一个特殊字符 (!@#$%^&*(),.?":{}|<>)',
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// 修改验证并注册函数
async function validateAndRegister() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // 验证用户名长度
  if (username.length < 2) {
    showError("用户名至少需要2个字符");
    return;
  }

  // 验证密码
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    showError(passwordValidation.message);
    return;
  }

  // 验证两次密码是否一致
  if (password !== confirmPassword) {
    showError("两次输入的密码不一致");
    return;
  }

  try {
    // 创建用户
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );
    // 设置用户显示名称
    await userCredential.user.updateProfile({
      displayName: username,
    });
    // 注册成功后自动跳转到主页
  } catch (error) {
    showError(getErrorMessage(error.code));
  }
}

// 显示错误消息
function showError(message) {
  const errorElement = document.getElementById("registerError");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// 获取错误信息
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "该邮箱已注册";
    case "auth/invalid-email":
      return "邮箱格式不正确";
    case "auth/operation-not-allowed":
      return "邮箱注册功能未启用";
    case "auth/weak-password":
      return "密码强度太弱";
    default:
      return "注册失败，请稍后重试";
  }
}

// 发送重置密码邮件
async function sendResetEmail() {
  const email = document.getElementById("resetEmail").value;
  const resetError = document.getElementById("resetError");

  if (!email) {
    resetError.textContent = "请输入邮箱地址";
    resetError.style.display = "block";
    return;
  }

  try {
    // 直接调用 Firebase 的重置密码方法
    await firebase.auth().sendPasswordResetEmail(email);

    // 显示成功消息
    alert("重置密码邮件已发送，请检查邮箱");

    // 关闭弹窗
    hideResetPassword();
  } catch (error) {
    // 显示错误信息
    console.error("Reset password error:", error);
    resetError.textContent = "发送失败，请稍后重试";
    resetError.style.display = "block";
  }
}

// 显示找回密码弹窗
function showResetPassword() {
  document.getElementById("resetPasswordModal").style.display = "flex";
}

// 隐藏找回密码弹窗
function hideResetPassword() {
  document.getElementById("resetPasswordModal").style.display = "none";
}

// 更新错误消息函数
function getResetErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "邮箱格式不正确，请检查后重试";
    case "auth/user-not-found":
      return "该邮箱未注册，请先注册账号";
    case "auth/too-many-requests":
      return "请求次数过多，请等待几分钟后再试";
    case "auth/network-request-failed":
      return "网络连接失败，请检查网络后重试";
    case "auth/operation-not-allowed":
      return "密码重置功能未启用，请联系管理员";
    default:
      return `发送失败（${errorCode}），请稍后重试或联系管理员`;
  }
}
