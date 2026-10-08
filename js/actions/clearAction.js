import { Action } from "./action.js";

export class ClearAction extends Action {

    apply(grid) {
        grid.clear();
    }

    toData() {
        return {
            type: "clear"
        };
    }

}