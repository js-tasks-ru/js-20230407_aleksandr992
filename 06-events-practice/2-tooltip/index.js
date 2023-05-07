class Tooltip {

  static currentTooltip;

  cursorOffset = 16;

  constructor() {
    if (Tooltip.currentTooltip) {
      return Tooltip.currentTooltip;
    }
    Tooltip.currentTooltip = this;
  }

  get template() {
    return `
      <div class="tooltip"></div>
    `;
  }

  show() {
    document.body.append(this.element);
  }

  initialize () {

    this.render();

    const pointerMove = event => {
      if (event.target.dataset.tooltip !== undefined) {
        this.element.style.setProperty('--mouse-x', event.clientX + this.cursorOffset + 'px');
        this.element.style.setProperty('--mouse-y', event.clientY + this.cursorOffset + 'px');
      }
    };

    const pointerOver = event => {
      if (event.target.dataset.tooltip !== undefined) {
        this.element.innerHTML = event.target.dataset.tooltip;
        document.addEventListener('pointerout', pointerOut);
        document.addEventListener('pointermove', pointerMove);
        this.show();
      }
    };

    const pointerOut = event => {
      if (event.target.dataset.tooltip !== undefined) {
        this.remove();
        document.removeEventListener('pointermove', pointerMove);
        document.removeEventListener('pointerout', pointerOut);
      }
    };

    document.addEventListener('pointerover', (event) => {
      pointerOver(event);
    });

  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  destroy() {
    //TODO: отписаться тут от всех обработчиков событий
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}

export default Tooltip;
