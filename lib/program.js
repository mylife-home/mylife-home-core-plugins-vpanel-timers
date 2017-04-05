'use strict';
const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-vpanel-timers');

const outputs = [];
for(let i=0; i<4; ++i) {
  outputs.push(`o${i}`);
}

const timerSuffixes = {
  's': 1000,
  'm': 60*1000,
  'h': 60*60*1000
};

module.exports = class Program {

  constructor(source, canWait) {
    this.source = source;
    this.canWait = canWait;
  }

  setup() {
    this.reset();
    this.parse();
  }

  parse() {
    this.steps = this.source.split(/(?:\|| )+/).map(part => {
      const items = part.split('-');
      if(items.length !== 2) {
        throw new Error(`Invalid program: Invalid step: '${part}'`);
      }
      const [op, value] = items;
      const step = { op, value };

      this.parseStep(step);

      return step;
    });

    this.totalWait = this.steps
      .filter(step => step.op === 'w')
      .reduce((prev, step) => prev + step.value, 0);
  }

  parseStep(step) {
    if(outputs.includes(step.op) || step.op === 'o*') {
      this.parseOutput(step);
      return;
    }

    if(step.op === 'w') {
      this.parseWait(step);
      return;
    }

    throw new Error(`Invalid program: Invalid step operation: '${step.op}'`);
  }

  parseOutput(step) {
    void step;
  }

  parseWait(step) {
    if(!this.canWait) {
      throw new Error('Invalid program: wait not allowed');
    }

    const { value } = step;
    const nb = parseInt(value);
    if(isNaN(nb)) {
      throw new Error(`Invalid program: Invalid wait: '${value}'`);
    }
    const suffix = value.substring(nb.toString().length);
    if(suffix) {
      if(!timerSuffixes.hasOwnProperty(suffix)) {
        throw new Error(`Invalid program: Invalid wait: '${value}'`);
      }
      const mul = timerSuffixes[suffix];
      step.value = nb*mul;
    }
  }

  setOutput(name, value) {
    void name;
    void value;
  }

  setAllOutputs(value) {
    for(const output of outputs) {
      this.setOutput(output, value);
    }
  }

  setProgress(value) {
    void value;
  }

  setRunning(value) {
    void value;
  }

  run() {
    this.currentStepIndex = -1;
    this.currentProgress = 0;
    this.executeStep();
    this.executeProgress();
  }

  executeProgress() {
    const PROGRESS_TIMER = 10000;

    this.setProgress(this.currentProgress);

    if(this.totalWait === 0) { return; } // no wait in the program -> no time, no progress

    this.currentProgress += parseInt((PROGRESS_TIMER / this.totalWait) * 100);
    if(this.currentProgress > 100) { this.currentProgress = 100; }

    this.setProgress(this.currentProgress);

    this.currentProgressTimer = setTimeout(this.executeProgress.bind(this), PROGRESS_TIMER);
  }

  executeStep() {
    try {
      this.currentTimer = null;

      const step = this.steps[++this.currentStepIndex];
      if(!step) {
        // terminated
        this.reset();
        return;
      }

      const { op, value } = step;
      switch(op) {
        case 'w':
          this.currentTimer = setTimeout(this.executeStep.bind(this), value);
          break;

        case 'o*':
          this.setAllOutputs(value);
          this.executeStep();
          break;

        default: // = outX
          this.setOutput(op, value);
          this.executeStep();
          break;
      }
    } catch(err) {
      logger.error('Error running step index %s', this.currentStepIndex, err);
      this.reset();
    }

    this.setRunning(this.running);
  }

  interrupt() {
    if(this.running) {
      this.reset();
    }
  }

  reset() {
    clearTimeout(this.currentTimer);
    clearTimeout(this.currentProgressTimer);
    this.currentTimer = null;
    this.currentProgressTimer = null;
    this.currentStepIndex = -1;
    this.setProgress((this.currentProgress = 0));
    this.setRunning(false);
  }

  get running() {
    return this.currentTimer !== null;
  }
};
