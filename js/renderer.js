export class Renderer {

    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        this.gl = canvas.getContext("webgl");

        if (!this.gl) {
            throw new Error("WebGL is not supported by this browser.");
        }

        this.shaderProgram = this.createShaderProgram();
        this.vertexBuffer = this.gl.createBuffer();

        this.positionLocation = this.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.colorLocation = this.gl.getUniformLocation(this.shaderProgram, "uColor");

        this.zoomLocation = this.gl.getUniformLocation(this.shaderProgram, "uZoom");
        this.panLocation = this.gl.getUniformLocation(this.shaderProgram, "uPan");
        this.aspectRatioLocation = this.gl.getUniformLocation(this.shaderProgram, "uAspectRatio");

        this.workspaceColor = [0.10, 0.11, 0.13];
        this.boardColor = [0.9, 0.9, 0.9];
        this.boardBorderColor = [0.35, 0.35, 0.38];

        this.fillColor = [0.15, 0.15, 0.15];
        this.boundaryColor = [0.8, 0.1, 0.1];
        this.gridLineColor = [0.65, 0.65, 0.65];

        this.gl.useProgram(this.shaderProgram);
    }

    clearWorkspace() {
        this.resizeToDisplaySize();

        const gl = this.gl;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(...this.workspaceColor, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    resizeToDisplaySize() {
        const width = Math.round(this.canvas.clientWidth);
        const height = Math.round(this.canvas.clientHeight);

        if (width <= 0 || height <= 0) {
            return;
        }

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        this.camera.setAspectRatio(width / height);
    }

    drawBoard() {
        const vertices = [
            -1, 1,
            -1, -1,
            1, 1,

            1, 1,
            -1, -1,
            1, -1
        ];

        this.drawVertices(vertices, this.gl.TRIANGLES, this.boardColor);
    }

    drawBoardBorder() {
        const vertices = [
            -1, 1,
            1, 1,

            1, 1,
            1, -1,

            1, -1,
            -1, -1,

            -1, -1,
            -1, 1
        ];

        this.drawVertices(vertices, this.gl.LINES, this.boardBorderColor);
    }

    drawFilledCells(grid) {
        const vertices = [];

        const cellWidth = 2 / grid.width;
        const cellHeight = 2 / grid.height;

        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                if (grid.getCell(x, y) === 0) {
                    continue;
                }

                const left = -1 + x * cellWidth;
                const right = left + cellWidth;
                const top = 1 - y * cellHeight;
                const bottom = top - cellHeight;

                vertices.push(
                    left, top,
                    left, bottom,
                    right, top,

                    right, top,
                    left, bottom,
                    right, bottom
                );
            }
        }

        this.drawVertices(vertices, this.gl.TRIANGLES, this.fillColor);
    }

    drawGridLines(grid) {
        const vertices = [];

        for (let x = 0; x <= grid.width; x++) {
            const worldX = -1 + (x / grid.width) * 2;

            vertices.push(
                worldX, 1,
                worldX, -1
            );
        }

        for (let y = 0; y <= grid.height; y++) {
            const worldY = 1 - (y / grid.height) * 2;

            vertices.push(
                -1, worldY,
                1, worldY
            );
        }

        this.drawVertices(vertices, this.gl.LINES, this.gridLineColor);
    }

    drawMarchingBoundary(segments, grid) {
        const vertices = [];

        for (const segment of segments) {
            const start = this.gridPointToWorldSpace(segment.start, grid);
            const end = this.gridPointToWorldSpace(segment.end, grid);

            vertices.push(
                start.x, start.y,
                end.x, end.y
            );
        }

        this.drawVertices(vertices, this.gl.LINES, this.boundaryColor);
    }

    drawMarchingFill(triangles, grid) {
        const vertices = [];

        for (const point of triangles) {
            const position = this.gridPointToWorldSpace(point, grid);

            vertices.push(position.x, position.y);
        }

        this.drawVertices(vertices, this.gl.TRIANGLES, this.fillColor);
    }

    gridPointToWorldSpace(point, grid) {
        const x = -1 + ((point.x + 0.5) / grid.width) * 2;
        const y = 1 - ((point.y + 0.5) / grid.height) * 2;

        return { x, y };
    }

    setBoardColor(hex) {
        this.boardColor = this.hexToRgb(hex);
    }

    setFillColor(hex) {
        this.fillColor = this.hexToRgb(hex);
    }

    setBoundaryColor(hex) {
        this.boundaryColor = this.hexToRgb(hex);
    }

    drawVertices(vertices, primitiveType, color) {
        if (vertices.length === 0) {
            return;
        }

        this.setColor(...color);
        this.uploadVertices(vertices);

        this.gl.drawArrays(primitiveType, 0, vertices.length / 2);
    }

    uploadVertices(vertices) {
        const gl = this.gl;
        const vertexData = new Float32Array(vertices);

        gl.useProgram(this.shaderProgram);

        this.applyCameraUniforms();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    applyCameraUniforms() {
        const gl = this.gl;

        gl.uniform1f(this.zoomLocation, this.camera.zoom);
        gl.uniform2f(this.panLocation, this.camera.pan.x, this.camera.pan.y);
        gl.uniform1f(this.aspectRatioLocation, this.camera.aspectRatio);
    }

    setColor(r, g, b, a = 1.0) {
        const gl = this.gl;

        gl.useProgram(this.shaderProgram);
        gl.uniform4f(this.colorLocation, r, g, b, a);
    }

    hexToRgb(hex) {
        const value = parseInt(hex.substring(1), 16);

        const r = ((value >> 16) & 255) / 255;
        const g = ((value >> 8) & 255) / 255;
        const b = (value & 255) / 255;

        return [r, g, b];
    }

    createShaderProgram() {
        const gl = this.gl;

        const vertexShaderSource = `
            attribute vec2 aPosition;

            uniform float uZoom;
            uniform vec2 uPan;
            uniform float uAspectRatio;

            void main() {
                vec2 position = aPosition * uZoom + uPan;
                position.x /= uAspectRatio;

                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;

            uniform vec4 uColor;

            void main() {
                gl_FragColor = uColor;
            }
        `;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error(
                "Could not link shader program: " +
                gl.getProgramInfoLog(shaderProgram)
            );
        }

        return shaderProgram;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(
                "Shader compilation failed: " +
                gl.getShaderInfoLog(shader)
            );
        }

        return shader;
    }
}