export default class DoubleSlider {

  element;
  subElements;

  constructor(
    {
    min = 0,
    max = 100,
    formatValue = value => value,
    selected = {
      from: 0,
      to: 100,
    },
  }
  ) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.from = selected.from;
    this.to = selected.to;
    this.render();
    this.init();
  }

  getTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.from)}</span>
        <div data-element="slider" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="leftThumb" class="range-slider__thumb-left"></span>
          <span data-element="rightThumb" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.to)}</span>
      </div>
    `;
  }

  init() {

    const { slider, progress, leftThumb, rightThumb, from, to } = this.subElements;
    let leftThumbPosition;
    let rightThumbPosition;

    const handleLeftPointerDown = (event) => {
      leftThumb.setPointerCapture(event.pointerId);
      leftThumb.addEventListener('pointerup', handleLeftPointerUp);
      leftThumb.addEventListener('pointermove', handleLeftPointerMove);
    };

    const handleRightPointerDown = (event) => {
      leftThumb.setPointerCapture(event.pointerId);
      leftThumb.addEventListener('pointerup', handleRightPointerUp);
      leftThumb.addEventListener('pointermove', handleRightPointerMove);
    };

    const handleLeftPointerMove = (event) => {

      leftThumbPosition = event.clientX - slider.getBoundingClientRect().left;

      const sliderWidth = slider.offsetWidth;
      const thumbWidth = leftThumb.offsetWidth;
      const minRange = 0;
      const maxRange = sliderWidth - thumbWidth;

      if (leftThumbPosition < 0) {
        leftThumbPosition = 0;
      }
      let rightEdge = slider.offsetWidth - leftThumb.offsetWidth;
      if (leftThumbPosition > rightThumbPosition) {
        leftThumbPosition = rightThumbPosition;
      }
      if (leftThumbPosition > rightEdge) {
        leftThumbPosition = rightEdge;
      }

      leftThumb.style.left = leftThumbPosition + 'px';
      progress.style.left = leftThumbPosition + 'px';
      this.from = this.calculateValue(leftThumbPosition, minRange, maxRange, this.min, this.max).toFixed(0);
      from.innerHTML = this.formatValue(this.from);
    };

    const handleRightPointerMove = (event) => {

      rightThumbPosition = event.clientX - slider.getBoundingClientRect().left;

      const sliderWidth = slider.offsetWidth;
      const thumbWidth = rightThumb.offsetWidth;
      const minRange = 0;
      const maxRange = sliderWidth - thumbWidth;

      if (rightThumbPosition > sliderWidth) {
        rightThumbPosition = sliderWidth;
      }
      let rightEdge = slider.offsetWidth - leftThumb.offsetWidth;
      if (rightThumbPosition < leftThumbPosition) {
        rightThumbPosition = leftThumbPosition;
      }
      if (rightThumbPosition > rightEdge) {
        rightThumbPosition = rightEdge;
      }

      rightThumb.style.left = rightThumbPosition + 'px';
      progress.style.right = sliderWidth - rightThumbPosition + 'px';
      this.to = this.calculateValue(rightThumbPosition, minRange, maxRange, this.min, this.max).toFixed(0);
      to.innerHTML = this.formatValue(this.to);
    };

    const handleLeftPointerUp = () => {
      leftThumb.removeEventListener('pointerup', handleLeftPointerUp);
      leftThumb.removeEventListener('pointermove', handleLeftPointerMove);
      leftThumb.dispatchEvent(new CustomEvent('rangeSelected', {
        bubbles: true,
        detail: {
          from: this.from,
          to: this.to,
        },
      }));
    };

    const handleRightPointerUp = () => {
      leftThumb.removeEventListener('pointerup', handleRightPointerUp);
      leftThumb.removeEventListener('pointermove', handleRightPointerMove);
      rightThumb.dispatchEvent(new CustomEvent('rangeSelected', {
        bubbles: true,
        detail: {
          from: this.from,
          to: this.to,
        },
      }));
    };

    document.addEventListener('DOMContentLoaded', () => {
      leftThumb.addEventListener('pointerdown', handleLeftPointerDown);
      rightThumb.addEventListener('pointerdown', handleRightPointerDown);
    });
  }

  calculateValue(position, minRange, maxRange, minValue, maxValue) {
    const range = maxRange - minRange;
    const valueRange = maxValue - minValue;
    const ratio = (position - minRange) / range;
    return minValue + ratio * valueRange;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  destroy() {
    this.remove();
    this.element = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

}
