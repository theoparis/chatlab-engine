import { Engine } from "../engine";
import { AbstractGameObject } from "./entity";
import { Transform } from "./transform";
import { Matrix4, Vector3, Vector2 } from "@math.gl/core";

// eslint-disable-next-line no-shadow
export enum CameraMode {
    ORBIT = "orbit",
    FREE = "free"
}

export class Camera extends AbstractGameObject {
    protected mode: CameraMode;
    protected viewMatrix: Matrix4;
    protected projectionMatrix: Matrix4;

    constructor(protected engine: Engine, fov = 45, near = 0.1, far = 1000) {
        super();
        this.transform = new Transform();
        this.projectionMatrix = new Matrix4().perspective({
            fovy: fov * Transform.deg2Rad,
            aspect: engine.gl.canvas.width / engine.gl.canvas.height,
            near: near,
            far: far
        });
        this.viewMatrix = new Matrix4();

        this.mode = CameraMode.ORBIT;

        /*         new Matrix4() */
    }

    panX(v: number) {
        if (this.mode === CameraMode.ORBIT) return;
        this.updateViewMatrix();
        this.transform.position.add(
            this.transform.right.clone().multiplyByScalar(v)
        );
    }

    panY(v: number) {
        this.updateViewMatrix();
        this.transform.position.y += this.transform.up.y * v;
        if (this.mode === CameraMode.ORBIT) return;
        this.transform.position.x += this.transform.up.x * v;
        this.transform.position.z += this.transform.up.z * v;
    }

    panZ(v: number) {
        this.updateViewMatrix();
        // orbit mode does translate after rotate, so only need to set z, rotate will handle rest
        if (this.mode === CameraMode.ORBIT) this.transform.position.z += v;
        // in freemode to move forward, we need to move on our forward which relative our current rotation
        else
            this.transform.position.add(
                this.transform.forward.clone().multiplyByScalar(v)
            );
    }

    updateViewMatrix() {
        if (this.mode === CameraMode.FREE)
            this.transform.viewMatrix = new Matrix4()
                .translate(this.transform.position)
                .rotateXYZ(
                    this.transform.rotation
                        .clone()
                        .multiplyByScalar(Transform.deg2Rad)
                );
        else
            this.transform.viewMatrix = new Matrix4()
                .rotateXYZ(
                    this.transform.rotation
                        .clone()
                        .multiplyByScalar(Transform.deg2Rad)
                )
                .translate(this.transform.position);

        this.transform.updateDirection();

        this.viewMatrix = this.transform.viewMatrix.clone().invert();
        return this.viewMatrix;
    }

    getTransform(): Transform {
        return this.transform;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    getViewMatrix() {
        return this.viewMatrix;
    }
}

export class CameraController {
    rotateRate: number;
    panRate: number;
    zoomRate: number;
    protected offset: Vector2;
    protected initPos: Vector2;
    protected prevPos: Vector2;
    protected canvas: HTMLCanvasElement;

    constructor(protected engine: Engine, protected camera: Camera) {
        this.canvas = engine.gl.canvas as HTMLCanvasElement;
        const box = this.canvas.getBoundingClientRect();

        this.rotateRate = -300;
        this.panRate = 5;
        this.zoomRate = 200;
        this.offset = new Vector2(box.left, box.top);

        this.initPos = new Vector2();
        this.prevPos = new Vector2();
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);

        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousewheel", (ev) =>
            this.onMouseWheel(ev as WheelEvent)
        );
    }

    getMousePosition(e: MouseEvent) {
        return new Vector2(e.pageX - this.offset.x, e.pageY - this.offset.y);
    }

    onMouseDown(e: MouseEvent) {
        this.initPos = this.prevPos = new Vector2(
            e.pageX - this.offset.x,
            e.pageY - this.offset.y
        );
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
    }

    onMouseUp() {
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
    }

    onMouseWheel(e: WheelEvent) {
        const delta = Math.max(-1, Math.min(1, e.deltaY - e.detail));
        this.camera.panZ(delta * (this.zoomRate / this.canvas.height));
    }

    onMouseMove(e: MouseEvent) {
        const pos = new Vector2(
            e.pageX - this.offset.x,
            e.pageY - this.offset.y
        );
        const d = pos.clone().sub(this.prevPos);

        if (!e.shiftKey) {
            this.camera.getTransform().rotation.y +=
                d.x * (this.rotateRate / this.canvas.width);
            this.camera.getTransform().rotation.x +=
                d.y * (this.rotateRate / this.canvas.height);
        } else {
            this.camera.panX(-d.x * (this.panRate / this.canvas.width));
            this.camera.panY(d.y * (this.panRate / this.canvas.height));
        }

        this.prevPos = pos.clone();
    }
}
