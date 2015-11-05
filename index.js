(function() {
  var DEFAULT_CANVAS_WIDTH = 1000;
  var DEFAULT_CANVAS_HEIGHT = 1000;
  var DEFAULT_ALLOWANCE = 10;
  var DRAWING_OPACITY = 0.25;

  var SHAPES = {
    point: {
      signature: ['x', 'y'],
      draw: function drawPoint(context, shape) {
        context.translate(shape.x, shape.y);
        context.beginPath();
        context.arc(0, 0, context.lineWidth, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
      },
    },

    line: {
      signature: ['x1', 'y1', 'x2', 'y2'],
      draw: function drawLine(context, shape) {
        context.beginPath();
        context.moveTo(shape.x1, shape.y1);
        context.lineTo(shape.x2, shape.y2);
        context.stroke();
      },
    },

    circle: {
      signature: ['x', 'y', 'r'],
      draw: function drawCircle(context, shape) {
        context.translate(shape.x, shape.y);
        context.beginPath();
        context.arc(0, 0, shape.r, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
      },
    },

    ellispe: {
      signature: ['x', 'y', 'r1', 'r2', 'angle'],
      draw: function drawEllispe(context, shape) {
        context.translate(shape.x, shape.y);
        context.scale(1, shape.r2 / shape.r1);
        context.beginPath();
        context.arc(0, 0, shape.r1, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
      },
    },

    rect: {
      signature: ['x', 'y', 'width', 'height'],
      draw: function drawRect(context, shape) {
        context.translate(shape.x, shape.y);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(shape.width, 0);
        context.lineTo(shape.width, shape.height);
        context.lineTo(0, shape.height);
        context.closePath();
        context.fill();
      },
    },

    polygon: {
      signature: ['points'],
      draw: function drawPolygon(context, shape) {
        context.beginPath();
        context.moveTo(shape.points[0].x, shape.points[0].y);
        shape.points.slice(1).forEach(function drawSegment(point) {
          context.lineTo(point.x, point.y);
        });
        context.lineTo(shape.points[0].x, shape.points[0].y);
        context.closePath();
        context.fill();
      },
    },
  };

  var shapesBySignature = Object.keys(SHAPES).reduce(function addSignature(allSignatures, shapeName) {
    var shapeSignature = SHAPES[shapeName].signature.sort().join(',');
    allSignatures[shapeSignature] = shapeName;
    return allSignatures;
  }, {});

  function determineShape(data) {
    var dataSignature = Object.keys(data).sort().join(',');
    return shapesBySignature[dataSignature];
  }

  function drawShapes(shapes, options) {
    var config = Object.assign({
      allowance: DEFAULT_ALLOWANCE,
      canvas: null,
    }, options)

    var canvas = config.canvas;
    if (canvas === null) {
      canvas = document.createElement('canvas');
      canvas.width = DEFAULT_CANVAS_WIDTH;
      canvas.height = DEFAULT_CANVAS_HEIGHT;
    }
    canvas.width = canvas.width; // Clear the canvas.

    var context = canvas.getContext('2d');
    context.globalAlpha = DRAWING_OPACITY;
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    context.lineWidth = config.allowance;

    shapes.forEach(function drawShape(shape) {
      context.save();
      SHAPES[shape.type].draw(context, shape);
      context.restore();
    });
    return context;
  }

  function countFilledPixels(context, opacity) {
    var opacityValue = Math.floor(opacity * 255);
    var pixels = 0;
    var data = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
    for (var i = 3; i < data.length; i += 4) {
      if (data[i] > opacityValue) {
        pixels += 1;
      }
    }
    return pixels;
  }

  function testShapeCloseness(first, second, options) {
    var firstShapeType = determineShape(first);
    var secondShapeType = determineShape(second);
    var firstShape = Object.assign({}, first, {type: firstShapeType});
    var secondShape = Object.assign({}, second, {type: secondShapeType});
    var context = drawShapes([firstShape, secondShape], options);
    var intersectArea = countFilledPixels(context, DRAWING_OPACITY);
    var unionArea = countFilledPixels(context, 0);
    return intersectArea / unionArea;
  }

  if (typeof module !== 'undefined') {
    module.exports = testShapeCloseness;
  } else if (typeof window !== 'undefined') {
    window.testShapeCloseness = testShapeCloseness;
  }
}());
