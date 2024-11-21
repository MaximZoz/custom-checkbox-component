class CustomCheckbox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    fetch("components/custom-checkbox/custom-checkbox.css")
      .then((response) => response.text())
      .then((cssText) => {
        const style = document.createElement("style");
        style.textContent = cssText;
        this.shadowRoot.appendChild(style);
      })
      .catch((error) => console.error("Failed to load CSS:", error));

    this.shadowRoot.innerHTML += `
            <div id="checkbox"></div>
        `;

    setTimeout(() => this._updateState());

    this.addEventListener("click", this.toggleState.bind(this));
  }


  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "unchecked");
    }
    
    if (this.hasAttribute("size")) {
      this._updateSize(this.getAttribute("size"));
    }
    
    if (this.hasAttribute("role")) {
      this.setAttribute("role", this.getAttribute("role"));
    }
  }


  static get observedAttributes() {
    return ["checked", "size"];
  }


  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "checked") {
      this.checkboxState = newValue ? "checked" : "unchecked";
      this._updateState();
    } else if (name === "size") {
      this._updateSize(newValue);
    }
  }


  _updateSize(size) {
    const newSize = parseInt(size, 10);
    if (!isNaN(newSize) && newSize > 0) {
      const div = this.shadowRoot.querySelector("#checkbox");
      div.style.width = `${newSize}px`;
      div.style.height = `${newSize}px`;
    }
  }


  toggleState() {
    switch (this.checkboxState) {
      case "unchecked":
        this.checkboxState = "mixed";
        break;
      case "mixed":
        this.checkboxState = "checked";
        break;
      default:
        this.checkboxState = "unchecked";
        break;
    }
    this._updateState();
  }


  _updateState() {
    if (this.internals_ && this.internals_.states) {
      this.internals_.states.delete("checked");
      this.internals_.states.delete("mixed");
      this.internals_.states.delete("unchecked");

      console.log(123)
      if (this.checkboxState) {
          this.internals_.states.add(this.checkboxState);
          return this.setAttribute("role", this.checkboxState);
      }

      if(this.hasAttribute("role")){
          this.checkboxState = this.getAttribute("role");
          this.internals_.states.add(this.getAttribute("role"));
         return this.setAttribute("role", this.checkboxState);
      }
      this.internals_.states.add("unchecked");
      this.checkboxState = "unchecked";
    }
  }

  get internals_() {
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
    return this._internals;
  }
}

window.customElements.define("custom-checkbox", CustomCheckbox);
