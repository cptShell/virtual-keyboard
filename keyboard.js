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
  const createKeyButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping.en[codeIndex];
  
    const typeChar = (char) => {
      const { selectionStart, selectionEnd } = bondedInput;
      const startText = bondedInput.value.substring(0, selectionStart);
      const endText = bondedInput.value.substring(selectionEnd, bondedInput.value.length);
  
      bondedInput.value = startText + char + endText;
      bondedInput.selectionEnd = selectionStart + char.length;
      bondedInput.selectionStart = selectionStart + char.length;
    };
    const handleMouseUp = (event) => {
      cancelBlur(event);
      updateKeyboardStyles(false, code, Devices.MOUSE);
      document.removeEventListener(EventNames.MOUSEUP, handleMouseUp);
    };
    const handleMouseDown = (event) => {
      if (!bondedInput || document.activeElement !== bondedInput) return;

      cancelBlur(event);
      updateKeyboardStyles(true, code, Devices.MOUSE);
      typeChar(key, bondedInput);
      document.addEventListener(EventNames.MOUSEUP, handleMouseUp);
    };

    const keyButton = createElement(TagNames.BUTTON, null, null, key);
    keyButton.addEventListener(EventNames.MOUSEDOWN, handleMouseDown);

    return keyButton;
  };

  const buttonMap = keyboardMapping.keyCodes.reduce((map, code) => {
    const button = createKeyButton(code);
    const pressState = { mouse: false, keyboard: false };
    return map.set(code, { button, pressState });
  }, new Map());

  const bondedInput = document.querySelector('textarea');
  const keyboard = createElement(TagNames.DIV);
  keyboard.classList.add(Devices.KEYBOARD);
  keyboard.addEventListener(EventNames.MOUSEDOWN, cancelBlur);

  const updateKeyboardStyles = (force, code, stateName) => {
    const { pressState, button } = buttonMap.get(code);
    pressState[stateName] = force;
    const condition = !pressState.keyboard && !pressState.mouse;

    if (force ? !condition : condition) {
      button.classList.toggle(ClassNames.PRESSED, force);
    }
  }

  const handleKeyUp = ({which: code}) => {
    updateKeyboardStyles(false, code, Devices.KEYBOARD);
  };
  const handleKeyDown = (event) => {
    if (!bondedInput || document.activeElement !== bondedInput) return;

    const { which: code, shiftKey, altKey } = event;
    updateKeyboardStyles(true, code, Devices.KEYBOARD);

    const isChangeLanguage = altKey && shiftKey;
    console.log(isChangeLanguage);
  };

  document.addEventListener(EventNames.KEYDOWN, handleKeyDown);
  document.addEventListener(EventNames.KEYUP, handleKeyUp);

  const buttons = [...buttonMap.values()].map(({ button }) => button);
  keyboard.append(...buttons);
  body.append(keyboard);
}

initKeyboard();
