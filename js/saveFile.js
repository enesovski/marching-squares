import { ActionFactory } from "./actions/actionFactory.js";
import { Config } from "./config.js";

export class SaveFile {

    static save(gridSize, history, fileName = Config.save.defaultFileName) {
        const data = {
            version: Config.save.version,
            gridSize: gridSize,
            actions: history.getActionsData()
        };

        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName.toLowerCase().endsWith(".json")
            ? fileName
            : `${fileName}.json`;

        link.click();

        URL.revokeObjectURL(url);
    }

    static async load(file) {
        const text = await file.text();
        const data = JSON.parse(text);

        this.validate(data);

        const actions = data.actions.map(actionData => {
            return ActionFactory.fromData(actionData);
        });

        return {
            gridSize: data.gridSize,
            actions: actions
        };
    }

    static validate(data) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new Error("Invalid project file.");
        }

        if (data.version !== Config.save.version) {
            throw new Error("Unsupported file version.");
        }

        if (!Number.isInteger(data.gridSize) || !Config.gridSizes.includes(data.gridSize)) {
            throw new Error("Invalid grid size.");
        }

        if (!Array.isArray(data.actions)) {
            throw new Error("Invalid actions.");
        }

        for (const action of data.actions) {
            this.validateAction(action, data.gridSize);
        }
    }

    static validateAction(action, gridSize) {
        if (action?.type === "clear") {
            return;
        }

        if (action?.type !== "stroke") {
            throw new Error("Invalid action type.");
        }

        if (!Config.brush.types.includes(action.brushType)) {
            throw new Error("Invalid brush type.");
        }

        const { minSize, maxSize, sizeStep } = Config.brush;

        if (!Number.isInteger(action.brushSize) ||
            action.brushSize < minSize ||
            action.brushSize > maxSize ||
            (action.brushSize - minSize) % sizeStep !== 0) {
            throw new Error("Invalid brush size.");
        }

        if (!Array.isArray(action.points) || action.points.some(point =>
            !point ||
            !Number.isInteger(point.x) ||
            !Number.isInteger(point.y) ||
            point.x < 0 ||
            point.x >= gridSize ||
            point.y < 0 ||
            point.y >= gridSize)) {
            throw new Error("Invalid stroke points.");
        }
    }
}