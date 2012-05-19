/*!
  * Cls: Lightweight class abstraction in JavaScript
  * https://github.com/alessioalex/Cls
  * License MIT (c) Alexandru Vladutu
  */

(function(root) {
  "use strict";

  /**
   * Create a 'class' with the instance methods speficied in opts.methods and
   * the class methods specified in opts.statics. If any super class is
   * provided by opts.uber, inherited from that class.
   *
   * @param {Object} Options hash with 3 props: uber, methods, statics.
   * @returns {Function}
   */
  function Cls(opts) {
    var Child, i, ctor, methods, statics;

    opts = opts || {};

    // Assign ctor the parent constructor if specified or an empty function
    if (opts.uber) {
      ctor = function() {
        return Child.uber.constructor.apply(this, arguments);
      };
    } else {
      ctor = function() {};
    }

    methods = opts.methods || {};
    statics = opts.statics || {};

    // Assign Child the custom constructor or ctor defined above
    Child = (methods.hasOwnProperty('constructor')) ? methods.constructor : ctor;

    Cls.extendz(Child, opts.uber);

    Cls.mixin(Child.prototype, methods);
    Cls.mixin(Child, statics);

    /**
     * Call parent method from inside the child using this.inherited
     *
     * @param {String} The name of the method.
     * @param {Array} The arguments for that method.
     */
    Child.prototype.inherited = function(methodName, args) {
      var exists;

      exists = Child.uber && Child.uber[methodName];

      return exists ? Child.uber[methodName].apply(this, args) : null;
    };

    return Child;
  }

  /**
   * Implement properties from an object to another.
   *
   * @param {Object} The 'receiver' of the new properties.
   * @param {Object} The 'sender' of the properties.
   * @return {Object}
   */
  Cls.mixin = function(to, from) {
    var prop;

    for (prop in from) {
      if (from.hasOwnProperty(prop)) {
        to[prop] = from[prop];
      }
    }

    return to;
  };

  /**
   *
   * Returns a function that inherits the prototype of the super function
   * and its properties.
   *
   * @param {Function} The child function.
   * @param {Function} The parent function.
   * @return {Function}
   * @api public
   */
  Cls.extendz = function(Child, Parent) {
    if (typeof Parent === 'undefined') {
      return Child;
    }

    // Copy the properties ('class properties / methods') from the parent
    Cls.mixin(Child, Parent);

    /**
     * The prototype of the parent is not directly assigned to the prototype
     * of the child because when altering the child's prototype we don't want
     * to also alter the parent's prototype.
     *
     * An empty object is used instead of a new parent object
     * because there's no need to inherit anything other than the prototype
     * (such as custom properties of a newly created parent object).
     */
    function Temp() { this.constructor = Child; }
    Temp.prototype = Parent.prototype;
    Child.prototype = new Temp();

    // Store the parent prototype into the uber property
    Child.uber = Parent.prototype;

    return Child;
  };

  // Store the previous value of Cls
  Cls.prevCls = root.Cls;

  // Check for environment: browser or Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cls;
  } else {
    root.Cls = Cls;
  }

  /**
   * Keeps the ex-value of the global Cls variable unmodified and
   * returns the Cls function defined above.
   *
   * @return {Function}
   */
  Cls.noConflict = function() {
    root.Cls = Cls.prevCls;
    return Cls;
  };
}(this));
