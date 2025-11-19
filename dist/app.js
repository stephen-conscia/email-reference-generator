(function(){"use strict";function s(){let e="";for(let n=0;n<4;n++)n%2===0?e+=String.fromCharCode(Math.floor(Math.random()*26)+65):e+=Math.floor(Math.random()*10).toString();const t=new Date,a=t.getFullYear().toString().slice(-2),i=("0"+(t.getMonth()+1)).slice(-2),c=("0"+t.getDate()).slice(-2),l=a+i+c,d=("0"+t.getHours()).slice(-2),h=("0"+t.getMinutes()).slice(-2),g=("0"+t.getSeconds()).slice(-2),u=d+h+g;return`[Ref:${e}/${l}/${u}]`}class r extends HTMLElement{constructor(){super(),this.shadow=this.attachShadow({mode:"open"}),this.shadow.innerHTML=`
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
    `}connectedCallback(){const o=this.shadow.querySelector("button");o.addEventListener("click",()=>{const t=s();navigator.clipboard.writeText(t).then(()=>{this.timerId&&clearTimeout(this.timerId),o.classList.add("success"),this.timerId=window.setTimeout(()=>{o.classList.remove("success")},3e3)}).catch(()=>{alert("Unable to write to clipboard. Please ensure permissions have been enabled.")})})}}customElements.define("email-ref-generator",r)})();
//# sourceMappingURL=app.js.map
