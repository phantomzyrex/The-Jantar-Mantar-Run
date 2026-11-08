import * as THREE from 'three';
import { PROTESTERS, ProtesterId } from '../types/game';

function configureColorTexture(tex: THREE.CanvasTexture, maxAnisotropy: number) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function configureDataTexture(tex: THREE.CanvasTexture, maxAnisotropy: number) {
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

// High-definition Asphalt Road Albedo + Bump Map
export function createAsphaltRoadTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3b4048';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle lane wear tracks
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(20,24,30,0.35)');
  grad.addColorStop(0.2, 'rgba(75,82,94,0.18)');
  grad.addColorStop(0.5, 'rgba(65,72,82,0.15)');
  grad.addColorStop(0.8, 'rgba(75,82,94,0.18)');
  grad.addColorStop(1, 'rgba(20,24,30,0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Mineral aggregate speckle
  for (let i = 0; i < 9000; i++) {
    const x = (i * 73) % 512;
    const y = (i * 139) % 512;
    const v = 50 + ((i * 29) % 34);
    ctx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const map = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 45);

  const bumpMap = configureDataTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 45);

  return { map, bumpMap };
}

// Warm Terracotta-Brown Indian Sidewalk Paver Texture (Exact match to screenshots)
export function createTerracottaSidewalkTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#63483f';
  ctx.fillRect(0, 0, 512, 512);

  const tileW = 64;
  const tileH = 64;
  for (let y = 0; y < 512; y += tileH) {
    for (let x = 0; x < 512; x += tileW) {
      const offset = (y / tileH) % 2 === 0 ? 0 : tileW / 2;
      const shade = ((x + y) % 3) * 4 - 4;
      ctx.fillStyle = `rgb(${99 + shade}, ${72 + shade}, ${63 + shade})`;
      ctx.fillRect((x + offset) % 512, y, tileW - 3, tileH - 3);
      ctx.strokeStyle = 'rgba(30, 20, 16, 0.38)';
      ctx.lineWidth = 2;
      ctx.strokeRect((x + offset) % 512, y, tileW - 2, tileH - 2);
    }
  }

  const tex = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 55);
  return tex;
}

// Iconic Delhi Tree Trunk Texture with Gnarled Organic Bark Fissures, Knots & PWD White-Red Band
export function createTreeBarkWithPwdBandTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Rich organic Neem/Peepal bark base gradient
  const baseGrad = ctx.createLinearGradient(0, 0, 512, 0);
  baseGrad.addColorStop(0, '#3d281a');
  baseGrad.addColorStop(0.35, '#523624');
  baseGrad.addColorStop(0.68, '#462e1e');
  baseGrad.addColorStop(1, '#362215');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // Interlocking organic bark ridges & deep vertical fissures
  for (let i = 0; i < 380; i++) {
    const x = (i * 37) % 512;
    const y = (i * 83) % 1024;
    const w = 4 + (i % 7);
    const h = 45 + ((i * 19) % 110);
    ctx.fillStyle = i % 3 === 0 ? '#24160d' : i % 2 === 0 ? '#5e402b' : '#332014';
    ctx.fillRect(x, y, w, h);
  }

  // Subtle green-grey monsoon moss & lichen patches on bark
  for (let i = 0; i < 45; i++) {
    const mx = (i * 79) % 512;
    const my = (i * 163) % 560;
    ctx.fillStyle = 'rgba(77, 107, 53, 0.18)';
    ctx.beginPath();
    ctx.ellipse(mx, my, 12 + (i % 10), 22 + (i % 14), 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // PWD White & Terracotta-Red Hand-Painted Band on Lower Trunk (y = 580..850)
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(0, 585, 512, 46);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 631, 512, 168);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(0, 799, 512, 46);

  // Realistic bark crevices & brush strokes showing through the lime/red oxide paint
  for (let x = 0; x < 512; x += 6) {
    const darkCrevice = x % 18 === 0;
    ctx.fillStyle = darkCrevice ? 'rgba(30, 18, 10, 0.34)' : 'rgba(90, 65, 45, 0.12)';
    ctx.fillRect(x, 580, darkCrevice ? 3 : 2, 272);
  }

  // Stenciled PWD tree number plate detail
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NDMC • 42', 256, 722);

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

// High-Detail Botanical Neem / Peepal Leaf-Cluster Texture with Leaf Veins & Dappled Sunlight
export function createFoliageTexture(baseHex: string, maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  const leafPalette = [
    '#14532d',
    '#166534',
    '#15803d',
    '#3f6212',
    '#4d7c0f',
    '#65a30d',
    '#84cc16',
    '#a3e635',
  ];

  // Draw 950 individual pointed botanical leaves with central midrib veins
  for (let i = 0; i < 950; i++) {
    const cx = (i * 73) % 512;
    const cy = (i * 137) % 512;
    const angle = ((i * 47) % 360) * (Math.PI / 180);
    const leafLen = 14 + (i % 12);
    const leafW = 6 + (i % 5);
    const color = leafPalette[i % leafPalette.length];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Leaf shadow for depth
    ctx.fillStyle = 'rgba(10, 28, 14, 0.35)';
    ctx.beginPath();
    ctx.ellipse(2, 2, leafLen, leafW, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leaf blade
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-leafLen, 0);
    ctx.quadraticCurveTo(0, -leafW * 1.25, leafLen, 0);
    ctx.quadraticCurveTo(0, leafW * 1.25, -leafLen, 0);
    ctx.fill();

    // Central leaf midrib vein
    ctx.strokeStyle = 'rgba(236, 252, 203, 0.38)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-leafLen * 0.8, 0);
    ctx.lineTo(leafLen * 0.85, 0);
    ctx.stroke();

    ctx.restore();
  }

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

// Colorful Tilted Book / Mobile Poster Wall Texture (Exact match to MOBILE REPAIR, छोले भटूरे, LAW BOOKS & BOOK DEPOT in screenshots!)
export function createColorfulPosterWallTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Dark wood/brown recessed shop wall
  ctx.fillStyle = '#3b2316';
  ctx.fillRect(0, 0, 512, 384);

  // Inner wood panel frame lines
  ctx.strokeStyle = '#24140c';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 368);

  const posters = [
    { x: 42, y: 45, w: 46, h: 64, c: '#ef4444', rot: -0.08 },
    { x: 112, y: 52, w: 48, h: 66, c: '#facc15', rot: 0.06 },
    { x: 185, y: 40, w: 46, h: 62, c: '#38bdf8', rot: -0.05 },
    { x: 262, y: 48, w: 50, h: 66, c: '#a855f7', rot: 0.09 },
    { x: 340, y: 42, w: 46, h: 64, c: '#22c55e', rot: -0.07 },
    { x: 418, y: 50, w: 48, h: 64, c: '#f97316', rot: 0.05 },

    { x: 52, y: 145, w: 48, h: 66, c: '#3b82f6', rot: 0.07 },
    { x: 128, y: 138, w: 48, h: 64, c: '#ec4899', rot: -0.06 },
    { x: 204, y: 148, w: 50, h: 68, c: '#eab308', rot: 0.04 },
    { x: 282, y: 140, w: 46, h: 64, c: '#10b981', rot: -0.08 },
    { x: 356, y: 150, w: 48, h: 66, c: '#ef4444', rot: 0.06 },
    { x: 426, y: 142, w: 46, h: 64, c: '#38bdf8', rot: -0.05 },

    { x: 44, y: 248, w: 50, h: 68, c: '#22c55e', rot: -0.05 },
    { x: 122, y: 254, w: 46, h: 64, c: '#f97316', rot: 0.08 },
    { x: 198, y: 244, w: 48, h: 66, c: '#9333ea', rot: -0.06 },
    { x: 276, y: 252, w: 50, h: 68, c: '#facc15', rot: 0.07 },
    { x: 352, y: 246, w: 48, h: 64, c: '#3b82f6', rot: -0.04 },
    { x: 424, y: 254, w: 48, h: 66, c: '#ef4444', rot: 0.06 },
  ];

  for (const p of posters) {
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate(p.rot);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-p.w / 2 + 3, -p.h / 2 + 4, p.w, p.h);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

export function createPoliceBarricadeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#1e293b';
  const stripeW = 46;
  for (let x = -256; x < 768; x += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeW, 0);
    ctx.lineTo(x + stripeW - 170, 256);
    ctx.lineTo(x - 170, 256);
    ctx.closePath();
    ctx.fill();
  }

  // Distressed metallic border
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#ca8a04';
  ctx.strokeRect(7, 7, 498, 242);

  // Center Blue Police Stencil Plate
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(132, 66, 248, 122);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#f8fafc';
  ctx.strokeRect(132, 66, 248, 122);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 54px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POLICE', 256, 128);

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

export function createBannerTexture(
  text: string,
  bgHex: string,
  textHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 1024, 220);

  // Top & Bottom stitched hem borders
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(16, 14, 992, 192);
  ctx.setLineDash([]);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 1016, 212);

  // 3D Extruded Text Shadow
  ctx.font = '900 86px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(text, 518, 120);

  ctx.fillStyle = textHex;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 10;
  ctx.strokeText(text, 512, 114);
  ctx.fillText(text, 512, 114);

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

export function createShopSignTexture(
  title: string,
  bgHex: string,
  fgHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 160);

  // Subtle awning stripe bevels
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let x = 0; x < 512; x += 32) {
    ctx.fillRect(x, 0, 14, 160);
  }

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 502, 150);

  ctx.font = 'italic 900 56px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Hard 3D comic block extrusion matching LAW BOOKS / PHOTOSTAT / छोले भटूरे
  ctx.fillStyle = '#0f172a';
  ctx.fillText(title, 262, 88);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 9;
  ctx.strokeText(title, 256, 82);
  ctx.fillStyle = fgHex;
  ctx.fillText(title, 256, 82);

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

export function createFloatingBadgeTexture(
  text: string,
  variant: 'speech' | 'nametag' | 'placard',
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 160);

  if (variant === 'speech') {
    // White comic speech bubble ("BATTERY 10%!")
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(22, 18, 472, 108, 36);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(16, 12, 472, 108, 36);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.font = 'italic 900 54px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 252, 68);
  } else if (variant === 'nametag') {
    // Dark translucent pill badge ("CAMERA PERSON PARTH")
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(16, 36, 480, 88, 18);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    ctx.font = 'italic 900 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 80);
  } else {
    // Protest hand placard ("RE-EXAM!")
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, 16, 464, 128);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(24, 16, 464, 128);

    ctx.font = '900 58px "Bricolage Grotesque", sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 80);
  }

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

export function createShutterTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 14) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, y, 256, 5);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, y + 5, 256, 4);
  }
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

export function createCheckeredFinishTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const size = 32;
  for (let y = 0; y < 128; y += size) {
    for (let x = 0; x < 512; x += size) {
      const isWhite = (x / size + y / size) % 2 === 0;
      ctx.fillStyle = isWhite ? '#f8fafc' : '#0f172a';
      ctx.fillRect(x, y, size, size);
    }
  }
  return configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
}

// Composite 10-part Police Barricade Group
export function buildBarricadeMesh(barricadeTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.35,
    metalness: 0.65,
  });
  const boardMat = new THREE.MeshStandardMaterial({
    map: barricadeTex,
    roughness: 0.5,
    metalness: 0.18,
  });
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.2,
  });

  const board = new THREE.Mesh(new THREE.BoxGeometry(2.75, 1.18, 0.14), boardMat);
  board.position.y = 0.84;
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  const postGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.48, 12);
  const leftPost = new THREE.Mesh(postGeo, frameMat);
  leftPost.position.set(-1.34, 0.74, 0);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, frameMat);
  rightPost.position.set(1.34, 0.74, 0);
  rightPost.castShadow = true;
  group.add(rightPost);

  const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.78, 12), frameMat);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.set(0, 1.45, 0);
  group.add(topBar);

  const footGeo = new THREE.BoxGeometry(0.15, 0.08, 0.95);
  const leftFoot = new THREE.Mesh(footGeo, frameMat);
  leftFoot.position.set(-1.34, 0.04, 0);
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, frameMat);
  rightFoot.position.set(1.34, 0.04, 0);
  group.add(rightFoot);

  const wheelGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.08, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const w1 = new THREE.Mesh(wheelGeo, wheelMat);
  w1.position.set(-1.34, 0.095, 0.36);
  group.add(w1);

  const w2 = new THREE.Mesh(wheelGeo, wheelMat);
  w2.position.set(1.34, 0.095, 0.36);
  group.add(w2);

  return group;
}

// ============================================================================
// ULTRA-REALISTIC LIVING OBJECTS PBR TEXTURE & PHYSICAL MATERIAL CACHE
// ============================================================================
const livingMaterialCache = new Map<string, THREE.Material>();
let cachedSkinBumpTex: THREE.CanvasTexture | null = null;
let cachedFabricBumpTex: THREE.CanvasTexture | null = null;
let cachedHairBumpTex: THREE.CanvasTexture | null = null;

function getSkinBumpTexture(): THREE.CanvasTexture {
  if (cachedSkinBumpTex) return cachedSkinBumpTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4200; i++) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    const v = 116 + ((i * 19) % 26);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 2, 2);
  }
  cachedSkinBumpTex = configureDataTexture(new THREE.CanvasTexture(canvas), 4);
  cachedSkinBumpTex.wrapS = THREE.RepeatWrapping;
  cachedSkinBumpTex.wrapT = THREE.RepeatWrapping;
  return cachedSkinBumpTex;
}

function getFabricBumpTexture(): THREE.CanvasTexture {
  if (cachedFabricBumpTex) return cachedFabricBumpTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#787878';
  ctx.fillRect(0, 0, 256, 256);
  // Fine woven warp & weft cloth threads
  for (let y = 0; y < 256; y += 3) {
    ctx.fillStyle = y % 6 === 0 ? '#969696' : '#646464';
    ctx.fillRect(0, y, 256, 1);
  }
  for (let x = 0; x < 256; x += 3) {
    ctx.fillStyle = x % 6 === 0 ? 'rgba(210,210,210,0.28)' : 'rgba(50,50,50,0.28)';
    ctx.fillRect(x, 0, 1, 256);
  }
  cachedFabricBumpTex = configureDataTexture(new THREE.CanvasTexture(canvas), 4);
  cachedFabricBumpTex.wrapS = THREE.RepeatWrapping;
  cachedFabricBumpTex.wrapT = THREE.RepeatWrapping;
  cachedFabricBumpTex.repeat.set(3, 3);
  return cachedFabricBumpTex;
}

function getHairBumpTexture(): THREE.CanvasTexture {
  if (cachedHairBumpTex) return cachedHairBumpTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#707070';
  ctx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 2) {
    const shade = 85 + ((x * 31) % 75);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, 0, 1, 256);
  }
  cachedHairBumpTex = configureDataTexture(new THREE.CanvasTexture(canvas), 4);
  cachedHairBumpTex.wrapS = THREE.RepeatWrapping;
  cachedHairBumpTex.wrapT = THREE.RepeatWrapping;
  return cachedHairBumpTex;
}

function getSkinPhysicalMaterial(skinHex: string): THREE.MeshPhysicalMaterial {
  const key = `skin_${skinHex}`;
  if (livingMaterialCache.has(key)) {
    return livingMaterialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = skinHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle warm subsurface cheek & nose flush
  const flushGrad = ctx.createRadialGradient(128, 138, 12, 128, 138, 95);
  flushGrad.addColorStop(0, 'rgba(225, 95, 85, 0.22)');
  flushGrad.addColorStop(1, 'rgba(225, 95, 85, 0)');
  ctx.fillStyle = flushGrad;
  ctx.fillRect(0, 0, 256, 256);

  const map = configureColorTexture(new THREE.CanvasTexture(canvas), 4);
  const mat = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap: getSkinBumpTexture(),
    bumpScale: 0.006,
    roughness: 0.46,
    metalness: 0.02,
    clearcoat: 0.14,
    clearcoatRoughness: 0.62,
    sheen: 0.38,
    sheenColor: new THREE.Color(0xfca5a5),
    sheenRoughness: 0.55,
  });
  livingMaterialCache.set(key, mat);
  return mat;
}

function getFabricPhysicalMaterial(
  baseHex: string,
  pattern: 'solid' | 'checkered' | 'zari_dupatta' | 'khaki_twill' | 'hoodie_fleece' | 'denim' = 'solid'
): THREE.MeshPhysicalMaterial {
  const key = `fabric_${baseHex}_${pattern}`;
  if (livingMaterialCache.has(key)) {
    return livingMaterialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  if (pattern === 'checkered') {
    // Authentic plaid checkered shirt weave (for Abhijit)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    for (let i = 0; i < 256; i += 32) {
      ctx.fillRect(i, 0, 6, 256);
      ctx.fillRect(0, i, 256, 6);
    }
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    for (let i = 16; i < 256; i += 32) {
      ctx.fillRect(i, 0, 3, 256);
      ctx.fillRect(0, i, 256, 3);
    }
  } else if (pattern === 'zari_dupatta') {
    // Crimson silk dupatta with woven gold Banarasi zari borders & bootis (for Neha)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 26);
    ctx.fillRect(0, 230, 256, 26);
    for (let y = 44; y < 215; y += 36) {
      for (let x = 24; x < 240; x += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'khaki_twill') {
    // Diagonal twill weave & subtle seam lines (for Delhi Police)
    ctx.strokeStyle = 'rgba(70, 52, 28, 0.16)';
    ctx.lineWidth = 2;
    for (let i = -256; i < 512; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }
  } else if (pattern === 'denim') {
    // Indigo/slate denim cross-hatch grain
    for (let i = 0; i < 2500; i++) {
      const x = (i * 43) % 256;
      const y = (i * 89) % 256;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, y, 2, 3);
    }
  } else {
    // Subtle natural cotton/linen weave micro-variation
    for (let y = 0; y < 256; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, y, 256, 2);
    }
  }

  const map = configureColorTexture(new THREE.CanvasTexture(canvas), 4);
  const mat = new THREE.MeshPhysicalMaterial({
    map,
    bumpMap: getFabricBumpTexture(),
    bumpScale: 0.014,
    roughness: pattern === 'zari_dupatta' ? 0.38 : 0.64,
    metalness: pattern === 'zari_dupatta' ? 0.18 : 0.02,
    sheen: 0.62,
    sheenColor: new THREE.Color(baseHex).lerp(new THREE.Color(0xffffff), 0.35),
    sheenRoughness: 0.58,
  });
  livingMaterialCache.set(key, mat);
  return mat;
}

function getHairPhysicalMaterial(hairHex: string): THREE.MeshPhysicalMaterial {
  const key = `hair_${hairHex}`;
  if (livingMaterialCache.has(key)) {
    return livingMaterialCache.get(key) as THREE.MeshPhysicalMaterial;
  }
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(hairHex),
    bumpMap: getHairBumpTexture(),
    bumpScale: 0.018,
    roughness: 0.48,
    metalness: 0.08,
    clearcoat: 0.22,
    clearcoatRoughness: 0.45,
    sheen: 0.5,
    sheenColor: new THREE.Color(hairHex).lerp(new THREE.Color(0xffffff), 0.25),
  });
  livingMaterialCache.set(key, mat);
  return mat;
}

// Helper: Builds an Ultra-Realistic Sculpted Human Head with Jawline, Ears, Nose, Eyebrows, Multi-Layer Eyes & Lips
function buildRealisticHumanHeadGroup(
  skinHex: string,
  eyeIrisHex: number,
  expression: 'determined' | 'chanting' | 'smiling' | 'stern'
): THREE.Group {
  const headGroup = new THREE.Group();
  const skinMat = getSkinPhysicalMaterial(skinHex);

  // 1. Sculpted Neck with Sternocleidomastoid Taper
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.135, 0.22, 16), skinMat);
  neck.position.set(0, -0.22, 0.01);
  neck.castShadow = true;
  headGroup.add(neck);

  // 2. Main Cranium Sphere + Sculpted Lower Jaw/Chin
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.275, 24, 24), skinMat);
  cranium.scale.set(0.96, 1.04, 0.98);
  cranium.castShadow = true;
  headGroup.add(cranium);

  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 16), skinMat);
  jaw.scale.set(0.92, 0.85, 0.92);
  jaw.position.set(0, -0.09, -0.02);
  headGroup.add(jaw);

  // 3. Sculpted 3D Nose Bridge, Tip & Nostrils (visible on both front & rear/side angles)
  for (const zDir of [-1, 1]) {
    const noseBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.075, 6, 10), skinMat);
    noseBridge.position.set(0, 0.01, zDir * 0.265);
    noseBridge.rotation.x = zDir * 0.22;
    headGroup.add(noseBridge);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), skinMat);
    noseTip.position.set(0, -0.03, zDir * 0.285);
    headGroup.add(noseTip);
  }

  // 4. Sculpted Left & Right Ears with Helix Rim
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), skinMat);
    ear.scale.set(0.42, 1.05, 0.68);
    ear.position.set(side * 0.265, 0.0, 0);
    headGroup.add(ear);
  }

  // 5. Multi-Layer Realistic Eyes (Sclera, Colored Iris, Dark Pupil, Corneal Specular Highlight & Arched Eyebrows)
  const scleraMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.12,
    clearcoat: 1.0,
  });
  const irisMat = new THREE.MeshStandardMaterial({ color: eyeIrisHex, roughness: 0.25 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const browMat = getHairPhysicalMaterial('#1e1b18');

  for (const zDir of [-1, 1]) {
    for (const ex of [-0.095, 0.095]) {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), scleraMat);
      sclera.scale.set(1.1, 0.92, 0.7);
      sclera.position.set(ex, 0.035, zDir * 0.242);
      headGroup.add(sclera);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), irisMat);
      iris.scale.set(1, 1, 0.55);
      iris.position.set(ex, 0.035, zDir * 0.266);
      headGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), pupilMat);
      pupil.position.set(ex, 0.035, zDir * 0.276);
      headGroup.add(pupil);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), highlightMat);
      glint.position.set(ex + 0.01, 0.046, zDir * 0.281);
      headGroup.add(glint);

      // Sculpted Eyebrow
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.068, 6, 8), browMat);
      brow.rotation.z =
        Math.PI / 2 +
        (expression === 'stern' ? (ex < 0 ? -0.22 : 0.22) : ex < 0 ? 0.08 : -0.08);
      brow.position.set(ex, 0.095, zDir * 0.248);
      headGroup.add(brow);
    }

    // 6. Sculpted Lips / Mouth Expression
    const lipMat = new THREE.MeshStandardMaterial({
      color: expression === 'chanting' ? 0x7f1d1d : 0x9f4a42,
      roughness: 0.45,
    });
    if (expression === 'chanting') {
      const openMouth = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), lipMat);
      openMouth.scale.set(1.25, 0.85, 0.5);
      openMouth.position.set(0, -0.105, zDir * 0.252);
      headGroup.add(openMouth);
    } else {
      const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.065, 6, 8), lipMat);
      lips.rotation.z = Math.PI / 2;
      lips.position.set(0, -0.105, zDir * 0.254);
      headGroup.add(lips);
    }
  }

  return headGroup;
}

// Helper: Builds an Articulated Realistic Shoe / Sneaker / Leather Jutti
function buildRealisticFootwearMesh(
  style: 'sneaker' | 'jutti' | 'boot',
  primaryColorHex: number,
  accentColorHex = 0xffffff
): THREE.Group {
  const shoeGroup = new THREE.Group();
  const upperMat = new THREE.MeshPhysicalMaterial({
    color: primaryColorHex,
    roughness: style === 'boot' ? 0.28 : 0.5,
    clearcoat: style === 'boot' ? 0.55 : 0.15,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: style === 'sneaker' ? accentColorHex : 0x1c1917,
    roughness: 0.75,
  });

  // Rubber outsole / midsole
  const sole = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.065, 0.39), soleMat);
  sole.position.set(0, -0.05, -0.04);
  sole.castShadow = true;
  shoeGroup.add(sole);

  // Sculpted shoe upper + rounded toe box
  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.11, 0.28), upperMat);
  upper.position.set(0, 0.02, 0.0);
  upper.castShadow = true;
  shoeGroup.add(upper);

  const toeCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 12, 10),
    style === 'sneaker' ? soleMat : upperMat
  );
  toeCap.scale.set(1.0, 0.65, 1.25);
  toeCap.position.set(0, 0.0, -0.14);
  shoeGroup.add(toeCap);

  // Ankle collar / sock cuff
  const ankleCuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.105, 0.09, 12),
    style === 'sneaker'
      ? new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 })
      : upperMat
  );
  ankleCuff.position.set(0, 0.08, 0.04);
  shoeGroup.add(ankleCuff);

  return shoeGroup;
}

// Ultra-Realistic Multi-Joint Sculpted Protester Character Model matching image_c8609fd5.png
export function buildProtesterMesh(
  protesterId: ProtesterId,
  isRemotePlayer = false
): {
  root: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  bodyGroup: THREE.Group;
} {
  const cfg = PROTESTERS.find((p) => p.id === protesterId) || PROTESTERS[3];
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const ringGeo = new THREE.RingGeometry(0.68, 0.78, 36);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isRemotePlayer ? 0x38bdf8 : 0xfacc15,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.03;
  root.add(ring);

  const shadowGeo = new THREE.CircleGeometry(0.64, 28);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  root.add(shadow);

  const skinTone =
    cfg.id === 'neha' || cfg.id === 'genz'
      ? '#dfa06b'
      : cfg.id === 'minister'
      ? '#d89660'
      : '#c98449';
  const skinMat = getSkinPhysicalMaterial(skinTone);

  const primaryPattern =
    cfg.id === 'abhijit'
      ? 'checkered'
      : cfg.id === 'genz'
      ? 'hoodie_fleece'
      : 'solid';
  const secondaryPattern =
    cfg.id === 'abhijit' || cfg.id === 'genz' || cfg.id === 'warrior' ? 'denim' : 'solid';

  const primaryMat = getFabricPhysicalMaterial(cfg.outfitPrimary, primaryPattern);
  const secondaryMat = getFabricPhysicalMaterial(cfg.outfitSecondary, secondaryPattern);

  // 1. Multi-Joint Articulated Legs (Thigh + Knee + Calf + Sculpted Footwear)
  const thighGeo = new THREE.CapsuleGeometry(0.118, 0.3, 10, 16);
  const calfGeo = new THREE.CapsuleGeometry(0.096, 0.28, 10, 16);

  const leftLeg = new THREE.Mesh(thighGeo, secondaryMat);
  leftLeg.position.set(-0.18, 0.52, 0);
  leftLeg.castShadow = true;
  bodyGroup.add(leftLeg);

  const leftCalf = new THREE.Mesh(calfGeo, secondaryMat);
  leftCalf.position.set(0, -0.22, 0.01);
  leftCalf.castShadow = true;
  leftLeg.add(leftCalf);

  const rightLeg = new THREE.Mesh(thighGeo, secondaryMat);
  rightLeg.position.set(0.18, 0.52, 0);
  rightLeg.castShadow = true;
  bodyGroup.add(rightLeg);

  const rightCalf = new THREE.Mesh(calfGeo, secondaryMat);
  rightCalf.position.set(0, -0.22, 0.01);
  rightCalf.castShadow = true;
  rightLeg.add(rightCalf);

  const shoeStyle = cfg.id === 'neha' || cfg.id === 'minister' ? 'jutti' : 'sneaker';
  const shoePrimaryHex =
    cfg.id === 'neha' || cfg.id === 'minister'
      ? 0x5c2c16
      : cfg.id === 'genz'
      ? 0x0f172a
      : 0x1e293b;
  const leftShoe = buildRealisticFootwearMesh(shoeStyle, shoePrimaryHex, 0xf8fafc);
  leftShoe.position.set(0, -0.42, -0.02);
  leftLeg.add(leftShoe);

  const rightShoe = buildRealisticFootwearMesh(shoeStyle, shoePrimaryHex, 0xf8fafc);
  rightShoe.position.set(0, -0.42, -0.02);
  rightLeg.add(rightShoe);

  // 2. Sculpted Anatomical Torso (Upper Chest + Tapered Waist/Hip + Collar)
  const chestGeo = new THREE.CapsuleGeometry(0.32, 0.44, 14, 22);
  const torso = new THREE.Mesh(chestGeo, primaryMat);
  torso.scale.set(1.06, 1.0, 0.84);
  torso.position.set(0, 1.18, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Kurta / Shirt Hem & Pelvis
  const hipHem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.35, 0.32, 20),
    primaryMat
  );
  hipHem.scale.set(1.04, 1.0, 0.84);
  hipHem.position.set(0, 0.88, 0);
  hipHem.castShadow = true;
  bodyGroup.add(hipHem);

  // Tailored Collar Ring
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.036, 10, 20),
    primaryMat
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 1.52, 0);
  bodyGroup.add(collar);

  // 3. Sculpted Realistic Human Head
  const headExpression =
    cfg.id === 'neha' || cfg.id === 'nsui'
      ? 'chanting'
      : cfg.id === 'warrior'
      ? 'smiling'
      : 'determined';
  const headGroup = buildRealisticHumanHeadGroup(skinTone, 0x3b2314, headExpression);
  headGroup.position.set(0, 1.83, 0);
  bodyGroup.add(headGroup);

  // 4. Character-Specific Hair, Hats, Jewelry, Garlands & Garments
  if (cfg.id === 'genz') {
    // Vibrant Purple Dyed Hair Locks + Stitched Pink Bucket Hat + Over-Ear Headphones around Neck
    const purpleHairMat = getHairPhysicalMaterial('#9333ea');
    for (const hx of [-0.25, 0.25]) {
      const lock = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.18, 8, 12), purpleHairMat);
      lock.position.set(hx, 1.79, 0.02);
      lock.rotation.z = hx < 0 ? 0.25 : -0.25;
      bodyGroup.add(lock);
    }

    const hatMat = getFabricPhysicalMaterial('#f472b6', 'solid');
    const hatBrimMat = getFabricPhysicalMaterial('#ec4899', 'solid');
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 0.09, 28), hatBrimMat);
    brim.position.set(0, 1.97, 0);
    brim.castShadow = true;
    bodyGroup.add(brim);

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.33, 0.22, 28), hatMat);
    crown.position.set(0, 2.09, 0);
    crown.castShadow = true;
    bodyGroup.add(crown);

    // Sculpted 3D Hoodie Hood bunched behind neck + Yellow Drawstrings
    const hoodBack = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.085, 12, 20), primaryMat);
    hoodBack.rotation.x = Math.PI / 2.2;
    hoodBack.position.set(0, 1.52, 0.08);
    bodyGroup.add(hoodBack);

    const stringMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
    for (const sx of [-0.08, 0.08]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), stringMat);
      cord.position.set(sx, 1.36, -0.27);
      bodyGroup.add(cord);
    }
  } else if (cfg.id === 'neha') {
    // Glossy Parted Dark Hair + Multi-Segment Woven Braid + Gold Jhumka Earrings + Red Bindi + Banarasi Zari Dupatta + Jhola Bag
    const hairMat = getHairPhysicalMaterial('#18181b');
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.292, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    hairCap.position.set(0, 1.85, 0.02);
    bodyGroup.add(hairCap);

    // Multi-segment braided plait with red parandi tassel
    for (let b = 0; b < 6; b++) {
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.058 - b * 0.004, 10, 10), hairMat);
      knot.position.set(0.22, 1.68 - b * 0.085, 0.09);
      bodyGroup.add(knot);
    }
    const parandi = new THREE.Mesh(
      new THREE.ConeGeometry(0.048, 0.14, 10),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
    );
    parandi.position.set(0.22, 1.15, 0.09);
    bodyGroup.add(parandi);

    // Traditional Gold Jhumka Bell Earrings & Red Forehead Bindi
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.88,
      roughness: 0.22,
    });
    for (const side of [-1, 1]) {
      const jhumka = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.07, 12), goldMat);
      jhumka.position.set(side * 0.275, 1.75, 0);
      bodyGroup.add(jhumka);
    }
    const bindi = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    bindi.position.set(0, 1.91, -0.265);
    bodyGroup.add(bindi);

    // Banarasi Zari Crimson & Gold Dupatta Sash
    const dupattaMat = getFabricPhysicalMaterial('#dc2626', 'zari_dupatta');
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.62), dupattaMat);
    sash.position.set(0, 1.18, 0);
    sash.rotation.z = 0.62;
    sash.castShadow = true;
    bodyGroup.add(sash);

    // Quilted Cream Jhola Sling Bag with Strap
    const jholaMat = getFabricPhysicalMaterial('#fef08a', 'solid');
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.3), jholaMat);
    bag.position.set(-0.37, 0.9, 0);
    bag.castShadow = true;
    bodyGroup.add(bag);
  } else if (cfg.id === 'abhijit') {
    // Sculpted Wavy Dark Hair + Orange Inner Crew Tee Collar + Red Commuter Backpack with Straps
    const hairMat = getHairPhysicalMaterial('#231815');
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.296, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairCap.position.set(0, 1.86, 0.02);
    bodyGroup.add(hairCap);

    // Sculpted wavy hair locks on top
    for (let i = -2; i <= 2; i++) {
      const wave = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), hairMat);
      wave.position.set(i * 0.07, 2.08, -0.04 + (i % 2) * 0.04);
      bodyGroup.add(wave);
    }

    // Inner Orange Tee V-neck visible at throat
    const innerTee = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.14, 16),
      getFabricPhysicalMaterial('#f97316', 'solid')
    );
    innerTee.position.set(0, 1.53, 0);
    bodyGroup.add(innerTee);

    // Contoured Red Commuter Backpack with Zipper Pocket & Shoulder Straps
    const packMat = getFabricPhysicalMaterial('#dc2626', 'solid');
    const packPocketMat = getFabricPhysicalMaterial('#991b1b', 'solid');
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.54, 0.22), packMat);
    backpack.position.set(0, 1.2, 0.27);
    backpack.castShadow = true;
    bodyGroup.add(backpack);

    const outerPouch = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.08), packPocketMat);
    outerPouch.position.set(0, 1.12, 0.39);
    bodyGroup.add(outerPouch);

    for (const sx of [-0.17, 0.17]) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.52, 0.58), packPocketMat);
      strap.position.set(sx, 1.24, 0);
      bodyGroup.add(strap);
    }
  } else if (cfg.id === 'nsui') {
    // Sculpted Dark Hair + Red Protest Headband + Royal Blue Student Union Sash with Gold Border
    const hairMat = getHairPhysicalMaterial('#171717');
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.295, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hair.position.set(0, 1.85, 0.02);
    bodyGroup.add(hair);

    const headband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.288, 0.288, 0.065, 24),
      getFabricPhysicalMaterial('#dc2626', 'solid')
    );
    headband.position.set(0, 1.94, 0);
    bodyGroup.add(headband);

    const blueSash = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.17, 0.62),
      getFabricPhysicalMaterial('#1d4ed8', 'solid')
    );
    blueSash.position.set(0, 1.18, 0);
    blueSash.rotation.z = -0.64;
    blueSash.castShadow = true;
    bodyGroup.add(blueSash);
  } else if (cfg.id === 'minister') {
    // Silver-White Side Hair + Gold-Rimmed Spectacles + White Handlebar Mustache + Brown Nehru Jacket + 16-Blossom Marigold Garland
    const whiteHairMat = getHairPhysicalMaterial('#e2e8f0');
    for (const hx of [-0.26, 0.26]) {
      const sideHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.12, 8, 10), whiteHairMat);
      sideHair.position.set(hx, 1.82, 0.04);
      bodyGroup.add(sideHair);
    }

    // White Handlebar Mustache & Gold-Rimmed Glasses
    const goldFrameMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.85,
      roughness: 0.2,
    });
    for (const zDir of [-1, 1]) {
      const mustache = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.028, 0.16, 8, 10),
        whiteHairMat
      );
      mustache.rotation.z = Math.PI / 2;
      mustache.position.set(0, 1.76, zDir * 0.265);
      bodyGroup.add(mustache);

      for (const gx of [-0.095, 0.095]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.008, 8, 18), goldFrameMat);
        rim.position.set(gx, 1.865, zDir * 0.258);
        bodyGroup.add(rim);
      }
    }

    // Tailored Brown Nehru Waistcoat with Brass Buttons
    const nehruMat = getFabricPhysicalMaterial('#8c5a32', 'solid');
    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.355, 0.62, 22), nehruMat);
    jacket.scale.set(1.05, 1.0, 0.85);
    jacket.position.set(0, 1.18, 0);
    jacket.castShadow = true;
    bodyGroup.add(jacket);

    // Volumetric 16-Flower Marigold Garland (गेंदे की माला)
    const orangePetalMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 });
    const yellowPetalMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
    const flowerCount = 16;
    for (let f = 0; f < flowerCount; f++) {
      const angle = (f / flowerCount) * Math.PI * 2;
      const blossom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.058, 1),
        f % 2 === 0 ? orangePetalMat : yellowPetalMat
      );
      blossom.position.set(
        Math.cos(angle) * 0.26,
        1.42 - Math.abs(Math.sin(angle)) * 0.16,
        Math.sin(angle) * 0.28
      );
      bodyGroup.add(blossom);
    }

    // Under-arm "SCAM" Rainbow Confidential File Folder
    const folder = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.34, 0.44),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    folder.position.set(0.36, 1.08, 0.05);
    bodyGroup.add(folder);
    const redBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    redBand.position.set(0.36, 1.08, 0.05);
    bodyGroup.add(redBand);
  } else {
    // Wheelchair Warrior Spiky Hair + Sculpted Full Beard
    const hairMat = getHairPhysicalMaterial('#1c1917');
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.295, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6),
      hairMat
    );
    hair.position.set(0, 1.86, 0.02);
    bodyGroup.add(hair);

    for (let s = -2; s <= 2; s++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.18, 8), hairMat);
      spike.position.set(s * 0.07, 2.14, 0);
      spike.rotation.z = -s * 0.15;
      bodyGroup.add(spike);
    }

    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), hairMat);
    beard.scale.set(0.96, 0.78, 0.95);
    beard.position.set(0, 1.72, 0);
    bodyGroup.add(beard);
  }

  // 5. Multi-Joint Articulated Arms (Shoulder + Upper Arm + Forearm + Sculpted Hand & Fingers)
  const buildArticulatedArm = (side: -1 | 1): THREE.Group => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.4, 1.42, 0);

    // Sleeve Shoulder Cap & Upper Arm
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.088, 0.24, 10, 14), primaryMat);
    upperArm.position.y = -0.12;
    upperArm.castShadow = true;
    armGroup.add(upperArm);

    // Bare or Sleeved Forearm
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.22, 10, 14), skinMat);
    forearm.position.y = -0.34;
    forearm.castShadow = true;
    armGroup.add(forearm);

    // Wristwatch / Kara Detail
    const wristBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.078, 0.04, 12),
      new THREE.MeshStandardMaterial({
        color: side > 0 ? 0xfacc15 : 0x334155,
        metalness: 0.75,
        roughness: 0.25,
      })
    );
    wristBand.position.y = -0.44;
    armGroup.add(wristBand);

    // Sculpted Palm + Thumb + Curled Finger Grip
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), skinMat);
    palm.scale.set(0.85, 1.1, 0.95);
    palm.position.y = -0.52;
    armGroup.add(palm);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.05, 6, 8), skinMat);
    thumb.position.set(-side * 0.055, -0.51, -0.03);
    thumb.rotation.z = side * 0.5;
    armGroup.add(thumb);

    return armGroup;
  };

  const leftArm = buildArticulatedArm(-1);
  bodyGroup.add(leftArm);

  const rightArm = buildArticulatedArm(1);
  bodyGroup.add(rightArm);

  // 6. Ultra-Realistic Character Accessories & Props
  if (cfg.accessory === 'selfie_stick') {
    leftArm.rotation.x = -Math.PI * 0.75;
    leftArm.rotation.z = 0.2;

    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.026, 0.98, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
    );
    stick.position.set(0, -0.82, 0);
    leftArm.add(stick);

    const phone = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.42, 0.035),
      new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        roughness: 0.15,
        metalness: 0.7,
        clearcoat: 1.0,
      })
    );
    phone.position.set(0, -1.32, 0);
    leftArm.add(phone);

    // Glowing Live Screen & Dual Camera Lenses
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.36),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    screen.position.set(0, -1.32, -0.02);
    leftArm.add(screen);

    const recDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.036, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    recDot.position.set(0.065, -1.46, 0.025);
    leftArm.add(recDot);
  } else if (cfg.accessory === 'placard') {
    leftArm.rotation.x = -Math.PI * 0.7;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.15, 10),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 })
    );
    pole.position.set(0, -0.8, 0);
    leftArm.add(pole);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.48, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 })
    );
    sign.position.set(0, -1.3, 0);
    leftArm.add(sign);
  } else if (cfg.accessory === 'flag') {
    leftArm.rotation.x = -Math.PI * 0.75;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.03, 1.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.55 })
    );
    pole.position.set(0, -0.9, 0);
    leftArm.add(pole);

    const flagCloth = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.52, 0.035),
      getFabricPhysicalMaterial('#1d4ed8', 'solid')
    );
    flagCloth.position.set(0.42, -1.38, 0);
    flagCloth.castShadow = true;
    leftArm.add(flagCloth);

    const whiteStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.15, 0.042),
      getFabricPhysicalMaterial('#ffffff', 'solid')
    );
    whiteStripe.position.set(0.42, -1.38, 0);
    leftArm.add(whiteStripe);
  } else if (cfg.accessory === 'wheelchair') {
    // Custom Para-Athletic Racing Wheelchair with 12-Spoke Cambered Wheels, Push-Rims, Frame & Backrest
    const tireGeo = new THREE.TorusGeometry(0.48, 0.052, 16, 36);
    tireGeo.rotateY(Math.PI / 2);
    const pushRimGeo = new THREE.TorusGeometry(0.41, 0.022, 12, 32);
    pushRimGeo.rotateY(Math.PI / 2);

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.75,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.15,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.65,
      roughness: 0.3,
    });

    // Cushioned Seat & High Ergonomic Backrest
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.65), frameMat);
    seat.position.set(0, 0.58, 0);
    bodyGroup.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.68, 0.09), frameMat);
    backrest.position.set(0, 0.96, 0.28);
    bodyGroup.add(backrest);

    for (const wx of [-0.47, 0.47]) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, 0.48, 0);
      wheelGroup.rotation.z = wx < 0 ? 0.07 : -0.07; // Realistic athletic wheel camber

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const pushRim = new THREE.Mesh(pushRimGeo, chromeMat);
      pushRim.position.x = wx < 0 ? -0.045 : 0.045;
      wheelGroup.add(pushRim);

      const axleHub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.12, 16),
        chromeMat
      );
      axleHub.rotation.z = Math.PI / 2;
      wheelGroup.add(axleHub);

      // 8 Metallic Wire Spokes per Wheel
      for (let s = 0; s < 8; s++) {
        const spoke = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.88, 6),
          chromeMat
        );
        spoke.rotation.x = (s / 8) * Math.PI;
        wheelGroup.add(spoke);
      }

      bodyGroup.add(wheelGroup);
    }
  }

  return { root, leftLeg, rightLeg, leftArm, rightArm, bodyGroup };
}

// Ultra-Realistic Sculpted Enemy Officer Model (Khaki Police Constable / Stick Squad / Riot Police)
export function buildEnemyOfficerMesh(
  variant: 'khaki_police' | 'orange_goon' | 'riot_police'
): {
  root: THREE.Group;
  rightArm: THREE.Group;
  alertBadge: THREE.Mesh;
} {
  const root = new THREE.Group();

  const zoneGeo = new THREE.RingGeometry(1.65, 1.78, 36);
  zoneGeo.rotateX(-Math.PI / 2);
  const zoneMat = new THREE.MeshBasicMaterial({
    color: variant === 'khaki_police' ? 0x38bdf8 : 0xf97316,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });
  const zone = new THREE.Mesh(zoneGeo, zoneMat);
  zone.position.y = 0.03;
  root.add(zone);

  const outfitHex =
    variant === 'khaki_police'
      ? '#c3a675'
      : variant === 'orange_goon'
      ? '#ea580c'
      : '#2563eb';
  const pantsHex =
    variant === 'khaki_police'
      ? '#a88b5c'
      : variant === 'orange_goon'
      ? '#334155'
      : '#1e3a8a';

  const uniformMat = getFabricPhysicalMaterial(
    outfitHex,
    variant === 'khaki_police' ? 'khaki_twill' : 'solid'
  );
  const pantsMat = getFabricPhysicalMaterial(
    pantsHex,
    variant === 'khaki_police' ? 'khaki_twill' : 'denim'
  );
  const leatherBeltMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b1806,
    roughness: 0.32,
    metalness: 0.15,
    clearcoat: 0.65,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.9,
    roughness: 0.2,
  });
  const skinMat = getSkinPhysicalMaterial('#c68642');
  const woodLathiMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4a359,
    roughness: 0.35,
    clearcoat: 0.45,
  });

  // 1. Articulated Legs + Pleated Trousers + Polished Combat Boots
  for (const side of [-1, 1]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.32, 10, 14), pantsMat);
    thigh.position.set(side * 0.19, 0.54, 0);
    thigh.castShadow = true;
    root.add(thigh);

    const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.102, 0.28, 10, 14), pantsMat);
    calf.position.set(side * 0.19, 0.28, 0);
    calf.castShadow = true;
    root.add(calf);

    const boot = buildRealisticFootwearMesh('boot', 0x1c1917, 0x0f172a);
    boot.position.set(side * 0.19, 0.08, 0.03);
    root.add(boot);
  }

  // 2. Sculpted Uniform Torso + Chest Pockets + Brass Buttons + Epaulettes + Sam Browne Leather Belt
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.56, 14, 20), uniformMat);
  torso.scale.set(1.08, 1.0, 0.86);
  torso.position.set(0, 1.16, 0);
  torso.castShadow = true;
  root.add(torso);

  // Sam Browne Leather Belt & Brass Buckle
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.365, 0.365, 0.11, 22), leatherBeltMat);
  belt.scale.set(1.06, 1.0, 0.86);
  belt.position.set(0, 0.91, 0);
  root.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.65), brassMat);
  buckle.position.set(0, 0.91, 0);
  root.add(buckle);

  // Shoulder Epaulettes with Delhi Police Red-Blue Ribbon & Brass Stars
  for (const side of [-1, 1]) {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.14), uniformMat);
    ep.position.set(side * 0.28, 1.5, 0);
    root.add(ep);

    const star = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), brassMat);
    star.position.set(side * 0.28, 1.52, 0);
    root.add(star);
  }

  // 3. Sculpted Officer Head with Stern Expression & Thick Curved Handlebar Mustache (मूंछ)
  const headGroup = buildRealisticHumanHeadGroup('#c68642', 0x271c19, 'stern');
  headGroup.position.set(0, 1.83, 0);
  root.add(headGroup);

  const mustacheMat = getHairPhysicalMaterial('#171717');
  for (const zDir of [-1, 1]) {
    const mustacheCenter = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.028, 0.18, 8, 10),
      mustacheMat
    );
    mustacheCenter.rotation.z = Math.PI / 2;
    mustacheCenter.position.set(0, 1.755, zDir * 0.268);
    root.add(mustacheCenter);

    for (const side of [-1, 1]) {
      const curl = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.075, 8), mustacheMat);
      curl.position.set(side * 0.115, 1.775, zDir * 0.265);
      curl.rotation.z = -side * 0.35;
      root.add(curl);
    }
  }

  // 4. Headgear & Tactical Shield per Variant
  if (variant === 'khaki_police') {
    const capCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.285, 0.15, 24),
      uniformMat
    );
    capCrown.position.set(0, 2.04, 0);
    capCrown.castShadow = true;
    root.add(capCrown);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.035, 0.24), leatherBeltMat);
    visor.position.set(0, 1.97, 0.22);
    visor.rotation.x = 0.15;
    root.add(visor);

    const capCrest = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), brassMat);
    capCrest.rotation.x = Math.PI / 2;
    capCrest.position.set(0, 2.04, 0.3);
    root.add(capCrest);
  } else if (variant === 'riot_police') {
    const helmetMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.55,
      clearcoat: 0.9,
    });
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.325, 22, 18), helmetMat);
    helmet.position.set(0, 1.87, 0);
    root.add(helmet);

    // Transparent Polycarbonate Helmet Visor
    const visorGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.335, 0.335, 0.18, 20, 1, true, -Math.PI * 0.35, Math.PI * 0.7),
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        transmission: 0.7,
        clearcoat: 1.0,
        side: THREE.DoubleSide,
      })
    );
    visorGlass.position.set(0, 1.85, 0);
    root.add(visorGlass);

    // Polycarbonate Riot Shield
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.72,
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.55,
      clearcoat: 1.0,
    });
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.42, 0.055), shieldMat);
    shield.position.set(-0.44, 1.06, 0.36);
    root.add(shield);
  }

  // 5. Articulated Officer Arms & Brass-Tipped Bamboo Lathi Baton
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 1.38, 0);
  const lUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.092, 0.25, 8, 12), uniformMat);
  lUpper.position.y = -0.12;
  leftArm.add(lUpper);
  const lForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.076, 0.22, 8, 12), skinMat);
  lForearm.position.y = -0.34;
  leftArm.add(lForearm);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 1.38, 0);
  const rUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.092, 0.25, 8, 12), uniformMat);
  rUpper.position.y = -0.12;
  rightArm.add(rUpper);
  const rForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.076, 0.22, 8, 12), skinMat);
  rForearm.position.y = -0.34;
  rightArm.add(rForearm);

  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 10), skinMat);
  rHand.position.y = -0.49;
  rightArm.add(rHand);

  // Segmented Bamboo Lathi with Brass Ferrule Tip
  const lathi = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.04, 1.18, 12),
    woodLathiMat
  );
  lathi.position.set(0, -0.58, 0.38);
  lathi.rotation.x = Math.PI / 3;
  rightArm.add(lathi);

  const lathiTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, 0.12, 12),
    brassMat
  );
  lathiTip.position.set(0, -0.28, 0.88);
  lathiTip.rotation.x = Math.PI / 3;
  rightArm.add(lathiTip);

  root.add(rightArm);

  const alertBadge = new THREE.Mesh(
    new THREE.CircleGeometry(0.24, 20),
    new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide })
  );
  alertBadge.position.set(0, 2.55, 0);
  root.add(alertBadge);

  return { root, rightArm, alertBadge };
}

// Composite 10-part Water Cannon Truck ("WATER CANNON / POLICE")
export function buildWaterCannonTruckMesh(maxAnisotropy: number): {
  root: THREE.Group;
  waterJetMesh: THREE.Mesh;
} {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.35,
  });
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.6,
    transparent: true,
    opacity: 0.8,
  });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.9, 8.2), bodyMat);
  hull.position.set(0, 1.9, 0);
  hull.castShadow = true;
  hull.receiveShadow = true;
  root.add(hull);

  const signTex = createShopSignTexture('WATER CANNON', '#f8fafc', '#1e3a8a', maxAnisotropy);
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(3.46, 0.75, 5.6),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
  );
  stripe.position.set(0, 1.75, 0);
  root.add(stripe);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.95, 0.1), glassMat);
  windshield.position.set(0, 2.35, 4.12);
  root.add(windshield);

  const turretBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 0.45, 16),
    whiteMat
  );
  turretBase.position.set(0, 3.55, 2.6);
  root.add(turretBase);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 1.2, 12),
    whiteMat
  );
  nozzle.rotation.x = Math.PI / 3;
  nozzle.rotation.z = 0.45;
  nozzle.position.set(-0.35, 3.85, 3.0);
  root.add(nozzle);

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.4, 3.9, 3.2),
    new THREE.Vector3(-3.2, 4.6, 5.5),
    new THREE.Vector3(-5.8, 0.2, 8.0)
  );
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.22, 10, false);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.82,
    roughness: 0.15,
  });
  const waterJetMesh = new THREE.Mesh(tubeGeo, waterMat);
  root.add(waterJetMesh);

  const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
  const zPositions = [-2.8, 0, 2.8];
  for (const zPos of zPositions) {
    const lTire = new THREE.Mesh(tireGeo, tireMat);
    lTire.position.set(-1.72, 0.55, zPos);
    root.add(lTire);

    const rTire = new THREE.Mesh(tireGeo, tireMat);
    rTire.position.set(1.72, 0.55, zPos);
    root.add(rTire);
  }

  return { root, waterJetMesh };
}

// Parked Red Delhi Transport / Police Bus & White Police Gypsy Van (Exact match to Screenshot 2)
export function buildPoliceBusMesh(
  variant: 'green_onduty' | 'red_police',
  maxAnisotropy: number
): THREE.Group {
  const group = new THREE.Group();

  const bodyHex = variant === 'green_onduty' ? 0xf8fafc : 0xc83e37;
  const trimHex = variant === 'green_onduty' ? 0x1d4ed8 : 0xfacc15;
  const label = variant === 'green_onduty' ? 'POLICE' : 'DELHI POLICE';

  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyHex, roughness: 0.48, metalness: 0.2 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimHex, roughness: 0.45 });
  const windowMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    roughness: 0.18,
    metalness: 0.15,
    transparent: true,
    opacity: 0.78,
  });

  // Main coach hull
  const coach = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.85, 8.8), bodyMat);
  coach.position.y = 1.85;
  coach.castShadow = true;
  coach.receiveShadow = true;
  group.add(coach);

  // Individual framed bus windows along both sides (matching red bus in Screenshot 2)
  for (let wz = -3.2; wz <= 3.2; wz += 1.25) {
    const winBox = new THREE.Mesh(new THREE.BoxGeometry(3.26, 0.88, 0.92), windowMat);
    winBox.position.set(0, 2.28, wz);
    group.add(winBox);
  }

  // Front & Rear windshields
  const frontWin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 8.86), windowMat);
  frontWin.position.set(0, 2.25, 0);
  group.add(frontWin);

  // Side Signboard
  const signTex = createShopSignTexture(label, '#f8fafc', '#1e3a8a', maxAnisotropy);
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.28, 0.55, 3.6),
    new THREE.MeshStandardMaterial({ map: signTex })
  );
  signMesh.position.set(0, 1.32, 0);
  group.add(signMesh);

  // Red & Blue Roof Siren Lightbar (visible in Screenshot 2)
  const sirenRed = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.24, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  sirenRed.position.set(-0.4, 3.4, 3.2);
  group.add(sirenRed);

  const sirenBlue = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.24, 0.35),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
  );
  sirenBlue.position.set(0.4, 3.4, 3.2);
  group.add(sirenBlue);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 7.8), trimMat);
  roof.position.set(0, 3.32, 0);
  group.add(roof);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.42, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
  for (const zPos of [-2.8, 2.8]) {
    const wl = new THREE.Mesh(wheelGeo, tireMat);
    wl.position.set(-1.62, 0.52, zPos);
    group.add(wl);
    const wr = new THREE.Mesh(wheelGeo, tireMat);
    wr.position.set(1.62, 0.52, zPos);
    group.add(wr);
  }

  return group;
}

// Ultra-Detailed 12-part Green & Yellow Delhi Auto-Rickshaw (Exact match to Screenshot 2 right lane!)
export function buildAutoRickshawMesh(): THREE.Group {
  const group = new THREE.Group();

  const greenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.42, metalness: 0.15 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.38, metalness: 0.1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    roughness: 0.12,
    transmission: 0.7,
    transparent: true,
    opacity: 0.78,
  });

  // Lower Green Chassis + Yellow Stripe
  const lower = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.92, 2.65), greenMat);
  lower.position.set(0, 0.66, 0);
  lower.castShadow = true;
  group.add(lower);

  const yellowBand = new THREE.Mesh(new THREE.BoxGeometry(1.89, 0.22, 2.68), yellowMat);
  yellowBand.position.set(0, 0.95, 0);
  group.add(yellowBand);

  // Rounded Yellow Canopy Top
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.78, 2.52), yellowMat);
  canopy.position.set(0, 1.56, -0.05);
  canopy.castShadow = true;
  group.add(canopy);

  // Front Windshield & Headlight
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.65, 0.08), glassMat);
  windshield.position.set(0, 1.38, 1.24);
  group.add(windshield);

  const headlight = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  headlight.position.set(0, 0.78, 1.35);
  group.add(headlight);

  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const frontW = new THREE.Mesh(wheelGeo, darkMat);
  frontW.position.set(0, 0.3, 1.15);
  group.add(frontW);

  const backL = new THREE.Mesh(wheelGeo, darkMat);
  backL.position.set(-0.92, 0.3, -0.95);
  group.add(backL);

  const backR = new THREE.Mesh(wheelGeo, darkMat);
  backR.position.set(0.92, 0.3, -0.95);
  group.add(backR);

  return group;
}

// Composite Water Fountain Roundabout
export function buildFountainRoundaboutMesh(): {
  root: THREE.Group;
  sprayGroup: THREE.Group;
} {
  const root = new THREE.Group();

  const curb = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.3, 0.32, 36),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 })
  );
  curb.position.y = 0.16;
  curb.receiveShadow = true;
  root.add(curb);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(4.75, 4.8, 0.38, 36),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 })
  );
  grass.position.y = 0.19;
  grass.receiveShadow = true;
  root.add(grass);

  const poolRim = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.7, 0.65, 28),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })
  );
  poolRim.position.y = 0.35;
  poolRim.castShadow = true;
  root.add(poolRim);

  const waterSurface = new THREE.Mesh(
    new THREE.CylinderGeometry(2.35, 2.35, 0.68, 28),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      roughness: 0.15,
    })
  );
  waterSurface.position.y = 0.36;
  root.add(waterSurface);

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.58, 1.9, 20),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 })
  );
  column.position.y = 1.25;
  column.castShadow = true;
  root.add(column);

  const upperDish = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 0.6, 0.38, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
  );
  upperDish.position.y = 2.15;
  upperDish.castShadow = true;
  root.add(upperDish);

  const sprayGroup = new THREE.Group();
  const dropGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const dropMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set(Math.cos(angle) * 0.9, 2.6 + (i % 3) * 0.35, Math.sin(angle) * 0.9);
    sprayGroup.add(drop);
  }
  root.add(sprayGroup);

  return { root, sprayGroup };
}

// Overhead Street Banner Archway ("हम देखेंगे", "RE-EXAM NOW!", "NO PAPER LEAKS", "द जंतर मंतर रन")
export function buildOverheadBannerMesh(
  text: string,
  bgHex: string,
  textHex: string,
  maxAnisotropy: number
): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.35,
  });

  const leftPole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 7.6, 12), poleMat);
  leftPole.position.set(-9.1, 3.8, 0);
  group.add(leftPole);

  const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 7.6, 12), poleMat);
  rightPole.position.set(9.1, 3.8, 0);
  group.add(rightPole);

  const tex = createBannerTexture(text, bgHex, textHex, maxAnisotropy);
  const cloth = new THREE.Mesh(
    new THREE.BoxGeometry(18.2, 1.9, 0.14),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })
  );
  cloth.position.set(0, 6.3, 0);
  cloth.castShadow = true;
  group.add(cloth);

  return group;
}

// Iconic Red Sandstone Jantar Mantar Finish Archway Gate
export function buildJantarMantarArchway(maxAnisotropy: number): THREE.Group {
  const group = new THREE.Group();

  const sandstoneMat = new THREE.MeshStandardMaterial({
    color: 0xb4533c,
    roughness: 0.75,
  });
  const creamStoneMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.7,
  });

  for (const side of [-1, 1]) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.2, 2.1), creamStoneMat);
    base.position.set(side * 8.6, 0.6, 0);
    group.add(base);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.8, 1.6), sandstoneMat);
    pillar.position.set(side * 8.6, 4.0, 0);
    pillar.castShadow = true;
    group.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 2.2), creamStoneMat);
    cap.position.set(side * 8.6, 7.5, 0);
    group.add(cap);
  }

  const beam = new THREE.Mesh(new THREE.BoxGeometry(20.2, 1.35, 1.7), sandstoneMat);
  beam.position.set(0, 8.35, 0);
  beam.castShadow = true;
  group.add(beam);

  const topCornice = new THREE.Mesh(new THREE.BoxGeometry(21.0, 0.4, 2.1), creamStoneMat);
  topCornice.position.set(0, 9.15, 0);
  group.add(topCornice);

  const signTex = createShopSignTexture('जंतर मंतर', '#7c2d12', '#fef08a', maxAnisotropy);
  const signBox = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 1.65, 1.9),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.55 })
  );
  signBox.position.set(0, 8.65, 0);
  group.add(signBox);

  return group;
}

// Red Sandstone Boundary Wall Segment
export function buildSandstoneWallSegment(): THREE.Group {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xb85d43, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.75 });
  const grilleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.4,
  });

  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.1, 18), wallMat);
  wall.position.y = 1.05;
  wall.receiveShadow = true;
  group.add(wall);

  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 18), grilleMat);
  rail.position.y = 2.45;
  group.add(rail);

  for (const zOff of [-8.8, 0, 8.8]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 3.1, 0.85), wallMat);
    pillar.position.set(0, 1.55, zOff);
    group.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.28, 1.05), trimMat);
    cap.position.set(0, 3.2, zOff);
    group.add(cap);
  }

  return group;
}

// Classic Delhi Double-Arm Streetlamp with Square Plinth Base (Exact match to both screenshots!)
export function buildStreetlampMesh(): THREE.Group {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7,
    metalness: 0.3,
  });
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.75,
    roughness: 0.3,
  });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });

  // Square dark plinth base on the sidewalk (visible at bottom-left and bottom-right of screenshots!)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.78, 0.68), baseMat);
  plinth.position.y = 0.39;
  plinth.castShadow = true;
  group.add(plinth);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.12, 6.6, 12), poleMat);
  pole.position.y = 3.5;
  pole.castShadow = true;
  group.add(pole);

  // Curved Double Top Bracket Arms
  const crossArm = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.09, 0.09), poleMat);
  crossArm.position.set(0, 6.75, 0);
  group.add(crossArm);

  for (const xOff of [-1.08, 1.08]) {
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.14, 14), poleMat);
    hood.position.set(xOff, 6.72, 0);
    group.add(hood);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), bulbMat);
    bulb.position.set(xOff, 6.6, 0);
    group.add(bulb);
  }

  return group;
}

// Lush Botanical Neem/Peepal Avenue Tree with Buttress Roots, Forked Limbs, Leaf-Vein Bump Maps & PWD Painted Trunk Band
export function buildLushDelhiTreeMesh(
  barkTex: THREE.CanvasTexture,
  foliageLightTex: THREE.CanvasTexture,
  foliageDarkTex: THREE.CanvasTexture,
  side: -1 | 1
): THREE.Group {
  const treeGroup = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    map: barkTex,
    bumpMap: barkTex,
    bumpScale: 0.045,
    roughness: 0.88,
  });
  const fLightMat = new THREE.MeshPhysicalMaterial({
    map: foliageLightTex,
    bumpMap: foliageLightTex,
    bumpScale: 0.03,
    roughness: 0.68,
    sheen: 0.35,
    sheenColor: new THREE.Color(0xa3e635),
    sheenRoughness: 0.6,
  });
  const fDarkMat = new THREE.MeshPhysicalMaterial({
    map: foliageDarkTex,
    bumpMap: foliageDarkTex,
    bumpScale: 0.03,
    roughness: 0.74,
    sheen: 0.28,
    sheenColor: new THREE.Color(0x4d7c0f),
    sheenRoughness: 0.65,
  });

  // 1. Octagonal Sidewalk Tree-Pit Curb & Dark Organic Soil Mulch
  const pitCurb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.02, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 })
  );
  pitCurb.position.y = 0.08;
  pitCurb.receiveShadow = true;
  treeGroup.add(pitCurb);

  const soilMulch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 0.84, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0x291d12, roughness: 0.95 })
  );
  soilMulch.position.y = 0.09;
  treeGroup.add(soilMulch);

  // 2. Flared Buttress Roots at Trunk Base
  for (let r = 0; r < 4; r++) {
    const rAngle = (r / 4) * Math.PI * 2 + 0.35;
    const rootFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.28, 0.95, 8),
      trunkMat
    );
    rootFlange.position.set(Math.cos(rAngle) * 0.32, 0.42, Math.sin(rAngle) * 0.32);
    rootFlange.rotation.z = -Math.cos(rAngle) * 0.38;
    rootFlange.rotation.x = Math.sin(rAngle) * 0.38;
    rootFlange.castShadow = true;
    treeGroup.add(rootFlange);
  }

  // 3. Gnarled Main Trunk with PWD White-and-Red Band
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.54, 4.4, 18), trunkMat);
  trunk.position.y = 2.2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // 4. Forked Upper Wooden Limbs / Boughs Reaching into Canopy
  const branches = [
    { rx: 0.42, rz: -0.48 * side, x: 0.45 * side, y: 3.9, z: 0.35 },
    { rx: -0.38, rz: 0.52 * side, x: -0.48 * side, y: 3.8, z: -0.32 },
    { rx: 0.48, rz: 0.25 * side, x: -0.22 * side, y: 4.1, z: 0.42 },
    { rx: -0.44, rz: -0.32 * side, x: 0.3 * side, y: 4.0, z: -0.38 },
  ];
  for (const b of branches) {
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.75, 10), trunkMat);
    limb.position.set(b.x, b.y, b.z);
    limb.rotation.set(b.rx, 0, b.rz);
    limb.castShadow = true;
    treeGroup.add(limb);
  }

  // 5. Multi-Layered Botanical Leaf Canopy Clusters (11 Organic Sculpted Lobes)
  const puffs = [
    { x: 0, y: 5.05, z: 0, r: 2.18, sy: 0.86, dark: false },
    { x: -1.15 * side, y: 4.48, z: 0.72, r: 1.58, sy: 0.84, dark: true },
    { x: 1.05 * side, y: 4.58, z: -0.62, r: 1.62, sy: 0.85, dark: false },
    { x: 0.68 * side, y: 5.75, z: 0.55, r: 1.56, sy: 0.88, dark: false },
    { x: -0.78 * side, y: 5.55, z: -0.65, r: 1.52, sy: 0.86, dark: true },
    { x: 0, y: 6.28, z: 0.1, r: 1.48, sy: 0.84, dark: false },
    { x: 1.28 * side, y: 4.18, z: 0.86, r: 1.32, sy: 0.82, dark: true },
    { x: -1.24 * side, y: 4.28, z: -0.82, r: 1.36, sy: 0.82, dark: false },
    { x: 0.35 * side, y: 4.85, z: 1.25, r: 1.28, sy: 0.84, dark: false },
    { x: -0.35 * side, y: 4.82, z: -1.22, r: 1.26, sy: 0.84, dark: true },
  ];

  for (const p of puffs) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(p.r, 18, 16),
      p.dark ? fDarkMat : fLightMat
    );
    sphere.scale.set(1.04, p.sy, 1.04);
    sphere.position.set(p.x, p.y, p.z);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    treeGroup.add(sphere);
  }

  // 6. Roadside Flowering Shrubs at Base of Tree Pit
  const shrubMat = fDarkMat;
  const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });
  for (const zOff of [-0.65, 0.65]) {
    const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), shrubMat);
    shrub.scale.set(1.1, 0.78, 1.1);
    shrub.position.set(-side * 0.45, 0.32, zOff);
    treeGroup.add(shrub);

    const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 0), flowerMat);
    blossom.position.set(-side * 0.55, 0.52, zOff);
    treeGroup.add(blossom);
  }

  return treeGroup;
}

// Multi-Story Urban Delhi Storefront with Angled Fascia Sign, Colorful Poster Wall, Rolling Shutters & Upper Apartments
export function buildDetailedStorefrontGroup(
  side: -1 | 1,
  signTex: THREE.CanvasTexture,
  shutterTex: THREE.CanvasTexture,
  posterWallTex: THREE.CanvasTexture,
  wallColorHex: number,
  awningColorHex: number,
  subSignTex?: THREE.CanvasTexture
): THREE.Group {
  const group = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ color: wallColorHex, roughness: 0.82 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x3b2f2f, roughness: 0.68 });
  const shutterMat = new THREE.MeshStandardMaterial({
    map: shutterTex,
    roughness: 0.52,
    metalness: 0.45,
  });
  const posterWallMat = new THREE.MeshStandardMaterial({
    map: posterWallTex,
    roughness: 0.65,
  });
  const awningMat = new THREE.MeshStandardMaterial({ color: awningColorHex, roughness: 0.55 });
  const windowGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.18,
    roughness: 0.2,
    metalness: 0.2,
  });

  // Main 3-story urban Delhi building block
  const building = new THREE.Mesh(new THREE.BoxGeometry(7.2, 12.2, 16.4), wallMat);
  building.position.y = 6.1;
  building.castShadow = true;
  building.receiveShadow = true;
  group.add(building);

  // Horizontal Floor Cornice Ledges
  for (const ledgeY of [4.6, 8.4, 12.25]) {
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.38, 16.8), trimMat);
    ledge.position.y = ledgeY;
    group.add(ledge);
  }

  const faceX = -side * 3.62;

  // Ground Floor Bay 1: Colorful Tilted Posters / Book-Cover Wall (Exact match to screenshots!)
  const posterBay = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 8.8), posterWallMat);
  posterBay.position.set(faceX, 1.9, 2.8);
  group.add(posterBay);

  // Ground Floor Bay 2: Corrugated Metal Rolling Shutter
  const shutterBay = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 5.6), shutterMat);
  shutterBay.position.set(faceX, 1.9, -4.8);
  group.add(shutterBay);

  // Protruding Slanted Shop Awning Hood (matching angled blue/red store awnings in screenshots)
  const awningHood = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.24, 15.6), awningMat);
  awningHood.position.set(faceX - side * 0.9, 3.85, 0);
  awningHood.rotation.z = side * 0.26;
  awningHood.castShadow = true;
  group.add(awningHood);

  // Large Angled Commercial Signboard Fascia ("LAW BOOKS", "छोले भटूरे", "PHOTOSTAT", "MOBILE REPAIR", "BOOK DEPOT")
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 1.65, 14.8),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.45 })
  );
  signBoard.position.set(faceX - side * 1.45, 4.45, 0);
  signBoard.rotation.z = side * 0.14;
  group.add(signBoard);

  // Optional Red Sub-Banner (e.g., "SANDESH - DAINIK" under MOBILE REPAIR in Screenshot 1)
  if (subSignTex) {
    const subSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.55, 4.8),
      new THREE.MeshStandardMaterial({ map: subSignTex, roughness: 0.5 })
    );
    subSign.position.set(faceX - side * 1.1, 3.1, 3.2);
    group.add(subSign);
  }

  // 2nd & 3rd Story Recessed Blue-Tinted Windows with Frames & Balcony Ledges
  for (const floorY of [6.5, 10.2]) {
    for (const zWin of [-5.2, 0, 5.2]) {
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.95, 2.7), trimMat);
      winFrame.position.set(faceX, floorY, zWin);
      group.add(winFrame);

      const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.68, 2.4), windowGlassMat);
      winGlass.position.set(faceX - side * 0.03, floorY, zWin);
      group.add(winGlass);

      const sill = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.18, 2.95), trimMat);
      sill.position.set(faceX - side * 0.2, floorY - 1.0, zWin);
      group.add(sill);
    }
  }

  return group;
}

// Roadside Red-and-White Striped Canopy Vendor Stall with Yellow "₹ 10" Sign & Living Chaiwala Vendor!
export function buildDharnaTentMesh(maxAnisotropy: number): THREE.Group {
  const group = new THREE.Group();

  const counterMat = new THREE.MeshStandardMaterial({ color: 0x854d27, roughness: 0.8 });
  const CounterDarkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.4 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.2 });
  const clayKulhadMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 });

  // Slatted Wooden Vendor Counter Stall
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.35, 3.8), counterMat);
  counter.position.y = 0.68;
  counter.castShadow = true;
  group.add(counter);

  for (let z = -1.6; z <= 1.6; z += 0.55) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(2.66, 1.25, 0.12), CounterDarkMat);
    slat.position.set(0, 0.68, z);
    group.add(slat);
  }

  // Authentic Chai Kettle (Patila), Stove & Stack of Clay Kulhad Cups on Counter
  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.38, 16), steelMat);
  kettle.position.set(0.35, 1.54, -0.6);
  group.add(kettle);

  for (let k = 0; k < 5; k++) {
    const kulhad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 10), clayKulhadMat);
    kulhad.position.set(0.45, 1.42, 0.35 + k * 0.22);
    group.add(kulhad);
  }

  // Living Sculpted Chaiwala Vendor Standing Behind the Counter
  const chaiwala = buildProtesterMesh('nsui', false);
  chaiwala.root.position.set(-0.65, 0, 0.15);
  chaiwala.root.rotation.y = Math.PI / 2;
  group.add(chaiwala.root);

  // Yellow "₹ 10" Price Signboard on Stall Front (Exact match to Screenshot 2!)
  const priceTex = createShopSignTexture('₹ 10', '#facc15', '#0f172a', maxAnisotropy);
  const priceBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.62, 1.9),
    new THREE.MeshStandardMaterial({ map: priceTex, roughness: 0.45 })
  );
  priceBoard.position.set(1.32, 1.55, 0);
  group.add(priceBoard);

  // 4 Support Poles
  for (const xOff of [-1.15, 1.15]) {
    for (const zOff of [-1.7, 1.7]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.1, 8), poleMat);
      pole.position.set(xOff, 1.55, zOff);
      group.add(pole);
    }
  }

  // Red & White Striped Pitched Canopy Roof
  const stripeCount = 8;
  const stripeLen = 4.2 / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    const isRed = i % 2 === 0;
    const sMat = getFabricPhysicalMaterial(isRed ? '#dc2626' : '#f8fafc', 'solid');
    const seg = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.95, 4), sMat);
    seg.rotation.y = Math.PI / 4;
    seg.scale.set(0.85, 1, 0.22);
    seg.position.set(0, 3.35, -1.8 + i * stripeLen);
    group.add(seg);
  }

  return group;
}

// Left Sidewalk Media Crew ("CAMERA PERSON PARTH" + "BATTERY 10%!" + "RE-EXAM!" Bystanders — Exact match to both screenshots!)
export function buildMediaCrewMesh(maxAnisotropy = 4): THREE.Group {
  const group = new THREE.Group();

  // 1. CAMERA PERSON PARTH (Mustard-yellow woven shirt, dark pants, holding broadcast ENG camera with lens hood & red REC tally light)
  const cameraman = buildProtesterMesh('abhijit', false);
  cameraman.root.position.set(0, 0, 0);

  const parthShirtMat = getFabricPhysicalMaterial('#d4a338', 'solid');
  cameraman.bodyGroup.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CapsuleGeometry) {
      if (child.position.y > 0.9) {
        child.material = parthShirtMat;
      }
    }
  });

  // Detailed Broadcast ENG Shoulder Camera Rig (Chassis, Lens Barrel, Matte Box, Top Handle, Shotgun Mic & Red REC LED)
  const camBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.65,
    roughness: 0.25,
    clearcoat: 0.5,
  });
  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.64), camBodyMat);
  camBody.position.set(-0.28, 1.88, 0.3);
  cameraman.bodyGroup.add(camBody);

  const lensBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.28, 16),
    camBodyMat
  );
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.set(-0.28, 1.88, 0.72);
  cameraman.bodyGroup.add(lensBarrel);

  const lensGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.05,
      clearcoat: 1.0,
    })
  );
  lensGlass.position.set(-0.28, 1.88, 0.87);
  cameraman.bodyGroup.add(lensGlass);

  const recDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  recDot.position.set(-0.36, 2.02, 0.62);
  cameraman.bodyGroup.add(recDot);

  // Floating "CAMERA PERSON PARTH" Nametag above head
  const parthTex = createFloatingBadgeTexture('CAMERA PERSON PARTH', 'nametag', maxAnisotropy);
  const parthSign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.62),
    new THREE.MeshBasicMaterial({ map: parthTex, transparent: true, side: THREE.DoubleSide })
  );
  parthSign.position.set(0, 2.75, 0);
  cameraman.root.add(parthSign);
  group.add(cameraman.root);

  // 2. Protester in Teal Woven Jacket holding "RE-EXAM!" Sign + "BATTERY 10%!" Comic Bubble (Exact match to Screenshot 2!)
  const tealProtester = buildProtesterMesh('nsui', false);
  tealProtester.root.position.set(-1.35, 0, -2.6);
  const tealJacketMat = getFabricPhysicalMaterial('#0d9488', 'solid');
  tealProtester.bodyGroup.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CapsuleGeometry) {
      if (child.position.y > 0.9) {
        child.material = tealJacketMat;
      }
    }
  });

  const reExamTex = createFloatingBadgeTexture('RE-EXAM!', 'placard', maxAnisotropy);
  const reExamBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.55, 0.06),
    new THREE.MeshBasicMaterial({ map: reExamTex })
  );
  reExamBoard.position.set(0, 2.65, 0);
  tealProtester.root.add(reExamBoard);

  const batteryTex = createFloatingBadgeTexture('BATTERY 10%!', 'speech', maxAnisotropy);
  const batteryBubble = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 0.85),
    new THREE.MeshBasicMaterial({ map: batteryTex, transparent: true, side: THREE.DoubleSide })
  );
  batteryBubble.position.set(0.2, 3.45, 0);
  tealProtester.root.add(batteryBubble);
  group.add(tealProtester.root);

  // 3. Second Bystander in Hoodie right next to Parth (matching Screenshot 2)
  const hoodieBystander = buildProtesterMesh('genz', false);
  hoodieBystander.root.position.set(0.45, 0, -3.4);
  group.add(hoodieBystander.root);

  return group;
}

// Ultra-Realistic Sikh Langar Seva Squad (+20% जान Booster Station with Sculpted Turbaned Sevadars & Langar Table)
export function buildSikhLangarSevaGroup(maxAnisotropy: number): THREE.Group {
  const sikhGroup = new THREE.Group();

  const ringGeo = new THREE.RingGeometry(1.45, 1.72, 36);
  ringGeo.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
  );
  ring.position.y = 0.04;
  sikhGroup.add(ring);

  const hairMat = getHairPhysicalMaterial('#171717');
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.9,
    roughness: 0.18,
  });

  for (const [idx, s] of [-0.62, 0.62].entries()) {
    const sevadar = buildProtesterMesh('nsui', false);
    sevadar.root.position.set(s, 0, 0);

    // Sculpted Pleated Dastar Turban (Saffron Orange & Kesari Yellow Woven Cloth)
    const turbanMat = getFabricPhysicalMaterial(idx === 0 ? '#f97316' : '#eab308', 'solid');
    const turbanBase = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), turbanMat);
    turbanBase.scale.set(1.06, 0.92, 1.08);
    turbanBase.position.set(0, 1.98, 0);
    sevadar.bodyGroup.add(turbanBase);

    // Tiered Diagonal Turban Pleats
    for (const side of [-1, 1]) {
      const pleat = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.065, 10, 20), turbanMat);
      pleat.rotation.x = Math.PI / 2.3;
      pleat.rotation.y = side * 0.28;
      pleat.position.set(0, 2.02, 0.02);
      sevadar.bodyGroup.add(pleat);
    }

    // Gold Khanda Turban Pin Crest
    const khandaPin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), goldMat);
    khandaPin.rotation.x = Math.PI / 2;
    khandaPin.position.set(0, 2.06, -0.32);
    sevadar.bodyGroup.add(khandaPin);

    // Full Sculpted Flowing Beard & Mustache
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 14), hairMat);
    beard.scale.set(0.96, 0.85, 0.96);
    beard.position.set(0, 1.71, 0);
    sevadar.bodyGroup.add(beard);

    sikhGroup.add(sevadar.root);
  }

  // Saffron-Draped Langar Seva Table & Polished Steel Deg Cauldron in Front
  const tableClothMat = getFabricPhysicalMaterial('#ea580c', 'solid');
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.82, 0.72), tableClothMat);
  table.position.set(0, 0.41, 0.75);
  table.castShadow = true;
  sikhGroup.add(table);

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.92,
    roughness: 0.14,
  });
  const degPot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.42, 18), steelMat);
  degPot.position.set(-0.25, 1.02, 0.75);
  sikhGroup.add(degPot);

  const sevaSignTex = createShopSignTexture('लंगर सेवा • +20% जान', '#15803d', '#fef08a', maxAnisotropy);
  const sevaBanner = new THREE.Mesh(
    new THREE.BoxGeometry(1.46, 0.42, 0.06),
    new THREE.MeshStandardMaterial({ map: sevaSignTex, roughness: 0.45 })
  );
  sevaBanner.position.set(0, 0.52, 1.12);
  sikhGroup.add(sevaBanner);

  return sikhGroup;
}

// Ultra-Realistic Living Indian Zebu Street Cow (गौ माता) with Brahma Hump, Dewlap, Curved Horns & Animated Head/Tail
export function buildSacredStreetCowMesh(): {
  root: THREE.Group;
  headPivot: THREE.Group;
  tailPivot: THREE.Group;
} {
  const root = new THREE.Group();

  // Warm Fawn-Cream Bovine Hide Physical Material with Subtle Coat Sheen
  const hideMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5ebe0,
    bumpMap: getSkinBumpTexture(),
    bumpScale: 0.01,
    roughness: 0.62,
    sheen: 0.45,
    sheenColor: new THREE.Color(0xfef3c7),
    sheenRoughness: 0.6,
  });
  const darkHideMat = new THREE.MeshPhysicalMaterial({
    color: 0xd6c7b2,
    roughness: 0.65,
    sheen: 0.35,
  });
  const muzzleMat = new THREE.MeshPhysicalMaterial({
    color: 0x475569,
    roughness: 0.35,
    clearcoat: 0.6,
  });
  const hornMat = new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.4,
    metalness: 0.15,
  });
  const hoofMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5 });

  // Ground Contact Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  // 1. Sculpted Barrel Torso, Ribcage & Hindquarters
  const barrel = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 0.98, 14, 22), hideMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.scale.set(0.92, 1.0, 1.08);
  barrel.position.set(0, 1.06, 0);
  barrel.castShadow = true;
  barrel.receiveShadow = true;
  root.add(barrel);

  // Signature Indian Zebu Brahma Shoulder Hump
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), darkHideMat);
  hump.scale.set(0.78, 1.15, 1.1);
  hump.position.set(0, 1.54, 0.44);
  hump.castShadow = true;
  root.add(hump);

  // 2. Four Articulated Legs with Knee Joints & Cloven Hooves
  const legPositions = [
    { x: -0.26, z: 0.52 },
    { x: 0.26, z: 0.52 },
    { x: -0.27, z: -0.52 },
    { x: 0.27, z: -0.52 },
  ];
  for (const lp of legPositions) {
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.52, 12), hideMat);
    upperLeg.position.set(lp.x, 0.66, lp.z);
    upperLeg.castShadow = true;
    root.add(upperLeg);

    const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.44, 12), darkHideMat);
    lowerLeg.position.set(lp.x, 0.26, lp.z);
    lowerLeg.castShadow = true;
    root.add(lowerLeg);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.1, 10), hoofMat);
    hoof.position.set(lp.x, 0.05, lp.z + 0.02);
    root.add(hoof);
  }

  // 3. Articulated Neck, Dewlap Folds & Bovine Head Group
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.26, 0.68);

  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.36, 10, 14), hideMat);
  neck.rotation.x = Math.PI / 3;
  neck.position.set(0, 0.06, 0.18);
  headPivot.add(neck);

  // Loose Zebu Dewlap Skin Fold under Neck
  const dewlap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.42), darkHideMat);
  dewlap.rotation.x = 0.35;
  dewlap.position.set(0, -0.14, 0.22);
  headPivot.add(dewlap);

  // Bovine Skull & Snout
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), hideMat);
  skull.scale.set(0.88, 0.95, 1.15);
  skull.position.set(0, 0.18, 0.42);
  skull.castShadow = true;
  headPivot.add(skull);

  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 0.38, 14), hideMat);
  snout.rotation.x = Math.PI / 2.3;
  snout.position.set(0, 0.08, 0.65);
  headPivot.add(snout);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), muzzleMat);
  muzzle.scale.set(1.05, 0.78, 0.75);
  muzzle.position.set(0, 0.02, 0.82);
  headPivot.add(muzzle);

  // Expressive Bovine Eyes, Drooping Zebu Ears & Curved Horns
  const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x1c1917, roughness: 0.1, clearcoat: 1.0 });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), eyeMat);
    eye.position.set(side * 0.19, 0.22, 0.48);
    headPivot.add(eye);

    // Long Drooping Zebu Ear
    const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 8, 10), darkHideMat);
    ear.position.set(side * 0.28, 0.16, 0.36);
    ear.rotation.z = side * 1.15;
    headPivot.add(ear);

    // Curved Horn
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.32, 10), hornMat);
    horn.position.set(side * 0.16, 0.42, 0.34);
    horn.rotation.z = -side * 0.32;
    horn.rotation.x = -0.25;
    headPivot.add(horn);
  }

  // Decorative Marigold / Sacred Red Thread Necklace around Neck
  const garland = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.035, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 })
  );
  garland.rotation.y = Math.PI / 2;
  garland.rotation.x = 0.4;
  garland.position.set(0, 0.05, 0.15);
  headPivot.add(garland);

  root.add(headPivot);

  // 4. Articulated Tail with Dark Brush Tuft
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 1.28, -0.74);

  const tailCord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.68, 8), hideMat);
  tailCord.position.set(0, -0.34, -0.06);
  tailCord.rotation.x = -0.15;
  tailPivot.add(tailCord);

  const tailTuft = new THREE.Mesh(
    new THREE.ConeGeometry(0.065, 0.22, 8),
    getHairPhysicalMaterial('#271c19')
  );
  tailTuft.position.set(0, -0.72, -0.1);
  tailPivot.add(tailTuft);

  root.add(tailPivot);

  return { root, headPivot, tailPivot };
}

// Ultra-Realistic Animated Delhi Pigeon Flock (कबूतर — Perched & Soaring Birds with Flapping Wings)
export function buildAnimatedPigeonFlockMesh(birdCount = 7): {
  root: THREE.Group;
  birds: Array<{
    birdGroup: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;
    phaseOffset: number;
    orbitRadius: number;
    orbitSpeed: number;
    baseY: number;
  }>;
} {
  const root = new THREE.Group();
  const birds: Array<{
    birdGroup: THREE.Group;
    leftWing: THREE.Mesh;
    rightWing: THREE.Mesh;
    phaseOffset: number;
    orbitRadius: number;
    orbitSpeed: number;
    baseY: number;
  }> = [];

  const plumageMat = new THREE.MeshPhysicalMaterial({
    color: 0x64748b,
    roughness: 0.45,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xcbd5e1),
  });
  const neckIridescentMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    metalness: 0.45,
    roughness: 0.25,
    clearcoat: 0.8,
  });
  const wingTipMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

  for (let i = 0; i < birdCount; i++) {
    const birdGroup = new THREE.Group();

    // Sculpted Pigeon Body
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.18, 8, 12), plumageMat);
    body.rotation.x = Math.PI / 2.2;
    body.castShadow = true;
    birdGroup.add(body);

    // Iridescent Emerald-Purple Neck Ring & Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.072, 0.08, 10), neckIridescentMat);
    neck.position.set(0, 0.08, 0.11);
    birdGroup.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), plumageMat);
    head.position.set(0, 0.13, 0.13);
    birdGroup.add(head);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.065, 8), beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.12, 0.2);
    birdGroup.add(beak);

    // Fan Tail Feathers
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.018, 0.18), wingTipMat);
    tail.position.set(0, -0.02, -0.18);
    tail.rotation.x = -0.15;
    birdGroup.add(tail);

    // Articulated Left & Right Flapping Wings
    const wingGeo = new THREE.BoxGeometry(0.38, 0.016, 0.18);
    wingGeo.translate(0.18, 0, 0);
    const leftWing = new THREE.Mesh(wingGeo, wingTipMat);
    leftWing.position.set(0.04, 0.04, 0.02);
    birdGroup.add(leftWing);

    const rightWingGeo = new THREE.BoxGeometry(0.38, 0.016, 0.18);
    rightWingGeo.translate(-0.18, 0, 0);
    const rightWing = new THREE.Mesh(rightWingGeo, wingTipMat);
    rightWing.position.set(-0.04, 0.04, 0.02);
    birdGroup.add(rightWing);

    const phaseOffset = (i / birdCount) * Math.PI * 2;
    const orbitRadius = 4.5 + (i % 3) * 2.2;
    const orbitSpeed = 0.75 + (i % 4) * 0.15;
    const baseY = 7.2 + (i % 3) * 1.4;

    root.add(birdGroup);
    birds.push({
      birdGroup,
      leftWing,
      rightWing,
      phaseOffset,
      orbitRadius,
      orbitSpeed,
      baseY,
    });
  }

  return { root, birds };
}

// Authentic Jantar Mantar Crimson-Terracotta Lime Plaster & Rubble Masonry PBR Textures
export function createJantarMantarMasonryTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Rich crimson-terracotta lime plaster base
  ctx.fillStyle = '#b54635';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle horizontal masonry block courses & lime wash patina
  const courseH = 32;
  for (let y = 0; y < 512; y += courseH) {
    const shade = ((y / courseH) % 3) * 6 - 6;
    ctx.fillStyle = `rgb(${181 + shade}, ${70 + Math.round(shade * 0.6)}, ${53 + Math.round(shade * 0.5)})`;
    ctx.fillRect(0, y, 512, courseH - 2);

    ctx.fillStyle = 'rgba(72, 22, 14, 0.42)';
    ctx.fillRect(0, y + courseH - 2, 512, 2);

    const xOffset = ((y / courseH) % 2) * 32;
    for (let x = xOffset; x < 512; x += 64) {
      ctx.fillRect(x, y, 2, courseH);
    }
  }

  // Fine mineral plaster grain
  for (let i = 0; i < 4500; i++) {
    const px = (i * 79) % 512;
    const py = (i * 151) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,225,200,0.08)' : 'rgba(45,12,8,0.12)';
    ctx.fillRect(px, py, 2, 2);
  }

  const map = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 3);

  const bumpMap = configureDataTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);

  return { map, bumpMap };
}

// White Makrana Marble Astronomical Degree Graduation Scale Texture
export function createAstronomicalMarbleScaleTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Warm Makrana ivory-white marble base
  const grad = ctx.createLinearGradient(0, 0, 512, 128);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.5, '#fef9c3');
  grad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  // Engraved celestial degree ticks along the rim
  ctx.strokeStyle = '#1e293b';
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';

  for (let x = 8; x < 512; x += 8) {
    const isMajor = x % 64 === 8;
    const isMid = x % 32 === 8;
    ctx.lineWidth = isMajor ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, isMajor ? 46 : isMid ? 30 : 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, 128);
    ctx.lineTo(x, isMajor ? 82 : isMid ? 98 : 110);
    ctx.stroke();

    if (isMajor) {
      const deg = Math.round((x / 512) * 90);
      ctx.fillText(`${deg}°`, x, 66);
    }
  }

  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 124);

  const tex = configureColorTexture(new THREE.CanvasTexture(canvas), maxAnisotropy);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Ultra-Realistic Monumental 3D Jantar Mantar Astronomical Observatory Complex (After Finish Line)
export function buildJantarMantarObservatoryComplex(maxAnisotropy: number): THREE.Group {
  const complex = new THREE.Group();

  const masonryTex = createJantarMantarMasonryTextures(maxAnisotropy);
  const marbleScaleTex = createAstronomicalMarbleScaleTexture(maxAnisotropy);

  const terracottaMat = new THREE.MeshStandardMaterial({
    map: masonryTex.map,
    bumpMap: masonryTex.bumpMap,
    bumpScale: 0.045,
    roughness: 0.76,
    metalness: 0.06,
  });

  const darkTerracottaMat = new THREE.MeshStandardMaterial({
    color: 0x8c2d1f,
    map: masonryTex.map,
    roughness: 0.8,
    metalness: 0.05,
  });

  const marbleScaleMat = new THREE.MeshStandardMaterial({
    map: marbleScaleTex,
    roughness: 0.28,
    metalness: 0.12,
  });

  const whiteMarbleMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    roughness: 0.32,
    metalness: 0.1,
  });

  const sandstonePathMat = new THREE.MeshStandardMaterial({
    color: 0xc26d53,
    roughness: 0.82,
  });

  const lawnMat = new THREE.MeshStandardMaterial({
    color: 0x2e6f1e,
    roughness: 0.88,
  });

  const waterPoolMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.22,
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.45,
    transparent: true,
    opacity: 0.88,
  });

  // =========================================================================
  // 0. HERITAGE PARK PLAZA, MANICURED MUGHAL LAWNS & SANDSTONE WALKWAYS
  // =========================================================================
  const plazaBase = new THREE.Mesh(new THREE.BoxGeometry(58, 0.24, 54), sandstonePathMat);
  plazaBase.position.set(0, 0.12, 0);
  plazaBase.receiveShadow = true;
  complex.add(plazaBase);

  for (const lx of [-16.5, 16.5]) {
    for (const lz of [-12, 12]) {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 19), lawnMat);
      lawn.position.set(lx, 0.15, lz);
      lawn.receiveShadow = true;
      complex.add(lawn);
    }
  }

  // Official ASI Heritage Monument Plaque at Plaza Entrance
  const plaqueTex = createShopSignTexture(
    'जंतर मंतर वेधशाला (1724)',
    '#7c2d12',
    '#fef08a',
    maxAnisotropy
  );
  const plaquePedestal = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.2, 0.9), terracottaMat);
  plaquePedestal.position.set(0, 0.6, 21.5);
  plaquePedestal.castShadow = true;
  complex.add(plaquePedestal);

  const plaqueBoard = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 1.45, 0.25),
    new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.45 })
  );
  plaqueBoard.position.set(0, 1.85, 21.5);
  plaqueBoard.castShadow = true;
  complex.add(plaqueBoard);

  // =========================================================================
  // 1. THE SAMRAT YANTRA (सम्राट यंत्र — Colossal Triangular Sundial & Quadrant Wings)
  // =========================================================================
  const samratGroup = new THREE.Group();
  samratGroup.position.set(0, 0.24, -2.5);

  // Sunken Reflecting Pool beneath the Samrat Yantra Quadrants
  const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(24.5, 0.45, 12.5), darkTerracottaMat);
  poolBasin.position.set(0, 0.22, 1.5);
  samratGroup.add(poolBasin);

  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.5, 11.2), waterPoolMat);
  poolWater.position.set(0, 0.26, 1.5);
  samratGroup.add(poolWater);

  // Custom Extruded Right-Angled Triangular Gnomon Wall with Pierced Archways!
  const gnomonLength = 21.0;
  const gnomonHeight = 14.2;
  const gnomonShape = new THREE.Shape();
  gnomonShape.moveTo(0, 0);
  gnomonShape.lineTo(gnomonLength, 0);
  gnomonShape.lineTo(gnomonLength, gnomonHeight);
  gnomonShape.closePath();

  // Pierced Mughal/Astronomical Arched Cutouts inside the Gnomon Wall
  const archHole1 = new THREE.Path();
  archHole1.moveTo(8.5, 0.8);
  archHole1.lineTo(11.8, 0.8);
  archHole1.lineTo(11.8, 3.8);
  archHole1.absarc(10.15, 3.8, 1.65, 0, Math.PI, false);
  archHole1.closePath();
  gnomonShape.holes.push(archHole1);

  const archHole2 = new THREE.Path();
  archHole2.moveTo(14.2, 0.8);
  archHole2.lineTo(18.0, 0.8);
  archHole2.lineTo(18.0, 5.8);
  archHole2.absarc(16.1, 5.8, 1.9, 0, Math.PI, false);
  archHole2.closePath();
  gnomonShape.holes.push(archHole2);

  const archHole3 = new THREE.Path();
  archHole3.moveTo(14.5, 8.2);
  archHole3.lineTo(17.8, 8.2);
  archHole3.lineTo(17.8, 9.8);
  archHole3.absarc(16.15, 9.8, 1.65, 0, Math.PI, false);
  archHole3.closePath();
  gnomonShape.holes.push(archHole3);

  const gnomonGeo = new THREE.ExtrudeGeometry(gnomonShape, {
    depth: 2.3,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 2,
  });
  // Rotate so the triangular gnomon rises from front (+Z) toward back (-Z) along the meridian!
  gnomonGeo.rotateY(Math.PI / 2);
  gnomonGeo.translate(-1.15, 0, gnomonLength * 0.45);

  const gnomonWall = new THREE.Mesh(gnomonGeo, terracottaMat);
  gnomonWall.castShadow = true;
  gnomonWall.receiveShadow = true;
  samratGroup.add(gnomonWall);

  // Stepped White Makrana Marble Hypotenuse Staircase + Twin Parapet Walls
  const numSteps = 34;
  for (let s = 0; s < numSteps; s++) {
    const t = s / numSteps;
    const stepZ = gnomonLength * 0.45 - t * gnomonLength;
    const stepY = t * gnomonHeight;
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.34, 0.65), whiteMarbleMat);
    stepMesh.position.set(0, stepY + 0.17, stepZ);
    stepMesh.castShadow = true;
    samratGroup.add(stepMesh);
  }

  // Inclined Marble Graduated Parapet Rails flanking the Gnomon Staircase
  const hypLen = Math.hypot(gnomonLength, gnomonHeight);
  const hypAngle = Math.atan2(gnomonHeight, gnomonLength);
  for (const railSide of [-1.05, 1.05]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, hypLen), marbleScaleMat);
    rail.position.set(railSide, gnomonHeight * 0.5 + 0.35, -gnomonLength * 0.05);
    rail.rotation.x = hypAngle;
    rail.castShadow = true;
    samratGroup.add(rail);
  }

  // Summit Observatory Chhatri Pavilion at top of the Samrat Yantra Gnomon
  const summitZ = gnomonLength * 0.45 - gnomonLength;
  const summitPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.6, 2.8),
    whiteMarbleMat
  );
  summitPlinth.position.set(0, gnomonHeight + 0.3, summitZ);
  samratGroup.add(summitPlinth);

  for (const px of [-1.0, 1.0]) {
    for (const pz of [-1.0, 1.0]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 2.1, 10),
        whiteMarbleMat
      );
      col.position.set(px, gnomonHeight + 1.55, summitZ + pz);
      samratGroup.add(col);
    }
  }
  const chhatriRoof = new THREE.Mesh(
    new THREE.SphereGeometry(1.65, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    terracottaMat
  );
  chhatriRoof.position.set(0, gnomonHeight + 2.5, summitZ);
  samratGroup.add(chhatriRoof);

  // Twin Sweeping Quadrant Wings (East & West Equinoctial Sundial Arcs!)
  const quadRadius = 9.4;
  const quadSegments = 18;
  for (const wingSide of [-1, 1]) {
    const wingGroup = new THREE.Group();
    wingGroup.position.set(wingSide * 1.1, 6.8, 1.5);
    wingGroup.rotation.x = -0.38; // Tilted parallel to the equatorial plane

    for (let i = 0; i < quadSegments; i++) {
      const frac = i / (quadSegments - 1);
      const angle =
        wingSide < 0
          ? Math.PI * 0.52 + frac * (Math.PI * 0.44)
          : Math.PI * 0.48 - frac * (Math.PI * 0.44);

      const qx = Math.cos(angle) * quadRadius + (wingSide < 0 ? quadRadius : -quadRadius);
      const qy = -Math.sin(angle) * quadRadius * 0.72;

      const block = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.55, 3.2), terracottaMat);
      block.position.set(qx, qy, 0);
      block.rotation.z = angle - Math.PI / 2;
      block.castShadow = true;
      block.receiveShadow = true;
      wingGroup.add(block);

      const marbleRim = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, 0.28, 3.38),
        marbleScaleMat
      );
      marbleRim.position.set(qx, qy + 0.82, 0);
      marbleRim.rotation.z = angle - Math.PI / 2;
      wingGroup.add(marbleRim);

      // Vertical Masonry Support Buttresses under the outer part of each Quadrant Arc
      if (i % 4 === 3) {
        const buttressH = Math.max(1.5, 6.8 + qy);
        const buttress = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, buttressH, 2.6),
          darkTerracottaMat
        );
        buttress.position.set(qx, qy - buttressH * 0.5, 0);
        wingGroup.add(buttress);
      }
    }

    samratGroup.add(wingGroup);
  }

  complex.add(samratGroup);

  // =========================================================================
  // 2. THE TWIN RAM YANTRA DRUMS (राम यंत्र — Cylindrical Fenestrated Pillar Observatories)
  // =========================================================================
  for (const side of [-1, 1]) {
    const ramGroup = new THREE.Group();
    ramGroup.position.set(side * 19.5, 0.24, -6.5);

    const drumRadius = 5.4;
    const drumHeight = 6.2;
    const pillarCount = 12;

    // Circular Floor Plinth with Radial White Marble Degree Sectors
    const floorPlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(drumRadius + 0.5, drumRadius + 0.65, 0.35, 32),
      terracottaMat
    );
    floorPlinth.position.y = 0.18;
    floorPlinth.receiveShadow = true;
    ramGroup.add(floorPlinth);

    const marbleFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(drumRadius - 0.1, drumRadius - 0.1, 0.4, 24),
      marbleScaleMat
    );
    marbleFloor.position.y = 0.2;
    ramGroup.add(marbleFloor);

    // Central Vertical Graduated Gnomon Pillar inside the Ram Yantra
    const centerGnomon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.38, drumHeight + 0.4, 16),
      whiteMarbleMat
    );
    centerGnomon.position.y = drumHeight * 0.5;
    centerGnomon.castShadow = true;
    ramGroup.add(centerGnomon);

    // 12 Radial Vertical Terracotta Piers + Multi-Tier Arched Window Lintels
    for (let p = 0; p < pillarCount; p++) {
      const theta = (p / pillarCount) * Math.PI * 2;
      const px = Math.cos(theta) * drumRadius;
      const pz = Math.sin(theta) * drumRadius;

      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, drumHeight, 1.35),
        terracottaMat
      );
      pier.position.set(px, drumHeight * 0.5, pz);
      pier.rotation.y = -theta;
      pier.castShadow = true;
      pier.receiveShadow = true;
      ramGroup.add(pier);

      // Radial Altitude Wall Sector connecting pier toward center
      const sectorWall = new THREE.Mesh(
        new THREE.BoxGeometry(drumRadius * 0.62, 1.1, 0.36),
        marbleScaleMat
      );
      sectorWall.position.set(
        Math.cos(theta) * (drumRadius * 0.58),
        0.75,
        Math.sin(theta) * (drumRadius * 0.58)
      );
      sectorWall.rotation.y = -theta;
      ramGroup.add(sectorWall);
    }

    // 3 Horizontal Ring Lintels with White Marble Cornices (creating the iconic open sky windows!)
    for (const ringY of [2.1, 4.1, drumHeight]) {
      const lintelRing = new THREE.Mesh(
        new THREE.TorusGeometry(drumRadius, 0.42, 10, 36),
        terracottaMat
      );
      lintelRing.rotation.x = Math.PI / 2;
      lintelRing.position.y = ringY;
      lintelRing.castShadow = true;
      ramGroup.add(lintelRing);
    }

    const topMarbleCap = new THREE.Mesh(
      new THREE.TorusGeometry(drumRadius, 0.48, 10, 36),
      marbleScaleMat
    );
    topMarbleCap.rotation.x = Math.PI / 2;
    topMarbleCap.position.y = drumHeight + 0.22;
    ramGroup.add(topMarbleCap);

    complex.add(ramGroup);
  }

  // =========================================================================
  // 3. THE TWIN JAI PRAKASH YANTRA BOWLS (जय प्रकाश यंत्र — Sunken Concave Hemispheres)
  // =========================================================================
  for (const side of [-1, 1]) {
    const jpGroup = new THREE.Group();
    jpGroup.position.set(side * 12.8, 0.24, 11.5);

    const bowlRadius = 3.8;

    // Outer Terracotta Circular Rim Wall
    const outerRim = new THREE.Mesh(
      new THREE.CylinderGeometry(bowlRadius + 0.55, bowlRadius + 0.75, 1.35, 32),
      terracottaMat
    );
    outerRim.position.y = 0.68;
    outerRim.castShadow = true;
    outerRim.receiveShadow = true;
    jpGroup.add(outerRim);

    // Engraved White Marble Horizon Ring
    const marbleRim = new THREE.Mesh(
      new THREE.TorusGeometry(bowlRadius + 0.15, 0.45, 12, 36),
      marbleScaleMat
    );
    marbleRim.rotation.x = Math.PI / 2;
    marbleRim.position.y = 1.35;
    jpGroup.add(marbleRim);

    // Inverted Hemispherical Marble Bowl with Celestial Coordinate Markings
    const invertedBowl = new THREE.Mesh(
      new THREE.SphereGeometry(
        bowlRadius,
        28,
        16,
        0,
        Math.PI * 2,
        Math.PI * 0.5,
        Math.PI * 0.5
      ),
      marbleScaleMat
    );
    invertedBowl.material.side = THREE.DoubleSide;
    invertedBowl.position.y = 1.35;
    jpGroup.add(invertedBowl);

    // Cross-Wires & Central Sighting Ring suspended over the Hemisphere
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const wireNS = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, bowlRadius * 2.1, 8),
      wireMat
    );
    wireNS.rotation.x = Math.PI / 2;
    wireNS.position.y = 1.42;
    jpGroup.add(wireNS);

    const wireEW = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, bowlRadius * 2.1, 8),
      wireMat
    );
    wireEW.rotation.z = Math.PI / 2;
    wireEW.position.y = 1.42;
    jpGroup.add(wireEW);

    const sightingRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.045, 10, 20),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 })
    );
    sightingRing.rotation.x = Math.PI / 2;
    sightingRing.position.y = 1.44;
    jpGroup.add(sightingRing);

    complex.add(jpGroup);
  }

  // =========================================================================
  // 4. THE MISRA YANTRA (मिश्र यंत्र — Iconic Heart-Shaped Concentric Stepped Gnomon)
  // =========================================================================
  const misraGroup = new THREE.Group();
  misraGroup.position.set(0, 0.24, -21.5);

  // Central Stepped Gnomon Core
  const misraCore = new THREE.Mesh(new THREE.BoxGeometry(4.2, 8.8, 7.5), terracottaMat);
  misraCore.position.set(0, 4.4, 0);
  misraCore.castShadow = true;
  misraGroup.add(misraCore);

  // Central White Marble Staircase on Misra Yantra
  for (let i = 0; i < 18; i++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.45), whiteMarbleMat);
    st.position.set(0, i * 0.48 + 0.25, 3.8 - i * 0.38);
    misraGroup.add(st);
  }

  // Concentric Heart-Shaped / Tilted Oval Niyat Chakra Rings on Left & Right
  for (const side of [-1, 1]) {
    for (const [idx, rScale] of [1.0, 0.78, 0.56].entries()) {
      const arcLoop = new THREE.Mesh(
        new THREE.TorusGeometry(4.6 * rScale, 0.42, 12, 28, Math.PI * 1.25),
        idx % 2 === 0 ? terracottaMat : marbleScaleMat
      );
      arcLoop.position.set(side * (2.6 + idx * 0.35), 4.6, 0.8 + idx * 0.3);
      arcLoop.rotation.z = side < 0 ? -Math.PI * 0.35 : -Math.PI * 0.9;
      arcLoop.rotation.x = -0.32;
      arcLoop.castShadow = true;
      misraGroup.add(arcLoop);
    }
  }

  complex.add(misraGroup);

  // =========================================================================
  // 5. CELEBRATING PROTESTERS & HERITAGE LAMPS ON THE JANTAR MANTAR PLAZA
  // =========================================================================
  const rallyIds: ProtesterId[] = ['neha', 'nsui', 'abhijit', 'genz', 'minister', 'warrior'];
  const rallyPositions = [
    { x: -6.2, z: 16.5, rot: 0.25 },
    { x: 6.2, z: 16.5, rot: -0.25 },
    { x: -9.8, z: 18.2, rot: 0.4 },
    { x: 9.8, z: 18.2, rot: -0.4 },
    { x: -4.2, z: 13.5, rot: 0.15 },
    { x: 4.2, z: 13.5, rot: -0.15 },
  ];

  rallyPositions.forEach((pos, idx) => {
    const pMesh = buildProtesterMesh(rallyIds[idx % rallyIds.length], false);
    pMesh.root.position.set(pos.x, 0.24, pos.z);
    pMesh.root.rotation.y = pos.rot;
    pMesh.rightArm.rotation.x = -Math.PI * 0.82;
    complex.add(pMesh.root);
  });

  return complex;
}

