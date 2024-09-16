chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ttsMenu",
    title: "使用TTS朗读选中文字",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ttsMenu") {
    chrome.tabs.sendMessage(tab.id, {
      action: "tts",
      text: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callTtsApi") {
    callOpenAITtsApi(request.text)
      .then((audioBase64) => {
        sendResponse({ success: true, audioBase64: audioBase64 });
      })
      .catch((error) => {
        console.error("TTS API调用失败:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开放，以便异步发送响应
  }
});

async function callOpenAITtsApi(text) {
  try {
    const result = await chrome.storage.sync.get([
      "apiKey",
      "urlBase",
      "model",
      "voice",
    ]);
    const apiKey = result.apiKey;
    const urlBase = result.urlBase || "https://api.openai.com/v1";
    const model = result.model || "tts-1";
    const voice = result.voice || "alloy";

    if (!apiKey) {
      throw new Error("API Key 未设置");
    }

    const response = await fetch(`${urlBase}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: voice,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API 请求失败: ${response.status} ${response.statusText} - ${
          errorData.error?.message || "未知错误"
        }`
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    return base64Audio;
  } catch (error) {
    console.error("TTS API调用出错:", error);
    throw error;
  }
}

// ... 处理来自content.js的消息,调用OpenAI API等
