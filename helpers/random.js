function randomRange(from, to) {
  return from + Math.round((to - from) * Math.random());
}

module.exports = { randomRange };
