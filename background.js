// Remove X-Frame-Options / CSP frame-ancestors from sub_frame responses
// for supported chord domains when initiated by this extension or those domains.

const CHORD_DOMAINS = ["hopamchuan.com"];
const RULE_ID = 1;
let installPromise = null;

async function installFrameRules() {
  if (installPromise) return installPromise;

  installPromise = chrome.declarativeNetRequest
    .updateDynamicRules({
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
    })
    .finally(() => {
      installPromise = null;
    });

  return installPromise;
}

chrome.runtime.onInstalled.addListener(() => {
  installFrameRules().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  installFrameRules().catch(console.error);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "ENSURE_FRAME_RULES") {
    installFrameRules()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => {
        console.error("Failed to install frame rules:", err);
        sendResponse({ ok: false });
      });
    return true;
  }
});

installFrameRules().catch(console.error);

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
