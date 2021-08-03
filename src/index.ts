import { Vector2, Vector3 } from "@math.gl/core";
import { Engine } from "./engine";
import { GameLoop } from "./gameloop";
import { Camera, CameraController } from "./object/camera";
import { Model } from "./object/model";
import * as P from "./object/primitives";
// import { Transform } from "./object/transform";
import { ShaderProgram } from "./shader";

const engine = new Engine().setSize(new Vector2(500, 500));

const renderLoop = new GameLoop(60);

const vertexShader = `#version 300 es
    #pragma vscode_glsllint_stage: vert
    in vec3 a_position;

    uniform mat4 modelMatrix;
    uniform mat4 projMatrix;
    uniform mat4 viewMatrix;

    void main() {
        gl_Position = projMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);
    }
`;

const fragmentShader = `#version 300 es
    #pragma vscode_glsllint_stage: frag
    precision mediump float;
    out vec4 finalColor;

    void main() {
        finalColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

const program = new ShaderProgram(engine)
    .shader(vertexShader, "vertex")
    .shader(fragmentShader, "fragment")
    .create();
program.bind();

const camera = new Camera(engine);
camera.getTransform().position.set(0, 1, 3);
const cameraCtrl = new CameraController(engine, camera);

const model = P.GridAxis.createModel(engine, program);
// const vertices: Vector3[] = [new Vector3(0, 0, 0)];

renderLoop.emitter.on("frame", ({ deltaTime }) => {
    // update objects
    camera.updateViewMatrix();
    // model.getTransform().scale.addScalar(-0.01);

    // frame background color
    engine.clearColor(new Vector3(0.3, 0.3, 0.3)).clear();
    const mat = model.update();

    // program.uniform("uPointSize", Math.sin(pointSize) * 10.0 + 30.0);
    program.uniform("modelMatrix", mat);
    program.uniform("projMatrix", camera.getProjectionMatrix());
    program.uniform("viewMatrix", camera.getViewMatrix());
    engine.renderModel(model, program);
});
renderLoop.start();
