import { Action } from "./action.js";

export class StrokeAction extends Action {

    constructor(brushType, brushSize) {
        super();

        this.brushType = brushType;
        this.brushSize = brushSize;
        this.points = [];
    }

    addPoint(x, y) {
        const lastPoint = this.points[this.points.length - 1];

        if (lastPoint && lastPoint.x === x && lastPoint.y === y) {
            return null;
        }

        const point = { x, y };
        this.points.push(point);

        return point;
    }

    apply(grid) {
        for (const point of this.points) {
            this.applyPoint(grid, point);
        }
    }

    applyPoint(grid, point) {
        if (this.brushType === "circle") {
            this.applyCircleBrush(grid, point.x, point.y);
            return;
        }

        this.applySquareBrush(grid, point.x, point.y);
    }

    applyCircleBrush(grid, centerX, centerY) {
        const radius = Math.floor(this.brushSize / 2);

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                const dx = x - centerX;
                const dy = y - centerY;

                if (dx * dx + dy * dy <= radius * radius) {
                    grid.setCell(x, y, 1);
                }
            }
        }
    }

    applySquareBrush(grid, centerX, centerY) {
        const radius = Math.floor(this.brushSize / 2);

        for (let y = centerY - radius; y <= centerY + radius; y++) {
            for (let x = centerX - radius; x <= centerX + radius; x++) {
                grid.setCell(x, y, 1);
            }
        }
    }
}