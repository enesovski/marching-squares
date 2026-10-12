
import { StrokeAction } from "./actions/strokeAction.js";
import { Config } from "./config.js";

export class Input {
    constructor(canvas, grid, camera, onChange, onActionCompleted, preview) {
        this.canvas = canvas;
        this.grid = grid;
        this.camera = camera;
        this.onChange = onChange;
        this.onActionCompleted = onActionCompleted;

        this.brushType = Config.brush.defaultType;
        this.brushSize = Config.brush.defaultSize;
        this.tool = "brush";
        this.currentStroke = null;
        this.isPanning = false;
        this.preview = preview;

        this.lastPanPoint = null;

        canvas.addEventListener("mousedown", event => {
            if (event.button === 1 || (event.button === 0 && this.tool === "pan")) {
                event.preventDefault();
                this.startPan(event);
            } else if (event.button === 0) {
                this.startStroke(event);
            }
        });


        canvas.addEventListener("mousemove", event => {
            this.updatePreview(event);

            if (this.isPanning) {
                this.continuePan(event);
            } else if (this.currentStroke) {
                this.continueStroke(event);
            }
        });

        canvas.addEventListener("mouseenter", event => {
            this.updatePreview(event);
        });

        canvas.addEventListener("mouseleave", () => {
            this.lastPointer = null;
            this.preview.hidden = true;
        });

        window.addEventListener("mouseup", event => {
            if (event.button === 0 || event.button === 1) this.endPan();
            if (event.button === 0) this.endStroke();
        });

        canvas.addEventListener("wheel", event => {
            event.preventDefault();
            const point = this.getClipPosition(event);
            const factor = event.deltaY < 0 ? Config.camera.zoomFactor : 1 / Config.camera.zoomFactor;
            this.camera.zoomAt(point, factor);
            this.onChange();
        }, { passive: false });

        canvas.addEventListener("contextmenu", event => event.preventDefault());
    }


    setGrid(grid) {
        this.grid = grid;
        this.updatePreview();
    }

    setBrushType(type) {
        this.brushType = type;
        this.updatePreview();
    }

    setBrushSize(size) {
        this.brushSize = size;
        this.updatePreview();
    }

    setTool(tool) {
        if (!["brush", "erase", "pan"].includes(tool)) return;

        this.cancelStroke();
        this.endPan();
        this.tool = tool;

        this.canvas.classList.toggle("pan-mode", tool === "pan");
        this.updatePreview();
    }

    startStroke(event) {
        const cellValue = this.tool === "erase" ? 0 : 1;

        this.currentStroke = new StrokeAction(
            this.brushType,
            this.brushSize,
            cellValue
        );

        this.addStrokePoint(event);
    }

    continueStroke(event) { this.addStrokePoint(event); }

    endStroke() {
        if (!this.currentStroke) return;
        if (this.currentStroke.points.length > 0) {
            this.onActionCompleted(this.currentStroke);
        }
        this.currentStroke = null;
    }

    cancelStroke() { this.currentStroke = null; }

    addStrokePoint(event) {
        const point = this.getGridPosition(event);
        if (!this.grid.isInside(point.x, point.y)) return;
        const addedPoints = this.currentStroke.addPoint(point.x, point.y);
        if (addedPoints.length === 0) return;
        for (const addedPoint of addedPoints) {
            this.currentStroke.applyPoint(this.grid, addedPoint);
        }
        this.onChange();
    }

    startPan(event) {
        this.isPanning = true;
        this.lastPanPoint = this.getClipPosition(event);
        this.canvas.classList.add("panning");
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
        this.canvas.classList.remove("panning");
    }

    getClipPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: 1 - ((event.clientY - rect.top) / rect.height) * 2
        };
    }

    getGridPosition(event) {
        const clipPoint = this.getClipPosition(event);
        const worldPoint = this.camera.clipToWorld(clipPoint);
        return {
            x: Math.floor(((worldPoint.x + 1) / 2) * this.grid.width),
            y: Math.floor(((1 - worldPoint.y) / 2) * this.grid.height)
        };
    }

    
    updatePreview(event) {
        if (event) {
            this.lastPointer = {
                clientX: event.clientX,
                clientY: event.clientY
            };
        }

        if (!this.lastPointer || this.tool === "pan") {
            this.preview.hidden = true;
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const { clientX, clientY } = this.lastPointer;

        const insideCanvas =
            clientX >= rect.left && clientX < rect.right &&
            clientY >= rect.top && clientY < rect.bottom;

        const cell = this.getGridPosition(this.lastPointer);

        if (!insideCanvas || !this.grid.isInside(cell.x, cell.y)) {
            this.preview.hidden = true;
            return;
        }

        const worldX = (cell.x + 0.5) * 2 / this.grid.width - 1;
        const worldY = 1 - (cell.y + 0.5) * 2 / this.grid.height;
        const halfHeight = rect.height / 2;
        const scale = rect.height * this.camera.zoom;

        this.preview.style.left =
            `${rect.width / 2 + (worldX * this.camera.zoom + this.camera.pan.x) * halfHeight}px`;

        this.preview.style.top =
            `${halfHeight - (worldY * this.camera.zoom + this.camera.pan.y) * halfHeight}px`;

        this.preview.style.width = `${scale * this.brushSize / this.grid.width}px`;
        this.preview.style.height = `${scale * this.brushSize / this.grid.height}px`;

        this.preview.classList.toggle("round", this.brushType === "circle");
        this.preview.classList.toggle("erasing", this.tool === "erase");
        this.preview.hidden = false;
    }

}
