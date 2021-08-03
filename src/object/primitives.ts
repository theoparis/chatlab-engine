import { Vector3 } from "@math.gl/core";
import { Engine } from "../engine";
import { ShaderProgram } from "../shader";
import { Model } from "./model";

export interface GridAxisOptions {
    div: number;
    size: number;
}

export class GridAxis {
    static createMesh(
        engine: Engine,
        program: ShaderProgram,
        originalOpts: Partial<GridAxisOptions> = {}
    ) {
        const { gl } = engine;
        const verts: Vector3[] = [];
        const opts: GridAxisOptions = {
            div: 10.0,
            size: 1.8,
            ...originalOpts
        };

        const step = opts.size / opts.div;
        const half = opts.size / 2;

        let p = 0;
        for (let i = 0; i <= opts.div; i++) {
            p = -half + i * step;
            // vertical line
            verts.push(new Vector3(p, 0, half));
            verts.push(new Vector3(p, 0, -half));

            // horizontal line
            p = half - i * step;
            verts.push(new Vector3(-half, 0, p));
            verts.push(new Vector3(half, 0, p));
        }
        const mesh: {
            drawMode: number;
            vao: WebGLVertexArrayObject | null;
            vertexCount: number;
            vertexBuffer: { buffer: WebGLBuffer; unbind: () => void } | null;
        } = {
            drawMode: gl.LINES,
            vao: gl.createVertexArray(),
            vertexCount: verts.length,
            vertexBuffer: null
        };

        gl.bindVertexArray(mesh.vao);
        mesh.vertexBuffer = engine.buffer(verts, "array");
        engine.gl.enableVertexAttribArray(program.attribLocation("a_position"));
        engine.gl.vertexAttribPointer(
            program.attribLocation("a_position"),
            3,
            engine.gl.FLOAT,
            false,
            0,
            0
        );
        mesh.vertexBuffer?.unbind();
        return mesh;
    }

    static createModel(
        engine: Engine,
        shader: ShaderProgram,
        options?: GridAxisOptions
    ) {
        return new Model(GridAxis.createMesh(engine, shader, options));
    }
}
