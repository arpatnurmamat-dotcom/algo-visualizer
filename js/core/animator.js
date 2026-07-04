class Animator {
  constructor(config) {
    if (!config || !Array.isArray(config.steps)) {
      throw new Error('Animator requires a config object with a steps array');
    }
    this.steps = config.steps;
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1000;
    this.intervalId = null;
    this.onStep = config.onStep || null;
    this.onComplete = config.onComplete || null;
  }

  next() {
    if (this.currentStep >= this.steps.length - 1) {
      this.pause();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }
    this.currentStep++;
    if (this.onStep) {
      this.onStep(this.steps[this.currentStep]);
    }
  }

  prev() {
    if (this.currentStep <= 0) {
      return;
    }
    this.currentStep--;
    if (this.onStep) {
      this.onStep(this.steps[this.currentStep]);
    }
  }

  play() {
    if (this.isPlaying) {
      return;
    }
    if (this.steps.length === 0) {
      return;
    }
    if (this.currentStep >= this.steps.length - 1) {
      return;
    }
    this.isPlaying = true;
    this.intervalId = setInterval(() => {
      this.next();
    }, this.speed);
  }

  pause() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSpeed(ms) {
    this.speed = ms;
    if (this.isPlaying) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.next();
      }, this.speed);
    }
  }

  jumpTo(n) {
    const clamped = Math.max(0, Math.min(n, this.steps.length - 1));
    this.currentStep = clamped;
    if (this.onStep) {
      this.onStep(this.steps[this.currentStep]);
    }
  }

  getProgress() {
    return {
      current: this.currentStep,
      total: this.steps.length - 1
    };
  }

  reset() {
    this.pause();
    this.jumpTo(0);
  }
}
