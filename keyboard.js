import './style.css';

const { body } = window.document;
const input = document.querySelector('textarea');

const createButton = (key) => {
  const pressState = {
    mouse: false,
    keyboard: false,
  };

  const keyButton = document.createElement('button');
  keyButton.textContent = key;

  const typeChar = (char) => {
    if (!input) return;

    const { selectionStart, selectionEnd } = input;
    const startText = input.value.substring(0, selectionStart);
    const endText = input.value.substring(selectionEnd, input.value.length);

    input.value = startText + char + endText;
    input.selectionEnd = selectionStart + char.length;
    input.selectionStart = selectionStart + char.length;
  };
  const handleMouseUp = (e) => {
    e.preventDefault();

    pressState.mouse = false;
    if (!pressState.keyboard && !pressState.mouse) {
      keyButton.classList.remove('pressed');
    }
    document.removeEventListener('mouseup', handleMouseUp);
  };
  const handleKeyUp = () => {
    pressState.keyboard = false;
    if (!pressState.keyboard && !pressState.mouse) {
      keyButton.classList.remove('pressed');
    }
    document.removeEventListener('keyup', handleMouseUp);
  };
  const handleMouseDown = (e) => {
    e.preventDefault();

    pressState.mouse = true;
    keyButton.classList.add('pressed');
    typeChar(key, input);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleKeyDown = (e) => {
    if (e.key !== key) return;
    
    keyButton.classList.add('pressed');
    pressState.keyboard = true;
    document.addEventListener('keyup', handleKeyUp);
  };

  keyButton.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);

  return keyButton;
};

const initKeyboard = () => {
  const keyboard = document.createElement('div');
  const keys = `qwertyuiop[]asdfghjkl;'zxcvbnm,./`;
  const keyboardButtons = keys.split('').map(createButton);

  const dropBlur = (event) => event.preventDefault();

  keyboard.classList.add('keyboard');
  keyboard.addEventListener('click', dropBlur);

  keyboard.append(...keyboardButtons);
  body.append(keyboard);
}

initKeyboard();
