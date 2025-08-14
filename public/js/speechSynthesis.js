const synthetizer = window.speechSynthesis;
let voices = [];
let pitch = 1.0;
let rate = 1.0;
export let selected_voice;

function loadVoices() {
    voices = synthetizer.getVoices().filter(voice => voice.lang.includes("es"));

    if (voices.length < 1) {
        console.warn("Tu navegador no tiene voces en español.");
        return;
    }

    if (voices.length === 1) {
        selected_voice = voices[0];
    } else {
        selected_voice = voices.find(v => v.lang.includes("US")) || voices[0];
    }
}

if (typeof speechSynthesis !== "undefined") {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
}

let onendSynthetizer = console.log;

export const set_onEnd_synthetizer = (callback) => {
    onendSynthetizer = callback;
};

export const say = (text) => {
    if (!selected_voice) {
        console.warn("No hay voz seleccionada aún. Intentando cargar...");
        loadVoices();
        if (!selected_voice) {
            console.error("No se pudo reproducir, no hay voces disponibles.");
            return;
        }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selected_voice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onend = onendSynthetizer;
    utterance.onerror = (e) => console.error("SpeechSynthesisUtterance.onerror", e);

    synthetizer.speak(utterance);
};

export const change_pitch = (value) => {
    const num = Number(value);
    if (isNaN(num)) {
        console.error("El pitch tiene que ser numérico");
        return;
    }
    pitch = Math.max(0.1, Math.min(2.0, num));
};

export const change_rate = (value) => {
    const num = Number(value);
    if (isNaN(num)) {
        console.error("El rate tiene que ser numérico");
        return;
    }
    rate = Math.max(0.1, Math.min(2.0, num));
};

export default voices;