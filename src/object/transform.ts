import { Matrix4, Vector3 } from "@math.gl/core";

export class Transform {
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    viewMatrix: Matrix4;
    normalMatrix: Matrix4;
    right: Vector3;
    up: Vector3;
    forward: Vector3;

    static readonly deg2Rad = Math.PI / 180;

    constructor() {
        this.position = new Vector3(0, 0, 0);
        this.rotation = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);
        this.viewMatrix = new Matrix4();
        this.normalMatrix = new Matrix4();

        // direction vectors
        this.forward = new Vector3();
        this.up = new Vector3();
        this.right = new Vector3();
    }

    updateMatrix() {
        this.viewMatrix = this.viewMatrix
            .identity()
            .translate(this.position)
            .rotateXYZ(this.rotation.clone().multiplyScalar(Transform.deg2Rad))
            .scale(this.scale);
        this.normalMatrix = this.viewMatrix.clone().transpose();

        this.updateDirection();

        return this.viewMatrix;
    }

    updateDirection() {
        this.forward = new Vector3(
            this.viewMatrix.clone().transformAsPoint([0, 0, 1], [])
        );
        this.up = new Vector3(
            this.viewMatrix.clone().transformAsPoint([0, 1, 0], [])
        );
        this.right = new Vector3(
            this.viewMatrix.clone().transformAsPoint([1, 0, 0], [])
        );

        return this;
    }

    reset() {
        this.position.set(0, 0, 0);
        this.scale.set(1, 1, 1);
        this.rotation.set(0, 0, 0);
    }
}
