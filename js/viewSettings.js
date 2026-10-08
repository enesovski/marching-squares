export const ViewMode = Object.freeze({
    GRID: "grid",
    MARCHING: "marching"
});

export class ViewSettings {

    constructor() {
        this.mode = ViewMode.GRID;

        this.gridLinesVisible = true;
        this.marchingFillVisible = true;
        this.marchingBoundaryVisible = true;
    }

    setMode(mode) {
        if (!Object.values(ViewMode).includes(mode)) {
            throw new Error(`Unknown view mode: ${mode}`);
        }

        this.mode = mode;
    }

    setGridLinesVisible(visible) {
        this.gridLinesVisible = visible;
    }

    setMarchingFillVisible(visible) {
        this.marchingFillVisible = visible;
    }

    setMarchingBoundaryVisible(visible) {
        this.marchingBoundaryVisible = visible;
    }
}