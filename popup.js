document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const urlBaseInput = document.getElementById("urlBase");
  const voiceSelect = document.getElementById("voice");
  const saveButton = document.getElementById("saveSettings");
  const toggleApiKeyButton = document.getElementById("toggleApiKey");

  // 加载保存的设置
  chrome.storage.sync.get(["apiKey", "urlBase", "voice"], function (result) {
    apiKeyInput.value = result.apiKey || "";
    urlBaseInput.value = result.urlBase || "";
    voiceSelect.value = result.voice || "alloy";
  });

  // 保存设置
  saveButton.addEventListener("click", function () {
    const apiKey = apiKeyInput.value;
    const urlBase = urlBaseInput.value;
    const voice = voiceSelect.value;

    chrome.storage.sync.set(
      { apiKey: apiKey, urlBase: urlBase, voice: voice },
      function () {
        console.log("设置已保存");
        alert("设置已保存");
      }
    );
  });

  // 切换API Key可见性
  toggleApiKeyButton.addEventListener("click", function () {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      toggleApiKeyButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      apiKeyInput.type = "password";
      toggleApiKeyButton.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });
});
