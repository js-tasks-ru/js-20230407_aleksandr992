export default class NotificationMessage {

  static currentNotification;

  element;
  subElements;
  document;

  constructor(
    {
      message = '',
      duration = 3000,
      type = 'success',
    }) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.document = document;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  getBodyElement(elementId) {
    return this.document.body.querySelector(elementId);
  }

  removeTimer() {
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  show() {
    this.getBodyElement('#btn1').after(this.element);
    this.removeTimer();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  remove () {
    this.element.remove();
  }

}
