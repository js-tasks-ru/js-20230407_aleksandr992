class Tooltip {

  static currentTooltip;

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
    if (typeof Tooltip.currentTooltip === 'object') {
      Tooltip.currentTooltip.remove();
    }
    document.body.append(this.element);
    Tooltip.currentTooltip = this;
  }

  initialize () {

    this.render();

    const moveTooltip = (event) => {
      if (event.target.dataset.tooltip !== undefined) {
        this.element.style.setProperty('--mouse-x', event.clientX + 16 + 'px');
        this.element.style.setProperty('--mouse-y', event.clientY + 16 + 'px');
      }
    };

    document.addEventListener('pointerover', (event) => {
      if (event.target.dataset.tooltip !== undefined) {
        this.element.innerHTML = event.target.dataset.tooltip;
        document.addEventListener('pointermove', moveTooltip);
        this.show();
      }
    });

    document.addEventListener('pointerout', (event) => {
      if (event.target.dataset.tooltip !== undefined) {
        this.remove();
        document.removeEventListener('pointermove', moveTooltip);
      }
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
