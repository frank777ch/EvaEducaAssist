const {
    Application,
    live2d: { Live2DModel },
} = PIXI;

// Url to Live2D
const modelUrl = "../eva/EvaEduca.model3.json";

let currentModel;
let app;

const videoElement = document.querySelector(".input_video"),
    guideCanvas = document.querySelector("canvas.guides");

(async function main() {
    // create pixi application
    app = new PIXI.Application({
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
    currentModel.on("pointerup", () => {
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

    // Schedule blinking every 4 seconds
    setInterval(() => {
        blink();
    }, 4000);

    // Schedule smiling every 6 seconds
    setInterval(() => {
        smile();
    }, 6000);

    // Start floating animation
    requestAnimationFrame(float);

    // Add mouse move event for eye tracking
    window.addEventListener("mousemove", onMouseMove);

    // Schedule random eye movement every 2 seconds
    setInterval(() => {
        moveEyesRandomly();
    }, 2000);
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

// Función para que el avatar "hable"
function avatarSay(message) {
    const gptAnswerDiv = document.getElementById("GPTAnswer");
    gptAnswerDiv.innerText = message;
}

// Ejemplo de uso
document.getElementById("BeginRecognition").addEventListener("click", () => {
    avatarSay("¡Hola, estoy aquí para ayudarte!");
});

// Función para parpadeo
function blink() {
    const coreModel = currentModel.internalModel.coreModel;
    coreModel.setParameterValueById("ParamEyeLOpen", 0);
    coreModel.setParameterValueById("ParamEyeROpen", 0);
    setTimeout(() => {
        coreModel.setParameterValueById("ParamEyeLOpen", 1);
        coreModel.setParameterValueById("ParamEyeROpen", 1);
    }, 200); // Duración del parpadeo
}

// Función para sonrisa suave con interpolación
function smile() {
    const coreModel = currentModel.internalModel.coreModel;
    let start = null;
    const duration = 1000; // Duración de la sonrisa en milisegundos

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const value = lerp(0, 1, progress);
        coreModel.setParameterValueById("ParamMouthForm", value);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            setTimeout(() => {
                start = null;
                requestAnimationFrame(reverseStep);
            }, 1000); // Mantener la sonrisa por un segundo antes de revertir
        }
    }

    function reverseStep(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const value = lerp(1, 0, progress);
        coreModel.setParameterValueById("ParamMouthForm", value);
        if (progress < 1) {
            requestAnimationFrame(reverseStep);
        }
    }

    requestAnimationFrame(step);
}

// Función de interpolación lineal
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Función para animar la flotación
function float(timestamp) {
    const coreModel = currentModel.internalModel.coreModel;
    const floatAmplitude = 10; // Amplitud de la flotación
    const floatSpeed = 1; // Velocidad de la flotación
    const value = Math.sin(timestamp * 0.001 * floatSpeed) * floatAmplitude;

    coreModel.setParameterValueById("ParamBodyAngleX", value);

    requestAnimationFrame(float);
}

// Función para el seguimiento de los ojos
function onMouseMove(event) {
    const coreModel = currentModel.internalModel.coreModel;
    const rect = app.view.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxOffsetX = 1; // Máximo desplazamiento horizontal
    const maxOffsetY = 1; // Máximo desplazamiento vertical

    const paramEyeBallX = ((mouseX - centerX) / centerX) * maxOffsetX;
    const paramEyeBallY = -((mouseY - centerY) / centerY) * maxOffsetY; // Invertir el eje Y

    coreModel.setParameterValueById("ParamEyeBallX", paramEyeBallX);
    coreModel.setParameterValueById("ParamEyeBallY", paramEyeBallY);
}

// Función para mover los ojos aleatoriamente
function moveEyesRandomly() {
    const coreModel = currentModel.internalModel.coreModel;

    const maxOffsetX = 0.5; // Máximo desplazamiento horizontal
    const maxOffsetY = 0.5; // Máximo desplazamiento vertical

    const paramEyeBallX = (Math.random() * 2 - 1) * maxOffsetX;
    const paramEyeBallY = (Math.random() * 2 - 1) * maxOffsetY;

    coreModel.setParameterValueById("ParamEyeBallX", paramEyeBallX);
    coreModel.setParameterValueById("ParamEyeBallY", paramEyeBallY);
}