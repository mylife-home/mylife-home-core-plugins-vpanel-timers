'use strict';

const Program = require('./program');

class PercentProgram extends Program {

  constructor(source, canWait, owner) {
    super(source, canWait);
    this.owner = owner;
  }

  parseOutput(step) {
    const value = parseInt(step.value);
    if(isNaN(value) || value < 0 || value > 100) {
      throw new Error(`Invalid out value: '${step.value}'`);
    }
    step.value = value;
  }

  setOutput(name, value) {
    this.owner[name] = value;
  }

  setProgress(value) {
    this.owner.progress = value;
  }
};

module.exports = class SmartTimerPercent {
  constructor(config) {
    this.initProgram = new PercentProgram(config.initProgram, false, this);
    this.triggerProgram = new PercentProgram(config.triggerProgram, true, this);
    this.cancelProgram = new PercentProgram(config.cancelProgram, false, this);

    this.initProgram.setup();
    this.triggerProgram.setup();
    this.cancelProgram.setup();

    this.progress = 0;
    this.initProgram.run();
  }

  trigger(arg) {
    if(arg === 'off') { return; }

    this.cancel('on');
    this.triggerProgram.run();
  }

  cancel(arg) {
    if(arg === 'off') { return; }

    if(!this.triggerProgram.running) { return; }
    this.triggerProgram.interrupt();
    this.cancelProgram.run();
  }

  close(done) {
    this.cancel('on');
    setImmediate(done);
  }

  static metadata(builder) {
    const binary = builder.enum('off', 'on');
    const percent = builder.range(0, 100);
    builder.usage.vpanel();
    builder.attribute('out1', percent);
    builder.attribute('out2', percent);
    builder.attribute('out3', percent);
    builder.attribute('out4', percent);
    builder.attribute('progress', percent);
    builder.action('trigger', binary);
    builder.action('cancel', binary);
    builder.config('initProgram', 'string');
    builder.config('triggerProgram', 'string');
    builder.config('cancelProgram', 'string');
  }
};
