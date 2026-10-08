import { ActionFactory } from "./actions/actionFactory.js";

export class SaveFile {

    static save(gridSize, history, fileName = "marching-squares.json") {
        const data = {
            version: 1,
            gridSize: gridSize,
            actions: history.getActionsData()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName.toLowerCase().endsWith(".json") ? fileName : `${fileName}.json`;
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
        if (data.version !== 1) {
            throw new Error("Unsupported file version.");
        }

        if (!Number.isInteger(data.gridSize) || data.gridSize <= 0) {
            throw new Error("Invalid grid size.");
        }

        if (!Array.isArray(data.actions)) {
            throw new Error("Invalid actions.");
        }
    }
}
