import { Action } from "./action.js";

export class StrokeAction extends Action {

    constructor(brushType, brushSize) {
        super();

        this.brushType = brushType;
        this.brushSize = brushSize;
        this.points = [];
    }

    toData() {
        return {
            type: "stroke",
            brushType: this.brushType,
            brushSize: this.brushSize,
            points: this.points
        };
    }

addPoint(x, y) {
    if (this.points.length === 0) {
        const point = { x, y };
        this.points.push(point);
        return [point];
    }

    const lastPoint = this.points[this.points.length - 1];

    if (lastPoint.x === x && lastPoint.y === y) {
        return [];
    }

    const newPoints = this.getLinePoints(lastPoint.x, lastPoint.y, x, y);

    for (const point of newPoints) {
        this.points.push(point);
    }

    return newPoints;
}

    getLinePoints(startX, startY, endX, endY) {
        const points = [];

        let x = startX;
        let y = startY;

        const dx = endX - startX;
        const dy = endY - startY;

        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);

        const distanceX = Math.abs(dx);
        const distanceY = Math.abs(dy);

        let movedX = 0;
        let movedY = 0;

        while (movedX < distanceX || movedY < distanceY) {
            const progressX = distanceX === 0
                ? Infinity
                : (movedX + 0.5) / distanceX;

            const progressY = distanceY === 0
                ? Infinity
                : (movedY + 0.5) / distanceY;

            if (progressX <= progressY && movedX < distanceX) {
                x += stepX;
                movedX++;
            } else {
                y += stepY;
                movedY++;
            }

            points.push({ x, y });
        }

        return points;
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