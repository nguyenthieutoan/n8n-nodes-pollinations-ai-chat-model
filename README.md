# n8n-nodes-pollinations-ai-chat-model

Developed and maintained by **[Jay Nguyen (Nguyễn Thiệu Toàn)](https://nguyenthieutoan.com)**.

🛡️ **[Verified n8n Creator](https://n8n.io/creators/nguyenthieutoan)** | 💼 CEO/Founder of **[GenStaff](https://genstaff.net)**

**Connect with me:**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nguyenthieutoan) [![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white)](https://www.facebook.com/nguyenthieutoan) [![Website](https://img.shields.io/badge/Website-nguyenthieutoan.com-brightgreen?style=flat)](https://nguyenthieutoan.com) [![Email](https://img.shields.io/badge/Email-me%40nguyenthieutoan.com-blue?style=flat)](mailto:me@nguyenthieutoan.com)

---

An n8n community node allowing seamless integration of the **Pollinations AI Chat Model** in your Agentic workflows. This sub-node connects directly to n8n's **AI Agent** or **Chain** nodes to supply chat capabilities powered by Pollinations.ai.

## Features

- **Dynamic Model Discovery:** Queries Pollinations API to dynamically populate available text generation models (with static fallback if offline).
- **Auto-Insert Support:** Class name starts with `Model` allowing instant drag-and-drop wiring.
- **Zero-Dependency Architecture:** Runtime-safe packaging prevents package version conflicts in n8n installations.
- **Glow Ring & Execution Checkmark Fix:** Embedded dynamic prototype patching guarantees proper visual feedback in n8n's workflow editor.
- **Advanced Options:** Support for `Temperature`, `Max Tokens`, `JSON Mode`, `Seed` (reproducibility), `Safe Mode` (content filters), and `Reasoning Effort` (for reasoning-heavy models).

## Installation

For self-hosted n8n instances, you can install this node via the **Community Nodes** settings panel.

1. Go to **Settings > Community Nodes**.
2. Click **Install a new node**.
3. Enter `n8n-nodes-pollinations-ai-chat-model`.
4. Agree to risk terms and click **Install**.

*Note: Ensure your environment variable `N8N_COMMUNITY_PACKAGES_ENABLED=true` is set.*

## Getting Your API Key

Pollinations.ai supports anonymous requests, but with limited rate-limits. To unlock full capability and unrestricted bandwidth, generate a personal API key by following these steps:

1. **Go to** 👉 [https://enter.pollinations.ai](https://enter.pollinations.ai)
2. **Sign in with GitHub** — click **"Login with GitHub"** and authorize the app.
3. After logging in, click on the **"Key"** section in the menu.
4. Click **"Add Key"** to generate a new API key.
5. **Copy** the generated key (it starts with `sk_...`).

> **Keep it private!** Never share your API key publicly or commit it to version control.

## Configuration & Credentials

Once you have your API key, connect it to n8n:

1. In n8n, go to **Credentials > Add Credential**.
2. Search for and select **"Pollinations API"**.
3. Paste your `sk_...` key into the **API Key** field and click **Save**.
4. Open the **Pollinations Chat Model** node in your workflow.
5. In the **Credential for Pollinations API** dropdown, select the credential you just created.

## License

[MIT](LICENSE)
