var FastRandom = function () {
  this.getNextFloat = function () {
    return Math.random();
  };
};

var ParticleWave = function (canvasSelector) {
  var me = this;

  var config = {
    colors: {
      background: 0x000000,
      particle: 0x477cc2
    },
    alpha: {
      particle: 1
    },
    particleCount: 30000
  };

  var TAU = Math.PI * 2;

  var random = new FastRandom();

  var particle;
  var particleFillStyle;
  var particleColorRGB = new Float32Array(3);

  var smoothGradient;
  var waterGradient;

  var canvas;
  var engine;

  var width;
  var height;

  var particleWaveWalker = 0;
  var randomWalker = 0;

  var requestTick = function () {
    window.requestAnimationFrame(tick);
  };

  var initParticle = function () {
    particle = new Float32Array(config.particleCount * 2);

    eachParticle(function (x, z) {
      particle[x] = random.getNextFloat();
      particle[z] = random.getNextFloat();
    });
  };

  var initCanvas = function () {
    canvas = document.querySelector(canvasSelector);

  
    engine = canvas.getContext('2d');

    width = canvas.width;
    height = canvas.height;

    // canvas.setAttribute('width', width);
    // canvas.setAttribute('height', height);
  };

  var initParticleColor = function () {
    particleColorRGB[0] = config.colors.particle >> 16 & 0xff;
    particleColorRGB[1] = config.colors.particle >> 8 & 0xff;
    particleColorRGB[2] = config.colors.particle & 0xff;

    particleFillStyle = 'rgb(' + particleColorRGB[0] + ',' + particleColorRGB[1] + ',' + particleColorRGB[2] +
      ')';
  };

  var initSmoothGradient = function () {
    smoothGradient = engine.createLinearGradient(
      width / 2,
      0,
      width / 2,
      height
    );

    smoothGradient.addColorStop(0.25, 'rgba(0, 0, 0, 0)');

    smoothGradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.9)');
    smoothGradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)');
    smoothGradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.9)');

    smoothGradient.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
  };

  var initWaterGradient = function () {
    waterGradient = engine.createLinearGradient(
      width / 2,
      height / 2,
      width / 2,
      height
    );

    waterGradient.addColorStop(0, 'rgba(0, 0, 30, 0)');
    waterGradient.addColorStop(1, 'rgba(30, 0, 60, 0.5)');
  };

  var init = function () {
    initCanvas();
    initParticle();
    initParticleColor();
    initSmoothGradient();
    initWaterGradient();
  };

  var eachParticle = function (cb) {
    for (var i = 0; i < particle.length; i += 2) {
      cb(i, i + 1);
    }
  };

  var renderParticle = function () {
    randomWalker += (Math.random() - 0.5) * 0.1;

    particleWaveWalker += 0.03;

    var radius = {
      min: 1,
      add: 5
    };

    var midY = height / 2;
    var midX = width / 2;

    var spreadX = 5;
    var spreadZ = 0.0;

    var modZ = 0.0;

    var addX = 0;
    var addY = 0;

    var p = {
      x: 0.0,
      y: 0.0,
      r: 0.0
    };

    engine.fillStyle = particleFillStyle;
    // engine.beginPath();

    var waveControl = 10;

    for (var i = 0, xIndex, zIndex; i < particle.length; i += 2) {

      xIndex = i;
      zIndex = i + 1;

      particle[zIndex] += 0.003;

      if (particle[zIndex] > 1) {
        particle[zIndex] = 0;
        particle[xIndex] = random.getNextFloat();
      }

      if (particle[zIndex] < 0.3) {
        continue;
      }

      modZ = Math.pow(particle[zIndex], 2);
      spreadZ = 1 + (spreadX - 1) * modZ;

      //bottom

      addX = (0.5 - particle[xIndex]) * width * spreadZ;
      addY = midY * modZ * (1 + 3 / waveControl);

      p.x = midX + addX;
      p.y = midY + addY;
      p.r = radius.min + modZ * radius.add;

      p.y += Math.sin(particle[xIndex] * 50 + particleWaveWalker) * addY / waveControl;
      p.y += Math.cos(particle[zIndex] * 10 + particleWaveWalker) * addY / waveControl;

      p.y -= Math.cos(particle[zIndex] + particle[xIndex] * 10 + particleWaveWalker) * addY / waveControl;

      p.y -= Math.cos(particle[xIndex] * 50 + particleWaveWalker) * addY / waveControl;
      p.y -= Math.sin(particle[zIndex] * 10 + particleWaveWalker) * addY / waveControl;

      if (p.x < 0 || p.x > width) {
        continue;
      }

      engine.fillRect(p.x, p.y, p.r, p.r);

      // engine.moveTo(p.x, p.y);
      // engine.arc(p.x, p.y, p.r, 0, TAU);

      //top
      // p.y = height - p.y;
      //
      // engine.moveTo(p.x, p.y);
      // engine.arc(p.x, p.y, p.r, 0, TAU);
    }

    engine.fillStyle = particleFillStyle;

    // engine.closePath();
    // engine.fill();
  };

  var colorIntToHexString = function (color) {
    var s = color.toString(16);

    return '0'.repeat(6 - s.length) + s;
  };

  var clear = function () {
    engine.fillStyle = '#' + colorIntToHexString(config.colors.background);
    engine.fillRect(0, 0, width, height);
  };

  var drawSmooth = function () {
    engine.fillStyle = smoothGradient;
    engine.fillRect(0, 0, width, height);
  };

  var drawWater = function () {
    engine.fillStyle = waterGradient;
    engine.fillRect(0, height / 2, width, height / 2);
  };

  var tick = function () {
    clear();

    drawWater();
    renderParticle();
    drawSmooth();

    requestTick();
  };

  this.run = function () {
    init();
    tick();
  };
};

