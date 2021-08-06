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

const startup = () => {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
};
