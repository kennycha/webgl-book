let gl
let canvas 
let shaderProgram
let triangleVertexBuffer

const createGLContext = (canvas) => {
  const context = canvas.getContext('webgl')
  
  if (context) {
    context.viewportWidth = canvas.width
    context.viewportHeight = canvas.height
  } else {
    alert('Failed to create WebGL context')
  }

  return context
}

const loadShaderFromDom = (id) => {
  const shaderScript = document.getElementById(id)

  if (!shaderScript) {
    return null
  }

  let shaderSource = ''
  let currentChild = shaderScript.firstChild
  while (currentChild) {
    if (currentChild.nodeType === 3) {
      shaderSource += currentChild.textContent
    }
    currentChild = currentChild.nextSibling
  }

  const shader = (shaderScript.type === 'x-shader/x-fragment') ? gl.createShader(gl.FRAGMENT_SHADER) : gl.createShader(gl.VERTEX_SHADER)
  
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

const setupShaders = () => {
  const vertexShader = loadShaderFromDom('shader-vs')
  const fragmentShader = loadShaderFromDom('shader-fs')

  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Failed to setup shaders')
  }

  gl.useProgram(shaderProgram)

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor')

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute)
}

const startup = () => {
  canvas = document.getElementById('myGLCanvas')
  gl = createGLContext(canvas)
  setupShaders()
  gl.clearColor(1.0, 1.0, 1.0, 1.0)
}