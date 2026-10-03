export class MarchingSquares {

    generateSegments(grid) {
        const segments = [];

        for (let y = 0; y < grid.height - 1; y++) {
            for (let x = 0; x < grid.width - 1; x++) {

                const A = grid.getCell(x, y);
                const B = grid.getCell(x + 1, y);
                const C = grid.getCell(x + 1, y + 1);
                const D = grid.getCell(x, y + 1);

                const caseIndex = A * 8 + B * 4 + C * 2 + D;

                const top = { x: x + 0.5, y: y };
                const right = { x: x + 1, y: y + 0.5 };
                const bottom = { x: x + 0.5, y: y + 1 };
                const left = { x: x, y: y + 0.5 };

                this.addCaseSegments(caseIndex, top, right, bottom, left, segments);
            }
        }

        return segments;
    }

    generateTriangles(grid) {
        const triangles = [];

        for (let y = 0; y < grid.height - 1; y++) {
            for (let x = 0; x < grid.width - 1; x++) {

                const AValue = grid.getCell(x, y);
                const BValue = grid.getCell(x + 1, y);
                const CValue = grid.getCell(x + 1, y + 1);
                const DValue = grid.getCell(x, y + 1);

                const caseIndex = AValue * 8 + BValue * 4 + CValue * 2 + DValue;

                const A = { x: x, y: y };
                const B = { x: x + 1, y: y };
                const C = { x: x + 1, y: y + 1 };
                const D = { x: x, y: y + 1 };

                const top = { x: x + 0.5, y: y };
                const right = { x: x + 1, y: y + 0.5 };
                const bottom = { x: x + 0.5, y: y + 1 };
                const left = { x: x, y: y + 0.5 };

                this.addCaseTriangles(
                    caseIndex,
                    A,
                    B,
                    C,
                    D,
                    top,
                    right,
                    bottom,
                    left,
                    triangles
                );
            }
        }

        return triangles;
    }

    addTriangle(triangles, p1, p2, p3) {
        triangles.push(p1, p2, p3);
    }

    addCaseSegments(caseIndex, top, right, bottom, left, segments) {

        switch (caseIndex) {

            case 0:
                break;

            case 1:
                segments.push({ start: left, end: bottom });
                break;

            case 2:
                segments.push({ start: bottom, end: right });
                break;

            case 3:
                segments.push({ start: left, end: right });
                break;

            case 4:
                segments.push({ start: top, end: right });
                break;

            case 5:
                segments.push({ start: top, end: left });
                segments.push({ start: bottom, end: right });
                break;

            case 6:
                segments.push({ start: top, end: bottom });
                break;

            case 7:
                segments.push({ start: top, end: left });
                break;

            case 8:
                segments.push({ start: left, end: top });
                break;

            case 9:
                segments.push({ start: top, end: bottom });
                break;

            case 10:
                segments.push({ start: left, end: bottom });
                segments.push({ start: top, end: right });
                break;

            case 11:
                segments.push({ start: top, end: right });
                break;

            case 12:
                segments.push({ start: left, end: right });
                break;

            case 13:
                segments.push({ start: bottom, end: right });
                break;

            case 14:
                segments.push({ start: left, end: bottom });
                break;

            case 15:
                break;
        }
    }

    addCaseTriangles(
        caseIndex,
        A,
        B,
        C,
        D,
        top,
        right,
        bottom,
        left,
        triangles
    ) {

        switch (caseIndex) {

            case 0:
                break;

            case 1:
                this.addTriangle(triangles, D, bottom, left);
                break;

            case 2:
                this.addTriangle(triangles, C, right, bottom);
                break;

            case 3:
                this.addTriangle(triangles, left, right, C);
                this.addTriangle(triangles, left, C, D);
                break;

            case 4:
                this.addTriangle(triangles, B, top, right);
                break;

            case 5:
                this.addTriangle(triangles, B, right, bottom);
                this.addTriangle(triangles, B, bottom, D);
                this.addTriangle(triangles, B, D, left);
                this.addTriangle(triangles, B, left, top);
                break;

            case 6:
                this.addTriangle(triangles, top, B, C);
                this.addTriangle(triangles, top, C, bottom);
                break;

            case 7:
                this.addTriangle(triangles, top, B, C);
                this.addTriangle(triangles, top, C, D);
                this.addTriangle(triangles, top, D, left);
                break;

            case 8:
                this.addTriangle(triangles, A, left, top);
                break;

            case 9:
                this.addTriangle(triangles, A, top, bottom);
                this.addTriangle(triangles, A, bottom, D);
                break;

            case 10:
                this.addTriangle(triangles, A, top, right);
                this.addTriangle(triangles, A, right, C);
                this.addTriangle(triangles, A, C, bottom);
                this.addTriangle(triangles, A, bottom, left);
                break;

            case 11:
                this.addTriangle(triangles, A, top, right);
                this.addTriangle(triangles, A, right, C);
                this.addTriangle(triangles, A, C, D);
                break;

            case 12:
                this.addTriangle(triangles, A, B, right);
                this.addTriangle(triangles, A, right, left);
                break;

            case 13:
                this.addTriangle(triangles, A, B, right);
                this.addTriangle(triangles, A, right, bottom);
                this.addTriangle(triangles, A, bottom, D);
                break;

            case 14:
                this.addTriangle(triangles, A, B, C);
                this.addTriangle(triangles, A, C, bottom);
                this.addTriangle(triangles, A, bottom, left);
                break;

            case 15:
                this.addTriangle(triangles, A, B, C);
                this.addTriangle(triangles, A, C, D);
                break;
        }
    }
}