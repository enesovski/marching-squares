import { Renderer } from "./renderer.js";
import { SceneRenderer } from "./sceneRenderer.js";
import { Grid } from "./grid.js";
import { Input } from "./input.js";
import { MarchingSquares } from "./marchingsquares.js";
import { Camera } from "./camera.js";
import { ViewMode, ViewSettings } from "./viewSettings.js";

import { ClearAction } from "./actions/clearAction.js";
import { ActionHistory } from "./actions/actionHistory.js";
import { SaveFile } from "./saveFile.js";

const canvas = document.getElementById("glCanvas");

const controls = {
    view: {
        gridButton: document.getElementById("gridViewButton"),
        marchingButton: document.getElementById("marchingViewButton")
    },

    brush: {
        type: document.getElementById("brushType"),
        size: document.getElementById("brushSize"),
        sizeValue: document.getElementById("brushSizeValue")
    },

    grid: {
        resolution: document.getElementById("gridResolution")
    },

    display: {
        gridLines: document.getElementById("gridLinesToggle"),
        marchingFill: document.getElementById("marchingFillToggle"),
        marchingBoundary: document.getElementById("marchingBoundaryToggle"),
        marchingOptions: document.getElementById("marchingDisplayControls")
    },

    colors: {
        board: document.getElementById("boardColor"),
        fill: document.getElementById("fillColor"),
        boundary: document.getElementById("boundaryColor")
    },

    history: {
        undo: document.getElementById("undoButton"),
        redo: document.getElementById("redoButton"),
        clear: document.getElementById("clearButton")
    },

    file: {
        save: document.getElementById("saveButton"),
        load: document.getElementById("loadButton"),
        input: document.getElementById("loadFileInput")
    }
};

const camera = new Camera();
const renderer = new Renderer(canvas, camera);
const marchingSquares = new MarchingSquares();
const sceneRenderer = new SceneRenderer(renderer, marchingSquares);

const history = new ActionHistory();
const viewSettings = new ViewSettings();

const initialGridSize = Number(controls.grid.resolution.value);

let grid = new Grid(initialGridSize, initialGridSize);

renderer.setBoardColor(controls.colors.board.value);
renderer.setFillColor(controls.colors.fill.value);
renderer.setBoundaryColor(controls.colors.boundary.value);

const input = new Input(
    canvas,
    grid,
    camera,
    renderScene,
    handleActionCompleted
);

input.setBrushType(controls.brush.type.value);
input.setBrushSize(Number(controls.brush.size.value));

function renderScene() {
    sceneRenderer.render(grid, viewSettings);
}

function handleActionCompleted(action) {
    history.commit(action);
    updateHistoryControls();
}

function setViewMode(mode) {
    viewSettings.setMode(mode);

    updateViewControls();
    renderScene();
}

function setGridResolution(size) {
    input.cancelStroke();

    grid = new Grid(size, size);
    input.setGrid(grid);

    history.reset();
    camera.reset();

    updateHistoryControls();
    renderScene();
}

function updateViewControls() {
    const gridViewActive = viewSettings.mode === ViewMode.GRID;

    controls.view.gridButton.setAttribute(
        "aria-pressed",
        String(gridViewActive)
    );

    controls.view.marchingButton.setAttribute(
        "aria-pressed",
        String(!gridViewActive)
    );

    controls.display.marchingOptions.hidden = gridViewActive;
}

function updateHistoryControls() {
    controls.history.undo.disabled = !history.canUndo();
    controls.history.redo.disabled = !history.canRedo();
}

async function loadProject(file) {
    input.cancelStroke();

    const project = await SaveFile.load(file);

    grid = new Grid(project.gridSize, project.gridSize);
    input.setGrid(grid);

    history.load(project.actions);
    history.rebuild(grid);

    camera.reset();

    controls.grid.resolution.value = String(project.gridSize);

    updateHistoryControls();
    renderScene();
}

controls.view.gridButton.addEventListener("click", () => {
    setViewMode(ViewMode.GRID);
});

controls.view.marchingButton.addEventListener("click", () => {
    setViewMode(ViewMode.MARCHING);
});

controls.brush.type.addEventListener("change", () => {
    input.setBrushType(controls.brush.type.value);
});

controls.brush.size.addEventListener("input", () => {
    const size = Number(controls.brush.size.value);

    input.setBrushSize(size);
    controls.brush.sizeValue.textContent = size;
});

controls.grid.resolution.addEventListener("change", () => {
    setGridResolution(Number(controls.grid.resolution.value));
});

controls.display.gridLines.addEventListener("change", () => {
    viewSettings.setGridLinesVisible(controls.display.gridLines.checked);
    renderScene();
});

controls.display.marchingFill.addEventListener("change", () => {
    viewSettings.setMarchingFillVisible(
        controls.display.marchingFill.checked
    );

    renderScene();
});

controls.display.marchingBoundary.addEventListener("change", () => {
    viewSettings.setMarchingBoundaryVisible(
        controls.display.marchingBoundary.checked
    );

    renderScene();
});

controls.colors.board.addEventListener("input", () => {
    renderer.setBoardColor(controls.colors.board.value);
    renderScene();
});

controls.colors.fill.addEventListener("input", () => {
    renderer.setFillColor(controls.colors.fill.value);
    renderScene();
});

controls.colors.boundary.addEventListener("input", () => {
    renderer.setBoundaryColor(controls.colors.boundary.value);
    renderScene();
});

controls.history.clear.addEventListener("click", () => {
    history.execute(new ClearAction(), grid);

    updateHistoryControls();
    renderScene();
});

controls.history.undo.addEventListener("click", () => {
    if (!history.undo(grid)) {
        return;
    }

    updateHistoryControls();
    renderScene();
});

controls.history.redo.addEventListener("click", () => {
    if (!history.redo(grid)) {
        return;
    }

    updateHistoryControls();
    renderScene();
});

controls.file.save.addEventListener("click", () => {
    const fileName = prompt(
        "Save project as:",
        "marching-squares.json"
    );

    if (!fileName || !fileName.trim()) {
        return;
    }

    SaveFile.save(
        grid.width,
        history,
        fileName.trim()
    );
});

controls.file.load.addEventListener("click", () => {
    controls.file.input.click();
});

controls.file.input.addEventListener("change", async () => {
    const file = controls.file.input.files[0];

    if (!file) {
        return;
    }

    try {
        await loadProject(file);
    } catch (error) {
        console.error(error);
        alert("Could not load the project file.");
    }

    controls.file.input.value = "";
});

updateViewControls();
updateHistoryControls();
renderScene();