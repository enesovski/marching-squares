
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
    project: {
        button: document.getElementById("projectTitleButton"),
        text: document.getElementById("projectTitleText"),
        input: document.getElementById("projectTitleInput"),
        unsaved: document.getElementById("unsavedIndicator")
    },
    tools: {
        brush: document.getElementById("brushToolButton"),
        erase: document.getElementById("eraseToolButton"),
        pan: document.getElementById("panToolButton"),
        zoomIn: document.getElementById("zoomInButton"),
        zoomOut: document.getElementById("zoomOutButton"),
        fit: document.getElementById("fitCanvasButton")
    },
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
    },
    status: {
        toolHelp: document.getElementById("statusToolHelp"),
        view: document.getElementById("statusView"),
        grid: document.getElementById("statusGrid"),
        zoom: document.getElementById("statusZoom")
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
let projectName = "Untitled Project";
let isDirty = false;
let editingTitle = false;
let activeTool = "brush";

renderer.setBoardColor(controls.colors.board.value);
renderer.setFillColor(controls.colors.fill.value);
renderer.setBoundaryColor(controls.colors.boundary.value);


const input = new Input(
    canvas,
    grid,
    camera,
    renderScene,
    handleActionCompleted,
    document.getElementById("brushPreview")
);

input.setBrushType(controls.brush.type.value);
input.setBrushSize(Number(controls.brush.size.value));

function renderScene() {
    sceneRenderer.render(grid, viewSettings);

    controls.status.view.textContent =
        viewSettings.mode === ViewMode.GRID ? "Grid" : "Marching";

    controls.status.grid.textContent = `${grid.width} × ${grid.height}`;
    controls.status.zoom.textContent = `${Math.round(camera.zoom * 100)}%`;

    input.updatePreview();
}

function setDirty(value) {
    isDirty = value;
    controls.project.unsaved.hidden = !isDirty;

    controls.project.button.title = isDirty
        ? "Rename project (unsaved changes)"
        : "Rename project";
}

function setProjectName(name) {
    const trimmed = name.trim() || "Untitled Project";

    if (trimmed !== projectName) {
        projectName = trimmed;
        setDirty(true);
    }

    controls.project.text.textContent = projectName;
    document.title = `${projectName} - Marching Squares`;
}

function startTitleEdit() {
    editingTitle = true;

    controls.project.button.hidden = true;
    controls.project.input.hidden = false;
    controls.project.input.value = projectName;

    controls.project.input.focus();
    controls.project.input.select();
}

function finishTitleEdit(saveChanges = true) {
    if (!editingTitle) return;

    editingTitle = false;

    if (saveChanges) {
        setProjectName(controls.project.input.value);
    }

    controls.project.input.hidden = true;
    controls.project.button.hidden = false;
}

function handleActionCompleted(action) {
    history.commit(action);
    setDirty(true);
    updateHistoryControls();
}

function updateHistoryControls() {
    controls.history.undo.disabled = !history.canUndo();
    controls.history.redo.disabled = !history.canRedo();
}

function updateBrushSizeControl() {
    const slider = controls.brush.size;

    const size = Number(slider.value);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const progress = max > min
        ? ((size - min) / (max - min)) * 100
        : 0;

    input.setBrushSize(size);
    controls.brush.sizeValue.textContent = size;
    slider.style.setProperty("--range-progress", `${progress}%`);
}

function setViewMode(mode) {
    viewSettings.setMode(mode);

    const isGrid = mode === ViewMode.GRID;

    controls.view.gridButton.setAttribute(
        "aria-pressed",
        String(isGrid)
    );

    controls.view.marchingButton.setAttribute(
        "aria-pressed",
        String(!isGrid)
    );

    controls.display.marchingOptions.hidden = isGrid;

    renderScene();
}


function setTool(tool) {
    activeTool = tool;
    input.setTool(tool);

    for (const name of ["brush", "erase", "pan"]) {
        const selected = name === tool;
        controls.tools[name].classList.toggle("is-active", selected);
        controls.tools[name].setAttribute("aria-pressed", String(selected));
    }

    const labels = {
        brush: "Draw",
        erase: "Erase",
        pan: "Pan"
    };

    controls.status.toolHelp.innerHTML =
        `<strong>LMB</strong> ${labels[tool]}`;
}


function changeResolution(size) {
    input.cancelStroke();

    grid = new Grid(size, size);
    input.setGrid(grid);

    history.reset();
    camera.reset();

    setDirty(true);
    updateHistoryControls();
    renderScene();
}

async function loadProject(file) {
    const project = await SaveFile.load(file);

    input.cancelStroke();

    grid = new Grid(project.gridSize, project.gridSize);
    input.setGrid(grid);

    history.load(project.actions);
    history.rebuild(grid);

    camera.reset();
    controls.grid.resolution.value = String(project.gridSize);

    setProjectName(file.name.replace(/\.json$/i, ""));
    setDirty(false);

    updateHistoryControls();
    renderScene();
}

// Project title

controls.project.button.addEventListener("click", startTitleEdit);

controls.project.input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        finishTitleEdit();
    } else if (event.key === "Escape") {
        event.preventDefault();
        finishTitleEdit(false);
    }
});

controls.project.input.addEventListener("blur", () => {
    finishTitleEdit();
});

// Tools

controls.tools.brush.addEventListener("click", () => {
    setTool("brush");
});

controls.tools.pan.addEventListener("click", () => {
    setTool("pan");
});

controls.tools.erase.addEventListener("click", () => {
    setTool("erase");
});

controls.tools.zoomIn.addEventListener("click", () => {
    camera.zoomAt({ x: 0, y: 0 }, 1.25);
    renderScene();
});

controls.tools.zoomOut.addEventListener("click", () => {
    camera.zoomAt({ x: 0, y: 0 }, 0.8);
    renderScene();
});

controls.tools.fit.addEventListener("click", () => {
    camera.reset();
    renderScene();
});

// View modes

controls.view.gridButton.addEventListener("click", () => {
    setViewMode(ViewMode.GRID);
});

controls.view.marchingButton.addEventListener("click", () => {
    setViewMode(ViewMode.MARCHING);
});

// Brush settings

controls.brush.type.addEventListener("change", () => {
    input.setBrushType(controls.brush.type.value);
});

controls.brush.size.addEventListener("input", updateBrushSizeControl);

// Grid settings

controls.grid.resolution.addEventListener("change", () => {
    changeResolution(Number(controls.grid.resolution.value));
});

// Display settings

controls.display.gridLines.addEventListener("change", () => {
    viewSettings.setGridLinesVisible(
        controls.display.gridLines.checked
    );
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

// Colors

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

// History

controls.history.clear.addEventListener("click", () => {
    history.execute(new ClearAction(), grid);
    setDirty(true);
    updateHistoryControls();
    renderScene();
});

controls.history.undo.addEventListener("click", () => {
    if (history.undo(grid)) {
        setDirty(true);
        updateHistoryControls();
        renderScene();
    }
});

controls.history.redo.addEventListener("click", () => {
    if (history.redo(grid)) {
        setDirty(true);
        updateHistoryControls();
        renderScene();
    }
});

// Save and load

controls.file.save.addEventListener("click", () => {
    const fileName = projectName.replace(/[\\/:*?"<>|]/g, "-");

    SaveFile.save(grid.width, history, `${fileName}.json`);
    setDirty(false);
});

controls.file.load.addEventListener("click", () => {
    controls.file.input.click();
});

controls.file.input.addEventListener("change", async () => {
    const file = controls.file.input.files[0];

    if (!file) return;

    try {
        await loadProject(file);
    } catch (error) {
        console.error(error);
        alert("Could not load the project file.");
    } finally {
        controls.file.input.value = "";
    }
});

// Initialization

window.addEventListener("resize", renderScene);

updateBrushSizeControl();
setTool(activeTool);
setViewMode(ViewMode.GRID);
setDirty(false);
updateHistoryControls();
