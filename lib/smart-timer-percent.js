'use strict';

const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-vpanel-timers.SmartTimerPercent');
const Program = require('./program');

class BinaryPercent extends Program {

  constructor(source, canWait) {
    super(source, canWait);
  }

  parseOutput(obj) {
    const key = Object.keys(obj)[0];
    const value = parseInt(obj[key]);
    if(isNaN(value) || value < 0 || value > 100) {
      throw new Error(`Invalid out value: '${obj[key]}'`);
    }
    obj[key] = value;
  }
};

module.exports = class SmartTimerPercent {
  constructor(config) {
  }

  trigger(arg) {
  }

  cancel(arg) {
  }

  close(done) {
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
