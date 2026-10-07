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

        const gridX = Math.floor(mouseX / cellWidth);
        const gridY = Math.floor(mouseY / cellHeight);

        this.applyBrush(gridX, gridY);

        this.onChange();
    }

    applyBrush(centerX, centerY) {
        if (this.brushType === "circle") {
            this.applyCircleBrush(centerX, centerY);
        } else {
            this.applySquareBrush(centerX, centerY);
        }
    }

    applyCircleBrush(centerX, centerY) {
        const radius = Math.floor(this.brushSize / 2);

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                const dx = x - centerX;
                const dy = y - centerY;

                if (dx * dx + dy * dy <= radius * radius) {
                    this.grid.setCell(x, y, 1);
                }
            }
        }
    }

    applySquareBrush(centerX, centerY) {
        const radius = Math.floor(this.brushSize / 2);

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                this.grid.setCell(x, y, 1);
            }
        }
    }
}