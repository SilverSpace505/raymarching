
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
        ready += 1
    })

function createBox(x, y, z, width, height, depth, colour) {
    let mesh = {type: 0, pos: {x: x, y: y, z: z}, scale: {x: width, y: height, z: depth}, rot: {x: 0, y: 0, z: 0}, colour: colour}
    webgl.meshes.push(mesh)
    return mesh
}

createBox(0, 0.5, 5, 0.5, 0.5, 0.5, [0, 0, 1, 1])
createBox(2, 1.5, 5, 0.5, 0.5, 0.5, [0, 0, 1, 1])

webgl.meshes.push({type: 2, pos: {x: 0, y: 3, z: 10}, scale: {x: 3, y: 0.5, z: 0}, rot: {x: 0, y: 0, z: 0}, colour: [1, 1, 1, 1]})

// function sdBox(p, p2, s) {
//     p = subv3l;
//     vec3 q = abs(p) - s;
//     return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
// }

function update(timestamp) {
    requestAnimationFrame(update)

    utils.getDelta(timestamp)
    ui.resizeCanvas()
    ui.getSu()
    input.setGlobals()
    webgl.resizeCanvas()

    fps++

    time += delta

    // if (ready == 3) {
    //     webgl.meshes[0].pos.x = Math.sin(time)
    //     webgl.meshes[0].colour[1] = Math.sin(time)/2+0.5
    // }

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

    if (ready == 3) {
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