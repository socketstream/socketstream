var UniqueSet;

UniqueSet = require('../utils/unique_set').UniqueSet;

module.exports = {
  user: new UniqueSet,
  channel: new UniqueSet
};
