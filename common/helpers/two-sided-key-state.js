export default class TwoSidedKeyState {
  constructor(leftSideCode, rightSideCode) {
    this.left = {
      code: leftSideCode,
      pressed: {
        mouse: false,
        keyboard: false,
      },
    };
    this.right = {
      code: rightSideCode,
      pressed: {
        mouse: false,
        keyboard: false,
      },
    };
  }

  get isPressed() {
    const isleftPressed = this.left.pressed.mouse || this.left.pressed.keyboard;
    const isRightPressed = this.right.pressed.mouse || this.right.pressed.keyboard;
    return isleftPressed || isRightPressed;
  }

  toggle(code, device, force) {
    const currentSide = this.left.code === code ? this.left : this.right;
    currentSide.pressed[device] = force;
  }
}
