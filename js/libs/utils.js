
// avoid global pollution
(function(root, factory) {
  root.utils = factory();
}(this, function() {
  if (!FEUtils) {
    throw new Error(`class CommonUtils is needed`);
  }
  class Utils extends FEUtils {
    constructor() {
      super();
    }
  }

  return new Utils();
}))