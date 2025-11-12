import { Desktop } from "@wxcc-desktop/sdk"

//Creating a custom logger
const logger = Desktop.logger.createLogger('dtmf-input-logger');

export class DtmfInput extends HTMLElement {
  private button!: HTMLButtonElement;
  private emailIdList: string[] = [];
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
          height: 38px;
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

      <button type="submit" class="button" title="Create Email Reference" aria-label="Create Email Reference">Create Email Reference</button>
    `;
  }

  connectedCallback() {
    Desktop.config.init({ widgetName: "email-reference-generator", widgetProvider: "Conscia" });
    this.button = this.shadowRoot!.querySelector('button')!;

    // Paste from clipboard
    this.pasteButton.addEventListener("click", async () => {
      if (!navigator.clipboard?.readText) {
        alert("Clipboard access not supported. Please paste manually.");
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        const filtered = text.replace(/[^0-9*#]/g, '');
        this.input.value = filtered;
        this.input.dispatchEvent(new Event('input'));
        this.input.focus();
      } catch (err) {
        logger.warn("Clipboard error:", err);
        alert("Failed to paste. Try Ctrl+V.");
      }
    });

    // Filter input in real-time
    this.input.addEventListener("input", () => {
      const filtered = this.input.value.replace(/[^0-9*#]/g, '');
      if (this.input.value !== filtered) {
        this.input.value = filtered;
      }
    });

    // Handle form submit
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = this.input.value.trim();
      if (value) {
        this.submitButton.disabled = true;
        this.submitButton.classList.add("button--success");
        this.submitButton.innerHTML = `
          <span>Sent</span>
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" class=
"button__icon">
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" fill="currentColor" />
          </svg>
          `;
        setTimeout(() => {
          this.submitButton.disabled = false;
          this.submitButton.classList.remove("button--success");
          this.submitButton.textContent = "Submit";
        }, 2000);
        logger.info("sending DTMF values", value);
        Desktop.agentContact.sendDtmf(value);
      }
      this.input.value = '';
    });

    this.webexEventListeners();
  }

  public get active() {
    return this._active;
  }

  show() {
    this._active = true;
    this.form.classList.add('active');
    this.input.focus();
  }

  hide() {
    this._active = false;
    this.form.classList.remove('active');
  }


  webexEventListeners() {
    Desktop.agentContact.addEventListener("eAgentContactAssigned", (message) => {
      //logger.info('eAgentContactAssigned', JSON.stringify(message));
      logger.info("media type is:", message.data.interaction.mediaType);
      logger.info("interactionId", message.data.interaction.interactionId);
      if (message.data.interaction.mediaType === "telephony" && !this._interactionId) {
        this._interactionId = message.data.interactionId;
        this.show();
        logger.info("New voice interaction. Showing the widget");
      }
    });

    Desktop.agentContact.addEventListener("eAgentContactEnded", (message) => {
      //logger.info('eAgentContactEnded', JSON.stringify(message));
      logger.info("media type is:", message.data.interaction.mediaType);
      logger.info("interactionId", message.data.interaction.interactionId);
      if (message.data.interactionId === this._interactionId) {
        this._interactionId = null;
        this.hide();
        logger.info("Tracked interaction closed. Hiding the widget");
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

customElements.define('dtmf-input', DtmfInput);
