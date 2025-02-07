export function speakLocalText(text) {
    if (config.EnableTTS) {
        const utterance = new SpeechSynthesisUtterance(text);
    
        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            const galnetVoice = voices.find(voice => voice.name.includes("Microsoft Hazel - English"));
            if (galnetVoice) {
                utterance.voice = galnetVoice;
            }
    
            utterance.rate = 0.85;
            utterance.pitch = 0.01;
            utterance.volume = 0.2;
    
            speechSynthesis.speak(utterance);
        };
    
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = setVoice;
        } else {
            setVoice();
        }
    }
}





