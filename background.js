// Cho phép nhúng Hợp Âm Chuẩn vào iframe của side panel bằng cách gỡ
// X-Frame-Options / CSP khỏi response của sub_frame. Chỉ áp dụng cho hopamchuan.com
// và chỉ khi request xuất phát từ extension này hoặc từ chính hopamchuan.com
// (cần cho việc bấm link bên trong iframe). Điều hướng top-level không bị đụng tới.

const CHORD_DOMAINS = ["hopamchuan.com"];
const RULE_ID = 1;

async function installFrameRules() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [
            { header: "x-frame-options", operation: "remove" },
            { header: "content-security-policy", operation: "remove" },
            { header: "content-security-policy-report-only", operation: "remove" },
          ],
        },
        condition: {
          requestDomains: CHORD_DOMAINS,
          initiatorDomains: [chrome.runtime.id, ...CHORD_DOMAINS],
          resourceTypes: ["sub_frame"],
        },
      },
    ],
  });
}

chrome.runtime.onInstalled.addListener(installFrameRules);
chrome.runtime.onStartup.addListener(installFrameRules);

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
