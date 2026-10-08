import { StrokeAction } from "./strokeAction.js";
import { ClearAction } from "./clearAction.js";

export class ActionFactory {

    static fromData(data) {
        switch (data.type) {
            case "stroke":
                return this.createStrokeAction(data);

            case "clear":
                return new ClearAction();

            default:
                throw new Error(`Unknown action type: ${data.type}`);
        }
    }

    static createStrokeAction(data) {
        const action = new StrokeAction(data.brushType, data.brushSize);

        for (const point of data.points) {
            action.addPoint(point.x, point.y);
        }

        return action;
    }
}