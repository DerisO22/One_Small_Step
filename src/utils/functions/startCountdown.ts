export const startCountdown = () => {
    const countdownAudio = new Audio('/sfx/countdown.mp3');

    countdownAudio.load();
    countdownAudio.play();
}