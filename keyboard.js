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
  Languages,
} from './common/common';

const { body } = window.document;
const langList = Object.values(Languages);
langList.getNext = (currentLang) => {
  const currentIndex = langList.indexOf(currentLang);
  const nextIndex = (currentIndex + 1) % langList.length;
  return langList[nextIndex] || currentLang;
};

const initKeyboard = () => {
  let lang = localStorage.getItem('user-key-lang') || Languages.EN;
  let isUpperCased = false;
  let isCapsed = false;
  const boundedInput = document.querySelector('textarea');
  const buttonMap = new Map();

  const toggleKeyboardStyles = (force, code, stateName) => {
    const button = buttonMap.get(code);
    const { pressState, button: element } = button;
    pressState[stateName] = force;
    const condition = !pressState.keyboard && !pressState.mouse;

    if (force ? !condition : condition) {
      element.classList.toggle(ClassNames.PRESSED, force);
    }
  };
  const setKeyboardStyles = (force, code) => {
    const button = buttonMap.get(code);
    const { button: element } = button;

    element.classList.toggle(ClassNames.PRESSED, force);
  };

  const typeChar = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    let char = code === KeyCodes.SPACE ? ' ' : keyboardMapping[lang][codeIndex];
    if (isUpperCased) char = char.toUpperCase();
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
      toggleKeyboardStyles(false, code, Devices.MOUSE);
      document.removeEventListener(EventNames.MOUSEUP, handleMouseUp);
    };
    const handleMouseDown = (event) => {
      if (!boundedInput || document.activeElement !== boundedInput) return;

      cancelBlur(event);
      toggleKeyboardStyles(true, code, Devices.MOUSE);
      typeAction();
      document.addEventListener(EventNames.MOUSEUP, handleMouseUp);
    };
    return [handleMouseDown, handleMouseUp];
  };
  const createKeyButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping[lang][codeIndex];
    const keyButton = createElement(TagNames.BUTTON, null, null, key);
    const invokeAction = () => typeChar(code, boundedInput);
    const [handleMouseDown] = setupMouseHandlers(code, invokeAction);
    keyButton.addEventListener(EventNames.MOUSEDOWN, handleMouseDown);

    return keyButton;
  };
  const updateKeys = (forceChangeLanguage) => {
    isUpperCased = !isUpperCased;
    if (forceChangeLanguage) lang = langList.getNext(lang);

    [...buttonMap.entries()].forEach(([code, { button }]) => {
      const updatedButton = button;
      const codeIndex = keyboardMapping.keyCodes.indexOf(code);
      const chars = keyboardMapping[lang + (isUpperCased ? 'Shift' : '')];
      const newChar = chars[codeIndex];
      updatedButton.textContent = newChar;
    });
  };
  const createCapsButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping[lang][codeIndex];
    const capsButton = createElement(TagNames.BUTTON, null, null, key);
    const handlePushCapsLock = () => {
      isCapsed = !isCapsed;
      updateKeys(false);
      setKeyboardStyles(isCapsed, code);
    };
    capsButton.addEventListener(EventNames.CLICK, handlePushCapsLock);

    return capsButton;
  };

  const pickCreateFunction = (code) => {
    if (code === KeyCodes.CAPS_LOCK) return createCapsButton;
    return createKeyButton;
  };

  keyboardMapping.keyCodes.reduce((map, code) => {
    const buttonCreateFunction = pickCreateFunction(code);
    const button = buttonCreateFunction(code);
    const pressState = { mouse: false, keyboard: false };
    return map.set(code, { button, pressState });
  }, buttonMap);

  const keyboard = createElement(TagNames.DIV, Devices.KEYBOARD);
  keyboard.addEventListener(EventNames.MOUSEDOWN, cancelBlur);

  const createHandleKey = (force) => ({ which: code }) => {
    if (!boundedInput || document.activeElement !== boundedInput) return;
    if (!buttonMap.has(code)) return;
    if (code !== KeyCodes.CAPS_LOCK) {
      toggleKeyboardStyles(force, code, Devices.KEYBOARD);
    }
  };
  const handleKeyUp = createHandleKey(false);
  const handleKeyDown = createHandleKey(true);
  const handleUnshift = ({ which: code }) => {
    if (code === KeyCodes.SHIFT) updateKeys(false);
  };
  const handleShift = ({
    altKey, shiftKey, which: code, repeat,
  }) => {
    if (repeat) return;
    if (code === KeyCodes.SHIFT) updateKeys(altKey && shiftKey);
  };
  const handleCapsLock = ({ which: code, repeat }) => {
    if (repeat) return;
    if (code === KeyCodes.CAPS_LOCK) {
      isCapsed = !isCapsed;
      updateKeys(false);
      setKeyboardStyles(isCapsed, code);
    }
  };
  document.addEventListener(EventNames.KEYDOWN, handleKeyDown);
  document.addEventListener(EventNames.KEYDOWN, handleShift);
  document.addEventListener(EventNames.KEYDOWN, handleCapsLock);
  document.addEventListener(EventNames.KEYUP, handleKeyUp);
  document.addEventListener(EventNames.KEYUP, handleUnshift);

  const buttons = [...buttonMap.values()].map(({ button }) => button);
  keyboard.append(...buttons);
  body.append(keyboard);
};

initKeyboard();
