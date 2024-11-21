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

  // Вызывается после добавления компонента в DOM
  connectedCallback() {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "unchecked");
    }

    if (this.hasAttribute("size")) {
      this._updateSize(this.getAttribute("size"));
    }
  }

  // Возвращает массив атрибутов, за изменениями которых следует наблюдать
  static get observedAttributes() {
    return ["size", "role"];
  }

  // Вызывается при изменении наблюдаемых атрибутов
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "size") {
      this._updateSize(newValue);
    }
    if (name === "role") {
      if (this.internals_ && this.internals_.states) {
        this._updateRole(newValue)
      }
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

  _updateRole(role) {
    this.internals_.states.delete("checked");
    this.internals_.states.delete("mixed");
    this.internals_.states.delete("unchecked");
    this.internals_.states.add(role);
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

  // Обновляет состояние компонента
  _updateState() {
    // Применяет текущее состояние в aria-checked и в CustomStateSet
    if (this.internals_ && this.internals_.states) {
      this.internals_.states.delete("checked");
      this.internals_.states.delete("mixed");
      this.internals_.states.delete("unchecked");

      if (this.checkboxState) {
        this.internals_.states.add(this.checkboxState);
        return this.setAttribute("role", this.checkboxState);
      }

      if (this.hasAttribute("role")) {
        this.checkboxState = this.getAttribute("role");
        this.internals_.states.add(this.getAttribute("role"));
        return this.setAttribute("role", this.checkboxState);
      }

      this.internals_.states.add("unchecked");
      this.checkboxState = "unchecked";
    }
  }

  // Ленивая инициализация attachInternals для использования Custom Elements API
  get internals_() {
    // Возвращает внутренние API для управления состояниями элемента
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
    return this._internals;
  }
}

window.customElements.define("custom-checkbox", CustomCheckbox);
