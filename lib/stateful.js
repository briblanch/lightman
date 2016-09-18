'use strict';

let proto = {
  state: {},
  resetState() {
    this.state = Object.assign({}, this.initialState);
  }
}

let stateful = function(config = {}) {
  let obj = Object.assign({}, proto, config);
  obj.resetState();

  return obj
};

module.exports = stateful;
