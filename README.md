This function figures out how much an arbitrary set of shapes overlaps.

Give it some shapes and some dimensions.

```js
var SHAPES = [{
  type: 'point',
  x: 50,
  y: 50
}, {
  type: 'line',
  x1: 25,
  y1: 25,
  x2: 75,
  y2: 75
}, {
  type: 'circle',
  x: 50,
  y: 50,
  r: Math.sqrt(500 / Math.PI)
}, {
  type: 'ellispe',
  x: 50,
  y: 50,
  r1: Math.sqrt(500 / Math.PI),
  r2: Math.sqrt(400 / Math.PI)
}, {
  type: 'rect',
  x: 0,
  y: 0,
  width: 100,
  height: 100
}, {
  type: 'polygon',
  points: [{x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}, {x: 0, y: 50}]
}];

testShapeCloseness(SHAPES, {
  width: 640,
  height: 480
});
```

You can optionally pass in an existing canvas to use...

```js
testShapeCloseness(SHAPES, {
  canvas: document.getElementById('some-canvas');
});
```

...or an allowance for point size and line width.

```js
testShapeCloseness(SHAPES, {
  width: 1000,
  height: 500,
  allowance: 50
});
```
