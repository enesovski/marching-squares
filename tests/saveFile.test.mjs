import assert from "node:assert/strict";
import test from "node:test";
import { SaveFile } from "../js/saveFile.js";
import { Grid } from "../js/grid.js";
import { ActionHistory } from "../js/actions/actionHistory.js";

const stroke = (overrides = {}) => ({
    type: "stroke", brushType: "circle", brushSize: 1,
    points: [{ x: 5, y: 5 }], ...overrides
});
const project = (overrides = {}) => ({
    version: 1, gridSize: 40, actions: [stroke()], ...overrides
});
const file = data => new Blob([JSON.stringify(data)]);

test("rejects grid sizes absent from the supported options", async () => {
    for (const gridSize of [1, 19, 30, 41, 100, "40", null]) {
        await assert.rejects(SaveFile.load(file(project({ gridSize }))), /grid size/i);
    }
});

test("rejects unsupported or missing brush settings", async () => {
    for (const overrides of [
        { brushType: "triangle" }, { brushType: undefined },
        { brushSize: 0 }, { brushSize: 2 }, { brushSize: 11 },
        { brushSize: 1.5 }, { brushSize: "3" }, { brushSize: undefined }
    ]) {
        await assert.rejects(SaveFile.load(file(project({ actions: [stroke(overrides)] }))), /brush/i);
    }
});

test("accepts both brush types across the configured size range", async () => {
    for (const brushType of ["circle", "square"]) {
        for (const brushSize of [1, 3, 5, 7, 9]) {
            const loaded = await SaveFile.load(file(project({ actions: [stroke({ brushType, brushSize })] })));
            const grid = new Grid(40, 40);
            loaded.actions[0].apply(grid);
            assert.equal(grid.getCell(5, 5), 1);
        }
    }
});

test("rejects malformed documents and invalid stroke points before replay", async () => {
    for (const data of [null, {}, project({ version: 2 }), project({ actions: null }),
        project({ actions: [null] }), project({ actions: [{ type: "unknown" }] }),
        project({ actions: [stroke({ points: null })] }),
        project({ actions: [stroke({ points: [{ x: "5", y: 5 }] })] }),
        project({ actions: [stroke({ points: [{ x: 40, y: 5 }] })] })]) {
        await assert.rejects(SaveFile.load(file(data)), Error);
    }
});

test("supported projects replay strokes and clear actions with undo/redo", async () => {
    for (const gridSize of [20, 40, 80]) {
        const loaded = await SaveFile.load(file(project({ gridSize, actions: [
            stroke(), { type: "clear" }, stroke({ brushType: "square", brushSize: 3 })
        ] })));
        const grid = new Grid(loaded.gridSize, loaded.gridSize);
        const history = new ActionHistory();
        history.load(loaded.actions);
        history.rebuild(grid);
        assert.equal(grid.cells.reduce((sum, value) => sum + value, 0), 9);
        history.undo(grid);
        assert.equal(grid.cells.reduce((sum, value) => sum + value, 0), 0);
        history.redo(grid);
        assert.equal(grid.cells.reduce((sum, value) => sum + value, 0), 9);
    }
});

test("validation follows changed configuration rather than hardcoded values", async () => {
    const { Config } = await import("../js/config.js");
    const original = structuredClone(Config);
    try {
        Config.gridSizes = [60];
        Config.save.version = 2;
        Config.brush.minSize = 2;
        Config.brush.maxSize = 6;
        Config.brush.sizeStep = 2;
        await assert.rejects(SaveFile.load(file(project())), /version/i);
        await assert.rejects(SaveFile.load(file(project({ version: 2 }))), /grid size/i);
        const data = project({ version: 2, gridSize: 60, actions: [stroke({ brushSize: 4 })] });
        assert.equal((await SaveFile.load(file(data))).gridSize, 60);
        await assert.rejects(SaveFile.load(file({ ...data, actions: [stroke({ brushSize: 3 })] })), /brush/i);
    } finally {
        Object.assign(Config, original);
    }
});
