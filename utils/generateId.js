const generateId = (prefix) => `${prefix}${Date.now()}`;

module.exports = generateId;
