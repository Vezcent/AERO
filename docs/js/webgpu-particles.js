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
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    const shader = device.createShaderModule({
      code: `
        struct Scene {
          time: f32,
          width: f32,
          height: f32,
          pixel_ratio: f32,
        };

        @group(0) @binding(0) var<uniform> scene: Scene;

        fn hash(value: vec2f) -> f32 {
          return fract(sin(dot(value, vec2f(127.1, 311.7))) * 43758.5453123);
        }

        fn star_layer(uv: vec2f, ratio: f32, scale: f32, offset: f32) -> f32 {
          let drift = vec2f(scene.time * 0.0000015 * (0.3 + offset), -scene.time * 0.0000006);
          let grid = vec2f(uv.x * ratio, uv.y) * scale + drift;
          let cell = floor(grid);
          let local = fract(grid) - vec2f(0.5);
          let seed = hash(cell + vec2f(offset, offset * 7.0));
          let radius = mix(0.014, 0.032, fract(seed * 13.0));
          let point = 1.0 - smoothstep(radius * 0.55, radius, length(local));
          let twinkle = 0.72 + 0.28 * sin(scene.time * 0.0012 + seed * 20.0);
          return point * step(0.986, seed) * twinkle;
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
          let blue_glow = exp(-7.0 * length(centered - vec2f(-0.16, 0.28)));
          let violet_glow = exp(-8.0 * length(centered - vec2f(0.54, -0.24)));
          let vignette = 1.0 - smoothstep(0.38, 1.22, length(centered));
          let stars = star_layer(uv, ratio, 58.0, 0.17) + star_layer(uv, ratio, 91.0, 0.63);
          let base = vec3f(0.004, 0.011, 0.025);
          let atmosphere = vec3f(0.012, 0.075, 0.15) * blue_glow * 0.45
            + vec3f(0.075, 0.02, 0.10) * violet_glow * 0.26;
          let colour = (base + atmosphere + vec3f(0.62, 0.82, 1.0) * stars) * (0.58 + vignette * 0.42);
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
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time, canvas.width, canvas.height, devicePixelRatio]));
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
