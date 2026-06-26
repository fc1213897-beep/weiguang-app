const auth = require("./utils/auth.js");

App({
  onLaunch() {
    auth.ensureSession().catch(() => {});
  },

  onShow() {
    auth.ensureSession().catch(() => {});
  },
});
