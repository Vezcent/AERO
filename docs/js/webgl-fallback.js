window.astiDiveState = window.astiDiveState || { progress: 0, target: 0, mouseX: 0, mouseY: 0 };

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
      uniform float u_dive_progress;
      uniform vec2 u_mouse;
      out vec4 out_colour;

      float hash(vec2 value) {
        return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float hash3d(vec3 p) {
        vec3 q = fract(p * vec3(0.1031, 0.1030, 0.0973));
        q += dot(q, q.yzx + 33.33);
        return fract((q.x + q.y) * q.z);
      }

      float noise3d(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);

        return mix(
          mix(mix(hash3d(i + vec3(0.0,0.0,0.0)), hash3d(i + vec3(1.0,0.0,0.0)), u.x),
              mix(hash3d(i + vec3(0.0,1.0,0.0)), hash3d(i + vec3(1.0,1.0,0.0)), u.x), u.y),
          mix(mix(hash3d(i + vec3(0.0,0.0,1.0)), hash3d(i + vec3(1.0,0.0,1.0)), u.x),
              mix(hash3d(i + vec3(0.0,1.0,1.0)), hash3d(i + vec3(1.0,1.0,1.0)), u.x), u.y), u.z
        );
      }

      float starLayer(vec2 uv, float ratio, float scale, float offset) {
        float warp = 1.0 + u_dive_progress * 1.5;
        vec2 drift = vec2(u_time * 0.0000015 * (0.3 + offset), -u_time * 0.0000006);
        vec2 grid = vec2(uv.x * ratio, uv.y) * scale * warp + drift;
        vec2 cell = floor(grid);
        vec2 local = fract(grid) - vec2(0.5);
        float seed = hash(cell + vec2(offset, offset * 7.0));
        float radius = mix(0.012, 0.028, fract(seed * 13.0));
        float point = 1.0 - smoothstep(radius * 0.55, radius, length(local));
        float twinkle = 0.72 + 0.28 * sin(u_time * 0.0012 + seed * 20.0);
        return point * step(0.982, seed) * twinkle;
      }

      vec3 brightStar(vec2 p, vec2 starPos, float time) {
        vec2 d = p - starPos;
        float dist = length(d);

        float core = exp(-180.0 * dist) * 1.5;
        float halo = exp(-14.0 * dist) * 0.38;

        float spikeH = exp(-70.0 * abs(d.y)) * exp(-3.5 * abs(d.x)) * 0.5;
        float spikeV = exp(-70.0 * abs(d.x)) * exp(-3.5 * abs(d.y)) * 0.5;

        float angle = atan(d.y, d.x);
        float rays = (0.7 + 0.3 * sin(angle * 12.0 + time * 0.0008)) * exp(-16.0 * dist) * 0.28;
        float twinkle = 0.85 + 0.15 * sin(time * 0.0018);

        return vec3(0.45, 0.78, 1.0) * (core + halo + spikeH + spikeV + rays) * twinkle;
      }

      vec3 renderPlanet3D(int i, vec2 p, vec2 planetPos, float pSize, float time) {
        vec2 dVec = p - planetPos;
        float dist = length(dVec);

        vec3 colors[8] = vec3[8](
          vec3(0.75, 0.72, 0.70),
          vec3(0.92, 0.78, 0.55),
          vec3(0.25, 0.65, 0.95),
          vec3(0.95, 0.42, 0.28),
          vec3(0.88, 0.68, 0.48),
          vec3(0.85, 0.75, 0.52),
          vec3(0.42, 0.85, 0.88),
          vec3(0.25, 0.45, 0.92)
        );

        if (dist > pSize) {
          float glow = exp(-14.0 * max(0.0, dist - pSize) / pSize);
          return colors[i] * glow * 0.4;
        }

        vec2 offset = dVec / pSize;
        float z = sqrt(max(0.0, 1.0 - dot(offset, offset)));
        vec3 N = vec3(offset.x, offset.y, z);

        vec3 L = normalize(vec3(-planetPos.x, -planetPos.y, 0.38));
        float NdotL = max(0.0, dot(N, L));
        float shadow = mix(0.04, 1.0, smoothstep(-0.1, 0.3, NdotL));

        vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
        float spec = pow(max(0.0, dot(N, H)), 18.0) * NdotL;
        float fresnel = pow(1.0 - z, 2.2) * (0.2 + 0.8 * NdotL);

        vec3 surfaceCol = colors[i];

        if (i == 0) { // Mercury
          float crat = noise3d(N * 24.0) * 0.3 + noise3d(N * 50.0) * 0.15;
          surfaceCol = mix(vec3(0.42, 0.4, 0.38), vec3(0.78, 0.75, 0.72), crat);
        }
        else if (i == 1) { // Venus
          float v_n = noise3d(N * 10.0 + vec3(time * 0.0001, 0.0, 0.0));
          surfaceCol = mix(vec3(0.94, 0.82, 0.58), vec3(0.82, 0.65, 0.38), v_n * 0.45);
        }
        else if (i == 2) { // Earth
          float land = smoothstep(0.48, 0.52, noise3d(N * 8.0));
          vec3 oceanCol = vec3(0.08, 0.32, 0.68);
          vec3 landCol = mix(vec3(0.22, 0.48, 0.2), vec3(0.55, 0.45, 0.28), noise3d(N * 16.0));
          vec3 baseEarth = mix(oceanCol, landCol, land);

          float ice = smoothstep(0.72, 0.88, abs(N.y));
          vec3 earthNoCloud = mix(baseEarth, vec3(0.95, 0.98, 1.0), ice);

          float cloud = smoothstep(0.54, 0.72, noise3d(N * 14.0 + vec3(time * 0.0002, time * 0.0001, 0.0)));
          surfaceCol = mix(earthNoCloud, vec3(0.98, 0.98, 1.0), cloud * 0.75);
          surfaceCol += vec3(0.2, 0.6, 1.0) * fresnel * 0.6;
        }
        else if (i == 3) { // Mars
          float m_n = noise3d(N * 15.0);
          vec3 marsBase = mix(vec3(0.92, 0.38, 0.22), vec3(0.58, 0.22, 0.12), m_n * 0.6);
          float ice = smoothstep(0.78, 0.9, abs(N.y));
          surfaceCol = mix(marsBase, vec3(0.95, 0.95, 0.98), ice);
        }
        else if (i == 4) { // Jupiter
          float band = sin(N.y * 36.0 + noise3d(N * 9.0) * 2.5) * 0.5 + 0.5;
          vec3 jupBase = mix(vec3(0.92, 0.78, 0.62), vec3(0.68, 0.42, 0.25), band);

          vec2 spotPos = vec2(0.2, -0.3);
          float spotD = length((N.xy - spotPos) * vec2(1.0, 1.6));
          float redSpot = smoothstep(0.18, 0.04, spotD);
          surfaceCol = mix(jupBase, vec3(0.85, 0.28, 0.18), redSpot * 0.85);
        }
        else if (i == 5) { // Saturn
          float band = sin(N.y * 28.0) * 0.5 + 0.5;
          surfaceCol = mix(vec3(0.9, 0.82, 0.6), vec3(0.72, 0.62, 0.42), band * 0.35);
          if (N.y > -0.1 && N.y < 0.25) {
            surfaceCol *= 0.55;
          }
        }
        else if (i == 6) { // Uranus
          float u_n = noise3d(N * 6.0) * 0.15;
          surfaceCol = vec3(0.42, 0.85, 0.88) + vec3(u_n);
        }
        else if (i == 7) { // Neptune
          vec3 nepBase = vec3(0.18, 0.38, 0.92);
          float storm = smoothstep(0.15, 0.03, length((N.xy - vec2(-0.3, 0.1)) * vec2(1.0, 1.5)));
          surfaceCol = mix(nepBase, vec3(0.08, 0.18, 0.55), storm);
        }

        return surfaceCol * shadow + vec3(1.0, 0.95, 0.85) * spec * 0.35 + colors[i] * fresnel * 0.4;
      }

      vec3 solarSystem(vec2 centered, float time) {
        float dive = u_dive_progress;
        if (dive >= 0.99) {
          return vec3(0.0);
        }

        vec2 mouseOffset = vec2(u_mouse.x * 0.12, -u_mouse.y * 0.12);
        float scaleFactor = 1.0 + dive * 3.8;
        vec2 p = (centered - mouseOffset) / scaleFactor;
        float distSun = length(p);

        vec3 sysCol = vec3(0.0);
        float sysAlpha = 1.0 - smoothstep(0.0, 0.85, dive);

        // Smooth Sun Atmosphere Glow
        float sunGranules = noise3d(vec3(p * 22.0, time * 0.0004)) * 0.15;
        float sunCore = smoothstep(0.058, 0.012, distSun);
        float sunInnerCorona = exp(-15.0 * distSun) * 1.1;
        float sunOuterCorona = exp(-4.2 * distSun) * 0.55;

        vec3 sunBase = (vec3(1.0, 0.96, 0.82) + vec3(sunGranules)) * sunCore;
        vec3 coronaCol = vec3(1.0, 0.58, 0.15) * sunInnerCorona + vec3(1.0, 0.78, 0.28) * sunOuterCorona;

        vec3 sunColor = sunBase + coronaCol;
        sysCol += sunColor;

        // 3D Orbital Paths
        float radii[8] = float[8](0.11, 0.18, 0.27, 0.36, 0.48, 0.62, 0.76, 0.90);
        vec2 pFlat = vec2(p.x, p.y / 0.55);
        float distFlat = length(pFlat);

        for (int i = 0; i < 8; i++) {
          float r = radii[i];
          float ring = smoothstep(0.0022, 0.0, abs(distFlat - r));
          sysCol += vec3(0.2, 0.42, 0.68) * ring * 0.28;
        }

        // 3D Raytraced Planets
        float t = time * 0.0003;
        float speeds[8] = float[8](3.2, 2.2, 1.5, 1.1, 0.65, 0.45, 0.3, 0.2);
        float sizes[8] = float[8](0.007, 0.010, 0.013, 0.009, 0.024, 0.019, 0.014, 0.013);

        for (int i = 0; i < 8; i++) {
          float angle = t * speeds[i] + float(i) * 1.35;
          float r = radii[i];
          vec2 planetPos = vec2(cos(angle) * r, sin(angle) * r * 0.55);
          float pSize = sizes[i];

          vec3 planetRender = renderPlanet3D(i, p, planetPos, pSize, time);
          sysCol += planetRender;

          if (i == 5) {
            vec2 satP = p - planetPos;
            vec2 satFlat = vec2(satP.x, satP.y / 0.42);
            float satR = length(satFlat);

            float ringOuter = smoothstep(0.022, 0.024, satR) - smoothstep(0.044, 0.046, satR);
            float cassiniGap = smoothstep(0.033, 0.034, satR) - smoothstep(0.035, 0.036, satR);
            float ringIntensity = max(0.0, ringOuter - cassiniGap * 0.85);

            float isBehind = step(satP.y, 0.0);
            float planetShadow = 1.0 - isBehind * smoothstep(0.02, 0.0, abs(satP.x));

            vec3 ringCol = vec3(0.85, 0.78, 0.6) * ringIntensity * planetShadow * 0.75;
            sysCol += ringCol;
          }

          if (i == 2) {
            float moonAngle = time * 0.003;
            vec2 moonPos = planetPos + vec2(cos(moonAngle), sin(moonAngle) * 0.55) * 0.028;
            float moonD = length(p - moonPos);
            if (moonD <= 0.004) {
              vec2 mOffset = (p - moonPos) / 0.004;
              float mZ = sqrt(max(0.0, 1.0 - dot(mOffset, mOffset)));
              vec3 mN = vec3(mOffset.x, mOffset.y, mZ);
              vec3 mL = normalize(vec3(-moonPos.x, -moonPos.y, 0.4));
              float mShadow = max(0.1, dot(mN, mL));
              float mCrat = noise3d(mN * 30.0) * 0.3;
              sysCol += vec3(0.85, 0.88, 0.92) * (1.0 - mCrat) * mShadow;
            }
          }
        }

        return sysCol * sysAlpha;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float ratio = u_resolution.x / u_resolution.y;
        vec2 centered = vec2((uv.x - 0.5) * ratio, uv.y - 0.5);

        // Volumetric Bottom Light Glow (Kimi Moonshot aesthetic)
        vec2 bottomCenter = vec2(centered.x * 0.65, centered.y - 0.42);
        float bottomGlow = exp(-2.8 * length(bottomCenter));
        float topGlow = exp(-4.5 * length(centered - vec2(0.3, -0.4)));

        float fog = (sin(centered.x * 3.5 + u_time * 0.0002) * cos(centered.y * 4.0 - u_time * 0.00015) + 1.0) * 0.5;

        vec3 deepSpace = vec3(0.003, 0.008, 0.018);
        vec3 bottomLight = vec3(0.045, 0.15, 0.28) * bottomGlow * 0.95;
        vec3 topLight = vec3(0.065, 0.25, 0.095) * topGlow * 0.4;
        vec3 fogLight = vec3(0.015, 0.05, 0.1) * fog * 0.35;

        vec3 atmosphere = bottomLight + topLight + fogLight;
        float vignette = 1.0 - smoothstep(0.38, 1.25, length(centered));

        float microStars = starLayer(uv, ratio, 110.0, 0.05) * 0.65;
        float midStars = starLayer(uv, ratio, 60.0, 0.45);
        float stars = microStars + midStars;

        // Hero Star: ONLY appears when dived into info menu, hidden during Orbit Menu mode!
        vec2 heroStarPos = vec2(0.32 * ratio, -0.28);
        vec3 heroStarCol = brightStar(centered, heroStarPos, u_time) * smoothstep(0.15, 0.85, u_dive_progress);

        // Solar System Layer (Orbit Menu)
        vec3 solSys = solarSystem(centered, u_time);

        vec3 colour = (deepSpace + atmosphere + vec3(0.62, 0.82, 1.0) * stars + heroStarCol + solSys) * (0.58 + vignette * 0.42);

        float grain = (hash(gl_FragCoord.xy + vec2(u_time * 0.001, u_time * 0.002)) - 0.5) * 0.028;
        colour += vec3(grain);

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
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const diveLoc = gl.getUniformLocation(program, "u_dive_progress");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    function resize() {
      const ratio = Math.min(devicePixelRatio, 2);
      fallbackCanvas.width = Math.floor(innerWidth * ratio);
      fallbackCanvas.height = Math.floor(innerHeight * ratio);
    }
    function draw(frameTime) {
      const state = window.astiDiveState;
      state.progress += (state.target - state.progress) * 0.022;

      gl.viewport(0, 0, fallbackCanvas.width, fallbackCanvas.height);
      gl.useProgram(program);
      gl.uniform2f(resolution, fallbackCanvas.width, fallbackCanvas.height);
      gl.uniform1f(timeLoc, frameTime);
      gl.uniform1f(diveLoc, state.progress);
      gl.uniform2f(mouseLoc, state.mouseX, state.mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(draw);
    }
    resize();
    addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(draw);
    document.documentElement.dataset.rendering = "webgl";
  });
}
