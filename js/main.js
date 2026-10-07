import { Renderer } from "./renderer.js";
import { Grid } from "./grid.js";
import { Input } from "./input.js";
import { MarchingSquares } from "./marchingsquares.js";

const canvas = document.getElementById("glCanvas");

const toggleViewButton = document.getElementById("toggleView");
const toggleMarchingButton = document.getElementById("toggleMarchingMode");

const brushTypeSelect = document.getElementById("brushType");
const brushSizeSlider = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const gridResolutionSelect = document.getElementById("gridResolution");

const clearButton = document.getElementById("clearButton");

const renderer = new Renderer(canvas);
let grid = new Grid(40, 40);
const marchingSquares = new MarchingSquares();

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
    } else {
        const triangles = marchingSquares.generateTriangles(grid);
        renderer.drawMarchingTriangles(triangles, grid);
    }
}

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

clearButton.addEventListener("click", () => {
    grid.clear();
    render();
});

toggleMarchingButton.addEventListener("click", () => {
    if (marchingMode === "lines") {
        marchingMode = "filled";
        toggleMarchingButton.textContent = "Marching Mode: Filled";
    } else {
        marchingMode = "lines";
        toggleMarchingButton.textContent = "Marching Mode: Lines";
    }

    render();
});

gridResolutionSelect.addEventListener("change", () => {
    const size = Number(gridResolutionSelect.value);

    grid = new Grid(size, size);
    input.setGrid(grid);

    render();
});

const input = new Input(canvas, grid, render);

brushTypeSelect.addEventListener("change", () => {
    input.setBrushType(brushTypeSelect.value);
});

brushSizeSlider.addEventListener("input", () => {
    const size = Number(brushSizeSlider.value);

    input.setBrushSize(size);
    brushSizeValue.textContent = size;
});

render();