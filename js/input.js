import { StrokeAction } from "./actions/strokeAction.js";

export class Input {

    constructor(canvas, grid, onChange, onActionCompleted) {
        this.canvas = canvas;
        this.grid = grid;

        this.onChange = onChange;
        this.onActionCompleted = onActionCompleted;

        this.brushType = "circle";
        this.brushSize = 1;

        this.currentStroke = null;

        canvas.addEventListener("mousedown", (event) => {
            if (event.button !== 0) {
                return;
            }

            this.startStroke(event);
        });

        canvas.addEventListener("mousemove", (event) => {
            if (!this.currentStroke) {
                return;
            }

            this.continueStroke(event);
        });

        window.addEventListener("mouseup", (event) => {
            if (event.button !== 0) {
                return;
            }

            this.endStroke();
        });
    }

    setGrid(grid) {
        this.grid = grid;
    }

    setBrushType(type) {
        this.brushType = type;
    }

    setBrushSize(size) {
        this.brushSize = size;
    }

    startStroke(event) {
        this.currentStroke = new StrokeAction(this.brushType, this.brushSize);
        this.addStrokePoint(event);
    }

    continueStroke(event) {
        this.addStrokePoint(event);
    }

    endStroke() {
        if (!this.currentStroke) {
            return;
        }

        if (this.currentStroke.points.length > 0) {
            this.onActionCompleted(this.currentStroke);
        }

        this.currentStroke = null;
    }

    cancelStroke() {
        this.currentStroke = null;
    }

    addStrokePoint(event) {
        const point = this.getGridPosition(event);

        if (!this.grid.isInside(point.x, point.y)) {
            return;
        }

        const addedPoint = this.currentStroke.addPoint(point.x, point.y);

        if (!addedPoint) {
            return;
        }

        this.currentStroke.applyPoint(this.grid, addedPoint);
        this.onChange();
    }

    getGridPosition(event) {
        const rect = this.canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const cellWidth = rect.width / this.grid.width;
        const cellHeight = rect.height / this.grid.height;

        return {
            x: Math.floor(mouseX / cellWidth),
            y: Math.floor(mouseY / cellHeight)
        };
    }
}