(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    canvas: null,
    width: 1000,
    height: 1000,
    allowance: 20
  };

  var SHAPE_ALPHA = 15;

  var SHAPES = {
    point: function (context, shape) {
      context.translate(shape.x, shape.y);
      context.beginPath();
      context.arc(0, 0, context.lineWidth, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    },

    line: function (context, shape) {
      context.beginPath();
      context.moveTo(shape.x1, shape.y1);
      context.lineTo(shape.x2, shape.y2);
      context.stroke();
    },

    circle: function (context, shape) {
      context.translate(shape.x, shape.y);
      context.beginPath();
      context.arc(0, 0, shape.r, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    },

    ellispe: function (context, shape) {
      context.translate(shape.x, shape.y);
      context.scale(1, shape.r2 / shape.r1);
      context.beginPath();
      context.arc(0, 0, shape.r1, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    },

    rect: function (context, shape) {
      context.translate(shape.x, shape.y);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(shape.width, 0);
      context.lineTo(shape.width, shape.height);
      context.lineTo(0, shape.height);
      context.closePath();
      context.fill();
    },

    polygon: function (context, shape) {
      context.beginPath();
      context.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.slice(1).forEach(function (point) {
        context.lineTo(point.x, point.y);
      });
      context.lineTo(shape.points[0].x, shape.points[0].y);
      context.closePath();
      context.fill();
    }
  };

  function getContext (options) {
    var config = Object.assign({}, DEFAULT_CONFIG, options);

    var canvas = config.canvas;
    if (canvas === null) {
      canvas = document.createElement('canvas');
      canvas.width = config.width;
      canvas.height = config.height;
    }

    testShapeCloseness.__lastCanvas = canvas; // For debugging

    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.lineWidth = config.allowance;
    return context;
  }

  function getNonAntialiasedData (context) {
    var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    var data = imageData.data;
    for (var alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
      data[alphaIndex] = Math.round(data[alphaIndex] / 255) * SHAPE_ALPHA;
    }
    return imageData;
  }

  function assignImageDataAlpha (original, overlay) {
    var originalData = original.data;
    var overlayData = overlay.data;
    for (var alphaIndex = 3; alphaIndex < originalData.length; alphaIndex += 4) {
      originalData[alphaIndex] = originalData[alphaIndex] + overlayData[alphaIndex];
    }
  }

  function drawShape (context, shape) {
    var canvas = context.canvas;
    var originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    SHAPES[shape.type](context, shape);
    context.restore();

    var newImageData = getNonAntialiasedData(context);
    assignImageDataAlpha(originalImageData, newImageData);
    context.putImageData(originalImageData, 0, 0);
  }

  function countFilledPixels (context, minAlpha) {
    var pixels = 0;
    var data = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
    for (var alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
      if (data[alphaIndex] > minAlpha) {
        pixels += 1;
      }
    }
    return pixels;
  }

  function testShapeCloseness (shapes, options) {
    var context = getContext(options);
    shapes.forEach(drawShape.bind(null, context));
    var intersectArea = countFilledPixels(context, SHAPE_ALPHA);
    var unionArea = countFilledPixels(context, 0);
    return intersectArea / unionArea;
  }

  testShapeCloseness.__internals = {
    shapes: SHAPES
  };

  if (typeof module !== 'undefined') {
    module.exports = testShapeCloseness;
  } else if (typeof window !== 'undefined') {
    window.testShapeCloseness = testShapeCloseness;
  }
}());
