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
