import { Renderer } from "./renderer.js";
import { Grid } from "./grid.js";
import { Input } from "./input.js";
import { MarchingSquares } from "./marchingsquares.js";

import { ClearAction } from "./actions/clearAction.js";
import { ActionHistory } from "./actions/actionHistory.js";

const canvas = document.getElementById("glCanvas");

const toggleViewButton = document.getElementById("toggleView");
const toggleMarchingModeButton = document.getElementById("toggleMarchingMode");

const brushTypeSelect = document.getElementById("brushType");
const brushSizeSlider = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const gridResolutionSelect = document.getElementById("gridResolution");

const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const clearButton = document.getElementById("clearButton");

const renderer = new Renderer(canvas);
const marchingSquares = new MarchingSquares();
const history = new ActionHistory();

let grid = new Grid(40, 40);

let viewMode = "grid";
let marchingMode = "lines";

function render() {
    renderer.clear();

    if (viewMode === "grid") {
        renderer.drawGrid(grid);
        return;
    }

    if (marchingMode === "lines") {
        const segments = marchingSquares.generateSegments(grid);
        renderer.drawSegments(segments, grid);
        return;
    }

    const triangles = marchingSquares.generateTriangles(grid);
    renderer.drawMarchingTriangles(triangles, grid);
}

function updateHistoryButtons() {
    undoButton.disabled = !history.canUndo();
    redoButton.disabled = !history.canRedo();
}

function onActionCompleted(action) {
    history.commit(action);
    updateHistoryButtons();
}

const input = new Input(canvas, grid, render, onActionCompleted);

input.setBrushType(brushTypeSelect.value);
input.setBrushSize(Number(brushSizeSlider.value));

toggleViewButton.addEventListener("click", () => {
    if (viewMode === "grid") {
        viewMode = "marching";
        toggleViewButton.textContent = "Switch to Grid";
    } else {
        viewMode = "grid";
        toggleViewButton.textContent = "Switch to Marching Squares";
    }

    render();
});

toggleMarchingModeButton.addEventListener("click", () => {
    if (marchingMode === "lines") {
        marchingMode = "filled";
        toggleMarchingModeButton.textContent = "Marching Mode: Filled";
    } else {
        marchingMode = "lines";
        toggleMarchingModeButton.textContent = "Marching Mode: Lines";
    }

    render();
});

brushTypeSelect.addEventListener("change", () => {
    input.setBrushType(brushTypeSelect.value);
});

brushSizeSlider.addEventListener("input", () => {
    const size = Number(brushSizeSlider.value);

    input.setBrushSize(size);
    brushSizeValue.textContent = size;
});

gridResolutionSelect.addEventListener("change", () => {
    const size = Number(gridResolutionSelect.value);

    input.cancelStroke();

    grid = new Grid(size, size);
    input.setGrid(grid);

    history.reset();
    updateHistoryButtons();

    render();
});

clearButton.addEventListener("click", () => {
    history.execute(new ClearAction(), grid);

    updateHistoryButtons();
    render();
});

undoButton.addEventListener("click", () => {
    if (!history.undo(grid)) {
        return;
    }

    updateHistoryButtons();
    render();
});

redoButton.addEventListener("click", () => {
    if (!history.redo(grid)) {
        return;
    }

    updateHistoryButtons();
    render();
});

updateHistoryButtons();
render();