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

  setRunning(value) {
    this.owner.running = value ? 'on' : 'off';
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
    this.running = 'off';
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

  toggle(arg) {
    if(this.triggerProgram.running) {
      this.cancel(arg);
    } else {
      this.trigger(arg);
    }
  }

  close(done) {
    this.cancel('on');
    setImmediate(done);
  }

  static metadata(builder) {
    const binary = builder.enum('off', 'on');
    const percent = builder.range(0, 100);
    builder.usage.vpanel();
    builder.attribute('o0', percent);
    builder.attribute('o1', percent);
    builder.attribute('o2', percent);
    builder.attribute('o3', percent);
    builder.attribute('o4', percent);
    builder.attribute('o5', percent);
    builder.attribute('o6', percent);
    builder.attribute('o7', percent);
    builder.attribute('o8', percent);
    builder.attribute('o9', percent);
    builder.attribute('progress', percent);
    builder.attribute('running', binary);
    builder.action('trigger', binary);
    builder.action('cancel', binary);
    builder.action('toggle', binary);
    builder.config('initProgram', 'string'); // ex: 'o*-0'
    builder.config('triggerProgram', 'string'); // ex: 'o0-50 w-1s o0-100 o1-50 w-1s o0-0 o1-0'
    builder.config('cancelProgram', 'string'); // ex: 'o*-0'
  }
};
