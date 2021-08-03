import { Vector3, Vector2, Matrix4 } from "@math.gl/core";
import { Engine } from "./engine";

export class ShaderProgram {
    protected shaders: WebGLShader[] = [];
    protected program?: WebGLProgram;

    constructor(protected engine: Engine) {}

    getProgram(): WebGLProgram | undefined {
        return this.program;
    }

    shader(src: string, type: "vertex" | "fragment") {
        const { gl } = this.engine;
        const shader = gl.createShader(
            type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
        );
        if (!shader) throw new Error("Failed to create shader");
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(
                "Error compiling shader: " + src,
                gl.getShaderInfoLog(shader)
            );
            gl.deleteShader(shader);
            return this;
        }

        this.shaders.push(shader);

        return this;
    }

    create() {
        const { gl } = this.engine;
        const program = gl.createProgram();
        if (!program) throw new Error("Failed to create shader program");
        this.program = program;
        this.shaders.forEach((shader) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            gl.attachShader(this.program!, shader);
        });
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(
                "Error creating shader program",
                gl.getProgramInfoLog(this.program)
            );
            gl.deleteProgram(this.program);
            return this;
        }

        gl.validateProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.VALIDATE_STATUS)) {
            console.error(
                "Error validating shader program",
                gl.getProgramInfoLog(this.program)
            );
            gl.deleteProgram(this.program);
            return this;
        }

        // can delete swhaders after program made
        this.shaders.forEach((shader) => {
            gl.deleteShader(shader);
        });

        return this;
    }

    bind() {
        const { gl } = this.engine;
        if (!this.program) throw new Error("Program must be initialized");
        gl.useProgram(this.program);
        return this;
    }

    unbind() {
        const { gl } = this.engine;
        gl.useProgram(null);
    }

    uniformLocation(name: string) {
        const { gl } = this.engine;
        if (!this.program) throw new Error("Program must be initialized");
        const location = gl.getUniformLocation(this.program, name);
        if (!location) throw new Error("Invalid location");
        return location;
    }

    attribLocation(name: string) {
        const { gl } = this.engine;
        if (!this.program) throw new Error("Program must be initialized");
        const location = gl.getAttribLocation(this.program, name);
        return location;
    }

    uniform(name: string, v: Vector3 | Vector2 | Matrix4 | number) {
        const { gl } = this.engine;
        if (!this.program) throw new Error("Program must be initialized");
        const location = gl.getUniformLocation(this.program, name);
        if (typeof v === "number") gl.uniform1f(location, v);
        if (v instanceof Vector2) gl.uniform2f(location, v.x, v.y);
        else if (v instanceof Vector3) gl.uniform3f(location, v.x, v.y, v.z);
        else if (v instanceof Matrix4)
            gl.uniformMatrix4fv(location, false, v.toFloat32Array());
        return this;
    }

    dispose() {
        const { gl } = this.engine;

        if (gl.getParameter(gl.CURRENT_PROGRAM) === this.program)
            gl.useProgram(null);
        if (this.program) gl.deleteProgram(this.program);
    }
}
