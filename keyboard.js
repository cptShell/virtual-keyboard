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

  const cropText = (selectionStart, selectionEnd) => {
    const inputText = boundedInput.value;
    const startText = inputText.substring(0, selectionStart);
    const endText = inputText.substring(selectionEnd, inputText.length);

    boundedInput.value = startText + endText;
    boundedInput.selectionEnd = selectionStart;
    boundedInput.selectionStart = selectionStart;
  }
  const removeChar = (forceShift) => {
    let { selectionStart, selectionEnd } = boundedInput;
    const startIndex = 0;
    const isRangedSelection = selectionStart !== selectionEnd;
    if (!isRangedSelection) {
      forceShift ? selectionEnd++ : selectionStart = Math.max(--selectionStart, startIndex);
    }
    
    cropText(selectionStart, selectionEnd);
  }
  const typeChar = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const chars = keyboardMapping[lang + (isUpperCased ? 'Shift' : '')];
    let char = code === KeyCodes.SPACE ? ' ' : chars[codeIndex];
    if (isUpperCased) char = char.toUpperCase();
    const { selectionStart, selectionEnd } = boundedInput;

    cropText(selectionStart, selectionEnd);
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
  const createActionInvoker = (code) => {
    if (code === KeyCodes.BACKSPACE) return () => removeChar(false);
    if (code === KeyCodes.DELETE) return () => removeChar(true); 
    return () => typeChar(code, boundedInput);
  }
  const createKeyButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping[lang][codeIndex];
    const keyButton = createElement(TagNames.BUTTON, null, null, key);
    const invokeAction = createActionInvoker(code);
    const [handleMouseDown] = setupMouseHandlers(code, invokeAction);
    keyButton.addEventListener(EventNames.MOUSEDOWN, handleMouseDown);

    return keyButton;
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
    if (!boundedInput || document.activeElement !== boundedInput) return;
    if (code === KeyCodes.SHIFT) updateKeys(false);
  };
  const handleShift = ({
    altKey, shiftKey, which: code, repeat,
  }) => {
    if (!boundedInput || document.activeElement !== boundedInput) return;
    if (repeat) return;
    if (code === KeyCodes.SHIFT) updateKeys(altKey && shiftKey);
  };
  const handleCapsLock = ({ which: code, repeat }) => {
    if (!boundedInput || document.activeElement !== boundedInput) return;
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
  
  console.log(buttonMap);
  const buttons = [...buttonMap.values()].map(({ button }) => button);
  keyboard.append(...buttons);
  body.append(keyboard);
};

initKeyboard();
