import { Card } from "./Card";

export class Column {
  constructor(columnElement, board) {
    this.element = columnElement;
    this.board = board;
    this.id = parseInt(columnElement.dataset.columnId);
    this.title = columnElement.querySelector("h3").textContent;
    this.cardsContainer = columnElement.querySelector(".cards-container");
    this.cards = [];

    // ищу элементы
    this.plusLink = columnElement.querySelector(".plus-link");
    this.addCardForm = columnElement.querySelector(".add-card-form");
    this.btnLink = columnElement.querySelector(".btn-link");
    this.btnCross = columnElement.querySelector(".btn-cross");
    this.btnAddCard = columnElement.querySelector(".btn-add-card");
    this.cardInput = columnElement.querySelector(".card-input");

    this.initForm();
  }

  // форма заполнния новой карточки
  initForm() {
    // скрываем по умолчанию
    if (this.addCardForm) {
      this.addCardForm.style.display = "none";
    }
    //а та, что как ссылка активная
    if (this.plusLink) {
      this.plusLink.style.display = "block";
    }
    //слежка за кликами
    if (this.btnLink) {
      this.btnLink.addEventListener("click", () => {
        this.showForm();
      });
    }

    if (this.btnCross) {
      this.btnCross.addEventListener("click", () => {
        this.hideForm();
      });
    }

    if (this.btnAddCard) {
      this.btnAddCard.addEventListener("click", () => {
        this.addCardFromForm();
      });
    }

    if (this.cardInput) {
      this.cardInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.addCardFromForm();
        }
      });
    }
  }

  showForm() {
    if (this.plusLink) this.plusLink.style.display = "none";
    if (this.addCardForm) this.addCardForm.style.display = "block";
    if (this.cardInput) this.cardInput.focus();
  }

  hideForm() {
    if (this.addCardForm) this.addCardForm.style.display = "none";
    if (this.plusLink) this.plusLink.style.display = "block";
    if (this.cardInput) this.cardInput.value = "";
  }

  addCardFromForm() {
    const text = this.cardInput ? this.cardInput.value.trim() : "";
    if (text) {
      this.board.addCard(this.id, text);
      this.hideForm();
    }
  }

  // очистить контейнер карточек
  clearCards() {
    this.cardsContainer.innerHTML = "";
    this.cards = [];
  }

  // Добавить карточку в колонку
  addCardElement(cardElement) {
    this.cardsContainer.append(cardElement);
  }

  // Восстановить карточки из данных
  restoreCards(cardsData) {
    this.clearCards();

    cardsData.forEach((cardData) => {
      const card = new Card(cardData, this.board);
      this.cards.push(card);
      this.addCardElement(card.createElement());
    });
  }

  // гет индекс карточки в контейнере
  getCardIndex(cardElement) {
    const cards = Array.from(this.cardsContainer.children);
    return cards.indexOf(cardElement);
  }
}
