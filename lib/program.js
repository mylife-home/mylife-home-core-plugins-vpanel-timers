'use strict';
const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-vpanel-timers');

const outputs = [];
for(let i=1; i<=10; ++i) {
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
    this.steps = prog.split(' ').map(part => {
      const items = part.split('-');
      if(items.length !== 2) {
        throw new Error(`Invalid program: Invalid part: '${part}'`);
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
    }
    if(step.op === 'wait') {
      this.parseWait(step);
    }

    throw new Error(`Invalid program: Invalid part: '${part}'`);
  }

  parseOutput(step) {
    void step;
  }

  parseWait(step) {
    if(!canWait) {
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
    // TODO
  }

  interrupt() {
    if(!this.running) { return; }
    clearTimeout(this.currentTimer)
    this.currentTimer = null;
  }

  get running() {
    return this.currentTimer !== null;
  }
};
