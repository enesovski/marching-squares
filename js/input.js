import { StrokeAction } from "./actions/strokeAction.js";

export class Input {

    constructor(canvas, grid, camera, onChange, onActionCompleted) {
        this.canvas = canvas;
        this.grid = grid;
        this.camera = camera;

        this.onChange = onChange;
        this.onActionCompleted = onActionCompleted;

        this.brushType = "circle";
        this.brushSize = 1;

        this.currentStroke = null;

        this.isPanning = false;
        this.lastPanPoint = null;

        canvas.addEventListener("mousedown", (event) => {
            if (event.button === 1) {
                event.preventDefault();
                this.startPan(event);
                return;
            }

            if (event.button === 0) {
                this.startStroke(event);
            }
        });

        canvas.addEventListener("mousemove", (event) => {
            if (this.isPanning) {
                this.continuePan(event);
                return;
            }

            if (this.currentStroke) {
                this.continueStroke(event);
            }
        });

        window.addEventListener("mouseup", (event) => {
            if (event.button === 1) {
                this.endPan();
                return;
            }

            if (event.button === 0) {
                this.endStroke();
            }
        });

        canvas.addEventListener("wheel", (event) => {
            event.preventDefault();

            const point = this.getClipPosition(event);

            const factor = event.deltaY < 0
                ? 1.1
                : 1 / 1.1;

            this.camera.zoomAt(point, factor);
            this.onChange();
        }, { passive: false });

        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
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

        const addedPoints = this.currentStroke.addPoint(point.x, point.y);

        if (addedPoints.length === 0) {
            return;
        }

        for (const addedPoint of addedPoints) {
            this.currentStroke.applyPoint(this.grid, addedPoint);
        }

        this.onChange();
    }

    startPan(event) {
        this.isPanning = true;
        this.lastPanPoint = this.getClipPosition(event);
    }

    continuePan(event) {
        const point = this.getClipPosition(event);

        const dx = point.x - this.lastPanPoint.x;
        const dy = point.y - this.lastPanPoint.y;

        this.camera.panBy(dx, dy);

        this.lastPanPoint = point;

        this.onChange();
    }

    endPan() {
        this.isPanning = false;
        this.lastPanPoint = null;
    }

    getClipPosition(event) {
        const rect = this.canvas.getBoundingClientRect();

        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = 1 - ((event.clientY - rect.top) / rect.height) * 2;

        return { x, y };
    }

    getGridPosition(event) {
        const clipPoint = this.getClipPosition(event);
        const worldPoint = this.camera.clipToWorld(clipPoint);

        return {
            x: Math.floor(((worldPoint.x + 1) / 2) * this.grid.width),
            y: Math.floor(((1 - worldPoint.y) / 2) * this.grid.height)
        };
    }
}