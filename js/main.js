import { Renderer } from "./renderer.js";
import { Grid } from "./grid.js";
import { Input } from "./input.js";
import { MarchingSquares } from "./marchingsquares.js";

const canvas = document.getElementById("glCanvas");
const toggleViewButton = document.getElementById("toggleView");
const toggleMarchingButton = document.getElementById("toggleMarchingMode");

const renderer = new Renderer(canvas);
const grid = new Grid(20, 20);
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

const input = new Input(canvas, grid, render);

render();