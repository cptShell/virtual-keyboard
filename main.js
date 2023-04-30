import { TagNames, createElement } from "./common/common";
import initKeyboard from "./keyboard";

const textPolygon = createElement(TagNames.TEXTAREA);
const title = createElement(TagNames.H2);
title.textContent = 'VIRTUAL KEYBOARD';
document.body.append(title, textPolygon);
initKeyboard();