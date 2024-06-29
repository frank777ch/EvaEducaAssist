const {
    Application,
    live2d: { Live2DModel },
} = PIXI;

// Url to Live2D
const modelUrl = "../eva/EvaEduca.model3.json";

let currentModel;

const videoElement = document.querySelector(".input_video"),
    guideCanvas = document.querySelector("canvas.guides");

(async function main() {
    // create pixi application
    const app = new PIXI.Application({
        view: document.getElementById("live2d"),
        autoStart: true,
        backgroundAlpha: 0,
        resizeTo: window,
    });

    // load live2d model
    currentModel = await Live2DModel.from(modelUrl, { autoInteract: false });
    currentModel.scale.set(0.6); // Ajusta la escala según sea necesario
    currentModel.interactive = true;
    currentModel.anchor.set(0.5, 0.5);
    currentModel.position.set(window.innerWidth / 2, window.innerHeight / 2);

    // Add events to drag model
    currentModel.on("pointerdown", (e) => {
        currentModel.offsetX = e.data.global.x - currentModel.position.x;
        currentModel.offsetY = e.data.global.y - currentModel.position.y;
        currentModel.dragging = true;
    });
    currentModel.on("pointerup", (e) => {
        currentModel.dragging = false;
    });
    currentModel.on("pointermove", (e) => {
        if (currentModel.dragging) {
            currentModel.position.set(e.data.global.x - currentModel.offsetX, e.data.global.y - currentModel.offsetY);
        }
    });

    // Add live2d model to stage
    app.stage.addChild(currentModel);
    window.currentModel = currentModel;
})();

window.mover_boca = (x, y, lerpAmount = 0.7) => {
    const coreModel = currentModel.internalModel.coreModel;

    currentModel.internalModel.motionManager.update = (...args) => {
        let mouth_value = (coreModel.getParameterValueById("ParamMouthOpenY") - y) * 0.3;
        coreModel.setParameterValueById(
            "ParamMouthOpenY",
            (coreModel.getParameterValueById("ParamMouthOpenY") - y) * 0.3 + y
        );
    };
};