export class Card {
  constructor(data, board) {
    this.id = data.id;
    this.text = data.text;
    this.board = board;
    this.element = null;
  }

  // создаем карточку
  createElement() {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.cardId = this.id;
    card.textContent = this.text;
    card.setAttribute("draggable", "true");

    // создаем крестик-кнопку удаления
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "card-delete";
    deleteBtn.innerHTML = "×"; // у меня не получился "\E951" даже через подключение шрифта в хеде html
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.board.deleteCard(this.id);
    });

    card.append(deleteBtn);
    this.element = card;

    this.addEventListeners();

    return card;
  }

  addEventListeners() {
    this.element.addEventListener("mousedown", (e) => {
      if (e.button === 0 && !e.target.classList.contains("card-delete")) {
        this.board.startDrag(this, e);
      }
    });

    this.element.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
  }
}
