import { LocalStorageManager } from "./LocalStorageManager";

export class StateManager {
  constructor() {
    this.storage = new LocalStorageManager();
    this.state = null;
  }

  initialize(columnIds) {
    const saved = this.storage.load();

    if (saved) {
      this.state = saved;
    } else {
      this.state = {
        columns: [
          {
            id: columnIds[0], // 1 - TODO
            title: "TODO",
            cards: [
              { id: 1, text: "1 для теста" },
              { id: 2, text: "2 для теста" },
            ],
          },
          {
            id: columnIds[1], // 2 - IN PROGRESS
            title: "IN PROGRESS",
            cards: [{ id: 3, text: "3 для теста" }],
          },
          {
            id: columnIds[2], // 3 - DONE
            title: "DONE",
            cards: [],
          },
        ],
        nextCardId: 4,
      };
      this.save();
    }
  }

  save() {
    this.storage.save(this.state);
  }

  getState() {
    return this.state;
  }

  // ролучить колонку по ID
  getColumn(columnId) {
    return this.state.columns.find((col) => col.id === columnId);
  }

  // добавить карточку
  addCard(columnId, text) {
    const column = this.getColumn(columnId);
    if (!column) return null;

    const newCard = {
      id: this.state.nextCardId++,
      text: text.trim(),
    };

    column.cards.push(newCard);
    this.save();
    return newCard;
  }

  // удалить карточку
  deleteCard(cardId) {
    this.state.columns.forEach((column) => {
      const index = column.cards.findIndex((card) => card.id === cardId);
      if (index !== -1) {
        column.cards.splice(index, 1);
      }
    });
    this.save();
  }

  // переместить карточку
  moveCard(cardId, targetColumnId, insertIndex) {
    let cardToMove = null;
    let sourceColumn = null;

    // находим карточку в исходной колонке
    for (const column of this.state.columns) {
      const cardIndex = column.cards.findIndex((card) => card.id === cardId);
      if (cardIndex !== -1) {
        cardToMove = column.cards[cardIndex];
        sourceColumn = column;
        column.cards.splice(cardIndex, 1);
        break;
      }
    }

    if (!cardToMove) return;

    // находим целевую колонку
    const targetColumn = this.getColumn(targetColumnId);
    if (targetColumn) {
      // вставляем на нужную позицию
      if (
        insertIndex === undefined ||
        insertIndex >= targetColumn.cards.length
      ) {
        targetColumn.cards.push(cardToMove);
      } else {
        targetColumn.cards.splice(insertIndex, 0, cardToMove);
      }
    }

    this.save();
  }
}
