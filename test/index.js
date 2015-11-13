/* eslint-env mocha */

var testShapeCloseness = require('..');
var Canvas = require('canvas');
var assert = require('assert');

var OVERLAP_TOLERANCE = 0.05;

var exampleShapeData = {
  point: {
    whole: {type: 'point', x: 50, y: 50},
  },
  line: {
    whole: {type: 'line', x1: 25, y1: 25, x2: 75, y2: 75},
  },
  circle: {
    whole: {type: 'circle', x: 50, y: 50, r: Math.sqrt(5000 / Math.PI)},
    half: {type: 'circle', x: 50, y: 50, r: Math.sqrt(2500 / Math.PI)},
  },
  ellispe: {
    whole: {type: 'ellispe', x: 50, y: 50, r1: 25, r2: 50},
  },
  rect: {
    whole: {type: 'rect', x: 0, y: 0, width: 100, height: 100},
    half: {type: 'rect', x: 0, y: 0, width: 100, height: 50},
  },
  polygon: {
    whole: {type: 'polygon', points: [{x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}, {x: 0, y: 50}]},
    half: {type: 'polygon', points: [{x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}]},
  },
};

describe('testShapeCloseness', function() {
  it('exports a function', function() {
    assert.equal(typeof testShapeCloseness, 'function');
  });

  it('exposes some internals', function() {
    assert.equal(typeof testShapeCloseness.__internals, 'object');
  });

  it('exposes a list of its shapes', function() {
    assert.equal(typeof testShapeCloseness.__internals.shapes, 'object');
  });
});

Object.keys(testShapeCloseness.__internals.shapes).forEach(function(shape) {
  describe('Shape "' + shape + '"', function() {
    var wholeShapeData = exampleShapeData[shape].whole;
    var halfShapeData = exampleShapeData[shape].half;

    var testCanvas = new Canvas();
    testCanvas.width = 200;
    testCanvas.height = 200;

    var testOptions = {
      canvas: testCanvas,
    };

    it('overlaps itself perfectly', function() {
      var shapesToCompare = [wholeShapeData, wholeShapeData];
      var overlap = testShapeCloseness(shapesToCompare, testOptions);
      assert(1 - overlap < OVERLAP_TOLERANCE);
    });

    if (halfShapeData !== undefined) {
      it('overlaps a shape half as big', function() {
        var shapesToCompare = [wholeShapeData, halfShapeData];
        var overlap = testShapeCloseness(shapesToCompare, testOptions);
        assert(0.5 - overlap < OVERLAP_TOLERANCE);
      });
    }
  });
});
