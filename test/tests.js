var Cls = require('../src/cls'),
    Person;

function ok(expr, msg) {
  if (!expr) { throw new Error(msg); }
}

Person = Cls({
  methods: {
    constructor: function(name, age) {
      this.name = name;
      this.age  = age;
    },
    whois: function() {
      return { "name": this.name, "age": this.age };
    },
    eat: function() {
      return this.name + ' is eating.';
    },
    toString: function() {
      return this.name + ', ' + this.age;
    },
    livesIn: function(country) {
      this.country = country;
    }
  },
  statics: {
    gender: ['male', 'female'],
    abilities: ['walk', 'talk'],
    getRandomName: function() {
      var _names;

      _names = ['Jake', 'Shawn', 'Keith', 'Alex'];

      return _names[Math.floor(Math.random() * _names.length)];
    }
  }
});

suite('Cls');

test('constructor should be called only once', function(done) {
  var TestClass, called, dummy;

  called = 0;

  TestClass = Cls({
    methods: {
      constructor: function() {
        called++;
      }
    }
  });

  dummy = new TestClass();
  ok(called === 1, 'constructor called only once');

  setTimeout(function() {
    ok(called === 1, 'a second constructor is never called');
    done();
  }, 100);
});

test('should create a simple class', function() {
  var Dummy;

  Dummy = Cls({
    methods: {
      constructor: function(thing) {
        this.thing = thing;
      }
    }
  });

  ok(new Dummy('abc').thing === 'abc', 'created a class');
});

test("constructor shouldn't be required", function() {
  var Dummy;

  Dummy = Cls({
    methods: {
      speak: function() {
        return 'He..llo?';
      }
    }
  });

  ok(new Dummy().speak() === 'He..llo?',
    'created new object without defining class constructor');
});

test('should create instance methods (methods)', function() {
  var man;

  man = new Person('Andy', 22);

  ok(man.whois().name === 'Andy' && man.toString() === 'Andy, 22',
    'created instance methods');
});

test('should create class methods / properties (statics)', function() {
  var P, toJson;

  P = Person, toJson = JSON.stringify;

  ok(toJson(P.gender) === toJson(['male', 'female'])
    && toJson(P.abilities) === toJson(['walk', 'talk'])
    && (typeof P.getRandomName() === 'string'), 'created class methods / props');
});

test('should implement mixins', function() {
  var Dummy, dumb;

  Dummy = Cls({
    methods: {
      speak: function() {
        return 'He..llo?';
      }
    }
  });

  Cls.mixin(Dummy, {
    clsName: 'Dummy',
    foo: function() {
      return 'bar';
    }
  });

  dumb = new Dummy();

  Cls.mixin(dumb, {
    name: 'zxc',
    run: function() {
      return 'running';
    }
  });

  ok(Dummy.clsName === 'Dummy' && Dummy.foo() === 'bar' &&
     dumb.name === 'zxc' && dumb.run() === 'running',
     'implemented mixins')
});

test('should be instances of their classes', function() {
  var Base, Inheritor, b, i;

  Base = Cls();
  Inheritor = Cls({ uber: Base });

  b = new Base();
  i = new Inheritor();
  ok(i instanceof Inheritor, 's is instance of Inheritor');
  ok(b instanceof Base, 'b is instance of Base');
});

test('sub class should inherit methods / props from super class', function() {
  var Student, s, toJson = JSON.stringify;

  Student = Cls({
    uber: Person,
    methods: {
      read: function(book) {
        return 'reading ' + book;
      }
    }
  });

  s = new Student('Blyth', 25);

  ok(s.name === 'Blyth' && s.age === 25 && s.toString() === 'Blyth, 25',
    'inherited instance methods');
  ok(toJson(Student.gender) === toJson(['male', 'female']),
    'inherited class methods');
});

test('should remember parent prototype in SubClass.inherited', function() {
  var SubClass, _names, i, allCopied;

  allCopied = true;
  _names = ['Jake', 'Shawn', 'Keith', 'Alex'];
  SubClass = Cls({ uber: Person });

  function Dummy() {
    this.name = 'Dummy';
    this.age = 10;
  }

  for (i in SubClass.uber) {
    allCopied = allCopied && (i in Person.prototype);
  }

  ok(SubClass.uber.toString.call(new Dummy()) === 'Dummy, 10', 'called original parent method');
  ok(allCopied, 'parent prototype is fully copied');
});

test('should call super method from SubClass', function(done) {
  var Worker, w, toJson = JSON.stringify;

  Worker = Cls({
    uber: Person,
    methods: {
      constructor: function(name, age, nick) {
        // this.inherited('constructor', arguments)
        this.inherited('constructor', [name, age]);
        this.nick = nick;
      },
      eat: function(x, callback) {
        var actions, that;

        that = this;
        actions = [];

        actions.push('Eating ' + x);

        setTimeout(function() {
          actions.push(that.inherited('eat'));
          callback(actions);
        }, 100);
      },
      livesIn: function(country, city) {
        // call the super function => this.country = country
        this.inherited('livesIn', arguments);
        this.city = city;
      }
    }
  });

  w = new Worker('John', 21, 'Esse');
  w.livesIn('Italy', 'Rome');

  w.eat('stake', function(actions) {
    ok(toJson(actions) === toJson(['Eating stake', 'John is eating.']),
      'super methods order');
    ok(w.nick === 'Esse' && w.country === 'Italy' && w.city === 'Rome',
      'proper attributes');
    done();
  });
});

test("calling non-existing super method doesn't throw err", function() {
  var Dummy, SuperDummy, dumb, superDumb;

  Dummy = Cls({
    methods: {
      constructor: function(name) {
        this.name = name;
      }
    }
  });

  SuperDummy = Cls({
    uber: Dummy,
    methods: {
      walk: function() {
        this.inherited('walk', arguments);
      }
    }
  });

  dumb = new Dummy('test');
  superDumb = new SuperDummy('test2');
  superDumb.walk();
});
