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
};

module.exports = class SmartTimerBinary {
  constructor(config) {
    this.initProgram = new BinaryProgram(config.initProgram, false, this);
    this.triggerProgram = new BinaryProgram(config.triggerProgram, true, this);
    this.cancelProgram = new BinaryProgram(config.cancelProgram, false, this);

    this.initProgram.parse();
    this.triggerProgram.parse();
    this.cancelProgram.parse();

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
    builder.attribute('out1', binary);
    builder.attribute('out2', binary);
    builder.attribute('out3', binary);
    builder.attribute('out4', binary);
    builder.attribute('progress', percent);
    builder.action('trigger', binary);
    builder.action('cancel', binary);
    builder.config('initProgram', 'string');
    builder.config('triggerProgram', 'string');
    builder.config('cancelProgram', 'string');
  }
};

