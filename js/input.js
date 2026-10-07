export class Input {

    constructor(canvas, grid, onChange) {
        this.canvas = canvas;
        this.grid = grid;
        this.onChange = onChange;

        this.brushType = "circle";
        this.brushSize = 1;

        canvas.addEventListener("mousedown", (event) => {
            this.handleMouse(event);
        });

        canvas.addEventListener("mousemove", (event) => {
            if (event.buttons === 1) {
                this.handleMouse(event);
            }
        });
    }

    setBrushType(type) {
        this.brushType = type;
    }

    setBrushSize(size) {
        this.brushSize = size;
    }

    handleMouse(event) {
        const rect = this.canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const cellWidth = rect.width / this.grid.width;
        const cellHeight = rect.height / this.grid.height;

        // Grid coordinates where integer positions represent cell centers.
        const mouseGridX = mouseX / cellWidth - 0.5;
        const mouseGridY = mouseY / cellHeight - 0.5;

        this.applyBrush(mouseGridX, mouseGridY);

        this.onChange();
    }

    applyBrush(mouseX, mouseY) {
        if (this.brushType === "circle") {
            this.applyCircleBrush(mouseX, mouseY);
        } else {
            this.applySquareBrush(mouseX, mouseY);
        }
    }

    applyCircleBrush(mouseX, mouseY) {
        const radius = this.brushSize;

        const minX = Math.floor(mouseX - radius);
        const maxX = Math.ceil(mouseX + radius);
        const minY = Math.floor(mouseY - radius);
        const maxY = Math.ceil(mouseY + radius);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = x - mouseX;
                const dy = y - mouseY;

                if (dx * dx + dy * dy <= radius * radius) {
                    this.grid.setCell(x, y, 1);
                }
            }
        }
    }

    applySquareBrush(mouseX, mouseY) {
        const radius = this.brushSize;

        const minX = Math.floor(mouseX - radius);
        const maxX = Math.ceil(mouseX + radius);
        const minY = Math.floor(mouseY - radius);
        const maxY = Math.ceil(mouseY + radius);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = Math.abs(x - mouseX);
                const dy = Math.abs(y - mouseY);

                if (dx <= radius && dy <= radius) {
                    this.grid.setCell(x, y, 1);
                }
            }
        }
    }
}