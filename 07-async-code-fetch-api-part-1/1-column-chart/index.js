import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element;
  subElements;
  processedData = [];

  constructor({
    url = '',
    label = '',
    range = {},
    link = '',
    formatHeading = data => data,
  }) {
    this.range = range;
    this.url = url;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.init();
  }

  init() {
    this.update();
  }

  getUrl(from, to) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    return url;
  }

  getLink() {
    return this.link && `<a href="${this.link}" class="column-chart__link">View all</a>`;
  }

  getTotalValue() {
    if (this.processedData.length > 0) {
      let total = 0;
      this.processedData.map(item => {
        total = total + item.rawValue;
      });
      return this.formatHeading(total);
    }
  }

  update(from = this.range.from, to = this.range.to) {
    const url = this.getUrl(from, to);
    fetch(url).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return null;
      }
    }).then(data => {
      this.processedData = this.processData(data);
      this.element.classList.remove('column-chart_loading');
      this.subElements.body.innerHTML = this.getChartBars();
      this.subElements.header.innerHTML = this.getTotalValue();
    }).catch(error => {
      throw new Error(`Произошла ошибка: ${error}`);
    });
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.getTotalValue()}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getChartBars()}
          </div>
        </div>
      </div>
    `;
  }

  getChartBars() {
    return this.processedData.map((bar) => {
      return `<div style="--value: ${bar.value}" data-tooltip="${bar.percent}"></div>`;
    }).join('');
  }

  processData(data) {
    let values;
    values = Object.entries(data).map(([key, value]) => {
      return value;
    });
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;
    return Object.entries(data).map(([key, value]) => {
      return {
        date: key,
        percent: (value / maxValue * 100).toFixed(0) + '%',
        value: Number(Math.floor(value * scale)),
        rawValue: value,
      };
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    if (this.processedData.length) {
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

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

}
