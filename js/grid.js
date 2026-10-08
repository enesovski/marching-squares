export class Grid {

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.cells = new Array(width * height).fill(0);
        this.colors = new Array(width * height).fill(null);
    }

    isInside(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getCell(x, y) {
        if (!this.isInside(x, y)) {
            return 0;
        }

        return this.cells[y * this.width + x];
    }

    setCell(x, y, value) {
        if (!this.isInside(x, y)) {
            return;
        }

        this.cells[y * this.width + x] = value;
    }

    clear() {
        this.cells.fill(0);
    }
}