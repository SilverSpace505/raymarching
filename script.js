
utils.setup()
utils.setStyles()

webgl.setStyles()

utils.setGlobals()

var delta = 0
var lastTime = 0
var su = 0

var speed = 5

var camera = {pos: {x: 0, y: 1, z: 0}, rot: {x: 0, y: 0, z: 0}}

var time = 0

var ready = 1
var fps = 0
var fps2 = 0

fetch("fragmentShader.glsl")
    .then(response => response.text())
    .then(fragmentShaderSource => {
        webgl.fragmentShader = fragmentShaderSource
        ready = 2
    })

function update(timestamp) {
    requestAnimationFrame(update)

    utils.getDelta(timestamp)
    ui.resizeCanvas()
    ui.getSu()
    input.setGlobals()
    webgl.resizeCanvas()

    fps++

    time += delta

    if (keys["KeyW"]) {
        camera.pos.x += Math.sin(camera.rot.y) * speed * delta
        camera.pos.z += Math.cos(camera.rot.y) * speed * delta
    }
    if (keys["KeyS"]) {
        camera.pos.x -= Math.sin(camera.rot.y) * speed * delta
        camera.pos.z -= Math.cos(camera.rot.y) * speed * delta
    }
    if (keys["KeyA"]) {
        camera.pos.x -= Math.sin(camera.rot.y+Math.PI/2) * speed * delta
        camera.pos.z -= Math.cos(camera.rot.y+Math.PI/2) * speed * delta
    }
    if (keys["KeyD"]) {
        camera.pos.x += Math.sin(camera.rot.y+Math.PI/2) * speed * delta
        camera.pos.z += Math.cos(camera.rot.y+Math.PI/2) * speed * delta
    }
    if (keys["Space"]) {
        camera.pos.y += speed * delta
    }
    if (keys["ShiftLeft"]) {
        camera.pos.y -= speed * delta
    }

    if (mouse.lclick) {
        input.lockMouse()
    }

    if (ready == 2) {
        webgl.setup()
        ready = 3
    }

    if (ready = 3) {
        webgl.render()
    }

    ui.text(10*su, 25*su, 25*su, fps2+"fps")

    input.updateInput()
}

setInterval(() => {
    fps2 = fps
    fps = 0
}, 1000)

requestAnimationFrame(update)

var sensitivity = 0.003

input.mouseMove = (event) => {
    input.mouse.x = event.clientX
	input.mouse.y = event.clientY
    if (input.isMouseLocked()) {
        camera.rot.x += event.movementY*sensitivity
		if (camera.rot.x > Math.PI/2*0.99) {
			camera.rot.x = Math.PI/2*0.99
		}
		if (camera.rot.x < -Math.PI/2*0.99) {
			camera.rot.x = -Math.PI/2*0.99
		}
        camera.rot.y += event.movementX*sensitivity
    }
}