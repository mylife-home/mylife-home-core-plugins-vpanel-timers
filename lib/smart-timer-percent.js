'use strict';

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
