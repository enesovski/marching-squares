import { Renderer } from "./renderer.js";
import { Grid } from "./grid.js";
import { Input } from "./input.js";
import { MarchingSquares } from "./marchingsquares.js";
import { Camera } from "./camera.js";
import { Config } from "./config.js";

import { ClearAction } from "./actions/clearAction.js";
import { ActionHistory } from "./actions/actionHistory.js";
import { SaveFile } from "./saveFile.js";

const canvas = document.getElementById("glCanvas");

const toggleViewButton = document.getElementById("toggleView");
const toggleMarchingModeButton = document.getElementById("toggleMarchingMode");

const brushTypeSelect = document.getElementById("brushType");
const brushSizeSlider = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const gridResolutionSelect = document.getElementById("gridResolution");

const backgroundColorInput = document.getElementById("backgroundColor");
const fillColorInput = document.getElementById("fillColor");
const boundaryColorInput = document.getElementById("boundaryColor");

const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const clearButton = document.getElementById("clearButton");

const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const loadFileInput = document.getElementById("loadFileInput");

for (const type of Config.brush.types) {
    brushTypeSelect.add(new Option(type.charAt(0).toUpperCase() + type.slice(1), type));
}
brushTypeSelect.value = Config.brush.defaultType;
brushSizeSlider.min = Config.brush.minSize;
brushSizeSlider.max = Config.brush.maxSize;
brushSizeSlider.step = Config.brush.sizeStep;
brushSizeSlider.value = Config.brush.defaultSize;
brushSizeValue.textContent = Config.brush.defaultSize;

for (const size of Config.gridSizes) {
    gridResolutionSelect.add(new Option(`${size} x ${size}`, String(size)));
}
gridResolutionSelect.value = String(Config.defaultGridSize);

backgroundColorInput.value = Config.colors.background;
fillColorInput.value = Config.colors.fill;
boundaryColorInput.value = Config.colors.boundary;

const camera = new Camera();
const renderer = new Renderer(canvas, camera);
const marchingSquares = new MarchingSquares();
const history = new ActionHistory();

let grid = new Grid(Config.defaultGridSize, Config.defaultGridSize);

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

const input = new Input(canvas, grid, camera, render, onActionCompleted);

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

backgroundColorInput.addEventListener("input", () => {
    renderer.setBackgroundColor(backgroundColorInput.value);
    render();
});

fillColorInput.addEventListener("input", () => {
    renderer.setFillColor(fillColorInput.value);
    render();
});

boundaryColorInput.addEventListener("input", () => {
    renderer.setBoundaryColor(boundaryColorInput.value);
    render();
});

gridResolutionSelect.addEventListener("change", () => {
    const size = Number(gridResolutionSelect.value);

    input.cancelStroke();

    grid = new Grid(size, size);
    input.setGrid(grid);

    history.reset();

    camera.reset(); 
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

saveButton.addEventListener("click", () => {
    const fileName = prompt("Save project as:", Config.save.defaultFileName);

    if (!fileName || !fileName.trim()) {
        return;
    }

    SaveFile.save(grid.width, history, fileName.trim());
});

loadButton.addEventListener("click", () => {
    loadFileInput.click();
});

loadFileInput.addEventListener("change", async () => {
    const file = loadFileInput.files[0];

    if (!file) {
        return;
    }

    try {
        input.cancelStroke();

        const project = await SaveFile.load(file);

        grid = new Grid(project.gridSize, project.gridSize);
        input.setGrid(grid);

        history.load(project.actions);
        history.rebuild(grid);

        camera.reset();

        gridResolutionSelect.value = String(project.gridSize);

        updateHistoryButtons();
        render();
    } catch (error) {
        console.error(error);
        alert("Could not load the project file.");
    }

    loadFileInput.value = "";
});

updateHistoryButtons();
render();
