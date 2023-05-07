export default class SortableTable {

  subElements;
  fieldSortTypes = {};
  fieldTemplates = {};

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {},
    }) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sortedData = this.data;
    this.getFieldSortTypes();
    this.getFieldTemplates();

    this.render();
    this.sort(sorted.id, sorted.order);
    this.init();
  }

  getFieldSortTypes() {
    return this.headerConfig.map(field => {
      if (typeof field.sortType === 'undefined') {
        return;
      }
      this.fieldSortTypes = {
        ...this.fieldSortTypes,
        [field.id]: field.sortType,
      };
    });
  }

  getFieldTemplates() {
    return this.headerConfig.map(field => {
      if (typeof field.template === 'undefined') {
        return;
      }
      this.fieldTemplates = {
        ...this.fieldTemplates,
        [field.id]: field.template,
      };
    });
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(column => {
      return this.getTableHeaderCell(column);
    }).join('')}
      </div>
    `;
  }

  getTableHeaderCell({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows()}
      </div>
    `;
  }

  getTableRows() {
    return this.sortedData.map(row => {
      return this.getTableRow(row);
    }).join('');
  }

  getTableRow(row) {
    return `
      <a href="/products/${row.id}" class="sortable-table__row">
        ${this.headerConfig.map(column => {
      if (typeof this.fieldTemplates[column.id] === 'function') {
        return this.fieldTemplates[column.id](row[column.id]);
      }
      return this.getTableCell(row[column.id]);
    }).join('')}
      </a>
    `;
  }

  getTableCell(cellData) {
    return `<div class="sortable-table__cell">${cellData}</div>`;
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.getTableHeader()}
          ${this.getTableBody()}
        </div>
      </div>
    `;
  }

  sortData(fieldValue, orderDirection = 'asc') {
    const directions = {
      asc: 1,
      desc: -1,
    };

    const direction = directions[orderDirection];

    if (!direction) {
      throw new Error(`Wrong param: ${orderDirection}`);
    }

    if (this.data.length !== 0 && this.headerConfig) {
      this.sortedData = [...this.data].sort((a, b) => {
        const keyA = a[fieldValue] || a;
        const keyB = b[fieldValue] || b;
        if (this.fieldSortTypes[fieldValue] === 'string') {
          return direction * keyA.localeCompare(keyB, 'ru-RU-u-kf-upper', {sensitivity: 'case'});
        }
        if (this.fieldSortTypes[fieldValue] === 'number') {
          return direction * (keyA - keyB);
        }
      });
    }
  }

  sort(fieldValue, orderDirection) {

    this.sortData(fieldValue, orderDirection);

    const allFields = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentField = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    allFields.forEach((field) => field.dataset.order = '');
    currentField.dataset.order = orderDirection;

    this.subElements.body.innerHTML = this.getTableRows();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  init() {
    sort.addEventListener('click', () => {
      const fieldValue = field.value;
      const orderValue = order.value;
      this.sort(fieldValue, orderValue);
    });

    document.addEventListener("DOMContentLoaded", () => {
      const sortableHeaderCells = this.element.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
      sortableHeaderCells.forEach(element => {
        element.addEventListener('pointerup', () => {
          let order = element.dataset.order;
          if (order === 'asc') {
            order = 'desc';
          } else {
            order = 'asc';
          }
          this.sort(element.dataset.id, order);
        });
      });
    });
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}
