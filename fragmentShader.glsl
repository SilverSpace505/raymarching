#version 300 es

precision mediump float;

out vec4 fragColour;

uniform float time;
uniform vec3 cameraPos;
uniform vec3 cameraRot;

layout(std140) uniform Objs {
    vec3 positions[10];
    vec3 scales[10];
    vec3 rotations[10];
    vec4 colours[10];
    float type[10];
};

in float vAspect;
in vec2 uv;

const int maxSteps = 100;
const float maxDist = 100.0;
const float surfDist = 0.01;
const float PI = 3.14159265359;

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    t = clamp(t, 0.0, 1.0);

    vec3 c = a + t*ab;
    return length(p - c) - r;
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r) {
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    // t = clamp(t, 0.0, 1.0);

    vec3 c = a + t*ab;
    float x = length(p - c) - r;
    float y = (abs(t-0.5)-0.5)*length(ab);
    float e = length(max(vec2(x, y), 0.0));
    float i = min(max(x, y), 0.0);
    return e + i;
}

float sdTorus(vec3 p, vec3 p2, vec2 r) {
    p -= p2;
    float x = length(p.xz)-r.x;
    return length(vec2(x, p.y))-r.y;
}

float sdBox(vec3 p, vec3 p2, vec3 s) {
    p -= p2;
    return length(max(abs(p)-s, 0.0));
}

vec4 getDist(vec3 p) {
    vec4 s = vec4(0, 1, 6, 1);

    float sphereDist = length(p-s.xyz)-s.w;
    float planeDist = p.y;

    // float cd = sdCapsule(p, vec3(3.5, 1.0, 6.0), vec3(4.5, 2.0, 5.0), 0.5);
    // float td = sdTorus(p, vec3(0.0, 1.0, 6.0), vec2(1.5, 0.25));
    // float bd = sdBox(p, vec3(-4.0, 0.5, 6.0), vec3(0.5, 0.5, 0.5));
    // float cyld = sdCylinder(p, vec3(2.0, 0.5, 2.0), vec3(6.0, 0.5, 4.0), 0.5);

    float d = sphereDist;
    vec3 c = vec3(0.4, 0.8, 1.0);
    if (planeDist < d) {
        d = planeDist;
        c = vec3(0.25, 0.75, 0.0);
    }
    // if (cd < d) {
    //     d = cd;
    //     c = vec3(1.0, 0.0, 0.0);
    // }
    // if (td < d) {
    //     d = td;
    //     c = vec3(0.0, 0.0, 1.0);
    // }
    // if (bd < d) {
    //     d = bd;
    //     c = vec3(0.0, 1.0, 0.0);
    // }
    // if (cyld < d) {
    //     d = cyld;
    //     c = vec3(1.0, 1.0, 0.0);
    // }

    for (int i = 0; i < 10; i++) {
        float d2 = maxDist;
        d2 = float(type[i]);
        if (type[i] == 0.0) {
            d2 = sdBox(p, positions[i], scales[i]);
        } else if (type[i] == 1.0) {
            d2 = length(p-positions[i])-scales[i].x;
        } else if (type[i] == 2.0) {
            d2 = sdTorus(p, positions[i], scales[i].xy);
        }
        if (d2 < d) {
            d = d2;
            c = colours[i].rgb;
        }
    }

    return vec4(d, c);
}

float rayMarch(vec3 ro, vec3 rd) {
    float d0 = 0.0;

    for (int i = 0; i < maxSteps; i++) {
        vec3 p = ro + rd*d0;
        float dS = getDist(p).x;
        d0 += dS;
        if (d0 > maxDist || dS < surfDist) break;
    }

    return d0;
}

vec3 getNormal(vec3 p) {
    float d = getDist(p).x;
    vec2 e = vec2(0.01, 0.0);

    vec3 n = d - vec3(
        getDist(p - e.xyy).x,
        getDist(p - e.yxy).x,
        getDist(p - e.yyx).x
    );

    return normalize(n);
}

vec3 getColour(vec3 p, float rd) {
    if (rd > maxDist) {
        return vec3(0.0, 0.0, 0.0);
    }
    vec3 colour = getDist(p).gba;
    vec3 lightPos = vec3(-0.5, 1.0, -1.0);
    vec3 l = normalize(lightPos);
    vec3 n = getNormal(p);

    float dif = clamp(dot(n, l), 0.0, 1.0);
    float d = rayMarch(p+n*surfDist*2.0, l);
    if (d < length(lightPos-p)) dif *= 0.1;
    return colour*(dif+0.25);
}

vec3 calculateRayDirection(vec2 uv, vec3 cameraPosition, float fov, vec2 rotation) {
    vec2 screenCoords = uv;
    
    float near = 1.0;
    vec3 rayDirectionScreen = normalize(vec3(screenCoords, -near));

    mat3 yawRotationMatrix = mat3(
        cos(rotation.x), 0.0, sin(rotation.x),
        0.0, 1.0, 0.0,
        -sin(rotation.x), 0.0, cos(rotation.x)
    );

    mat3 pitchRotationMatrix = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(rotation.y), -sin(rotation.y),
        0.0, sin(rotation.y), cos(rotation.y)
    );

    vec3 rotatedRayDirection = yawRotationMatrix * pitchRotationMatrix * rayDirectionScreen;

    return normalize(rotatedRayDirection);
}

void main() {
    vec3 colour = vec3(0.0);

    float fov = radians(60.0);

    vec3 ro = cameraPos;
    vec3 rd = calculateRayDirection(vec2(-uv.x, uv.y), cameraPos, fov, vec2(-cameraRot.y+PI, cameraRot.x));

    float d = rayMarch(ro, rd);

    vec3 p = ro + rd * d;
    
    colour = getColour(p, d);

    fragColour = vec4(colour, 1.0);
}