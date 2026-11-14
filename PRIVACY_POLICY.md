# Privacy Policy for Chord Side Panel

*Last updated: November 14, 2026*

## 1. Overview
**Chord Side Panel** ("the Extension") is committed to respecting and protecting your privacy. This extension is designed as an open and transparent utility to display guitar and musical chord sheets in the Chrome Side Panel alongside YouTube videos.

## 2. Information Collection and Usage
- **No Personal Data Collected:** Chord Side Panel does not collect, transmit, store, or sell any personal information, browsing history outside supported chord queries, IP addresses, or device identifiers.
- **Local Storage:** The extension uses `chrome.storage.local` exclusively on your local device to remember your user preferences (e.g., chosen chord provider, auto-scroll speed preference, 50|50 split column preference, and your local recent search history). This data never leaves your device.
- **Third-Party Services:** When you search for chords, requests are made directly between your browser and the respective chord websites (hopamchuan.com and ultimate-guitar.com) to fetch chord pages. These third-party sites are governed by their own privacy policies.

## 3. Permissions Explanation
- `sidePanel`: Required to render the chord viewer interface side-by-side with your browser tabs.
- `declarativeNetRequest`: Required solely to remove embedding restriction headers (`X-Frame-Options` and `Content-Security-Policy`) for sub-frames loaded directly inside the extension from hopamchuan.com and ultimate-guitar.com. It is strictly scoped to sub-frames and does not affect your regular browsing.
- `storage`: Required to save your settings and search history locally.
- `host_permissions`: Scoped strictly to YouTube (to read the current video title of the active tab for chord lookup) and the supported chord sites (to load chord sheets in the side panel).

## 4. Children's Privacy
The Extension does not knowingly collect or solicit any information from anyone under the age of 13.

## 5. Contact
If you have any questions or suggestions regarding this Privacy Policy, please contact the developer via GitHub.
