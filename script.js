
utils.setup()
utils.setStyles()

webgl.setup()
webgl.setStyles()

utils.setGlobals()

var delta = 0
var lastTime = 0
var su = 0

var speed = 5

var camera = {pos: {x: 0, y: 0, z: 0}, rot: {x: 0, y: 0, z: 0}}
var test = new webgl.Box(0, 0, -5, 1, 1, 1, [1, 0, 0])
test.alpha = 0.8
test.oneSide = false
let colourst = [[1, 0, 0], [1, 0.5, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1]]
test.colours = []
test.setColour = false
for (let i = 0; i < 6; i++) {
    test.colours.push(...colourst[i], ...colourst[i], ...colourst[i], ...colourst[i])
}
test.order = true
console.log(test.colours)
test.updateBuffers()
console.log(test.colours)

function update(timestamp) {
    requestAnimationFrame(update)

    utils.getDelta(timestamp)
    ui.resizeCanvas()
    ui.getSu()
    input.setGlobals()
    webgl.resizeCanvas()

    if (keys["KeyW"]) {
        camera.pos.x -= Math.sin(camera.rot.y) * speed * delta
        camera.pos.z -= Math.cos(camera.rot.y) * speed * delta
    }
    if (keys["KeyS"]) {
        camera.pos.x += Math.sin(camera.rot.y) * speed * delta
        camera.pos.z += Math.cos(camera.rot.y) * speed * delta
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

    webgl.setView(camera)
    webgl.setupFrame()
    webgl.render()

    input.updateInput()
}

requestAnimationFrame(update)

var sensitivity = 0.003

input.mouseMove = (event) => {
    input.mouse.x = event.clientX
	input.mouse.y = event.clientY
    if (input.isMouseLocked()) {
        camera.rot.x -= event.movementY*sensitivity
		if (camera.rot.x > Math.PI/2*0.99) {
			camera.rot.x = Math.PI/2*0.99
		}
		if (camera.rot.x < -Math.PI/2*0.99) {
			camera.rot.x = -Math.PI/2*0.99
		}
        camera.rot.y -= event.movementX*sensitivity
    }
}