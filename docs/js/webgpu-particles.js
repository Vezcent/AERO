window.astiDiveState = window.astiDiveState || { progress: 0, target: 0, mouseX: 0, mouseY: 0 };

addEventListener("pointermove", (e) => {
  window.astiDiveState.mouseX = (e.clientX / innerWidth - 0.5) * 2;
  window.astiDiveState.mouseY = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

const canvas = document.querySelector("#gpu-background");

if (canvas) {
  const context = canvas.getContext("webgpu");

  async function startWebGpu() {
    if (!navigator.gpu || !context) return false;
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return false;

    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    const uniformBuffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const shader = device.createShaderModule({
      code: `
        struct Scene {
          time: f32,
          width: f32,
          height: f32,
          pixel_ratio: f32,
          dive_progress: f32,
          mouse_x: f32,
          mouse_y: f32,
          pad: f32,
        };

        @group(0) @binding(0) var<uniform> scene: Scene;

        fn hash(value: vec2f) -> f32 {
          return fract(sin(dot(value, vec2f(127.1, 311.7))) * 43758.5453123);
        }

        fn hash3d(p: vec3f) -> f32 {
          var q = fract(p * vec3f(0.1031, 0.1030, 0.0973));
          q += dot(q, q.yzx + 33.33);
          return fract((q.x + q.y) * q.z);
        }

        fn noise3d(p: vec3f) -> f32 {
          let i = floor(p);
          let f = fract(p);
          let u = f * f * (3.0 - 2.0 * f);

          return mix(
            mix(mix(hash3d(i + vec3f(0.0,0.0,0.0)), hash3d(i + vec3f(1.0,0.0,0.0)), u.x),
                mix(hash3d(i + vec3f(0.0,1.0,0.0)), hash3d(i + vec3f(1.0,1.0,0.0)), u.x), u.y),
            mix(mix(hash3d(i + vec3f(0.0,0.0,1.0)), hash3d(i + vec3f(1.0,0.0,1.0)), u.x),
                mix(hash3d(i + vec3f(0.0,1.0,1.0)), hash3d(i + vec3f(1.0,1.0,1.0)), u.x), u.y), u.z
          );
        }

        fn star_layer(uv: vec2f, ratio: f32, scale: f32, offset: f32) -> f32 {
          let warp = 1.0 + scene.dive_progress * 1.5;
          let drift = vec2f(scene.time * 0.0000015 * (0.3 + offset), -scene.time * 0.0000006);
          let grid = vec2f(uv.x * ratio, uv.y) * scale * warp + drift;
          let cell = floor(grid);
          let local = fract(grid) - vec2f(0.5);
          let seed = hash(cell + vec2f(offset, offset * 7.0));
          let radius = mix(0.012, 0.028, fract(seed * 13.0));
          let point = 1.0 - smoothstep(radius * 0.55, radius, length(local));
          let twinkle = 0.72 + 0.28 * sin(scene.time * 0.0012 + seed * 20.0);
          return point * step(0.982, seed) * twinkle;
        }

        // Bright Hero Star (Appears when dived into info menu)
        fn bright_star(p: vec2f, star_pos: vec2f, time: f32) -> vec3f {
          let d = p - star_pos;
          let dist = length(d);

          let core = exp(-180.0 * dist) * 1.5;
          let halo = exp(-14.0 * dist) * 0.38;

          // Cross Diffraction Spikes
          let spike_h = exp(-70.0 * abs(d.y)) * exp(-3.5 * abs(d.x)) * 0.5;
          let spike_v = exp(-70.0 * abs(d.x)) * exp(-3.5 * abs(d.y)) * 0.5;

          let angle = atan2(d.y, d.x);
          let rays = (0.7 + 0.3 * sin(angle * 12.0 + time * 0.0008)) * exp(-16.0 * dist) * 0.28;
          let twinkle = 0.85 + 0.15 * sin(time * 0.0018);

          return vec3f(0.45, 0.78, 1.0) * (core + halo + spike_h + spike_v + rays) * twinkle;
        }

        fn render_planet_3d(i: i32, p: vec2f, planet_pos: vec2f, p_size: f32, time: f32) -> vec3f {
          let d_vec = p - planet_pos;
          let dist = length(d_vec);

          let colors = array<vec3f, 8>(
            vec3f(0.75, 0.72, 0.70), // Mercury
            vec3f(0.92, 0.78, 0.55), // Venus
            vec3f(0.25, 0.65, 0.95), // Earth
            vec3f(0.95, 0.42, 0.28), // Mars
            vec3f(0.88, 0.68, 0.48), // Jupiter
            vec3f(0.85, 0.75, 0.52), // Saturn
            vec3f(0.42, 0.85, 0.88), // Uranus
            vec3f(0.25, 0.45, 0.92)  // Neptune
          );

          if (dist > p_size) {
            let glow = exp(-14.0 * max(0.0, dist - p_size) / p_size);
            return colors[i] * glow * 0.4;
          }

          let offset = d_vec / p_size;
          let z = sqrt(max(0.0, 1.0 - dot(offset, offset)));
          let N = vec3f(offset.x, offset.y, z);

          let L = normalize(vec3f(-planet_pos.x, -planet_pos.y, 0.38));
          let NdotL = max(0.0, dot(N, L));
          let shadow = mix(0.04, 1.0, smoothstep(-0.1, 0.3, NdotL));

          let H = normalize(L + vec3f(0.0, 0.0, 1.0));
          let spec = pow(max(0.0, dot(N, H)), 18.0) * NdotL;
          let fresnel = pow(1.0 - z, 2.2) * (0.2 + 0.8 * NdotL);

          var surface_col = colors[i];

          if (i == 0) { // Mercury
            let crat = noise3d(N * 24.0) * 0.3 + noise3d(N * 50.0) * 0.15;
            surface_col = mix(vec3f(0.42, 0.4, 0.38), vec3f(0.78, 0.75, 0.72), crat);
          }
          else if (i == 1) { // Venus
            let v_n = noise3d(N * 10.0 + vec3f(time * 0.0001, 0.0, 0.0));
            surface_col = mix(vec3f(0.94, 0.82, 0.58), vec3f(0.82, 0.65, 0.38), v_n * 0.45);
          }
          else if (i == 2) { // Earth
            let land = smoothstep(0.48, 0.52, noise3d(N * 8.0));
            let ocean_col = vec3f(0.08, 0.32, 0.68);
            let land_col = mix(vec3f(0.22, 0.48, 0.2), vec3f(0.55, 0.45, 0.28), noise3d(N * 16.0));
            let base_earth = mix(ocean_col, land_col, land);

            let ice = smoothstep(0.72, 0.88, abs(N.y));
            let earth_no_cloud = mix(base_earth, vec3f(0.95, 0.98, 1.0), ice);

            let cloud = smoothstep(0.54, 0.72, noise3d(N * 14.0 + vec3f(time * 0.0002, time * 0.0001, 0.0)));
            surface_col = mix(earth_no_cloud, vec3f(0.98, 0.98, 1.0), cloud * 0.75);
            surface_col += vec3f(0.2, 0.6, 1.0) * fresnel * 0.6;
          }
          else if (i == 3) { // Mars
            let m_n = noise3d(N * 15.0);
            let mars_base = mix(vec3f(0.92, 0.38, 0.22), vec3f(0.58, 0.22, 0.12), m_n * 0.6);
            let ice = smoothstep(0.78, 0.9, abs(N.y));
            surface_col = mix(mars_base, vec3f(0.95, 0.95, 0.98), ice);
          }
          else if (i == 4) { // Jupiter
            let band = sin(N.y * 36.0 + noise3d(N * 9.0) * 2.5) * 0.5 + 0.5;
            let jup_base = mix(vec3f(0.92, 0.78, 0.62), vec3f(0.68, 0.42, 0.25), band);

            let spot_pos = vec2f(0.2, -0.3);
            let spot_d = length((N.xy - spot_pos) * vec2f(1.0, 1.6));
            let red_spot = smoothstep(0.18, 0.04, spot_d);
            surface_col = mix(jup_base, vec3f(0.85, 0.28, 0.18), red_spot * 0.85);
          }
          else if (i == 5) { // Saturn
            let band = sin(N.y * 28.0) * 0.5 + 0.5;
            surface_col = mix(vec3f(0.9, 0.82, 0.6), vec3f(0.72, 0.62, 0.42), band * 0.35);
            if (N.y > -0.1 && N.y < 0.25) {
              surface_col *= 0.55;
            }
          }
          else if (i == 6) { // Uranus
            let u_n = noise3d(N * 6.0) * 0.15;
            surface_col = vec3f(0.42, 0.85, 0.88) + vec3f(u_n);
          }
          else if (i == 7) { // Neptune
            let nep_base = vec3f(0.18, 0.38, 0.92);
            let storm = smoothstep(0.15, 0.03, length((N.xy - vec2f(-0.3, 0.1)) * vec2f(1.0, 1.5)));
            surface_col = mix(nep_base, vec3f(0.08, 0.18, 0.55), storm);
          }

          return surface_col * shadow + vec3f(1.0, 0.95, 0.85) * spec * 0.35 + colors[i] * fresnel * 0.4;
        }

        fn solar_system(centered: vec2f, time: f32) -> vec3f {
          let dive = scene.dive_progress;
          if (dive >= 0.99) {
            return vec3f(0.0);
          }

          let mouse_offset = vec2f(scene.mouse_x * 0.12, -scene.mouse_y * 0.12);
          let scale_factor = 1.0 + dive * 3.8;
          let p = (centered - mouse_offset) / scale_factor;
          let dist_sun = length(p);

          var sys_col = vec3f(0.0);
          let sys_alpha = 1.0 - smoothstep(0.0, 0.85, dive);

          // Smooth Sun Atmosphere Glow
          let sun_granules = noise3d(vec3f(p * 22.0, time * 0.0004)) * 0.15;
          let sun_core = smoothstep(0.058, 0.012, dist_sun);
          let sun_inner_corona = exp(-15.0 * dist_sun) * 1.1;
          let sun_outer_corona = exp(-4.2 * dist_sun) * 0.55;

          let sun_base = (vec3f(1.0, 0.96, 0.82) + vec3f(sun_granules)) * sun_core;
          let corona_col = vec3f(1.0, 0.58, 0.15) * sun_inner_corona + vec3f(1.0, 0.78, 0.28) * sun_outer_corona;

          let sun_color = sun_base + corona_col;
          sys_col += sun_color;

          // 3D Orbital Paths
          let radii = array<f32, 8>(0.11, 0.18, 0.27, 0.36, 0.48, 0.62, 0.76, 0.90);
          let p_flat = vec2f(p.x, p.y / 0.55);
          let dist_flat = length(p_flat);

          for (var i: i32 = 0; i < 8; i++) {
            let r = radii[i];
            let ring = smoothstep(0.0022, 0.0, abs(dist_flat - r));
            sys_col += vec3f(0.2, 0.42, 0.68) * ring * 0.28;
          }

          // 3D Raytraced Planets
          let t = time * 0.0003;
          let speeds = array<f32, 8>(3.2, 2.2, 1.5, 1.1, 0.65, 0.45, 0.3, 0.2);
          let sizes = array<f32, 8>(0.007, 0.010, 0.013, 0.009, 0.024, 0.019, 0.014, 0.013);

          for (var i: i32 = 0; i < 8; i++) {
            let angle = t * speeds[i] + f32(i) * 1.35;
            let r = radii[i];
            let planet_pos = vec2f(cos(angle) * r, sin(angle) * r * 0.55);
            let p_size = sizes[i];

            let planet_render = render_planet_3d(i, p, planet_pos, p_size, time);
            sys_col += planet_render;

            if (i == 5) { // Saturn 3D Rings
              let sat_p = p - planet_pos;
              let sat_flat = vec2f(sat_p.x, sat_p.y / 0.42);
              let sat_r = length(sat_flat);

              let ring_outer = smoothstep(0.022, 0.024, sat_r) - smoothstep(0.044, 0.046, sat_r);
              let cassini_gap = smoothstep(0.033, 0.034, sat_r) - smoothstep(0.035, 0.036, sat_r);
              let ring_intensity = max(0.0, ring_outer - cassini_gap * 0.85);

              let is_behind = step(sat_p.y, 0.0);
              let planet_shadow = 1.0 - is_behind * smoothstep(0.02, 0.0, abs(sat_p.x));

              let ring_col = vec3f(0.85, 0.78, 0.6) * ring_intensity * planet_shadow * 0.75;
              sys_col += ring_col;
            }

            if (i == 2) { // Earth Moon
              let moon_angle = time * 0.003;
              let moon_pos = planet_pos + vec2f(cos(moon_angle), sin(moon_angle) * 0.55) * 0.028;
              let moon_d = length(p - moon_pos);
              if (moon_d <= 0.004) {
                let m_offset = (p - moon_pos) / 0.004;
                let m_z = sqrt(max(0.0, 1.0 - dot(m_offset, m_offset)));
                let m_N = vec3f(m_offset.x, m_offset.y, m_z);
                let m_L = normalize(vec3f(-moon_pos.x, -moon_pos.y, 0.4));
                let m_shadow = max(0.1, dot(m_N, m_L));
                let m_crat = noise3d(m_N * 30.0) * 0.3;
                sys_col += vec3f(0.85, 0.88, 0.92) * (1.0 - m_crat) * m_shadow;
              }
            }
          }

          return sys_col * sys_alpha;
        }

        @vertex fn vertex_main(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
          var positions = array<vec2f, 3>(
            vec2f(-1.0, -1.0),
            vec2f(3.0, -1.0),
            vec2f(-1.0, 3.0)
          );
          return vec4f(positions[index], 0.0, 1.0);
        }

        @fragment fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
          let resolution = vec2f(scene.width, scene.height);
          let uv = position.xy / resolution;
          let ratio = resolution.x / resolution.y;
          let centered = vec2f((uv.x - 0.5) * ratio, uv.y - 0.5);

          // Volumetric Bottom Light Glow (Kimi Moonshot aesthetic)
          let bottom_center = vec2f(centered.x * 0.65, centered.y - 0.42);
          let bottom_glow = exp(-2.8 * length(bottom_center));
          let top_glow = exp(-4.5 * length(centered - vec2f(0.3, -0.4)));

          let fog = (sin(centered.x * 3.5 + scene.time * 0.0002) * cos(centered.y * 4.0 - scene.time * 0.00015) + 1.0) * 0.5;

          let deep_space = vec3f(0.003, 0.008, 0.018);
          let bottom_light = vec3f(0.045, 0.15, 0.28) * bottom_glow * 0.95;
          let top_light = vec3f(0.065, 0.025, 0.095) * top_glow * 0.4;
          let fog_light = vec3f(0.015, 0.05, 0.1) * fog * 0.35;

          let atmosphere = bottom_light + top_light + fog_light;
          let vignette = 1.0 - smoothstep(0.38, 1.25, length(centered));

          let micro_stars = star_layer(uv, ratio, 110.0, 0.05) * 0.65;
          let mid_stars = star_layer(uv, ratio, 60.0, 0.45);
          let stars = micro_stars + mid_stars;

          // Hero Star: ONLY appears when dived into info menu, hidden during Orbit Menu mode!
          let hero_star_pos = vec2f(0.32 * ratio, -0.28);
          let hero_star_col = bright_star(centered, hero_star_pos, scene.time) * smoothstep(0.15, 0.85, scene.dive_progress);

          // Solar System Layer (Orbit Menu)
          let sol_sys = solar_system(centered, scene.time);

          var colour = (deep_space + atmosphere + vec3f(0.62, 0.82, 1.0) * stars + hero_star_col + sol_sys) * (0.58 + vignette * 0.42);

          let grain = (hash(position.xy + vec2f(scene.time * 0.001, scene.time * 0.002)) - 0.5) * 0.028;
          colour += vec3f(grain);

          return vec4f(colour, 1.0);
        }
      `
    });

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{ binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: "uniform" } }]
    });
    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
    });
    const pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: { module: shader, entryPoint: "vertex_main" },
      fragment: { module: shader, entryPoint: "fragment_main", targets: [{ format }] },
      primitive: { topology: "triangle-list" }
    });

    function resize() {
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.floor(innerWidth * ratio);
      canvas.height = Math.floor(innerHeight * ratio);
      context.configure({ device, format, alphaMode: "premultiplied" });
    }

    function render(time) {
      const state = window.astiDiveState;
      state.progress += (state.target - state.progress) * 0.022;

      const uniforms = new Float32Array([
        time,
        canvas.width,
        canvas.height,
        devicePixelRatio,
        state.progress,
        state.mouseX,
        state.mouseY,
        0.0
      ]);
      device.queue.writeBuffer(uniformBuffer, 0, uniforms);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }]
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
      requestAnimationFrame(render);
    }

    resize();
    addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(render);
    document.documentElement.dataset.rendering = "webgpu";
    return true;
  }

  window.astiRenderingPromise = startWebGpu().catch(() => false);
}
