import { TagNames, createElement } from './common/common';
import initKeyboard from './keyboard';

const textPolygon = createElement(TagNames.TEXTAREA);
const title = createElement(TagNames.H1);
title.textContent = 'VIRTUAL KEYBOARD';
document.body.append(title, textPolygon);
initKeyboard();
const textDescription = createElement(TagNames.SPAN);
textDescription.textContent = '"Alt + Shift" for change language';
document.body.append(textDescription);

console.log(`

Score: 110 / 110
Basic scope:
- [x] switching keyboard layouts between English and another language is implemented. Selected language should be saved and used on page reload. A keyboard shortcut for switching a language should be specified on the page: +15
- [x] mouse clicks on buttons of the virtual keyboard or pressing buttons on a physical keyboard inputs characters to the input field (text area): +15

Extra scope:
- [x] animation of pressing a key is implemented: +15

Technical requirements:
- [x] usage of ES6+ features (classes, property destructuring, etc): +15
- [x] usage of ESLint: +10
- [x] requirements to the repository, commits and pull request are met: +10

Penalties:
- [ ] there're errors related to the executable code (errors like favicon.ico: Failed to load resource: the server responded with a status of 404 are not taken into account) or there're eslint-config-airbnb-base warnings: -15

`);
