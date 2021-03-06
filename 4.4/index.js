let gl;
let canvas;
let shaderProgram;

let floorVertexPositionBuffer;
let floorVertexIndexBuffer;

let cubeVertexPositionBuffer;
let cubeVertexIndexBuffer;

let modelViewMatrix;
let projectionMatrix;
let modelViewMatrixStack;

const createGLContext = (canvas) => {
  const context = canvas.getContext("webgl");

  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context");
  }

  return context;
};

const loadShaderFromDOM = (id) => {
  const shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  let shaderSource = "";
  let currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType === 3) {
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  const shader =
    shaderScript.type === "x-shader/x-fragment"
      ? gl.createShader(gl.FRAGMENT_SHADER)
      : gl.createShader(gl.VERTEX_SHADER);

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

const setupShaders = () => {
  const vertexShader = loadShaderFromDOM("shader-vs");
  const fragmentShader = loadShaderFromDOM("shader-fs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    "aVertexPosition"
  );
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(
    shaderProgram,
    "aVertexColor"
  );
  shaderProgram.uniformMVMatrix = gl.getUniformLocation(
    shaderProgram,
    "uMVMatrix"
  );
  shaderProgram.uniformProjMatrix = gl.getUniformLocation(
    shaderProgram,
    "uPMatrix"
  );

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  modelViewMatrix = mat4.create();
  projectionMatrix = mat4.create();
  modelViewMatrixStack = [];
};

const pushModelViewMatrix = () => {
  const copyToPush = mat4.create(modelViewMatrix);
  modelViewMatrixStack.push(copyToPush);
};

const popModelViewMatrix = () => {
  if (modelViewMatrixStack.length === 0) {
    throw "Error popModelViewMatrix() - Stack was empty";
  }
  modelViewMatrix = modelViewMatrixStack.pop();
};

const setupFloorBuffers = () => {
  floorVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
  const floorVertextPosition = [
    5.0,
    0.0,
    5.0,
    5.0,
    0.0,
    -5.0,
    -5.0,
    0.0,
    -5.0,
    -5.0,
    0.0,
    5.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(floorVertextPosition),
    gl.STATIC_DRAW
  );
  floorVertexPositionBuffer.itemSize = 3;
  floorVertexPositionBuffer.numberOfItems = 4;

  floorVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);
  const floorVertexIndices = [0, 1, 2, 3];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(floorVertexIndices),
    gl.STATIC_DRAW
  );
  floorVertexIndexBuffer.itemSize = 1;
  floorVertexIndexBuffer.numberOfItems = 4;
};

const setupCubeBuffers = () => {
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  const cubeVertexPosition = [
    1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    1.0,

    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,

    -1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,

    1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,

    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    -1.0,
    -1.0,
    1.0,
    1.0,

    1.0,
    -1.0,
    1.0,
    1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    -1.0,
    1.0,
  ];
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(cubeVertexPosition),
    gl.STATIC_DRAW
  );
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numberOfItems = 24;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  const cubeVertexIndices = [
    0,
    1,
    2,
    0,
    2,
    3,
    4,
    6,
    5,
    4,
    7,
    6,
    8,
    9,
    10,
    8,
    10,
    11,
    12,
    13,
    14,
    12,
    14,
    15,
    16,
    17,
    18,
    16,
    18,
    19,
    20,
    22,
    21,
    20,
    23,
    22,
  ];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeVertexIndices),
    gl.STATIC_DRAW
  );
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numberOfItems = 36;
};

const setupBuffers = () => {
  setupFloorBuffers();
  setupCubeBuffers();
};

const uploadModelViewMatrixToShader = () => {
  gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false, modelViewMatrix)
}

const uploadProjectionMatrixToShader = () => {
  gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false, projectionMatrix)
}

const drawFloor = (r, g, b, a) => {
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute)
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a)

  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer)
  gl.drawElements(gl.TRIANGLE_FAN, floorVertexIndexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0)
}

const drawCube = (r, g, b, a) => {
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute)
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a)

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0)
}

const drawTable = () => {
  // table top
  pushModelViewMatrix()
  mat4.translate(modelViewMatrix, [0.0, 1.0, 0.0], modelViewMatrix)
  mat4.scale(modelViewMatrix, [2.0, 0.1, 2.0], modelViewMatrix)
  uploadModelViewMatrixToShader()
  drawCube(0.72, 0.53, 0.04, 1.0)
  popModelViewMatrix()

  // table leg
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      pushModelViewMatrix()
      mat4.translate(modelViewMatrix, [i * 1.9, -0.1, j * 1.9], modelViewMatrix)
      mat4.scale(modelViewMatrix, [0.1, 1.0, 0.1], modelViewMatrix)
      uploadModelViewMatrixToShader()
      drawCube(0.72, 0.53, 0.04, 1.0)
      popModelViewMatrix()
    }
  }
}

const draw = () => {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  
  mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, projectionMatrix)
  mat4.identity(modelViewMatrix)
  mat4.lookAt([8, 5, -10], [0, 0, 0], [0, 1, 0], modelViewMatrix)

  uploadModelViewMatrixToShader()
  uploadProjectionMatrixToShader()

  drawFloor(1.0, 0.0, 0.0, 1.0)

  pushModelViewMatrix()
  mat4.translate(modelViewMatrix, [0.0, 1.1, 0.0], modelViewMatrix)
  uploadModelViewMatrixToShader()
  drawTable()
  popModelViewMatrix()

  pushModelViewMatrix()
  mat4.translate(modelViewMatrix, [0.0, 2.7, 0.0], modelViewMatrix)
  mat4.scale(modelViewMatrix, [0.5, 0.5, 0.5], modelViewMatrix)
  uploadModelViewMatrixToShader()
  drawCube(0.0, 0.0, 1.0, 1.0)
  popModelViewMatrix()

}

const startup = () => {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers()
  gl.clear(1.0, 1.0, 1.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  draw()
};
