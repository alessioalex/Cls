Cls
--------
An interface for classical object oriented programming in JavaScript.

API
---------
<h3>Creating a class with Cls</h3>

``` js
var Slideshow, sshow;

Slideshow = Cls({
  methods: {
    constructor: function(slides, effect) {
      this.slides = slides;
      this.effect = effect;
    },
    goTo: function(slide) {
      domSelector('#id').nextSlide(slide, this.effect);
    }
  },
  statics: {
    version: '0.0.1'
  }
});

sshow = new Slideshow(['top_story', 'sport', 'politics'], 'fade');
```

<h3>Extending that class</h3>

``` js
var MegaSlideshow, mshow;

MegaSlideshow = Cls({
  uber: Slideshow,
  methods: {
    goTo: function(slide) {
      var that = this;

      this.changePageTitle(slide, function() {
        that.inherited('next');
      });
    }
  }
});
```

<h3>Mixins</h3>

You can override / add methods to a class/object (any object) using Cls.mixin(obj, { /* methods */ }):

``` js
var laptop = {
  os: 'OSX Lion',
  processor: 'i5'
};

laptop = Cls.mixin(laptop, { memory: '8GB', cores: 5 });
```

Environments
------------
You can use Cls in the browser or in a Node.js app.

<h3>In the browser</h3>

``` html
<script src="path/to/cls.js"></script>
<!-- Cls() is exposed as a global var -->

<script type="text/javascript">
  var Foo = Cls({ ... });
  ...
</script>
```

<h3>Node.js</h3>

``` js
var Cls = require('Cls');

var Foo = Cls({ ... });
```

Install the Package!
--------------------
Install the package with npm manually or by including the app into your package.json dependencies.

    $ npm install Cls

    // then, in your Node app
    var Cls = require('Cls')

Developers
----------

    $ npm install .
    $ npm test
    $ npm run-script build

Only edit the file `src/cls.js`.
For more examples check `test/tests.js`.

Why did I write this library?
-----------------------------

- prototype is a long word
- People are used to classes from other languages
- Although CoffeeScript's Class implementation is nice, if you have 10 files that use OOP the __extends function is defined 10 times
- I don't like the functionality provided by most of the similar OOP libraries or I consider them bloated

Bonus - for CoffeeScript fans
-----------------------------
```js
log = console.log
Cls = require './cls'

Animal = Cls
  methods:
    constructor: (@name) ->

    move: (meters) ->
      log "#{@name} moved #{meters} meters"

  statics:
    types: ['vertebrates', 'invertebrates']

Snake = Cls
  uber: Animal
  methods:
    move: ->
      log "Slithering..."
      setTimeout =>
        this.inherited 'move', [5]
      , 300

Horse = Cls
  uber: Animal
  methods:
    move: ->
      log "Galloping..."
      args = arguments
      setTimeout =>
        this.inherited 'move', args
      , 1500

sam = new Snake "Sammy the Python"
tom = new Horse "Tommy the Palomino"

sam.move()
tom.move(45)
```
