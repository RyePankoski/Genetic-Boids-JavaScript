class SoundManager {
    constructor(settings) {
        this.settings = settings;
        this.enabled = true;
        this.volume = 0.3;
        this.sounds = {};
        this.lastMilestone = 0;
    }



    loadSound(name, path) {
        this.sounds[name] = new Audio(path);
        this.sounds[name].volume = this.volume;
    }


    playSound(name) {
        if (!this.enabled) {
            return;
        }

        if (this.sounds[name]) {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.volume;
            sound.play();
        }

    }

    checkMilestone(currentBoids) {
        if (!this.enabled) return;

        const currentMilestone = Math.floor(currentBoids / this.settings.MILESTONE);

        if (currentMilestone > this.lastMilestone && currentBoids > 0) {
            this.lastMilestone = currentMilestone;
            this.playSound("milestone");
        }
    }

    playBirthSound(probability = 0.05) {
    if (!this.enabled) return;

    if (Math.random() < probability) {
        // Define a scale in semitones relative to root
        const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // C major scale

        // Pick a random note from the scale
        const note = scale[Math.floor(Math.random() * scale.length)];

        // Convert semitones to playback rate multiplier
        // 2^(n/12) = frequency ratio
        const playbackRate = Math.pow(2, note / 12);

        this.playSound('birth', { playbackRate });
    }
}


    setVolume(newVolume) {
        this.volume = newVolume;

        Object.values(this.sounds).forEach(sound => {
            sound.volume = newVolume;
        });
    }

    toggleEnabled(){
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
export default SoundManager;