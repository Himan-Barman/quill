export class TTSService {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static speakingWord: string | null = null;
  private static listeners: Set<(word: string | null) => void> = new Set();

  static speak(text: string) {
    if (!this.synth) return;
    
    // Stop any ongoing speech
    this.stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Use an english voice if available
    const voices = this.synth.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en-'));
    if (enVoice) {
      utterance.voice = enVoice;
    }
    
    utterance.rate = 0.9; // Slightly slower for clear pronunciation
    
    utterance.onstart = () => {
      this.speakingWord = text;
      this.notifyListeners();
    };
    
    utterance.onend = () => {
      this.speakingWord = null;
      this.notifyListeners();
    };
    
    utterance.onerror = () => {
      this.speakingWord = null;
      this.notifyListeners();
    };
    
    this.synth.speak(utterance);
  }

  static stop() {
    if (this.synth) {
      this.synth.cancel();
      this.speakingWord = null;
      this.notifyListeners();
    }
  }

  static getCurrentlySpeaking() {
    return this.speakingWord;
  }

  static subscribe(listener: (word: string | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.speakingWord));
  }
}
