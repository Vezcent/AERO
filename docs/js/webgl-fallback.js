const fallbackCanvas = document.querySelector("#gpu-background");

if (fallbackCanvas) {
  Promise.resolve(window.astiRenderingPromise).then((webGpuStarted) => {
    if (webGpuStarted) return;
    const gl = fallbackCanvas.getContext("webgl2");
    if (!gl) {
      document.documentElement.dataset.rendering = "css";
      return;
    }
    const vertexSource = `#version 300 es
      void main() {
        vec2 points[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
        gl_Position = vec4(points[gl_VertexID], 0.0, 1.0);
      }`;
    const fragmentSource = `#version 300 es
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      out vec4 out_colour;

      float hash(vec2 value) {
        return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float starLayer(vec2 uv, float ratio, float scale, float offset) {
        vec2 drift = vec2(u_time * 0.0000015 * (0.3 + offset), -u_time * 0.0000006);
        vec2 grid = vec2(uv.x * ratio, uv.y) * scale + drift;
        vec2 cell = floor(grid);
        vec2 local = fract(grid) - vec2(0.5);
        float seed = hash(cell + vec2(offset, offset * 7.0));
        float radius = mix(0.014, 0.032, fract(seed * 13.0));
        float point = 1.0 - smoothstep(radius * 0.55, radius, length(local));
        float twinkle = 0.72 + 0.28 * sin(u_time * 0.0012 + seed * 20.0);
        return point * step(0.986, seed) * twinkle;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float ratio = u_resolution.x / u_resolution.y;
        vec2 centered = vec2((uv.x - 0.5) * ratio, uv.y - 0.5);
        float blueGlow = exp(-7.0 * length(centered - vec2(-0.16, 0.28)));
        float violetGlow = exp(-8.0 * length(centered - vec2(0.54, -0.24)));
        float vignette = 1.0 - smoothstep(0.38, 1.22, length(centered));
        float stars = starLayer(uv, ratio, 58.0, 0.17) + starLayer(uv, ratio, 91.0, 0.63);
        vec3 base = vec3(0.004, 0.011, 0.025);
        vec3 atmosphere = vec3(0.012, 0.075, 0.15) * blueGlow * 0.45
          + vec3(0.075, 0.02, 0.10) * violetGlow * 0.26;
        vec3 colour = (base + atmosphere + vec3(0.62, 0.82, 1.0) * stars) * (0.58 + vignette * 0.42);
        out_colour = vec4(colour, 1.0);
      }`;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);

    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    function resize() {
      const ratio = Math.min(devicePixelRatio, 2);
      fallbackCanvas.width = Math.floor(innerWidth * ratio);
      fallbackCanvas.height = Math.floor(innerHeight * ratio);
    }
    function draw(frameTime) {
      gl.viewport(0, 0, fallbackCanvas.width, fallbackCanvas.height);
      gl.useProgram(program);
      gl.uniform2f(resolution, fallbackCanvas.width, fallbackCanvas.height);
      gl.uniform1f(time, frameTime);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(draw);
    }
    resize();
    addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(draw);
    document.documentElement.dataset.rendering = "webgl";
  });
}
