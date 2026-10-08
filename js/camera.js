import { Config } from "./config.js";

export class Camera {

    constructor() {
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };

        this.minZoom = Config.camera.minZoom;
        this.maxZoom = Config.camera.maxZoom;
    }

    clipToWorld(point) {
        return {
            x: (point.x - this.pan.x) / this.zoom,
            y: (point.y - this.pan.y) / this.zoom
        };
    }

    zoomAt(point, factor) {
        const worldPoint = this.clipToWorld(point);

        const newZoom = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, this.zoom * factor)
        );

        this.zoom = newZoom;

        this.pan.x = point.x - worldPoint.x * this.zoom;
        this.pan.y = point.y - worldPoint.y * this.zoom;
    }

    panBy(x, y) {
        this.pan.x += x;
        this.pan.y += y;
    }

    reset() {
        this.zoom = 1;
        this.pan.x = 0;
        this.pan.y = 0;
    }
}
