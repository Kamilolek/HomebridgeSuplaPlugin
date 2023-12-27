export function HSVtoRGB(h, s, v) {
  h = h / 360;
  s = s / 100;
  v = v / 100;
  let r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    s = h.s;
    v = h.v;
    h = h.h;
  }
  // eslint-disable-next-line prefer-const
  i = Math.floor(h * 6);
  // eslint-disable-next-line prefer-const
  f = h * 6 - i;
  // eslint-disable-next-line prefer-const
  p = v * (1 - s);
  // eslint-disable-next-line prefer-const
  q = v * (1 - f * s);
  // eslint-disable-next-line prefer-const
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function RGBtoHSV(r, g, b) {
  if (arguments.length === 1) {
    g = r.g;
    b = r.b;
    r = r.r;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min;
  let
    h,
    // eslint-disable-next-line prefer-const
    s = (max === 0 ? 0 : d / max),
    // eslint-disable-next-line prefer-const
    v = max / 255;

  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

export function HexToRGB(hex) {
  return {
    r: parseInt(hex.substr(2, 2), 16),
    g: parseInt(hex.substr(4, 2), 16),
    b: parseInt(hex.substr(6, 2), 16),
  };
}

export function RGBToHex(r, g, b) {
  if (arguments.length === 1) {
    g = r.g;
    b = r.b;
    r = r.r;
  }
  return '0x' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
