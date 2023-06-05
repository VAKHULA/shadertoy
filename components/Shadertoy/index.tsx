"use client";
import { useEffect, useRef } from "react";

export const Shadertoy = ({ shader }: { shader: string }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<any>(null);
  const vp_size = useRef([255, 255]);
  const shaderProgram = useRef<{
    inPos: number[],
    iTime:number,
    iMouse: number[],
    iResolution: number[]
  }>(null);
  const bufObj = useRef<{inx: number[], pos: number[]}>([]);
  const mousepos = useRef([0, 0]);

  function initScene() {
    if (!canvas.current) {
      return;
    }

    glRef.current = canvas.current.getContext("experimental-webgl");

    if (!glRef.current) {
      return;
    }

    canvas.current.addEventListener("mousemove", (e) => {
      mousepos.current = [e.clientX, e.clientY];
    });

    shaderProgram.current = glRef.current.createProgram();
    if (!shaderProgram.current) {
      return;
    }

    let status = null;

    let vertexSource = `
        attribute vec2 inPos;

        void main() {
            gl_Position = vec4(inPos, 0.0, 1.0);
        }
    `;

    let vertexShaderObj = glRef.current.createShader(
      glRef.current.VERTEX_SHADER
    );
    glRef.current.shaderSource(vertexShaderObj, vertexSource);
    glRef.current.compileShader(vertexShaderObj);

    status = glRef.current.getShaderParameter(
      vertexShaderObj,
      glRef.current.COMPILE_STATUS
    );
    if (!status) console.error(glRef.current.getShaderInfoLog(vertexShaderObj));

    glRef.current.attachShader(shaderProgram.current, vertexShaderObj);
    glRef.current.linkProgram(shaderProgram.current);

    let fragmentSource = `
        precision mediump float;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform float iTime;

        ${shader}

        void main() {
            mainImage( gl_FragColor, gl_FragCoord.xy );
        }
    `;

    let fragmentShaderObj = glRef.current.createShader(
      glRef.current.FRAGMENT_SHADER
    );
    glRef.current.shaderSource(fragmentShaderObj, fragmentSource);
    glRef.current.compileShader(fragmentShaderObj);

    status = glRef.current.getShaderParameter(
      fragmentShaderObj,
      glRef.current.COMPILE_STATUS
    );
    if (!status) console.error(glRef.current.getShaderInfoLog(fragmentShaderObj));

    glRef.current.attachShader(shaderProgram.current, fragmentShaderObj);
    glRef.current.linkProgram(shaderProgram.current);

    status = glRef.current.getProgramParameter(
      shaderProgram.current,
      glRef.current.LINK_STATUS
    );
    if (!status) console.error(glRef.current.getProgramInfoLog(shaderProgram.current));

    shaderProgram.current.inPos = glRef.current.getAttribLocation(
      shaderProgram.current,
      "inPos"
    );
    shaderProgram.current.iTime = glRef.current.getUniformLocation(
      shaderProgram.current,
      "iTime"
    );
    shaderProgram.current.iMouse = glRef.current.getUniformLocation(
      shaderProgram.current,
      "iMouse"
    );
    shaderProgram.current.iResolution = glRef.current.getUniformLocation(
      shaderProgram.current,
      "iResolution"
    );

    glRef.current.useProgram(shaderProgram.current);

    var pos = [-1, -1, 1, -1, 1, 1, -1, 1];
    var inx = [0, 1, 2, 0, 2, 3];
    bufObj.current.pos = glRef.current.createBuffer();
    glRef.current.bindBuffer(glRef.current.ARRAY_BUFFER, bufObj.current.pos);
    glRef.current.bufferData(
      glRef.current.ARRAY_BUFFER,
      new Float32Array(pos),
      glRef.current.STATIC_DRAW
    );
    bufObj.current.inx = glRef.current.createBuffer();
    bufObj.current.inx.len = inx.length;
    glRef.current.bindBuffer(
      glRef.current.ELEMENT_ARRAY_BUFFER,
      bufObj.current.inx
    );
    glRef.current.bufferData(
      glRef.current.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(inx),
      glRef.current.STATIC_DRAW
    );
    glRef.current.enableVertexAttribArray(shaderProgram.current.inPos);
    glRef.current.vertexAttribPointer(
      shaderProgram.current.inPos,
      2,
      glRef.current.FLOAT,
      false,
      0,
      0
    );
    glRef.current.enable(glRef.current.DEPTH_TEST);
    glRef.current.clearColor(0.0, 0.0, 0.0, 1.0);

    window.onresize = resize;
    resize();
    requestAnimationFrame(render);
  }

  function resize() {
    if (!canvas.current) {
      return;
    }

    vp_size.current = [window.innerWidth, window.innerHeight]; // [256, 256]
    canvas.current.width = vp_size.current[0];
    canvas.current.height = vp_size.current[1];
  }

  function render(deltaMS: number) {
    const gl = glRef.current;

    if (!gl || !canvas.current || !shaderProgram.current) {
      return;
    }

    glRef.current.viewport(0, 0, canvas.current.width, canvas.current.height);
    glRef.current.clear(
      glRef.current.COLOR_BUFFER_BIT | glRef.current.DEPTH_BUFFER_BIT
    );
    glRef.current.uniform1f(shaderProgram.current.iTime, deltaMS / 1000.0);
    glRef.current.uniform2f(
      shaderProgram.current.iResolution,
      canvas.current.width,
      canvas.current.height
    );
    glRef.current.uniform2f(
      shaderProgram.current.iMouse,
      mousepos.current[0],
      mousepos.current[1]
    );
    glRef.current.drawElements(
      glRef.current.TRIANGLES,
      bufObj.current.inx.len,
      glRef.current.UNSIGNED_SHORT,
      0
    );

    requestAnimationFrame(render);
  }

  useEffect(() => {
    initScene();
  }, []);

  return (
    <canvas
      style={{
        border: "none",
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: -1
      }}
      ref={canvas}
    />
  );
};
