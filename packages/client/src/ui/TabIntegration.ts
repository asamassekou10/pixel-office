import { CSSColors } from '../design/tokens.js';
import { SERVER_URL } from '../config.js';

type Language = 'python' | 'nodejs' | 'curl';

/**
 * Integration tab: copy-paste code snippets for Python, Node.js, and curl.
 */
export class TabIntegration {
  readonly element: HTMLDivElement;
  private codeArea: HTMLPreElement;
  private copyBtn: HTMLButtonElement;
  private langButtons: HTMLButtonElement[] = [];
  private currentLang: Language = 'python';

  constructor() {
    this.element = document.createElement('div');
    this.element.style.cssText = 'padding:16px;';

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      font-size:10px;color:${CSSColors.UI.TextDim};text-transform:uppercase;
      letter-spacing:1px;margin-bottom:12px;
    `;
    header.textContent = 'Integration Snippets';
    this.element.appendChild(header);

    // Language tabs
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;gap:4px;margin-bottom:12px;';

    for (const lang of ['python', 'nodejs', 'curl'] as Language[]) {
      const btn = document.createElement('button');
      btn.textContent = lang === 'nodejs' ? 'Node.js' : lang.charAt(0).toUpperCase() + lang.slice(1);
      btn.style.cssText = `
        padding:4px 12px;border:1px solid ${CSSColors.UI.BorderDim};
        border-radius:3px;background:transparent;
        color:${CSSColors.UI.TextDim};
        font-family:'Courier New',monospace;font-size:10px;
        cursor:pointer;text-transform:uppercase;letter-spacing:1px;
        transition:all 0.15s;
      `;
      btn.addEventListener('click', () => this.switchLang(lang));
      tabBar.appendChild(btn);
      this.langButtons.push(btn);
    }
    this.element.appendChild(tabBar);

    // Code area
    this.codeArea = document.createElement('pre');
    this.codeArea.style.cssText = `
      background:${CSSColors.Background.Secondary};
      border:1px solid ${CSSColors.UI.BorderDim};
      border-radius:3px;padding:16px;
      font-family:'Courier New',monospace;font-size:10px;
      color:${CSSColors.UI.TextGlow};
      overflow-x:auto;line-height:1.6;
      white-space:pre;max-height:400px;overflow-y:auto;
    `;
    this.element.appendChild(this.codeArea);

    // Copy button
    this.copyBtn = document.createElement('button');
    this.copyBtn.textContent = 'Copy to Clipboard';
    this.copyBtn.style.cssText = `
      margin-top:8px;padding:6px 12px;width:100%;
      background:transparent;border:1px solid ${CSSColors.Neon.Cyan};
      color:${CSSColors.Neon.Cyan};border-radius:3px;
      font-family:'Courier New',monospace;font-size:11px;
      cursor:pointer;text-transform:uppercase;letter-spacing:1px;
      transition:all 0.15s;
    `;
    this.copyBtn.addEventListener('click', () => this.copy());
    this.copyBtn.addEventListener('mouseenter', () => {
      this.copyBtn.style.background = CSSColors.Neon.Cyan;
      this.copyBtn.style.color = CSSColors.Background.Primary;
    });
    this.copyBtn.addEventListener('mouseleave', () => {
      this.copyBtn.style.background = 'transparent';
      this.copyBtn.style.color = CSSColors.Neon.Cyan;
    });
    this.element.appendChild(this.copyBtn);

    this.switchLang('python');
  }

  private switchLang(lang: Language): void {
    this.currentLang = lang;

    const langs: Language[] = ['python', 'nodejs', 'curl'];
    langs.forEach((l, i) => {
      const active = l === lang;
      this.langButtons[i].style.borderColor = active ? CSSColors.Neon.Cyan : CSSColors.UI.BorderDim;
      this.langButtons[i].style.color = active ? CSSColors.Neon.Cyan : CSSColors.UI.TextDim;
      if (active) {
        this.langButtons[i].style.textShadow = `0 0 6px ${CSSColors.Neon.Cyan}`;
      } else {
        this.langButtons[i].style.textShadow = 'none';
      }
    });

    this.codeArea.textContent = this.getSnippet(lang);
  }

  private getSnippet(lang: Language): string {
    const url = SERVER_URL;

    if (lang === 'python') {
      return `import requests

SERVER_URL = "${url}"
API_KEY = "your-api-key-here"

headers = {"Authorization": f"Bearer {API_KEY}"}

# Create or update an agent
response = requests.post(
    f"{SERVER_URL}/api/agents",
    headers=headers,
    json={
        "id": "agent-001",
        "x": 400,
        "y": 300,
        "state": "WORKING",
        "jobType": "python-dev",
        "skills": ["python", "fastapi", "testing"],
        "connections": ["agent-002"]
    }
)
print(response.json())

# List all agents
agents = requests.get(
    f"{SERVER_URL}/api/agents",
    headers=headers
)
print(agents.json())

# Delete an agent
requests.delete(
    f"{SERVER_URL}/api/agents/agent-001",
    headers=headers
)`;
    }

    if (lang === 'nodejs') {
      return `const SERVER_URL = "${url}";
const API_KEY = "your-api-key-here";

const headers = {
  "Authorization": \`Bearer \${API_KEY}\`,
  "Content-Type": "application/json"
};

// Create or update an agent
const res = await fetch(\`\${SERVER_URL}/api/agents\`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    id: "agent-001",
    x: 400,
    y: 300,
    state: "WORKING",
    jobType: "node-dev",
    skills: ["typescript", "nodejs", "react"],
    connections: ["agent-002"]
  })
});
console.log(await res.json());

// List all agents
const list = await fetch(\`\${SERVER_URL}/api/agents\`, { headers });
console.log(await list.json());

// Delete an agent
await fetch(\`\${SERVER_URL}/api/agents/agent-001\`, {
  method: "DELETE",
  headers
});`;
    }

    // curl
    return `# Create or update an agent
curl -X POST ${url}/api/agents \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "agent-001",
    "x": 400,
    "y": 300,
    "state": "WORKING",
    "jobType": "devops",
    "skills": ["kubernetes", "docker", "terraform"],
    "connections": ["agent-002"]
  }'

# List all agents
curl ${url}/api/agents \\
  -H "Authorization: Bearer your-api-key-here"

# Delete an agent
curl -X DELETE ${url}/api/agents/agent-001 \\
  -H "Authorization: Bearer your-api-key-here"`;
  }

  private copy(): void {
    navigator.clipboard.writeText(this.getSnippet(this.currentLang)).then(() => {
      this.copyBtn.textContent = 'Copied!';
      this.copyBtn.style.borderColor = CSSColors.Neon.Green;
      this.copyBtn.style.color = CSSColors.Neon.Green;
      this.copyBtn.style.background = 'transparent';
      setTimeout(() => {
        this.copyBtn.textContent = 'Copy to Clipboard';
        this.copyBtn.style.borderColor = CSSColors.Neon.Cyan;
        this.copyBtn.style.color = CSSColors.Neon.Cyan;
      }, 2000);
    });
  }
}
