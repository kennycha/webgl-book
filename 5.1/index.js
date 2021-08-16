let gl;
const pwgl = {};
pwgl.ongoingImageLoads = [];
let canvas;

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

  let shader;
  if (shaderScript.type === "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  } else if (shaderScript.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

const setupShaders = () => {
  const vertexShader = loadShaderFromDOM("shader-vs");
  const fragmentShader = loadShaderFromDOM("shader-fs");

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) && !gl.isContextLost()) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  pwgl.vertexPositionAttributeLoc = gl.getAttribLocation(
    shaderProgram,
    "aVertexPosition"
  );
  pwgl.vertexTextureAttributeLoc = gl.getAttribLocation(
    shaderProgram,
    "aTextureCoordinates"
  );
  pwgl.uniformMVMatrixLoc = gl.getUniformLocation(
    shaderProgram,
    "uMVMatrix"
  );
  pwgl.uniformProjMatrixLoc = gl.getUniformLocation(
    shaderProgram,
    "uPMatrix"
  );
  pwgl.uniformSamplerLoc = gl.getUniformLocation(shaderProgram, 'uSampler')

  gl.enableVertexAttribArray(pwgl.vertexPositionAttributeLoc);
  gl.enableVertexAttribArray(pwgl.vertexTextureAttributeLoc)

  pwgl.modelViewMatrix = mat4.create();
  pwgl.projectionMatrix = mat4.create();
  pwgl.modelViewMatrixStack = [];
};

const pushModelViewMatrix = () => {
  const copyToPush = mat4.create(pwgl.modelViewMatrix);
  pwgl.modelViewMatrixStack.push(copyToPush);
};

const popModelViewMatrix = () => {
  if (pwgl.modelViewMatrixStack.length === 0) {
    throw "Error popModelViewMatrix() - Stack was empty";
  }
  pwgl.modelViewMatrix = pwgl.modelViewMatrixStack.pop();
};

const setupFloorBuffers = () => {
  pwgl.floorVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexPositionBuffer);
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
  pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE = 3;
  pwgl.FLOOR_VERTEX_POS_BUF_NUM_ITEMS = 4;

  pwgl.floorVertexTextureCoordinateBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexTextureCoordinateBuffer);
  const floorVertexTextureCoordinates = [
    2.0, 0.0,
    2.0, 2.0,
    0.0, 2.0,
    0.0, 0.0
  ]
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(floorVertexTextureCoordinates),
    gl.STATIC_DRAW
  );
  pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2
  pwgl.FLOOR_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 4

  pwgl.floorVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.floorVertexIndexBuffer);
  const floorVertexIndices = [0, 1, 2, 3];  
            
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), 
                gl.STATIC_DRAW);

  pwgl.FLOOR_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
  pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS = 4;
};

const setupCubeBuffers = () => {
  pwgl.cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexPositionBuffer);
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
  pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE = 3;
  pwgl.CUBE_VERTEX_POS_BUF_NUM_ITEMS = 24;

  pwgl.cubeVertexTextureCoordinateBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexTextureCoordinateBuffer)
  const textureCoordinates = [
    0.0, 0.0,    1.0, 0.0,    1.0, 1.0,    0.0, 1.0,    
    0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    
    0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    
    0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    
    0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,    
    0.0, 1.0,    1.0, 1.0,    1.0, 0.0,    0.0, 0.0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW)
  pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2
  pwgl.CUBE_VERTEX_TEX_COORD_BUF_NUM_ITEMS - 24

  pwgl.cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.cubeVertexIndexBuffer);
  const cubeVertexIndices = [
    0, 1, 2, 0, 2, 3,   
    4, 6, 5, 4, 7, 6,   
    8, 9, 10, 8, 10, 11, 
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 22, 21, 20, 23, 22 
  ];
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeVertexIndices),
    gl.STATIC_DRAW
  );
  pwgl.CUBE_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
  pwgl.CUBE_VERTEX_INDEX_BUF_NUM_ITEMS = 36;
};

const textureFinishedLoading = (image, texture) => {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  gl.generateMipmap(gl.TEXTURE_2D)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
  gl.bindTexture(gl.TEXTURE_2D, null)
}

const loadImageForTexture = (url, texture) => {
  const image = new Image()
  image.onload = () => {
    pwgl.ongoingImageLoads.splice(pwgl.ongoingImageLoads.indexOf(image), 1)
    textureFinishedLoading(image, texture)
  }
  pwgl.ongoingImageLoads.push(image)
  image.crossOrigin = 'anonymous'
  image.src = url
}

const setupTextures = () => {
  pwgl.woodTexture = gl.createTexture()
  loadImageForTexture('wood_128x128.jpg', pwgl.woodTexture)

  pwgl.groundTexture = gl.createTexture()
  loadImageForTexture('wood_floor_256.jpg', pwgl.groundTexture)

  pwgl.boxTexture = gl.createTexture()
  loadImageForTexture('wicker_256.jpg', pwgl.boxTexture)
}

const setupBuffers = () => {
  setupFloorBuffers();
  setupCubeBuffers();
};

const uploadModelViewMatrixToShader = () => {
  gl.uniformMatrix4fv(pwgl.uniformMVMatrixLoc, false, pwgl.modelViewMatrix)
}

const uploadProjectionMatrixToShader = () => {
  gl.uniformMatrix4fv(pwgl.uniformProjMatrixLoc, false, pwgl.projectionMatrix)
}

const drawFloor = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexPositionBuffer)
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc, pwgl.FLOOR_VERTEX_POS_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0)
  
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.floorVertexTextureCoordinateBuffer)
  gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc, pwgl.FLOOR_VERTEX_TEX_COORD_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0)
  
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, pwgl.groundTexture)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.floorVertexIndexBuffer)
  gl.drawElements(gl.TRIANGLE_FAN, pwgl.FLOOR_VERTEX_INDEX_BUF_NUM_ITEMS, gl.UNSIGNED_SHORT, 0)
}

const drawCube = (texture) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexPositionBuffer)
  gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc, pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0)
  
  gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.cubeVertexTextureCoordinateBuffer)
  gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc, pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE, gl.FLOAT, false, 0, 0)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.cubeVertexIndexBuffer)
  gl.drawElements(gl.TRIANGLES, pwgl.CUBE_VERTEX_INDEX_BUF_NUM_ITEMS, gl.UNSIGNED_SHORT, 0)
}

const drawTable = () => {
  // table top
  pushModelViewMatrix()
  mat4.translate(pwgl.modelViewMatrix, [0.0, 1.0, 0.0], pwgl.modelViewMatrix)
  mat4.scale(pwgl.modelViewMatrix, [2.0, 0.1, 2.0], pwgl.modelViewMatrix)
  uploadModelViewMatrixToShader()
  drawCube(pwgl.woodTexture)
  popModelViewMatrix()

  // table leg
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      pushModelViewMatrix()
      mat4.translate(pwgl.modelViewMatrix, [i * 1.9, -0.1, j * 1.9], pwgl.modelViewMatrix)
      mat4.scale(pwgl.modelViewMatrix, [0.1, 1.0, 0.1], pwgl.modelViewMatrix)
      uploadModelViewMatrixToShader()
      drawCube(pwgl.woodTexture)
      popModelViewMatrix()
    }
  }
}

const draw = () => {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  
  mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pwgl.projectionMatrix)
  mat4.identity(pwgl.modelViewMatrix)
  mat4.lookAt([8, 5, -10], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix)

  uploadModelViewMatrixToShader()
  uploadProjectionMatrixToShader()
  gl.uniform1i(pwgl.uniformSamplerLoc, 0)

  drawFloor()

  pushModelViewMatrix()
  mat4.translate(pwgl.modelViewMatrix, [0.0, 1.1, 0.0], pwgl.modelViewMatrix)
  uploadModelViewMatrixToShader()
  drawTable()
  popModelViewMatrix()

  pushModelViewMatrix()
  mat4.translate(pwgl.modelViewMatrix, [0.0, 2.7, 0.0], pwgl.modelViewMatrix)
  mat4.scale(pwgl.modelViewMatrix, [0.5, 0.5, 0.5], pwgl.modelViewMatrix)
  uploadModelViewMatrixToShader()
  drawCube(pwgl.boxTexture)
  popModelViewMatrix()

  pwgl.requestId = requestAnimationFrame(draw, canvas)
}

const handleContextLost = (event) => {
  event.preventDefault()
  cancelAnimationFrame(pwgl.requestId)

  for (let i = 0; i < pwgl.ongoingImageLoads.length; i += 1) {
    pwgl.ongoingImageLoads[i].onload = undefined
  }
  pwgl.ongoingImageLoads = []
}

const handleContextRestored = (event) => {
  setupShaders()
  setupBuffers()
  setupTextures()
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  pwgl.requestId = requestAnimationFrame(draw, canvas)
}

const startup = () => {
  canvas = document.getElementById("myGLCanvas");
  canvas.addEventListener('webglcontextlost', handleContextLost, false)
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false)
  
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers()
  setupTextures()
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)

  draw()
};
