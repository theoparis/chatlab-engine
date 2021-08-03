import { Vector2, Vector3 } from "@math.gl/core";
import { Model } from "./object/model";
import { ShaderProgram } from "./shader";

// TODO: abstract gl interfaces for browser and node.js (terminal UI or headless)
export class Engine {
    protected canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;

    constructor() {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        const gl = this.canvas.getContext("webgl2");
        if (!gl) throw new Error("WebGL Context is not available");
        this.gl = gl;
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        return this;
    }

    clearColor(color: Vector3) {
        this.gl.clearColor(color.x, color.y, color.z, 1.0);
        return this;
    }

    buffer(
        values: Vector3[],
        type: "array" | "elementArray" = "array",
        isStatic = true
    ) {
        const { gl } = this;
        const b = gl.createBuffer();
        if (!b) throw new Error("Failed to create WebGL buffer");
        const buffer = b;
        if (values.some((v) => v instanceof Vector3)) {
            gl.bindBuffer(
                type === "array" ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER,
                buffer
            );
            const f32Array = new Float32Array(
                values.reduce((arr, val) => {
                    arr.push(...val.toArray());
                    return arr;
                }, [] as number[])
            );
            gl.bufferData(
                type === "array" ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER,
                f32Array,
                isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW
            );
        }

        return {
            buffer,
            unbind: () => {
                gl.bindBuffer(
                    type === "array"
                        ? gl.ARRAY_BUFFER
                        : gl.ELEMENT_ARRAY_BUFFER,
                    null
                );
            }
        };
    }

    setSize(dim: Vector2) {
        this.canvas.style.width = dim.x + "px";
        this.canvas.style.height = dim.y + "px";
        this.canvas.width = dim.x;
        this.canvas.height = dim.y;

        this.gl.viewport(0, 0, dim.x, dim.y);
        return this;
    }

    renderModel(model: Model, shader: ShaderProgram) {
        shader.uniform("modelMatrix", model.getTransform().viewMatrix);
        this.gl.bindVertexArray(model.mesh.vao);
        if (model.mesh.indexCount)
            this.gl.drawElements(
                model.mesh.drawMode,
                model.mesh.indexCount,
                this.gl.UNSIGNED_SHORT,
                0
            );
        else
            this.gl.drawArrays(
                model.mesh.drawMode,
                0,
                model.mesh.vertexCount ?? 0
            );
        this.gl.bindVertexArray(null);
        return this;
    }
}
