import { Vector3 } from "@math.gl/core";
import { AbstractGameObject } from "./entity";
import { Transform } from "./transform";

export interface VAO {
    elementArrayBuffer: WebGLBuffer;
    attributes: WebGLBuffer[];
}

export class Model extends AbstractGameObject {
    constructor(
        public mesh: {
            vao: WebGLVertexArrayObject | null;
            vertexCount?: number;
            indexCount?: number;
            drawMode: number;
            vertexBuffer: WebGLBuffer | null;
        }
    ) {
        super();
    }

    movePosition(position: Vector3) {
        this.transform.position.add(position);
        return this;
    }

    getTransform(): Transform {
        return this.transform;
    }

    update() {
        this.transform.updateMatrix();
        return this.transform.viewMatrix.clone();
    }
}
