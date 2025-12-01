export const startCountdown = () => {
    const countdownAudio = new Audio('/sfx/countdown.wav');

    countdownAudio.load();
    countdownAudio.play();
}