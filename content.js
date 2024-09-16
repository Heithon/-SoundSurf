let audioMap = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "tts") {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.textDecoration = "underline";
    span.style.cursor = "pointer";
    span.className = "tts-underline";
    span.dataset.text = request.text;

    range.surroundContents(span);

    span.addEventListener("click", handleSpanClick);

    // 显示加载提示
    showLoadingIndicator(span);

    // 调用background.js中的API请求函数
    chrome.runtime.sendMessage(
      { action: "callTtsApi", text: request.text },
      (response) => {
        if (response.success) {
          const audioUrl = URL.createObjectURL(
            base64ToBlob(response.audioBase64)
          );
          audioMap.set(request.text, audioUrl);
          hideLoadingIndicator(span);
        } else {
          // 显示错误消息
          showErrorMessage(response.error);
          span.style.textDecoration = "line-through";
        }
      }
    );
  }
});

function base64ToBlob(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: "audio/mpeg" });
}

function handleSpanClick(event) {
  const span = event.target;
  const text = span.dataset.text;

  if (audioMap.has(text)) {
    showAudioPlayer(text, audioMap.get(text), event);
  } else {
    showLoadingIndicator(span);
  }
}

function showLoadingIndicator(element) {
  element.style.backgroundColor = "#ffff99";
  element.title = "正在加载音频...";
}

function hideLoadingIndicator(element) {
  element.style.backgroundColor = "";
  element.title = "点击播放音频";
}

function showErrorMessage(error) {
  const errorDiv = document.createElement("div");
  errorDiv.textContent = `错误：${error}`;
  errorDiv.style.color = "red";
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "10px";
  errorDiv.style.right = "10px";
  errorDiv.style.padding = "10px";
  errorDiv.style.backgroundColor = "white";
  errorDiv.style.border = "1px solid red";
  errorDiv.style.borderRadius = "5px";
  errorDiv.style.zIndex = "9999";

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    document.body.removeChild(errorDiv);
  }, 5000);
}

function showAudioPlayer(text, audioUrl, clickEvent) {
  const playerDiv = document.createElement("div");
  playerDiv.style.position = "absolute";
  playerDiv.style.backgroundColor = "#ffffff";
  playerDiv.style.padding = "20px";
  playerDiv.style.borderRadius = "10px";
  playerDiv.style.boxShadow =
    "0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.1)";
  playerDiv.style.zIndex = "10000";
  playerDiv.style.width = "300px";
  playerDiv.style.fontFamily = "'Arial', sans-serif";

  const titleDiv = document.createElement("div");
  titleDiv.textContent = "音频播放器";
  titleDiv.style.color = "#2c3e50";
  titleDiv.style.fontSize = "18px";
  titleDiv.style.fontWeight = "bold";
  titleDiv.style.marginBottom = "15px";
  titleDiv.style.textAlign = "center";

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = audioUrl;
  audio.style.width = "100%";
  audio.style.marginBottom = "15px";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  const closeButton = document.createElement("button");
  closeButton.textContent = "关闭";
  closeButton.onclick = () => document.body.removeChild(playerDiv);
  styleButton(closeButton);

  const downloadLink = document.createElement("a");
  downloadLink.href = audioUrl;
  downloadLink.download = `tts_audio_${text.substring(0, 20)}.mp3`;
  downloadLink.textContent = "下载音频";
  styleButton(downloadLink);

  buttonContainer.appendChild(closeButton);
  buttonContainer.appendChild(downloadLink);

  playerDiv.appendChild(titleDiv);
  playerDiv.appendChild(audio);
  playerDiv.appendChild(buttonContainer);

  document.body.appendChild(playerDiv);

  // 计算弹出框的位置
  const rect = clickEvent.target.getBoundingClientRect();
  const playerRect = playerDiv.getBoundingClientRect();

  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY;

  // 检查是否超出右边界
  if (left + playerRect.width > window.innerWidth) {
    left = window.innerWidth - playerRect.width - 10;
  }

  // 检查是否超出下边界
  if (top + playerRect.height > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - playerRect.height;
  }

  playerDiv.style.left = `${left}px`;
  playerDiv.style.top = `${top}px`;
}

function styleButton(button) {
  button.style.padding = "8px 12px";
  button.style.backgroundColor = "#2980b9";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.fontSize = "14px";
  button.style.cursor = "pointer";
  button.style.transition = "background-color 0.3s ease";
  button.style.textDecoration = "none";
  button.style.display = "inline-block";

  button.addEventListener("mouseover", function () {
    this.style.backgroundColor = "#3498db";
  });

  button.addEventListener("mouseout", function () {
    this.style.backgroundColor = "#2980b9";
  });
}
