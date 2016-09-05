'use strict';

const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-vpanel-timers.SmartTimerPercent');
const Program = require('./program');

class PercentProgram extends Program {

  constructor(source, canWait, owner) {
    super(source, canWait);
    this.owner = owner;
  }

  parseOutput(obj) {
    const key = Object.keys(obj)[0];
    const value = parseInt(obj[key]);
    if(isNaN(value) || value < 0 || value > 100) {
      throw new Error(`Invalid out value: '${obj[key]}'`);
    }
    obj[key] = value;
  }

  setOutput(name, value) {
    owner[name] = value;
  }
};

module.exports = class SmartTimerPercent {
  constructor(config) {
    this.initProgram = new PercentProgram(config.initProgram, false, this);
    this.triggerProgram = new PercentProgram(config.triggerProgram, true, this);
    this.cancelProgram = new PercentProgram(config.cancelProgram, false, this);

    this.initProgram.parse();
    this.triggerProgram.parse();
    this.cancelProgram.parse();

    this.initProgram.run();

    this.out1 = 0;
    this.out2 = 0;
    this.out3 = 0;
    this.out4 = 0;
    this.out5 = 0;
    this.out6 = 0;
    this.out7 = 0;
    this.out8 = 0;
    this.out9 = 0;
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
    builder.attribute('out5', percent);
    builder.attribute('out6', percent);
    builder.attribute('out7', percent);
    builder.attribute('out8', percent);
    builder.attribute('out9', percent);
    builder.attribute('progress', percent);
    builder.action('trigger', binary);
    builder.action('cancel', binary);
    builder.config('initProgram', 'string');
    builder.config('triggerProgram', 'string');
    builder.config('cancelProgram', 'string');
  }
};
