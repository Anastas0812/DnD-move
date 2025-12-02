export class LocalStorageManager {
  constructor(key = "task-board") {
    this.key = key;
  }

  load() {
    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : null;
  }

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  export() {
    return this.load();
  }

  import(data) {
    this.save(data);
  }
}
