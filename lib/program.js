'use strict';

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
  }

  parse() {
    this.tokens = prog.split(' ').map(part => {
      const items = part.split('-');
      if(items.length !== 2) {
        throw new Error(`Invalid program: Invalid part: '${part}'`);
      }
      const [name, value] = items;
      const ret = {};
      ret[name] = value;

      if(outputs.includes(name)) {
        parseOutput(ret);
      }
      if(name === 'wait') {
        parseWait(ret);
      }

      throw new Error(`Invalid program: Invalid part: '${part}'`);

      return ret;
    });
  }

  parseOutput(obj) {
    void ret;
  }

  parseWait(obj) {
    if(!canWait) {
      throw new Error('Invalid program: wait not allowed');
    }

    const value = obj.wait;
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
      obj.wait = nb*mul;
    }
  }

  run() {
    // TODO
  }

  interrupt() {
    // TODO
  }
};
