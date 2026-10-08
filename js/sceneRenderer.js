import { ViewMode } from "./viewSettings.js";

export class SceneRenderer {

    constructor(renderer, marchingSquares) {
        this.renderer = renderer;
        this.marchingSquares = marchingSquares;
    }

    render(grid, viewSettings) {
        this.renderer.clearWorkspace();
        this.renderer.drawBoard();

        if (viewSettings.mode === ViewMode.GRID) {
            this.renderGridView(grid, viewSettings);
        } else {
            this.renderMarchingView(grid, viewSettings);
        }

        this.renderer.drawBoardBorder();
    }

    renderGridView(grid, viewSettings) {
        this.renderer.drawFilledCells(grid);

        if (viewSettings.gridLinesVisible) {
            this.renderer.drawGridLines(grid);
        }
    }

    renderMarchingView(grid, viewSettings) {
        if (viewSettings.marchingFillVisible) {
            const triangles = this.marchingSquares.generateTriangles(grid);
            this.renderer.drawMarchingFill(triangles, grid);
        }

        if (viewSettings.gridLinesVisible) {
            this.renderer.drawGridLines(grid);
        }

        if (viewSettings.marchingBoundaryVisible) {
            const segments = this.marchingSquares.generateSegments(grid);
            this.renderer.drawMarchingBoundary(segments, grid);
        }
    }
}