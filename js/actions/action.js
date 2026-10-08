export class Action {

    apply(grid) {
        throw new Error("apply() must be implemented.");
    }

    toData() {
        throw new Error("toData() must be implemented.");
    }
}