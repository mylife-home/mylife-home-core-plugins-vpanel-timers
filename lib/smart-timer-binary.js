'use strict';

const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-vpanel-timers.SmartTimerBinary');
const Program = require('./program');

class BinaryProgram extends Program {

  constructor(source, canWait, owner) {
    super(source, canWait);
    this.owner = owner;
  }

  parseOutput(obj) {
    const key = Object.keys(obj)[0];
    const value = obj[key];
    switch(value) {
      case 'on':
      case 'off':
        return;
    }
    throw new Error(`Invalid out value: '${value}'`);
  }

  setOutput(name, value) {
    owner[name] = value;
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

    this.initProgram.run();

    this.out1 = 'off';
    this.out2 = 'off';
    this.out3 = 'off';
    this.out4 = 'off';
    this.out5 = 'off';
    this.out6 = 'off';
    this.out7 = 'off';
    this.out8 = 'off';
    this.out9 = 'off';
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
    builder.attribute('out5', binary);
    builder.attribute('out6', binary);
    builder.attribute('out7', binary);
    builder.attribute('out8', binary);
    builder.attribute('out9', binary);
    builder.attribute('progress', percent);
    builder.action('trigger', binary);
    builder.action('cancel', binary);
    builder.config('initProgram', 'string');
    builder.config('triggerProgram', 'string');
    builder.config('cancelProgram', 'string');
  }
};

