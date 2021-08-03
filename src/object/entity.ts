import { Transform } from "./transform";

export interface GameObject {
    getTransform(): Transform;
}

export class AbstractGameObject implements GameObject {
    protected transform: Transform = new Transform();

    getTransform(): Transform {
        return this.transform;
    }
}
