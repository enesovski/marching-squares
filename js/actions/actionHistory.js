export class ActionHistory {

    constructor() {
        this.actions = [];
        this.redoActions = [];
    }

    commit(action) {
        this.actions.push(action);
        this.redoActions.length = 0;
    }

    execute(action, grid) {
        action.apply(grid);
        this.commit(action);
    }

    undo(grid) {
        if (!this.canUndo()) {
            return false;
        }

        const action = this.actions.pop();
        this.redoActions.push(action);

        this.rebuild(grid);

        return true;
    }

    redo(grid) {
        if (!this.canRedo()) {
            return false;
        }

        const action = this.redoActions.pop();
        this.actions.push(action);

        this.rebuild(grid);

        return true;
    }

    rebuild(grid) {
        grid.clear();

        for (const action of this.actions) {
            action.apply(grid);
        }
    }

    reset() {
        this.actions.length = 0;
        this.redoActions.length = 0;
    }

    canUndo() {
        return this.actions.length > 0;
    }

    canRedo() {
        return this.redoActions.length > 0;
    }
}