import { StateManager } from "./StateManager.js";
import { Column } from "./Column.js";
import { Card } from "./Card.js";

export class Board {
  constructor() {
    this.container = document.querySelector(".main");
    this.stateManager = new StateManager();
    this.columns = new Map();

    this.dragData = {
      card: null,
      offset: { x: 0, y: 0 },
      ghost: null,
      placeholder: null,
      sourceColumn: null,
    };
  }

  init() {
    const columnElements = this.container.querySelectorAll(".column");
    const columnIds = Array.from(columnElements).map((el) => {
      return parseInt(el.dataset.columnId);
    });

    this.stateManager.initialize(columnIds);
    this.initColumns();
    this.restoreCardsFromState();
  }

  initColumns() {
    const columnElements = this.container.querySelectorAll(".column");

    columnElements.forEach((columnElement) => {
      const column = new Column(columnElement, this);
      this.columns.set(column.id, column);
    });
  }

  restoreCardsFromState() {
    const state = this.stateManager.getState();

    state.columns.forEach((columnData) => {
      const column = this.columns.get(columnData.id);
      if (column) {
        column.restoreCards(columnData.cards);
      }
    });
  }

  // добавляем карточку
  addCard(columnId, text) {
    const cardData = this.stateManager.addCard(columnId, text);
    if (cardData) {
      const column = this.columns.get(columnId);
      if (column) {
        const card = new Card(cardData, this);
        column.cards.push(card);
        column.addCardElement(card.createElement());
      }
    }
  }

  deleteCard(cardId) {
    this.stateManager.deleteCard(cardId);

    this.columns.forEach((column) => {
      column.cards = column.cards.filter((card) => card.id !== cardId);
      const cardElement = column.cardsContainer.querySelector(
        `[data-card-id="${cardId}"]`,
      );
      if (cardElement) {
        cardElement.remove();
      }
    });
  }

  // начало перетаскивания
  startDrag(card, e) {
    this.dragData.card = card;
    this.dragData.sourceColumn = card.element.closest(".column");

    const rect = card.element.getBoundingClientRect();
    this.dragData.offset.x = e.clientX - rect.left;
    this.dragData.offset.y = e.clientY - rect.top;

    // ghost
    this.dragData.ghost = card.element.cloneNode(true);
    this.dragData.ghost.classList.add("dragging");
    this.dragData.ghost.style.position = "fixed";
    this.dragData.ghost.style.width = rect.width + "px";
    this.dragData.ghost.style.height = rect.height + "px";
    this.dragData.ghost.style.left = e.clientX - this.dragData.offset.x + "px";
    this.dragData.ghost.style.top = e.clientY - this.dragData.offset.y + "px";
    this.dragData.ghost.style.pointerEvents = "none";
    this.dragData.ghost.style.zIndex = "10000";
    document.body.appendChild(this.dragData.ghost);

    // placeholder
    this.dragData.placeholder = document.createElement("div");
    this.dragData.placeholder.className = "drop-placeholder";
    this.dragData.placeholder.style.width = rect.width + "px";
    this.dragData.placeholder.style.height = rect.height + "px";

    const container = card.element.parentNode;
    container.insertBefore(this.dragData.placeholder, card.element);
    card.element.style.display = "none";

    //  обработчики
    document.addEventListener("mousemove", this.doDrag.bind(this));
    document.addEventListener("mouseup", this.stopDrag.bind(this));
  }

  // перетаскивание
  doDrag(e) {
    if (!this.dragData.ghost) return;

    // двигаем ghost
    this.dragData.ghost.style.left = e.clientX - this.dragData.offset.x + "px";
    this.dragData.ghost.style.top = e.clientY - this.dragData.offset.y + "px";

    // элементы под курсором
    const elements = document.elementsFromPoint(e.clientX, e.clientY);

    // ищеу целевую колонку
    let targetColumn = null;
    for (const el of elements) {
      if (el.classList.contains("column")) {
        targetColumn = el;
        break;
      }
      if (el.classList.contains("cards-container")) {
        targetColumn = el.closest(".column");
        break;
      }
    }

    if (!targetColumn) {
      targetColumn = this.dragData.sourceColumn;
    }

    // Ищем карточку
    let targetCard = null;
    let insertBefore = true;

    for (const el of elements) {
      if (el.classList.contains("card") && el !== this.dragData.card.element) {
        targetCard = el;
        const rect = el.getBoundingClientRect();
        insertBefore = e.clientY < rect.top + rect.height / 2;
        break;
      }
    }

    // апдейт placeholder
    this.updatePlaceholder(targetColumn, targetCard, insertBefore);
  }

  updatePlaceholder(columnElement, targetCard, insertBefore) {
    if (!this.dragData.placeholder) return;

    const container = columnElement.querySelector(".cards-container");

    if (this.dragData.placeholder.parentNode) {
      this.dragData.placeholder.parentNode.removeChild(
        this.dragData.placeholder,
      );
    }

    if (targetCard && targetCard.parentNode === container) {
      if (insertBefore) {
        container.insertBefore(this.dragData.placeholder, targetCard);
      } else {
        container.insertBefore(
          this.dragData.placeholder,
          targetCard.nextSibling,
        );
      }
    } else {
      if (container.children.length > 0) {
        container.insertBefore(this.dragData.placeholder, container.firstChild);
      } else {
        container.appendChild(this.dragData.placeholder);
      }
    }
  }

  // конец перетаскивания
  stopDrag(e) {
    if (
      !this.dragData.card ||
      !this.dragData.ghost ||
      !this.dragData.placeholder
    )
      return;

    const targetColumnElement = this.dragData.placeholder.closest(".column");

    if (targetColumnElement && this.dragData.placeholder.parentNode) {
      const targetColumnId = parseInt(targetColumnElement.dataset.columnId);
      const container = this.dragData.placeholder.parentNode;

      const children = Array.from(container.children);
      let insertIndex = children.indexOf(this.dragData.placeholder);

      if (insertIndex === -1) {
        insertIndex = children.length;
      }

      container.removeChild(this.dragData.placeholder);
      this.dragData.card.element.style.display = "";

      const currentChildren = Array.from(container.children);
      if (insertIndex < currentChildren.length) {
        container.insertBefore(
          this.dragData.card.element,
          currentChildren[insertIndex],
        );
      } else {
        container.appendChild(this.dragData.card.element);
      }

      this.saveCardMove(targetColumnId, insertIndex);
    } else {
      this.dragData.card.element.style.display = "";
      if (this.dragData.placeholder && this.dragData.placeholder.parentNode) {
        this.dragData.placeholder.parentNode.removeChild(
          this.dragData.placeholder,
        );
      }
    }

    this.cleanupDrag();
  }

  saveCardMove(targetColumnId, insertIndex) {
    const sourceColumnId = parseInt(
      this.dragData.sourceColumn.dataset.columnId,
    );

    this.stateManager.moveCard(
      this.dragData.card.id,
      targetColumnId,
      insertIndex,
    );

    this.updateLocalColumnsData(sourceColumnId, targetColumnId, insertIndex);
  }

  updateLocalColumnsData(sourceColumnId, targetColumnId, insertIndex) {
    const sourceColumn = this.columns.get(sourceColumnId);
    if (sourceColumn) {
      sourceColumn.cards = sourceColumn.cards.filter(
        (card) => card.id !== this.dragData.card.id,
      );
    }

    const targetColumn = this.columns.get(targetColumnId);
    if (targetColumn) {
      targetColumn.cards = targetColumn.cards.filter(
        (card) => card.id !== this.dragData.card.id,
      );

      if (insertIndex < targetColumn.cards.length) {
        targetColumn.cards.splice(insertIndex, 0, this.dragData.card);
      } else {
        targetColumn.cards.push(this.dragData.card);
      }
    }
  }

  cleanupDrag() {
    // Удаляем ghost
    if (this.dragData.ghost) {
      document.body.removeChild(this.dragData.ghost);
    }

    if (this.dragData.placeholder && this.dragData.placeholder.parentNode) {
      this.dragData.placeholder.parentNode.removeChild(
        this.dragData.placeholder,
      );
    }

    // Сбрасываем данные
    this.dragData = {
      card: null,
      offset: { x: 0, y: 0 },
      ghost: null,
      placeholder: null,
      sourceColumn: null,
    };

    document.removeEventListener("mousemove", this.doDrag.bind(this));
    document.removeEventListener("mouseup", this.stopDrag.bind(this));
  }

  clearBoard() {
    this.stateManager.clear();
    this.columns.forEach((column) => column.clearCards());
    this.init();
  }
}
