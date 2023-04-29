export default class LangList {
  constructor(langList) {
    this.langList = langList;
    this.currentIndex = 0;
  }
  getNext() {
    this.currentIndex = (this.currentIndex + 1) % this.langList.length;
  }
  get current() {
    return this.langList[this.currentIndex];
  }
}