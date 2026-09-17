export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mouseDown = false;
        this.mouseClicked = false;
        this.scrollDelta = 0;
        this._boundKeyDown = this._onKeyDown.bind(this);
        this._boundKeyUp = this._onKeyUp.bind(this);
        this._boundMouseMove = this._onMouseMove.bind(this);
        this._boundMouseDown = this._onMouseDown.bind(this);
        this._boundMouseUp = this._onMouseUp.bind(this);
        this._boundWheel = this._onWheel.bind(this);
        this._boundContextMenu = (e) => e.preventDefault();
        window.addEventListener('keydown', this._boundKeyDown);
        window.addEventListener('keyup', this._boundKeyUp);
        canvas.addEventListener('mousemove', this._boundMouseMove);
        canvas.addEventListener('mousedown', this._boundMouseDown);
        canvas.addEventListener('mouseup', this._boundMouseUp);
        canvas.addEventListener('wheel', this._boundWheel);
        canvas.addEventListener('contextmenu', this._boundContextMenu);
    }

    _onKeyDown(e) {
        this.keys[e.code] = true;
    }

    _onKeyUp(e) {
        this.keys[e.code] = false;
    }

    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mousePos.x = (e.clientX - rect.left) * scaleX;
        this.mousePos.y = (e.clientY - rect.top) * scaleY;
    }

    _onMouseDown(e) {
        if (e.button === 0) {
            this.mouseDown = true;
            this.mouseClicked = true;
        }
    }

    _onMouseUp(e) {
        if (e.button === 0) {
            this.mouseDown = false;
        }
    }

    _onWheel(e) {
        this.scrollDelta += e.deltaY;
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    isKeyJustPressed(code) {
        return !!this.keys[code];
    }

    consumeClick() {
        if (this.mouseClicked) {
            this.mouseClicked = false;
            return true;
        }
        return false;
    }

    consumeScroll() {
        const d = this.scrollDelta;
        this.scrollDelta = 0;
        return d;
    }

    destroy() {
        window.removeEventListener('keydown', this._boundKeyDown);
        window.removeEventListener('keyup', this._boundKeyUp);
        this.canvas.removeEventListener('mousemove', this._boundMouseMove);
        this.canvas.removeEventListener('mousedown', this._boundMouseDown);
        this.canvas.removeEventListener('mouseup', this._boundMouseUp);
        this.canvas.removeEventListener('wheel', this._boundWheel);
        this.canvas.removeEventListener('contextmenu', this._boundContextMenu);
    }
}
