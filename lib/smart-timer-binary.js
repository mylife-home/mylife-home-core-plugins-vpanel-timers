'use strict';

const Program = require('./program');

class BinaryProgram extends Program {

  constructor(source, canWait, owner) {
    super(source, canWait);
    this.owner = owner;
  }

  parseOutput(step) {
    const { value } = step;
    switch(value) {
      case 'on':
      case 'off':
        return;
    }
    throw new Error(`Invalid out value: '${value}'`);
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

module.exports = class SmartTimerBinary {
  constructor(config) {
    this.initProgram = new BinaryProgram(config.initProgram, false, this);
    this.triggerProgram = new BinaryProgram(config.triggerProgram, true, this);
    this.cancelProgram = new BinaryProgram(config.cancelProgram, false, this);

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
    builder.attribute('o0', binary);
    builder.attribute('o1', binary);
    builder.attribute('o2', binary);
    builder.attribute('o3', binary);
    builder.attribute('progress', percent);
    builder.attribute('running', binary);
    builder.action('trigger', binary);
    builder.action('cancel', binary);
    builder.action('toggle', binary);
    builder.config('initProgram', 'string'); // ex: 'o*-off'
    builder.config('triggerProgram', 'string'); // ex: 'o0-on w-1s o0-off o1-on w-1s o1-off'
    builder.config('cancelProgram', 'string'); // ex: 'o*-off'
  }
};

