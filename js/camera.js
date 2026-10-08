import { Config } from "./config.js";

export class Camera {

    constructor() {
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.aspectRatio = 1;

        this.minZoom = Config.camera.minZoom;
        this.maxZoom = Config.camera.maxZoom;
    }

    setAspectRatio(aspectRatio) {
        this.aspectRatio = aspectRatio;
    }

    clipToWorld(point) {
        return {
            x: (point.x * this.aspectRatio - this.pan.x) / this.zoom,
            y: (point.y - this.pan.y) / this.zoom
        };
    }

    zoomAt(point, factor) {
        const worldPoint = this.clipToWorld(point);

        this.zoom = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, this.zoom * factor)
        );

        this.pan.x = point.x * this.aspectRatio - worldPoint.x * this.zoom;
        this.pan.y = point.y - worldPoint.y * this.zoom;
    }

    panBy(x, y) {
        this.pan.x += x * this.aspectRatio;
        this.pan.y += y;
    }

    reset() {
        this.zoom = 1;
        this.pan.x = 0;
        this.pan.y = 0;
    }
}