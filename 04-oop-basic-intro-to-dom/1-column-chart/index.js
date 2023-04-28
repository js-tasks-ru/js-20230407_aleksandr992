export default class ColumnChart {
  chartHeight = 50;
  element;
  subElements;

  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = data => data,
  }) {
    value = value.toLocaleString('en-EN');
    this.data = data;
    this.processedData = this.getColumnProps(this.data);
    this.label = label;
    this.value = typeof formatHeading === 'function' ? formatHeading(value) : value;
    this.link = link;
    this.render();
  }

  getLink() {
    return this.link && `<a href="${this.link}" class="column-chart__link">View all</a>`;
  }

  getChartBars() {
    return this.processedData.map((bar) => {
      return `<div style="--value: ${bar.value}" data-tooltip="${bar.percent}"></div>`;
    }).join('');
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartBars()}
          </div>
        </div>
      </div>
    `;
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  update({headerData, bodyData}) {
    this.processedData = this.getColumnProps(bodyData);
    this.subElements.header.textContent = headerData;
    this.subElements.body.innerHTML = this.getChartBars();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }

  remove () {
    this.element.remove();
  }

}



