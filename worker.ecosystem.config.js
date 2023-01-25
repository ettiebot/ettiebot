module.exports = {
  "apps" : [{
    "name"        : "ettie-worker",
    "script"      : "build/worker/index.js",
    "env": {
      "DISPLAY": ":99"
    }
  },
  {
    "name"        : "Xvfb",
    "interpreter" : "none",
    "script"      : "Xvfb",
    "args"        : ":99"
  }]
}