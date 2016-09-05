'use strict';

module.exports = class SmartTimerBinary {
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
