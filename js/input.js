export class Input {

    constructor(canvas, grid, onChange) {
        this.canvas = canvas;
        this.grid = grid;
        this.onChange = onChange;

        canvas.addEventListener("mousedown", (event) => {
            this.handleMouse(event);
        });

        canvas.addEventListener("mousemove", (event) => {
            if (event.buttons === 1) {
                this.handleMouse(event);
            }
        });
    }

    handleMouse(event) {
        const rect = this.canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const cellWidth = rect.width / this.grid.width;
        const cellHeight = rect.height / this.grid.height;

        const gridX = Math.floor(mouseX / cellWidth);
        const gridY = Math.floor(mouseY / cellHeight);

        this.grid.setCell(gridX, gridY, 1);

        this.onChange();
    }
}