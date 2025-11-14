import { Desktop } from "@wxcc-desktop/sdk"
import generateEmailId from "./generate-reference-id"

//Creating a custom logger
const logger = Desktop.logger.createLogger('email-reference-generator');

export class EmailRefGenerator extends HTMLElement {
  private copyButton!: HTMLButtonElement;
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
          --scale: 0;
          --tooltip-color: black;
          --arrow-size: 10px;

          --text-color: oklch(20.8% 0.042 265.755);
          --shadow: oklch(70.4% 0.04 256.788);
          --border: oklch(55.4% 0.046 257.417);
          --button-outline: #65B4FA;
            
          --success-bg: oklch(72.3% 0.219 149.579);
          --success-text: oklch(62.7% 0.194 149.214);
        }

        /* Dark mode - activated via .dark class */
        :host(.dark) {
          --text-color: oklch(92.9% 0.013 255.508);

          --shadow: oklch(86.9% 0.022 252.894);
          --border: oklch(37.2% 0.044 257.287);
        }

        .container {
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

        .button {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.2em;
          padding: 0.4em;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: var(--text-color);
          border: none;
          border-radius: 50%;
          position: relative;
        }

        .button::before,
        .button::after {
          position: absolute;
          left: 50%;
          bottom: -20px;
          transform: translateX(-50%) translateY(var(--translate-y, 0)) scale(var(--scale));
          transition: 50ms transform;
          transform-origin: bottom center;
        }

        .button::before {
          --translate-y: calc(100% - var(--arrow-size));

          content: attr(data-tooltip);
          background: var(--tooltip-color);
          border-radius: 4px;
          text-align: center;
          color: white;
          width: max-content;
          padding: 0.4rem;
        }
        
        .button::after {
          --translate-y: calc(-1 * var(--arrow-size));

          content: '';
          border: var(--arrow-size) solid transparent;
          border-bottom-color: var(--tooltip-color);
          transform-origin: bottom center;
        }

        .button:is(:focus) {
           box-shadow: 0 0 2px 2px var(--button-outline);
           outline: transparent;
        }

        .button:hover::before,
        .button:hover::after {
          --scale: 1;
        }

        .button.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .button.success {
          color: var(--success-text);
        }

        .button__icon {
          width: auto;
        }

        /* Dark mode input focus glow */
        :host(.dark) input:focus {
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
        }
      </style>

      <button id="copy-btn" class="button" data-tooltip="Generate Email Title" title="Generate Email Title" aria-label="Generate Email Title">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path
            d="M480-480Zm0-40 320-200H160l320 200ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v280h-80v-200L480-440 160-640v400h360v80H160ZM715-42l-70-40 46-78h-91v-80h91l-46-78 70-40 45 78 45-78 70 40-46 78h91v80h-91l46 78-70 40-45-78-45 78Z" />
        </svg>
      </button>
    `;
  }

  connectedCallback() {
    Desktop.config.init({ widgetName: "email-reference-generator", widgetProvider: "Conscia" });
    this.copyButton = this.shadowRoot!.querySelector('#copy-btn')!;
    let timerId: number | undefined;

    this.copyButton.addEventListener("click", () => {
      const textToCopy = generateEmailId();
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (timerId) clearTimeout(timerId);
        this.copyButton.classList.add("success");
        timerId = setTimeout(() => {
          this.copyButton.classList.remove("success");
        }, 3000);

      }).catch(() => alert("Unable to write to clipboard. Please ensure permissions have been enabled."));
    });

    this.webexEventListeners();
  }

  render() {
    if (this.emailTransactionIds.size) {
      logger.info("Render: showing the widget");
      this.copyButton.classList.add('active');
    } else {
      logger.info("Render: hiding the widget");
      this.copyButton.classList.remove('active');
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
