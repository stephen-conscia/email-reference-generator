import { Desktop } from "@wxcc-desktop/sdk"
import generateEmailId from "./generate-reference-id"

//Creating a custom logger
const logger = Desktop.logger.createLogger('email-reference-generator');

export class EmailRefGenerator extends HTMLElement {
  private container!: HTMLDivElement;
  private copyButton!: HTMLButtonElement;
  private regenerateButton!: HTMLButtonElement;
  private outputSpan!: HTMLSpanElement;
  private emailTransactionIds = new Set();

  static get observedAttributes() {
    return ['darkmode'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          --text-color: oklch(20.8% 0.042 265.755);
          --shadow: oklch(70.4% 0.04 256.788);
          --border: oklch(55.4% 0.046 257.417);
            
          --success-bg: oklch(72.3% 0.219 149.579);
          --success-text: oklch(96.2% 0.044 156.743);
        }

        /* Dark mode - activated via .dark class */
        :host(.dark) {
          --text-color: oklch(92.9% 0.013 255.508);

          --shadow: oklch(86.9% 0.022 252.894);
          --border: oklch(37.2% 0.044 257.287);
        }

        .container {
          height: 34px;
          box-sizing: border-box;
          border-radius: 8px;
          border-color: var(--text-color);
          border: 1px solid var(--border);
          display: inline-flex;
          flex-warp: no-wrap;
          align-items: center;
          justify-content:center;
          gap: 0.2em;
          padding: 0 0.4em;
          transition: background-color 0.4s ease, color 0.4s ease, opacity 0.3s ease, transform 0.3s ease;
          color: var(--text-color);
          font-size: 0.9rem;
        }
        .test {
        opacity: 0;
        pointer-events: none;
        transform: translateY(-10px);
        }

        .container.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }


        .container--success {
          background: var(--success-bg);
          color: var(--success-text);
        }

        span {
          color: inherit;
          user-select: text;
          cursor: text;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.2em;
          padding: 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: inherit;
          border: none;
          border-radius: 4px;
        }

        .button:is(:hover, :focus) {
           box-shadow: 0 0 2px 2px var(--shadow);
           outline: transparent;
        }

        .button__icon {
          width: 1.25em;
          height: 1.25em;
          fill: currentColor;
        }

        /* Dark mode input focus glow */
        :host(.dark) input:focus {
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
        }
      </style>

      <div class="container">
        <button id="regenerate-btn" class="button" title="Regenerate Reference" aria-label="Regenerate Reference">
          <svg class="button__icon" xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="24px">
            <path
              d="M204-318q-22-38-33-78t-11-82q0-134 93-228t227-94h7l-64-64 56-56 160 160-160 160-56-56 64-64h-7q-100 0-170 70.5T240-478q0 26 6 51t18 49l-60 60ZM481-40 321-200l160-160 56 56-64 64h7q100 0 170-70.5T720-482q0-26-6-51t-18-49l60-60q22 38 33 78t11 82q0 134-93 228t-227 94h-7l64 64-56 56Z" />
          </svg>
        </button>
        <span class="text-output"></span>
        <button id="copy-btn" class="button" title="Create Email Reference" aria-label="Create Email Reference">
          <svg class="button__icon" xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="24px">
            <path
              d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
          </svg>
        </button>
      </div>
    `;
  }

  connectedCallback() {
    Desktop.config.init({ widgetName: "email-reference-generator", widgetProvider: "Conscia" });
    this.container = this.shadowRoot!.querySelector('.container')!;
    this.copyButton = this.shadowRoot!.querySelector('#copy-btn')!;
    this.regenerateButton = this.shadowRoot!.querySelector('#regenerate-btn')!;
    this.outputSpan = this.shadowRoot!.querySelector('span')!;
    let timerId: number | null;

    this.outputSpan.textContent = generateEmailId();

    this.outputSpan.addEventListener("click", () => {
      const range = document.createRange();
      range.selectNodeContents(this.outputSpan);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range)
    });

    this.regenerateButton.addEventListener("click", () => {
      console.log("regen button clicked");
      this.outputSpan.textContent = generateEmailId();
    });

    this.copyButton.addEventListener("click", () => {
      if (timerId) clearTimeout(timerId);
      const textToCopy = this.outputSpan.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.container.classList.add('container--success');
        timerId = setTimeout(() => {
          this.container.classList.remove('container--success');
          timerId = null;
        }, 3000);
      }).catch(() => alert("Unable to write to clipboard. Please ensure permissions have been enabled."));
    });

    this.webexEventListeners();
  }

  render() {
    if (this.emailTransactionIds.size) {
      logger.info("Render: showing the widget");
      this.outputSpan.textContent = generateEmailId();
      this.container.classList.add('active');
    } else {
      logger.info("Render: hiding the widget");
      this.container.classList.remove('active');
    }
  }

  webexEventListeners() {
    Desktop.agentContact.addEventListener("eAgentContactAssigned", (message) => {
      logger.info('eAgentContactAssigned', JSON.stringify(message));
      logger.info("media type is:", message.data.interaction.mediaType);
      logger.info("interactionId", message.data.interaction.interactionId);
      if (message.data.interaction.mediaType === "email") {
        this.emailTransactionIds.add(message.data.interactionId);
        this.render();
      }
    });

    Desktop.agentContact.addEventListener("eAgentContactEnded", (message) => {
      logger.info('eAgentContactEnded', JSON.stringify(message));
      logger.info("media type is:", message.data.interaction.mediaType);
      logger.info("interactionId", message.data.interaction.interactionId);
      if (this.emailTransactionIds.has(message.data.interactionId)) {
        this.emailTransactionIds.delete(message.data.interactionId);
        this.render();
        logger.info("Tracked interaction closed.");
      }
    });
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'darkmode') {
      const isDark = newValue === 'true';
      if (isDark) {
        this.classList.add('dark');
      } else {
        this.classList.remove('dark');
      }
    }
  }
}

customElements.define('email-reference-generator', EmailRefGenerator);
