(function() {
  'use strict';

  var DEFAULT_CANVAS_WIDTH = 1000;
  var DEFAULT_CANVAS_HEIGHT = 1000;
  var DEFAULT_ALLOWANCE = 20;

  var DRAWING_OPACITY = 0.25;

  var SHAPES = {
    point: function drawPoint(context, shape) {
      context.translate(shape.x, shape.y);
      context.beginPath();
      context.arc(0, 0, context.lineWidth, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    },

    line: function drawLine(context, shape) {
      context.beginPath();
      context.moveTo(shape.x1, shape.y1);
      context.lineTo(shape.x2, shape.y2);
      context.stroke();
    },

    circle: function drawCircle(context, shape) {
      context.translate(shape.x, shape.y);
      context.beginPath();
      context.arc(0, 0, shape.r, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    },

    ellispe: function drawEllispe(context, shape) {
      context.translate(shape.x, shape.y);
      context.scale(1, shape.r2 / shape.r1);
      context.beginPath();
      context.arc(0, 0, shape.r1, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    },

    rect: function drawRect(context, shape) {
      context.translate(shape.x, shape.y);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(shape.width, 0);
      context.lineTo(shape.width, shape.height);
      context.lineTo(0, shape.height);
      context.closePath();
      context.fill();
    },

    polygon: function drawPolygon(context, shape) {
      context.beginPath();
      context.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.slice(1).forEach(function drawSegment(point) {
        context.lineTo(point.x, point.y);
      });
      context.lineTo(shape.points[0].x, shape.points[0].y);
      context.closePath();
      context.fill();
    },
  };

  function applyThreshold(context, opacity) {
    var minOpacity = Math.floor(opacity * 255);
    var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    var data = imageData.data;
    for (var alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
      if (data[alphaIndex] < minOpacity) {
        data[alphaIndex] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
  }

  function drawShapes(shapes, options) {
    var config = Object.assign({
      canvas: null,
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      allowance: DEFAULT_ALLOWANCE,
    }, options);

    var canvas = config.canvas;
    if (canvas === null) {
      canvas = document.createElement('canvas');
      canvas.width = config.width;
      canvas.height = config.height;
    }
    testShapeCloseness.__lastCanvas = canvas; // This is useful for debugging.

    var context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = DRAWING_OPACITY;
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.lineWidth = config.allowance;

    shapes.forEach(function drawShape(shape) {
      context.save();
      SHAPES[shape.type](context, shape);
      context.restore();
      applyThreshold(context, DRAWING_OPACITY);
    });
    return context;
  }

  function countFilledPixels(context, opacity) {
    var opacityValue = Math.floor(opacity * 255);
    var pixels = 0;
    var data = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
    for (var alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
      if (data[alphaIndex] > opacityValue) {
        pixels += 1;
      }
    }
    return pixels;
  }

  function testShapeCloseness(shapes, options) {
    var context = drawShapes(shapes, options);
    var intersectArea = countFilledPixels(context, DRAWING_OPACITY);
    var unionArea = countFilledPixels(context, 0);
    return intersectArea / unionArea;
  }

  testShapeCloseness.__internals = {
    shapes: SHAPES,
  };

  if (typeof module !== 'undefined') {
    module.exports = testShapeCloseness;
  } else if (typeof window !== 'undefined') {
    window.testShapeCloseness = testShapeCloseness;
  }
}());
