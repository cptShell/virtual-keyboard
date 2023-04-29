import { STORAGE_KEY } from '../constants/constants';

export default class LangList {
  constructor(langList, initLang) {
    const index = langList.findIndex(lang => lang === initLang) || 0;
    this.langList = langList;
    this.currentIndex = index;
  }
  getNext() {
    this.currentIndex = (this.currentIndex + 1) % this.langList.length;
    localStorage.setItem(STORAGE_KEY, this.current);
  }
  get current() {
    return this.langList[this.currentIndex];
  }
}