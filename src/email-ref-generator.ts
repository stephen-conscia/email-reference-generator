function generateId(): string {
  // Reference ID example [J4L5/250917/101545]

  // Generate random string in the following format: character, number, character, number
  let randomString = '';
  const randomStringLength = 4; // Can be increased if required (regex must be updated to match if changed)

  for (let i = 0; i < randomStringLength; i++) {
    if (i % 2 === 0) {
      // Append random character between A-Z on even index
      randomString += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    } else {
      // Append random digit between 0-9 on odd index
      randomString += Math.floor(Math.random() * 10).toString();
    }
  }

  // Generate date string
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const dateString = year + month + day;

  // Generate time string
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  const timeString = hours + minutes + seconds;

  return `[Ref:${randomString}/${dateString}/${timeString}]`;
}

class EmailRefGenerator extends HTMLElement {
  private shadow: ShadowRoot;
  private timerId?: number;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    this.shadow.innerHTML = `
      <style>
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.15rem;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          background-color: #0a74da;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.12);
          transition: background-color 0.25s, box-shadow 0.25s, transform 0.1s;
        }

        button svg {
          width: 18px;
          height: 18px;
        }

        button:hover {
          background-color: #085bb1;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        }

        button:active {
          transform: translateY(1px);
        }

        button.success {
          background-color: #28a745 !important;
          box-shadow: 0 0 4px rgba(40,167,69,0.6);
        }
      </style>

      <button>Generate Ref
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M480-480Zm0-40 320-200H160l320 200ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v280h-80v-200L480-440 160-640v400h360v80H160ZM715-42l-70-40 46-78h-91v-80h91l-46-78 70-40 45 78 45-78 70 40-46 78h91v80h-91l46 78-70 40-45-78-45 78Z" />
        </svg>
      </button>
    `;
  }

  connectedCallback(): void {
    const button = this.shadow.querySelector('button') as HTMLButtonElement;
    button.addEventListener('click', () => {
      const textToCopy = generateId();
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          if (this.timerId) clearTimeout(this.timerId);
          button.classList.add("success");
          this.timerId = window.setTimeout(() => {
            button.classList.remove("success");
          }, 3000);
        })
        .catch(() => {
          alert("Unable to write to clipboard. Please ensure permissions have been enabled.");
        });
    });
  }
}

customElements.define('email-ref-generator', EmailRefGenerator);

