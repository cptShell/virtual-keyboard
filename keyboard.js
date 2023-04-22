import './style.css';
import {
  createElement,
  cancelBlur,
  keyboardMapping,
  ClassNames,
  EventNames,
  TagNames,
  Devices,
  KeyCodes,
  Languages
} from './common/common';

const { body } = window.document;
const langList = Object.values(Languages);
langList.getNext = (currentLang) => {
  const currentIndex = langList.indexOf(currentLang);
  const nextIndex = (currentIndex + 1) % langList.length;
  return langList[nextIndex] || currentLang;
}

const initKeyboard = () => {
  let lang = localStorage.getItem('user-key-lang') || Languages.EN;
  let isUpperCased = false;
  let isShifted = false;
  const boundedInput = document.querySelector('textarea');
  const buttonMap = new Map();

  const updateKeyboardStyles = (force, code, stateName) => {
    const button = buttonMap.get(code);
    const { pressState, button: element } = button;
    pressState[stateName] = force;
    const condition = !pressState.keyboard && !pressState.mouse;

    if (force ? !condition : condition) {
      element.classList.toggle(ClassNames.PRESSED, force);
    }
  };

  const typeChar = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const char = code === KeyCodes.SPACE ? ' ' : keyboardMapping[lang][codeIndex];
    const { selectionStart, selectionEnd } = boundedInput;
    const startText = boundedInput.value.substring(0, selectionStart);
    const endText = boundedInput.value.substring(selectionEnd, boundedInput.value.length);

    boundedInput.value = startText + char + endText;
    boundedInput.selectionEnd = selectionStart + char.length;
    boundedInput.selectionStart = selectionStart + char.length;
  };

  const setupMouseHandlers = (code, typeAction) => {
    const handleMouseUp = (event) => {
      cancelBlur(event);
      updateKeyboardStyles(false, code, Devices.MOUSE);
      document.removeEventListener(EventNames.MOUSEUP, handleMouseUp);
    };
    const handleMouseDown = (event) => {
      if (!boundedInput || document.activeElement !== boundedInput) return;

      cancelBlur(event);
      updateKeyboardStyles(true, code, Devices.MOUSE);
      typeAction();
      document.addEventListener(EventNames.MOUSEUP, handleMouseUp);
    };
    return [handleMouseDown, handleMouseUp];
  }

  const createKeyButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping[lang][codeIndex];
    const invokeAction = () => typeChar(code, boundedInput);

    const [handleMouseDown] = setupMouseHandlers(code, invokeAction);
    const keyButton = createElement(TagNames.BUTTON, null, null, key);
    keyButton.addEventListener(EventNames.MOUSEDOWN, handleMouseDown);

    return keyButton;
  };

  const pickCreateFunction = (code) => {
    if (code === KeyCodes.CAPS_LOCK) return createKeyButton;
    return createKeyButton;
  }

  const updateKeys = (forceChangeLanguage) => {
    if (forceChangeLanguage) lang = langList.getNext(lang);
    console.log(lang);
    [...buttonMap.entries()].map(([code, { button }]) => {
      const codeIndex = keyboardMapping.keyCodes.indexOf(code);
      const chars = keyboardMapping[lang + (isUpperCased ? 'Shift' : '')];
      const newChar = chars[codeIndex];
      button.textContent = isUpperCased ? newChar.toUpperCase() : newChar;
    });
  }

  keyboardMapping.keyCodes.reduce((map, code) => {
    const buttonCreateFunction = pickCreateFunction(code);
    const button = buttonCreateFunction(code);
    const pressState = { mouse: false, keyboard: false };
    return map.set(code, { button, pressState });
  }, buttonMap);

  const keyboard = createElement(TagNames.DIV, Devices.KEYBOARD);
  keyboard.addEventListener(EventNames.MOUSEDOWN, cancelBlur);

  const handleKeyUp = ({ which: code }) => {
    if (!buttonMap.has(code)) return;

    updateKeyboardStyles(false, code, Devices.KEYBOARD);
  };
  const handleKeyDown = ({ which: code }) => {
    if (!boundedInput || document.activeElement !== boundedInput) return;
    if (!buttonMap.has(code)) return;

    updateKeyboardStyles(true, code, Devices.KEYBOARD);
  };
  const handleUnshift = ({which: code}) => {
    if (code !== KeyCodes.SHIFT) return;

    isShifted = false;

    isUpperCased = !isUpperCased;
    updateKeys(false);
  }
  const handleShift = ({which: code}) => {
    if (isShifted) return;

    isShifted = true;

    if (code !== KeyCodes.SHIFT) return;

    isUpperCased = !isUpperCased;
    updateKeys(false);
  }

  document.addEventListener(EventNames.KEYDOWN, handleKeyDown);
  document.addEventListener(EventNames.KEYDOWN, handleShift);
  document.addEventListener(EventNames.KEYUP, handleKeyUp);
  document.addEventListener(EventNames.KEYUP, handleUnshift);

  const buttons = [...buttonMap.values()].map(({ button }) => button);
  keyboard.append(...buttons);
  body.append(keyboard);
};

initKeyboard();
