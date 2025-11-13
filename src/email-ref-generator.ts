import { Desktop } from "@wxcc-desktop/sdk"
import generateEmailId from "./generate-reference-id"

//Creating a custom logger
const logger = Desktop.logger.createLogger('email-reference-generator');

export class DtmfInput extends HTMLElement {
  private container!: HTMLDivElement;
  private button!: HTMLButtonElement;
  private emailTransactionIds = new Set();
  private _active = false;

  static get observedAttributes() {
    return ['darkmode'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          --button-bg: #3b82f6;
          --button-fg: white;
          --button-hover: #2563eb;

          --icon-border: #b0b2b6;   /* was #a8aaad */
          --icon-bg: #ECF3FE;
          --icon-hover-bg: #d4e0f8;  /* slightly darker than #ECF3FE */
          --icon-fg: #6b7280;

          --button-success-bg: #22c55e;
          --button-success-text: #FFFFFF;
          --button-success-hover: #16a34a;
        }

        /* Dark mode - activated via .dark class */
        :host(.dark) {
          /* Slightly muted button colors for dark mode */
          --button-bg: #2563eb;          /* was #3b82f6, a bit darker */
          --button-fg: #f1f5f9;          /* lighter text for contrast */
          --button-hover: #1d4ed8;       /* slightly darker on hover */

          --icon-bg: transparent;
          --icon-fg: #94a3b8;
          --icon-border: #64748b;
          /* icon hover a bit lighter/darker for subtle effect */
          --icon-hover-bg: #2c374e;      /* was #334155, slightly softer */

          /* Success button colors tuned for dark mode */
          --button-success-bg: #22c55e;  /* slightly darker green */
          --button-success-hover: #16a34a;
        }

        .container {
          height: 38px;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.2em;
          padding: 0.4em 0.75em;
          border: none;
          border-radius: 0.4em;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--button-bg);
          color: var(--button-fg);
          font-weight: 500;
        }

        .button:hover {
          background: var(--button-hover);
        }

        .button--success {
          background: var(--button-success-bg);
          color: var(--button-success-text);
        }

        .button--success:hover {
          background: var(--button-success-hover);
        }

        .button:not(:disabled):active {
           transform: translateY(1px);
         }

        .button:disabled {
          cursor: not-allowed;
          pointer-events: none;
        }

        .button:active {
          transform: translateY(1px);
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
        <button type="submit" class="button" title="Create Email Reference" aria-label="Create Email Reference">Create Email Reference</button>
      </div>
    `;
  }

  connectedCallback() {
    Desktop.config.init({ widgetName: "email-reference-generator", widgetProvider: "Conscia" });
    this.button = this.shadowRoot!.querySelector('button')!;

    this.webexEventListeners();
  }

  public get active() {
    return this._active;
  }

  render() {
    if (this.emailTransactionIds.size) {
      logger.info("Render: showing the widget");
      this._active = true;
      this.container.classList.add('active');
    } else {
      this._active = false;
      this.container.classList.remove('active');
    }
  }

  webexEventListeners() {
    Desktop.agentContact.addEventListener("eAgentContactAssigned", (message) => {
      //logger.info('eAgentContactAssigned', JSON.stringify(message));
      logger.info("media type is:", message.data.interaction.mediaType);
      logger.info("interactionId", message.data.interaction.interactionId);
      if (message.data.interaction.mediaType === "email") {
        this.emailTransactionIds.add(message.data.interactionId);
        this.render();
      }
    });

    Desktop.agentContact.addEventListener("eAgentContactEnded", (message) => {
      //logger.info('eAgentContactEnded', JSON.stringify(message));
      logger.info("media type is:", message.data.interaction.mediaType);
      logger.info("interactionId", message.data.interaction.interactionId);
      if (this.emailTransactionIds.has(message.data.interactionId)) {
        this.emailTransactionIds.delete(message.data.interactionId);
        this.render();
        logger.info("Tracked interaction closed.");
      }
    });
  }

  // Handle darkmode="true" | "false"
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

customElements.define('email-reference-generator', DtmfInput);
