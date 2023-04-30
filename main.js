import { TagNames, createElement } from "./common/common";
import initKeyboard from "./keyboard";

const textPolygon = createElement(TagNames.TEXTAREA);
document.body.append(textPolygon);
initKeyboard();