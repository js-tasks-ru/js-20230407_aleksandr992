import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  subElements;
  fieldSortTypes = {};
  fieldTemplates = {};
  sortedData = [];

  isSortLocally = false;

  itemsLoaded = 0;
  itemsToLoad = 30;



  constructor(
    headerConfig = [],
    {
      sorted = {},
      url = '',
    } = {}) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.searchParams = {
      _order: this.sorted.order,
      _sort: this.sorted.id,
      _start: this.itemsLoaded,
      _end: this.itemsLoaded + this.itemsToLoad,
    };
    this.url = url;
    this.getFieldSortTypes();
    this.getFieldTemplates();
    this.render();
    this.init();
  }

  getUrl(searchParams) {
    const url = new URL(this.url, BACKEND_URL);
    Object.entries({...searchParams}).map(([key, value]) => {
      url.searchParams.set(key, value);
    });
    console.log(url);
    return url;
  }

  async loadData() {
    const loader = this.element.querySelector('[data-element="loading"]');
    const placeHolder = this.element.querySelector('[data-element="emptyPlaceholder"]');
    loader.style.display = "block";
    const url = this.getUrl(this.searchParams);
    await fetchJson(url).then(data => {
      if (data.length === 0) {
        loader.style.display = "none";
        placeHolder.style.display = "block";
        return;
      }
      this.itemsLoaded = this.itemsLoaded + this.itemsToLoad;
      this.searchParams._start = this.itemsLoaded;
      this.searchParams._end = this.itemsLoaded + this.itemsToLoad;
      this.sortedData = [...this.sortedData, ...data];
      this.subElements.body.innerHTML = this.getTableRows();
      loader.style.display = "none";
    }).catch(error => {
      throw new Error(`Произошла ошибка: ${error}`);
    });
  }

  handleInfiniteScroll = () => {
    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight;
    if (endOfPage) {
      void this.loadData();
    }
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
        ${this.headerConfig.map(column => this.getTableHeaderCell(column)).join('')}
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
    if (this.sortedData.length > 0) {
      const loader = this.element.querySelector('[data-element="loading"]');
      loader.style.display = "none";
      return this.sortedData.map(row => {
        return this.getTableRow(row);
      }).join('');
    }
    return '';

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
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
              <button type="button" class="button-primary-outline">Очистить фильтры</button>
            </div>
          </div>
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

    if (this.sortedData.length !== 0 && this.headerConfig) {
      this.sortedData = [...this.sortedData].sort((a, b) => {
        const keyA = a[fieldValue];
        const keyB = b[fieldValue];
        switch (this.fieldSortTypes[fieldValue]) {
        case 'number':
          return direction * (keyA - keyB);
        case 'string':
          return direction * keyA.localeCompare(keyB, 'ru-RU-u-kf-upper', {sensitivity: 'case'});
        case 'custom':
          return direction * customSorting(keyA, keyB);
        default:
          throw new Error(`Неизвестный тип сортировки: ${this.fieldSortTypes[fieldValue]}`);
        }
      });
    }
  }


  sortTable(fieldValue, orderDirection) {
    const allFields = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentField = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    allFields.forEach((field) => field.dataset.order = '');
    currentField.dataset.order = orderDirection;
  }

  sort(fieldValue, orderDirection) {
    this.sortData(fieldValue, orderDirection);
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      void this.sortOnServer();
    }
  }

  sortOnClient(fieldValue, orderDirection) {
    this.sortTable(fieldValue, orderDirection);
    this.subElements.body.innerHTML = this.getTableRows();
  }

  sortOnServer(fieldValue, orderDirection) {
    this.itemsLoaded = 0;
    this.sortedData = [];
    const table = this.element.querySelector('[data-element="body"]');
    console.log(table);
    table.innerHTML = '';
    this.searchParams = {
      _order: orderDirection,
      _sort: fieldValue,
      _start: this.itemsLoaded,
      _end: this.itemsLoaded + this.itemsToLoad,
    };
    void this.loadData();
    this.sortTable(fieldValue, orderDirection);
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

  handleSort = (element) => {
    this.searchParams._order = element.dataset.order;
    if (this.searchParams._order === 'asc') {
      this.searchParams._order = 'desc';
    } else {
      this.searchParams._order = 'asc';
    }
    if (this.isSortLocally) {
      this.sortOnClient(element.dataset.id, this.searchParams._order);
    } else {
      this.sortOnServer(element.dataset.id, this.searchParams._order);
    }
  }

  init() {

    this.loadData().then(() => {
      this.sortTable(this.sorted.id, this.sorted.order);
    });
    const sortableHeaderCells = this.element.querySelectorAll('.sortable-table__cell[data-sortable="true"]');
    sortableHeaderCells.forEach(element => {
      element.addEventListener('pointerup', () => this.handleSort(element));
    });
    window.addEventListener('scroll', this.handleInfiniteScroll);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      window.removeEventListener("scroll", this.handleInfiniteScroll);
    }
  }

}
