import './style.css';
import {
  createElement,
  cancelBlur,
  keyboardMapping,
  ClassNames,
  EventNames,
  TagNames,
  Devices,
} from './common/common';

const { body } = window.document;

const initKeyboard = () => {
  const boundedInput = document.querySelector('textarea');
  const buttonMap = new Map();

  const updateKeyboardStyles = (force, code, stateName) => {
    const { pressState, button } = buttonMap.get(code);
    pressState[stateName] = force;
    const condition = !pressState.keyboard && !pressState.mouse;

    if (force ? !condition : condition) {
      button.classList.toggle(ClassNames.PRESSED, force);
    }
  };

  const createKeyButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping.en[codeIndex];

    const typeChar = (char) => {
      const { selectionStart, selectionEnd } = boundedInput;
      const startText = boundedInput.value.substring(0, selectionStart);
      const endText = boundedInput.value.substring(selectionEnd, boundedInput.value.length);

      boundedInput.value = startText + char + endText;
      boundedInput.selectionEnd = selectionStart + char.length;
      boundedInput.selectionStart = selectionStart + char.length;
    };
    const handleMouseUp = (event) => {
      cancelBlur(event);
      updateKeyboardStyles(false, code, Devices.MOUSE);
      document.removeEventListener(EventNames.MOUSEUP, handleMouseUp);
    };
    const handleMouseDown = (event) => {
      if (!boundedInput || document.activeElement !== boundedInput) return;

      cancelBlur(event);
      updateKeyboardStyles(true, code, Devices.MOUSE);
      typeChar(key, boundedInput);
      document.addEventListener(EventNames.MOUSEUP, handleMouseUp);
    };

    const keyButton = createElement(TagNames.BUTTON, null, null, key);
    keyButton.addEventListener(EventNames.MOUSEDOWN, handleMouseDown);

    return keyButton;
  };

  keyboardMapping.keyCodes.reduce((map, code) => {
    const button = createKeyButton(code);
    const pressState = { mouse: false, keyboard: false };
    return map.set(code, { button, pressState });
  }, buttonMap);

  const keyboard = createElement(TagNames.DIV, Devices.KEYBOARD);
  keyboard.addEventListener(EventNames.MOUSEDOWN, cancelBlur);

  const handleKeyUp = ({ which: code }) => {
    updateKeyboardStyles(false, code, Devices.KEYBOARD);
  };
  const handleKeyDown = (event) => {
    if (!boundedInput || document.activeElement !== boundedInput) return;

    const { which: code, shiftKey, altKey } = event;
    const isChangeLanguage = altKey && shiftKey;

    updateKeyboardStyles(true, code, Devices.KEYBOARD);

    if (isChangeLanguage) console.log('language is changed!');
  };

  document.addEventListener(EventNames.KEYDOWN, handleKeyDown);
  document.addEventListener(EventNames.KEYUP, handleKeyUp);

  const buttons = [...buttonMap.values()].map(({ button }) => button);
  keyboard.append(...buttons);
  body.append(keyboard);
};

initKeyboard();
