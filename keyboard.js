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
  TwoSidedKeyState,
  LangList,
  SpecialKeySybols,
  STORAGE_KEY,
} from './common/common';

const { body } = window.document;
const initLang = localStorage.getItem(STORAGE_KEY) || Languages.EN;
const langList = new LangList([Languages.EN, Languages.RU], initLang);
const altCodes = [KeyCodes.ALT_LEFT, KeyCodes.ALT_RIGHT];
const shiftCodes = [KeyCodes.SHIFT_LEFT, KeyCodes.SHIFT_RIGHT];
const removeChars = [KeyCodes.DELETE, KeyCodes.BACKSPACE];
const controlKeys = [KeyCodes.CTRL_LEFT, KeyCodes.CTRL_RIGHT, KeyCodes.WIN];

export default () => {
  const shiftState = new TwoSidedKeyState(...shiftCodes);
  const altState = new TwoSidedKeyState(...altCodes);
  let isCapsed = false;
  const boundedInput = document.querySelector(TagNames.TEXTAREA);
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

  const cropText = (selectionStart, selectionEnd, insertionStr = '') => {
    const inputText = boundedInput.value;
    const startText = inputText.substring(0, selectionStart);
    const endText = inputText.substring(selectionEnd, inputText.length);

    boundedInput.value = startText + insertionStr + endText;
    boundedInput.selectionEnd = selectionStart + insertionStr.length;
    boundedInput.selectionStart = selectionStart + insertionStr.length;
  };
  const removeChar = (forceShift) => {
    let { selectionStart, selectionEnd } = boundedInput;
    const startIndex = 0;
    const isRangedSelection = selectionStart !== selectionEnd;
    if (!isRangedSelection) {
      if (forceShift) {
        selectionEnd += 1;
      } else {
        selectionStart = Math.max(selectionStart - 1, startIndex);
      }
    }

    cropText(selectionStart, selectionEnd);
  };
  const typeChar = (code) => {
    const charIndex = keyboardMapping.keyCodes.indexOf(code);
    const isUpperCased = isCapsed ? !shiftState.isPressed : shiftState.isPressed;
    let keyboardMappingProperty = langList.current;
    if (isUpperCased) keyboardMappingProperty += KeyCodes.SHIFT;
    const chars = keyboardMapping[keyboardMappingProperty];
    let char = chars[charIndex];
    if (code === KeyCodes.SPACE) char = SpecialKeySybols.SPACE;
    if (code === KeyCodes.TAB) char = SpecialKeySybols.TAB;
    if (code === KeyCodes.ENTER) char = SpecialKeySybols.ENTER;
    if (controlKeys.some((value) => value === code)) char = '';

    const { selectionStart, selectionEnd } = boundedInput;

    cropText(selectionStart, selectionEnd, char);
  };
  const setupMouseHandlers = (code, typeAction, onUpAction) => {
    const handleMouseUp = (event) => {
      cancelBlur(event);
      toggleKeyboardStyles(false, code, Devices.MOUSE);
      if (onUpAction) onUpAction();
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
  const updateKeys = () => {
    const isUpperCased = isCapsed ? !shiftState.isPressed : shiftState.isPressed;
    let keyboardMappingProperty = langList.current;
    if (isUpperCased) keyboardMappingProperty += KeyCodes.SHIFT;
    const chars = keyboardMapping[keyboardMappingProperty];

    [...buttonMap.entries()].forEach(([code, { button }]) => {
      const updatedButton = button;
      const codeIndex = keyboardMapping.keyCodes.indexOf(code);
      const newChar = chars[codeIndex];
      updatedButton.textContent = newChar;
    });
  };
  const createActionInvokers = (code) => {
    if (code === KeyCodes.BACKSPACE) return [() => removeChar(false)];
    if (code === KeyCodes.DELETE) return [() => removeChar(true)];
    if (shiftCodes.some((value) => value === code)) {
      const onDownAction = () => {
        if (!shiftState.isPressed && altState.isPressed) langList.getNext();
        shiftState.toggle(code, Devices.MOUSE, true);
        updateKeys();
      };
      const onUpAction = () => {
        shiftState.toggle(code, Devices.MOUSE, false);
        updateKeys();
      };
      return [onDownAction, onUpAction];
    }
    if (altCodes.some((value) => value === code)) {
      const onDownAction = () => {
        if (shiftState.isPressed && !altState.isPressed) langList.getNext();
        altState.toggle(code, KeyCodes.MOUSE, true);
        updateKeys();
      };
      const onUpAction = () => altState.toggle(code, KeyCodes.MOUSE, false);
      return [onDownAction, onUpAction];
    }
    return [() => typeChar(code)];
  };
  const createKeyButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping[langList.current][codeIndex];
    const keyButton = createElement(TagNames.BUTTON, null, null, key);
    const [onDownAction, onUpAction] = createActionInvokers(code);
    const [handleMouseDown] = setupMouseHandlers(code, onDownAction, onUpAction);
    keyButton.addEventListener(EventNames.MOUSEDOWN, handleMouseDown);

    return keyButton;
  };
  const createCapsButton = (code) => {
    const codeIndex = keyboardMapping.keyCodes.indexOf(code);
    const key = keyboardMapping[langList.current][codeIndex];
    const capsButton = createElement(TagNames.BUTTON, null, null, key);
    const handlePushCapsLock = () => {
      isCapsed = !isCapsed;
      updateKeys();
      setKeyboardStyles(isCapsed, code);
    };
    capsButton.addEventListener(EventNames.CLICK, handlePushCapsLock);

    return capsButton;
  };
  const pickCreateFunction = (code) => {
    if (code === KeyCodes.CAPS_LOCK) return createCapsButton;
    return createKeyButton;
  };

  keyboardMapping.keyCodes.reduce((map, code, index) => {
    const buttonCreateFunction = pickCreateFunction(code);
    const button = buttonCreateFunction(code);
    button.classList.add(keyboardMapping.classes[index]);
    const pressState = { mouse: false, keyboard: false };
    return map.set(code, { button, pressState });
  }, buttonMap);

  const keyboard = createElement(TagNames.DIV, Devices.KEYBOARD);
  keyboard.addEventListener(EventNames.MOUSEDOWN, cancelBlur);

  const createHandleKey = (force) => (event) => {
    event.preventDefault();

    if (!boundedInput || document.activeElement !== boundedInput) return;

    const { code, repeat } = event;
    if (!buttonMap.has(code)) return;

    if (KeyCodes.TAB === code && force) {
      typeChar(code);
      return;
    }
    if (altCodes.some((alt) => alt === code)) {
      if (repeat) return;

      altState.toggle(code, Devices.KEYBOARD, force);
      toggleKeyboardStyles(force, code, Devices.KEYBOARD);
      if (shiftState.isPressed && force) {
        langList.getNext();
        updateKeys();
      }
      return;
    }
    if (shiftCodes.some((shift) => shift === code)) {
      if (repeat) return;

      if (altState.isPressed) langList.getNext();
      shiftCodes.forEach((shift) => toggleKeyboardStyles(force, shift, Devices.KEYBOARD));
      shiftState.toggle(code, Devices.KEYBOARD, force);
      updateKeys();
      return;
    }
    if (code === KeyCodes.CAPS_LOCK) {
      if (repeat || !force) return;

      isCapsed = !isCapsed;
      updateKeys();
      setKeyboardStyles(isCapsed, code);
      return;
    }
    if (removeChars.some((value) => value === code)) {
      if (force) removeChar(code === KeyCodes.DELETE);
      setKeyboardStyles(force, code);
      return;
    }
    if (force) typeChar(code);
    toggleKeyboardStyles(force, code, Devices.KEYBOARD);
  };
  const handleRefreshFocus = (event) => {
    if (event.target === body) event.preventDefault();
  };
  const handleKeyUp = createHandleKey(false);
  const handleKeyDown = createHandleKey(true);
  document.addEventListener(EventNames.KEYDOWN, handleKeyDown);
  document.addEventListener(EventNames.KEYUP, handleKeyUp);
  document.addEventListener(EventNames.MOUSEDOWN, handleRefreshFocus);

  const buttons = [...buttonMap.values()].map(({ button }) => button);
  keyboard.append(...buttons);
  body.append(keyboard);
};
