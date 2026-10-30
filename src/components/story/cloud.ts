const VERTEX = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// Sparse to dense. The first glyph keeps a faint grid in clear sky.
const GLYPHS = ".,:;-=+*#%@";

const FRAGMENT = `
// Large cell indices need real precision; mediump makes neighbouring cells hash alike on some GPUs.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define GLYPHS ${GLYPHS.length}.0
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_progress;
uniform vec3 u_light;
uniform vec3 u_shade;
uniform vec3 u_dot;
uniform float u_dots;
uniform float u_strength;
uniform vec2 u_cell;
uniform sampler2D u_glyphs;

// Sin-free hash (Dave Hoskins): stays well distributed without huge intermediate values.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 5; octave++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

// The first three octaves only: ASCII cells are ~9x16 px, so finer detail can't show in them anyway.
float fbm3(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 3; octave++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value / 0.875; // rescaled to the same 0-1 range as the full five octaves
}

// Domain-warped noise drifting sideways: billows that slowly roll and change shape.
float cloudShape(vec2 coord, float t) {
  vec2 uv = coord / u_resolution.y;
  vec2 warp = vec2(fbm(uv * 1.4 + vec2(t, 0.0)), fbm(uv * 1.4 + vec2(5.2, 1.3) - t * 0.6));
  return fbm(uv * 2.1 + warp * 1.6 + vec2(t * 1.8, t * 0.3));
}

// The same cloud at ASCII resolution: same large shapes, a fifth of the noise work.
float cloudShapeCoarse(vec2 coord, float t) {
  vec2 uv = coord / u_resolution.y;
  vec2 warp = vec2(fbm3(uv * 1.4 + vec2(t, 0.0)), fbm3(uv * 1.4 + vec2(5.2, 1.3) - t * 0.6));
  return fbm3(uv * 2.1 + warp * 1.6 + vec2(t * 1.8, t * 0.3));
}

void main() {
  vec2 screen = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.035;
  vec2 toPointer = (gl_FragCoord.xy - u_pointer) / u_resolution.y;
  float near = 1.0 - smoothstep(0.0, 0.22, length(toPointer));

  vec4 soft = vec4(0.0);
  // Once fully turned into ASCII the soft cloud is invisible, so skip it entirely.
  if (u_progress > 0.0 && u_dots < 1.0) {
    float shape = cloudShape(gl_FragCoord.xy, t);
    // Scroll lowers the threshold, so cloud grows in from the top (the sky) until it covers everything.
    float threshold = mix(1.0, 0.05, u_progress) - screen.y * 0.3 * (1.0 - u_progress);
    float density = smoothstep(threshold, threshold + 0.28, shape);
    // The cursor parts the cloud a little, less so once it has gathered.
    density *= 1.0 - near * 0.55 * (1.0 - smoothstep(0.75, 0.95, u_progress));
    vec3 color = mix(u_shade, u_light, smoothstep(0.35, 0.85, shape));
    soft = vec4(color * density, density);
  }

  if (u_dots <= 0.0) {
    gl_FragColor = soft;
    return;
  }

  // ASCII cloud: sample the same drifting cloud at each character cell and pick a glyph by density.
  vec2 cell = floor(gl_FragCoord.xy / u_cell);
  vec2 centre = (cell + 0.5) * u_cell;
  float density = clamp(smoothstep(0.5, 0.82, cloudShapeCoarse(centre, t)) + near * 0.45, 0.0, 1.0);
  float glyph = floor(density * (GLYPHS - 1.0) + 0.5);
  // A few cells shimmer up a step, so the cloud flickers like a live terminal.
  glyph = min(glyph + step(0.985, hash(cell + floor(u_time * 6.0))), GLYPHS - 1.0);
  vec2 local = fract(gl_FragCoord.xy / u_cell);
  float ink = texture2D(u_glyphs, vec2((glyph + local.x) / GLYPHS, 1.0 - local.y)).a;
  float alpha = ink * mix(0.22, 1.0, density) * u_strength;
  // Cross-fade: the soft billows and the glyphs come from the same cloud, so it turns into text in place.
  gl_FragColor = mix(soft, vec4(u_dot * alpha, alpha), u_dots);
}`;

type Rgb = [number, number, number];

export type Cloud = Readonly<{
  /**
   * coverage: how much soft cloud (0–1); ascii: how far it has turned into glyphs (0–1);
   * strength: how strongly the glyphs draw, lower behind content.
   */
  render: (coverage: number, seconds: number, ascii?: number, strength?: number) => void;
  setPointer: (x: number, y: number) => void;
  setColors: (colors: { light: Rgb; shade: Rgb; dot: Rgb }) => void;
  resize: () => void;
  destroy: () => void;
}>;

/** Draws the glyph ramp once into a texture: one row, one cell per character. */
function glyphAtlas(gl: WebGLRenderingContext) {
  const cellWidth = 32;
  const cellHeight = 56;
  const atlas = document.createElement("canvas");
  atlas.width = cellWidth * GLYPHS.length;
  atlas.height = cellHeight;
  const context = atlas.getContext("2d")!;
  context.font = `600 ${cellHeight * 0.72}px ui-monospace, "Geist Mono", monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff";
  [...GLYPHS].forEach((glyph, index) => context.fillText(glyph, cellWidth * (index + 0.5), cellHeight * 0.55));

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  // Not a power of two, so no mipmaps and clamp to edge.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/** One clock for every cloud canvas, so the story's cloud and the projects' cloud match at the hand-over. */
export const cloudClock = () => performance.now() / 1000;

/** Glyph strength for the ASCII cloud: strong enough to read as weather, backed off so content stays first. */
export const ASCII_FIELD_STRENGTH = 0.68;

/** Character cell size in CSS px, shared by the story and the projects field so the hand-off lines up. */
export const ASCII_CELL = { width: 9, height: 16 };

/**
 * Animated cloud on its own WebGL canvas: one full-screen shader pass of drifting noise,
 * which can also condense into an ASCII cloud of glyphs.
 */
export function createCloud(canvas: HTMLCanvasElement, scale: number): Cloud | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
  if (!gl) return null;

  const program = gl.createProgram()!;
  for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Cloud shader failed; the page falls back to its plain background.", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  // One triangle that covers the whole screen.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uResolution = uniform("u_resolution");
  const uPointer = uniform("u_pointer");
  const uTime = uniform("u_time");
  const uProgress = uniform("u_progress");
  const uLight = uniform("u_light");
  const uShade = uniform("u_shade");
  const uDot = uniform("u_dot");
  const uDots = uniform("u_dots");
  const uStrength = uniform("u_strength");
  const uCell = uniform("u_cell");
  glyphAtlas(gl);
  gl.uniform1i(uniform("u_glyphs"), 0);

  const resize = () => {
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uCell, ASCII_CELL.width * scale, ASCII_CELL.height * scale);
  };

  let cleared = false;
  resize();
  gl.uniform2f(uPointer, -9999, -9999);

  return {
    render(progress, seconds, dots = 0, strength = 1) {
      if (progress <= 0.001 && dots <= 0.001) {
        if (!cleared) gl.clear(gl.COLOR_BUFFER_BIT);
        cleared = true;
        return;
      }
      cleared = false;
      gl.uniform1f(uProgress, Math.min(progress, 1));
      gl.uniform1f(uDots, Math.min(dots, 1));
      gl.uniform1f(uStrength, strength);
      gl.uniform1f(uTime, seconds);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    setPointer(x, y) {
      gl.uniform2f(uPointer, x * scale, canvas.height - y * scale);
    },
    setColors({ light, shade, dot }) {
      gl.uniform3f(uDot, ...dot);
      gl.uniform3f(uLight, ...light);
      gl.uniform3f(uShade, ...shade);
    },
    resize,
    destroy: () => gl.getExtension("WEBGL_lose_context")?.loseContext(),
  };
}
