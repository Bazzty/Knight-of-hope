import fs from 'fs';
const content = fs.readFileSync('/Users/nacho.ov/Library/Application Support/Code/User/workspaceStorage/e99fa15f1ab8f00a5e656ea44a19467e/GitHub.copilot-chat/chat-session-resources/1ba0df74-9069-441c-942a-411470c944fc/call_MHxQN3pOMmtXS0l1N05TeFBHeW4__vscode-1778725811037/content.txt', 'utf8');
const json = JSON.parse(content.trim());
console.log(Object.keys(json));
const base64Data = json.b64.replace(/^data:image\/png;base64,/, '');
fs.writeFileSync('public/assets/test2_transparent.png', Buffer.from(base64Data, 'base64'));
