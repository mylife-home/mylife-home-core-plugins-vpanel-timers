'use strict';
const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-vpanel-timers');

const outputs = [];
for(let i=1; i<=4; ++i) {
  outputs.push(`out${i}`);
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
    this.currentTimer = null;
    this.currentStepIndex = -1;
  }

  parse() {
    this.steps = this.source.split(/\ |,|;/g).map(part => {
      const items = part.split('-');
      if(items.length !== 2) {
        throw new Error(`Invalid program: Invalid step: '${part}'`);
      }
      const [op, value] = items;
      const step = { op, value };

      this.parseStep(step);

      return step;
    });
  }

  parseStep(step) {
    if(outputs.includes(step.op) || step.op === 'out*') {
      this.parseOutput(step);
      return;
    }

    if(step.op === 'wait') {
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

  run() {
    this.currentStepIndex = -1;
    this.executeStep();
  }

  executeStep() {

    try {
      this.currentTimer = null;

      const step = this.steps[++this.currentStepIndex];
      if(!step) {
        this.currentStepIndex = -1;
        return; // terminated
      }

      const { op, value } = step;
      switch(op) {
        case 'wait':
          this.currentTimer = setTimeout(this.executeStep.bind(this), value);
          break;

        case 'out*':
          this.setAllOutputs(value);
          this.executeStep();
          break;

        default: // = outX
          this.setOutput(op, value);
          this.executeStep();
          break;
      }
    } catch(err) {
      logger.error('Error running step index %s : %s', this.currentStepIndex, err.toString());
      clearTimeout(this.currentTimer);
      this.currentStepIndex = -1;
    }
  }

  interrupt() {
    if(!this.running) { return; }
    clearTimeout(this.currentTimer);
    this.currentTimer = null;
    this.currentStepIndex = -1;
  }

  get running() {
    return this.currentTimer !== null;
  }
};
