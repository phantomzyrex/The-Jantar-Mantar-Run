import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ComicCallout,
  DYNAMIC_LEVELS,
  EmoteKey,
  PROTESTER_EMOTES,
  PROTESTERS,
  ProtesterId,
  RunTelemetry,
  WEATHER_CONFIGS,
  WeatherMode,
} from '../types/game';
import {
  buildAnimatedPigeonFlockMesh,
  buildAutoRickshawMesh,
  buildBarricadeMesh,
  buildDetailedStorefrontGroup,
  buildDharnaTentMesh,
  buildEnemyOfficerMesh,
  buildFountainRoundaboutMesh,
  buildJantarMantarArchway,
  buildJantarMantarObservatoryComplex,
  buildLushDelhiTreeMesh,
  buildMediaCrewMesh,
  buildOverheadBannerMesh,
  buildPoliceBusMesh,
  buildProtesterMesh,
  buildSacredStreetCowMesh,
  buildSikhLangarSevaGroup,
  buildStreetlampMesh,
  buildWaterCannonTruckMesh,
  createAsphaltRoadTextures,
  createCheckeredFinishTexture,
  createColorfulPosterWallTexture,
  createFoliageTexture,
  createPoliceBarricadeTexture,
  createShopSignTexture,
  createShutterTexture,
  createTerracottaSidewalkTexture,
  createTreeBarkWithPwdBandTexture,
} from './ProceduralAssets';
import { soundEngine } from '../audio/soundEngine';
import { multiplayerClient } from '../network/multiplayerClient';

export type GamePhase =
  | 'title'
  | 'select_protester'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'arrested'
  | 'victory';

interface JantarMantarWorldProps {
  phase: GamePhase;
  protesterId: ProtesterId;
  levelId: string;
  levelSeed: number;
  weatherMode: WeatherMode;
  requestedEmote: { key: EmoteKey; timestamp: number } | null;
  onTelemetryUpdate: (telemetry: RunTelemetry) => void;
  onAddCallout: (callout: Omit<ComicCallout, 'id' | 'createdAt'>) => void;
  onRunFinished: (result: {
    status: 'completed' | 'arrested';
    telemetry: RunTelemetry;
  }) => void;
}

interface ObstacleEntity {
  id: string;
  type:
    | 'barricade'
    | 'khaki_police'
    | 'orange_goon'
    | 'riot_police'
    | 'water_cannon'
    | 'auto_rickshaw'
    | 'police_bus'
    | 'sikh_squad'
    | 'fountain';
  mesh: THREE.Group;
  rightArm?: THREE.Group;
  waterJetMesh?: THREE.Mesh;
  sprayGroup?: THREE.Group;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  triggeredDodge: boolean;
  triggeredShout: boolean;
  hitPlayer: boolean;
  patrolDir: number;
  patrolSpeed: number;
}

// Pre-allocated math helpers at module scope (zero GC in loop)
const _camTargetPos = new THREE.Vector3();
const _camLookAt = new THREE.Vector3();
const _targetFogColor = new THREE.Color();

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const JantarMantarWorld: React.FC<JantarMantarWorldProps> = ({
  phase,
  protesterId,
  levelId,
  levelSeed,
  weatherMode,
  requestedEmote,
  onTelemetryUpdate,
  onAddCallout,
  onRunFinished,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const phaseRef = useRef<GamePhase>(phase);
  const protesterIdRef = useRef<ProtesterId>(protesterId);
  const levelIdRef = useRef<string>(levelId);
  const levelSeedRef = useRef<number>(levelSeed);
  const weatherModeRef = useRef<WeatherMode>(weatherMode);
  const onTelemetryRef = useRef(onTelemetryUpdate);
  const onAddCalloutRef = useRef(onAddCallout);
  const onRunFinishedRef = useRef(onRunFinished);
  const triggerEmoteFnRef = useRef<((key: EmoteKey) => void) | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    protesterIdRef.current = protesterId;
  }, [protesterId]);

  useEffect(() => {
    levelIdRef.current = levelId;
    levelSeedRef.current = levelSeed;
  }, [levelId, levelSeed]);

  useEffect(() => {
    weatherModeRef.current = weatherMode;
  }, [weatherMode]);

  useEffect(() => {
    onTelemetryRef.current = onTelemetryUpdate;
    onAddCalloutRef.current = onAddCallout;
    onRunFinishedRef.current = onRunFinished;
  }, [onTelemetryUpdate, onAddCallout, onRunFinished]);

  useEffect(() => {
    if (requestedEmote && triggerEmoteFnRef.current) {
      triggerEmoteFnRef.current(requestedEmote.key);
    }
  }, [requestedEmote]);

  const rebuildTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (
      (phase === 'countdown' || phase === 'title' || phase === 'select_protester') &&
      rebuildTriggerRef.current
    ) {
      rebuildTriggerRef.current();
    }
  }, [phase, protesterId, levelId, levelSeed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    const initialWeather = WEATHER_CONFIGS[weatherModeRef.current];
    scene.background = new THREE.Color(initialWeather.fogColor);
    const sceneFog = new THREE.FogExp2(initialWeather.fogColor, initialWeather.fogDensity);
    scene.fog = sceneFog;

    // Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.2,
      280
    );
    camera.position.set(0, 5.2, 11);

    // 3-Point Warm Delhi Golden-Hour Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffe8c2, 0x475569, 0.92);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.65);
    keyLight.position.set(22, 38, 25);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 150;
    const d = 28;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.DirectionalLight(0xfde68a, 0.55);
    rimLight.position.set(-18, 22, -30);
    scene.add(rimLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Dynamic Weather 3D Particle System (Rain drops / Delhi Smog Dust)
    const weatherParticleCount = 260;
    const weatherGeo = new THREE.BufferGeometry();
    const weatherPositions = new Float32Array(weatherParticleCount * 3);
    for (let i = 0; i < weatherParticleCount; i++) {
      weatherPositions[i * 3] = (Math.random() - 0.5) * 32;
      weatherPositions[i * 3 + 1] = Math.random() * 16;
      weatherPositions[i * 3 + 2] = (Math.random() - 0.5) * 44;
    }
    weatherGeo.setAttribute('position', new THREE.BufferAttribute(weatherPositions, 3));
    const weatherMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.22,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const weatherPoints = new THREE.Points(weatherGeo, weatherMat);
    scene.add(weatherPoints);

    // Shared High-Anisotropy Procedural PBR Textures
    const barricadeTex = createPoliceBarricadeTexture(maxAnisotropy);
    const checkeredTex = createCheckeredFinishTexture(maxAnisotropy);
    const shutterTex = createShutterTexture(maxAnisotropy);
    const posterWallTex = createColorfulPosterWallTexture(maxAnisotropy);
    const asphaltTextures = createAsphaltRoadTextures(maxAnisotropy);
    const sidewalkTex = createTerracottaSidewalkTexture(maxAnisotropy);
    const barkPwdTex = createTreeBarkWithPwdBandTexture(maxAnisotropy);
    const foliageLightTex = createFoliageTexture('#4d7c0f', maxAnisotropy);
    const foliageDarkTex = createFoliageTexture('#365314', maxAnisotropy);
    const sandeshSubSignTex = createShopSignTexture(
      'SANDESH - DAINIK',
      '#dc2626',
      '#ffffff',
      maxAnisotropy
    );

    // Dust Puff Particle Pool
    const dustPool: {
      mesh: THREE.Mesh;
      active: boolean;
      life: number;
      maxLife: number;
      vy: number;
      vz: number;
    }[] = [];
    const dustGeo = new THREE.SphereGeometry(0.32, 10, 10);
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xfef3c7,
      transparent: true,
      opacity: 0.65,
    });
    for (let i = 0; i < 28; i++) {
      const m = new THREE.Mesh(dustGeo, dustMat.clone());
      m.visible = false;
      scene.add(m);
      dustPool.push({ mesh: m, active: false, life: 0, maxLife: 0.45, vy: 1.2, vz: 2 });
    }

    function spawnDustPuff(x: number, y: number, z: number, scale = 1.0) {
      const item = dustPool.find((p) => !p.active);
      if (!item) return;
      item.active = true;
      item.life = 0;
      item.maxLife = 0.38 + Math.random() * 0.18;
      item.mesh.position.set(
        x + (Math.random() - 0.5) * 0.45,
        y + 0.15,
        z + (Math.random() - 0.5) * 0.35
      );
      item.mesh.scale.setScalar(scale * (0.7 + Math.random() * 0.5));
      (item.mesh.material as THREE.MeshBasicMaterial).opacity = 0.65;
      item.mesh.visible = true;
    }

    // Active Emote State (Keys 1-4)
    let activeEmoteKey: EmoteKey | null = null;
    let emoteTimer = 0;
    let emoteDuration = 1.0;

    function triggerProtesterEmote(key: EmoteKey) {
      if (phaseRef.current !== 'playing') return;
      const emoteCfg = PROTESTER_EMOTES[key];
      if (!emoteCfg) return;

      activeEmoteKey = key;
      emoteTimer = 0;
      emoteDuration = emoteCfg.durationSec;
      telemetry.activeEmote = key;
      telemetry.score += 25;

      soundEngine.playEmoteChime(key);
      onAddCalloutRef.current({
        text: emoteCfg.nameHindi,
        subtext: `${emoteCfg.callout} (+25 अंक)`,
        x: 50,
        y: 30,
        variant: 'emote',
      });
      multiplayerClient.sendCallout(emoteCfg.callout);
    }

    triggerEmoteFnRef.current = triggerProtesterEmote;

    // Input state
    const heldKeys = new Set<string>();
    let jumpBufferTimer = 0;
    let coyoteTimer = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (phaseRef.current === 'playing' || phaseRef.current === 'countdown') {
          e.preventDefault();
        }
      }
      heldKeys.add(e.code);
      if (e.code === 'Space') {
        jumpBufferTimer = 0.14;
      }

      // Emote Keys 1 - 4
      if (phaseRef.current === 'playing' && !e.repeat) {
        if (e.code === 'Digit1' || e.code === 'Numpad1') triggerProtesterEmote(1);
        else if (e.code === 'Digit2' || e.code === 'Numpad2') triggerProtesterEmote(2);
        else if (e.code === 'Digit3' || e.code === 'Numpad3') triggerProtesterEmote(3);
        else if (e.code === 'Digit4' || e.code === 'Numpad4') triggerProtesterEmote(4);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    const handleBlur = () => {
      heldKeys.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    let playerRig = buildProtesterMesh(protesterIdRef.current, false);
    scene.add(playerRig.root);

    const remoteMeshes = new Map<string, ReturnType<typeof buildProtesterMesh>>();

    // Police Van for Arrest Sequence ("PAKDA GAYA!")
    const arrestVanGroup = new THREE.Group();
    const vanBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 2.5, 5.8),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    vanBody.position.y = 1.5;
    vanBody.castShadow = true;
    arrestVanGroup.add(vanBody);

    const vanStripe = new THREE.Mesh(
      new THREE.BoxGeometry(3.15, 0.55, 5.84),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 })
    );
    vanStripe.position.y = 1.25;
    arrestVanGroup.add(vanStripe);

    const sirenRed = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.22, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    sirenRed.position.set(-0.45, 2.85, 1.8);
    arrestVanGroup.add(sirenRed);

    const sirenBlue = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.22, 0.35),
      new THREE.MeshBasicMaterial({ color: 0x2563eb })
    );
    sirenBlue.position.set(0.45, 2.85, 1.8);
    arrestVanGroup.add(sirenBlue);

    arrestVanGroup.visible = false;
    scene.add(arrestVanGroup);

    let roadMaterialRef: THREE.MeshStandardMaterial | null = null;
    let obstacles: ObstacleEntity[] = [];
    let livingCows: Array<{
      headPivot: THREE.Group;
      tailPivot: THREE.Group;
      phase: number;
    }> = [];
    let pigeonFlocks: Array<ReturnType<typeof buildAnimatedPigeonFlockMesh>> = [];
    let playerX = 0;
    let playerY = 0;
    let playerZ = 0;
    let playerVx = 0;
    let playerVy = 0;
    let playerVz = 0;
    let isGrounded = true;
    let hitstopTimer = 0;
    let cameraShake = 0;
    let dustSpawnTimer = 0;
    let netSyncTimer = 0;
    let uiSyncTimer = 0;
    let titlePanTime = 0;

    let telemetry: RunTelemetry = {
      josh: 100,
      distanceM: 0,
      targetDistanceM: 500,
      timeSec: 0,
      score: 0,
      barricadesJumped: 0,
      closeDodges: 0,
      waterCannonHits: 0,
      sikhBoostsTaken: 0,
      halfwayShown: false,
      activeEmote: null,
    };

    const Z_SCALE = 1.45;

    function buildLevelScene() {
      while (worldGroup.children.length > 0) {
        const child = worldGroup.children[0];
        worldGroup.remove(child);
      }

      scene.remove(playerRig.root);
      playerRig = buildProtesterMesh(protesterIdRef.current, false);
      scene.add(playerRig.root);

      const lvl =
        DYNAMIC_LEVELS.find((l) => l.id === levelIdRef.current) || DYNAMIC_LEVELS[0];
      const rand = seededRandom(levelSeedRef.current);
      const wCfg = WEATHER_CONFIGS[weatherModeRef.current];

      const totalWorldLen = lvl.distanceM * Z_SCALE;
      telemetry = {
        josh: 100,
        distanceM: 0,
        targetDistanceM: lvl.distanceM,
        timeSec: 0,
        score: 0,
        barricadesJumped: 0,
        closeDodges: 0,
        waterCannonHits: 0,
        sikhBoostsTaken: 0,
        halfwayShown: false,
        activeEmote: null,
      };
      activeEmoteKey = null;
      emoteTimer = 0;
      onTelemetryRef.current({ ...telemetry });

      playerX = 0;
      playerY = 0;
      playerZ = 0;
      playerVx = 0;
      playerVy = 0;
      playerVz = 0;
      isGrounded = true;
      hitstopTimer = 0;
      cameraShake = 0;
      arrestVanGroup.visible = false;
      playerRig.root.position.set(0, 0, 0);

      // 1. Main Ultra-Realistic Asphalt Road Plane (-Z direction)
      const roadWidth = 17.5;
      const roadLen = totalWorldLen + 200;
      const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLen);
      roadGeo.rotateX(-Math.PI / 2);
      const roadMat = new THREE.MeshStandardMaterial({
        map: asphaltTextures.map,
        bumpMap: asphaltTextures.bumpMap,
        bumpScale: 0.04,
        color: new THREE.Color(lvl.roadColor),
        roughness: wCfg.roadRoughness,
        metalness: wCfg.roadMetalness,
      });
      roadMaterialRef = roadMat;
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(0, 0, -roadLen / 2 + 40);
      roadMesh.receiveShadow = true;
      worldGroup.add(roadMesh);

      // 2. Warm Terracotta-Brown Paver Sidewalks (Exact match to both screenshots!)
      const sidewalkGeo = new THREE.BoxGeometry(12.5, 0.28, roadLen);
      const sidewalkMat = new THREE.MeshStandardMaterial({
        map: sidewalkTex,
        roughness: 0.88,
      });
      const leftWalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      leftWalk.position.set(-roadWidth / 2 - 6.25, 0.14, -roadLen / 2 + 40);
      leftWalk.receiveShadow = true;
      worldGroup.add(leftWalk);

      const rightWalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      rightWalk.position.set(roadWidth / 2 + 6.25, 0.14, -roadLen / 2 + 40);
      rightWalk.receiveShadow = true;
      worldGroup.add(rightWalk);

      const groundOutGeo = new THREE.PlaneGeometry(220, roadLen);
      groundOutGeo.rotateX(-Math.PI / 2);
      const groundOutMat = new THREE.MeshStandardMaterial({
        color: 0x5c4038,
        roughness: 0.95,
      });
      const groundOut = new THREE.Mesh(groundOutGeo, groundOutMat);
      groundOut.position.set(0, -0.04, -roadLen / 2 + 40);
      worldGroup.add(groundOut);

      // 3. Alternating Yellow & Black Painted Curbs + 3 Crisp White Lane Dividers (Exact match to screenshots)
      const curbSegGeo = new THREE.BoxGeometry(0.48, 0.34, 3.0);
      const yellowCurbMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55 });
      const blackCurbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });

      const dashGeo = new THREE.PlaneGeometry(0.24, 3.6);
      dashGeo.rotateX(-Math.PI / 2);
      const dashMat = new THREE.MeshBasicMaterial({
        color: 0x9ca3af,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });

      const laneOffsets = [-4.3, 0, 4.3];
      let curbToggle = 0;
      for (let z = 24; z > -totalWorldLen - 40; z -= 3.0) {
        curbToggle++;
        const cMat = curbToggle % 2 === 0 ? yellowCurbMat : blackCurbMat;
        const leftCurb = new THREE.Mesh(curbSegGeo, cMat);
        leftCurb.position.set(-roadWidth / 2 - 0.22, 0.17, z);
        worldGroup.add(leftCurb);

        const rightCurb = new THREE.Mesh(curbSegGeo, cMat);
        rightCurb.position.set(roadWidth / 2 + 0.22, 0.17, z);
        worldGroup.add(rightCurb);

        if (curbToggle % 3 === 0) {
          for (const lx of laneOffsets) {
            const dash = new THREE.Mesh(dashGeo, dashMat);
            dash.position.set(lx, 0.02, z);
            worldGroup.add(dash);
          }
        }
      }

      // Foreground Decorative Barricades behind Start (visible at bottom of Screenshot 2!)
      for (const fx of [-5.2, -1.6, 2.0]) {
        const fgBar = buildBarricadeMesh(barricadeTex);
        fgBar.position.set(fx, 0, 6.2);
        worldGroup.add(fgBar);
      }

      // Checkered Finish Line & Red Sandstone Finish Gate
      const finishLineGeo = new THREE.PlaneGeometry(roadWidth, 2.2);
      finishLineGeo.rotateX(-Math.PI / 2);
      const finishLineMat = new THREE.MeshBasicMaterial({
        map: checkeredTex,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
      finishLine.position.set(0, 0.025, -totalWorldLen);
      worldGroup.add(finishLine);

      const finishArch = buildJantarMantarArchway(maxAnisotropy);
      finishArch.position.set(0, 0, -totalWorldLen);
      worldGroup.add(finishArch);

      // Ultra-Realistic Monumental 3D Jantar Mantar Astronomical Observatory Complex directly after the Finish Line!
      const jantarObservatory = buildJantarMantarObservatoryComplex(maxAnisotropy);
      jantarObservatory.position.set(0, 0, -totalWorldLen - 30);
      worldGroup.add(jantarObservatory);

      // 4. Overhead Protest Banners ("हम देखेंगे" in pink/red at z=-46, "RE-EXAM NOW!" in yellow at z=-29, etc.)
      const firstBanner = buildOverheadBannerMesh(
        'RE-EXAM NOW!',
        '#ca8a04',
        '#1e293b',
        maxAnisotropy
      );
      firstBanner.position.set(0, 0, -34);
      worldGroup.add(firstBanner);

      const secondBanner = buildOverheadBannerMesh(
        'हम देखेंगे',
        '#be123c',
        '#fef2f2',
        maxAnisotropy
      );
      secondBanner.position.set(0, 0, -54);
      worldGroup.add(secondBanner);

      const bannerColors = [
        { bg: '#dc2626', fg: '#fef08a' },
        { bg: '#ca8a04', fg: '#0f172a' },
        { bg: '#be123c', fg: '#ffffff' },
        { bg: '#f97316', fg: '#0f172a' },
        { bg: '#15803d', fg: '#ffffff' },
      ];
      lvl.banners.forEach((bannerText, idx) => {
        if (idx === 0) return;
        const zPos = -75 - (idx / lvl.banners.length) * (totalWorldLen - 90);
        const palette = bannerColors[idx % bannerColors.length];
        const bannerMesh = buildOverheadBannerMesh(
          bannerText,
          palette.bg,
          palette.fg,
          maxAnisotropy
        );
        bannerMesh.position.set(0, 0, zPos);
        worldGroup.add(bannerMesh);
      });

      // 5. Exact Roadside Storefronts, Trees with PWD White-Red Trunk Bands, Streetlamps, Vendor Stalls & Camera Person Parth!
      const leftShopConfigs = [
        {
          title: 'MOBILE REPAIR',
          bg: '#b45309',
          fg: '#f8fafc',
          wall: 0xd6b89c,
          awning: 0x9a3412,
          subSign: sandeshSubSignTex,
        },
        {
          title: 'PHOTOSTAT',
          bg: '#b91c1c',
          fg: '#f8fafc',
          wall: 0xe5ceb4,
          awning: 0x991b1b,
        },
        {
          title: 'GUPTA COACHING',
          bg: '#1e3a8a',
          fg: '#f8fafc',
          wall: 0xfef3c7,
          awning: 0x1d4ed8,
        },
        {
          title: 'SHARMA PHOTO',
          bg: '#9d174d',
          fg: '#fef08a',
          wall: 0xfce7f3,
          awning: 0x831843,
        },
        {
          title: 'जनता होटल',
          bg: '#c2410c',
          fg: '#ffffff',
          wall: 0xffedd5,
          awning: 0x9a3412,
        },
      ].map((s) => ({
        ...s,
        tex: createShopSignTexture(s.title, s.bg, s.fg, maxAnisotropy),
      }));

      const rightShopConfigs = [
        {
          title: 'छोले भटूरे',
          bg: '#1e3a8a',
          fg: '#f8fafc',
          wall: 0xd6b89c,
          awning: 0x1e40af,
        },
        {
          title: 'LAW BOOKS',
          bg: '#1e3a8a',
          fg: '#f8fafc',
          wall: 0xe2c7ab,
          awning: 0x172554,
        },
        {
          title: 'BOOK DEPOT',
          bg: '#1e3a8a',
          fg: '#f8fafc',
          wall: 0xfef3c7,
          awning: 0x1e3a8a,
        },
        {
          title: 'NEW BOOKS',
          bg: '#7c2d12',
          fg: '#fef08a',
          wall: 0xffedd5,
          awning: 0x9a3412,
        },
        {
          title: 'XEROX & PRINT',
          bg: '#0f766e',
          fg: '#f8fafc',
          wall: 0xccfbf1,
          awning: 0x115e59,
        },
      ].map((s) => ({
        ...s,
        tex: createShopSignTexture(s.title, s.bg, s.fg, maxAnisotropy),
      }));

      // Left Sidewalk Foreground: CAMERA PERSON PARTH + "BATTERY 10%!" + "RE-EXAM!" Bystanders (Exact match to Screenshot 1 & 2!)
      const openingCrew = buildMediaCrewMesh(maxAnisotropy);
      openingCrew.position.set(-9.5, 0.28, -9.5);
      worldGroup.add(openingCrew);

      const midCrew = buildMediaCrewMesh(maxAnisotropy);
      midCrew.position.set(-9.5, 0.28, -totalWorldLen * 0.48);
      worldGroup.add(midCrew);

      // Left Sidewalk Red-and-White Striped Vendor Stall ("₹ 10") at z = -29 (Exact match to Screenshot 2!)
      const openingVendorStall = buildDharnaTentMesh(maxAnisotropy);
      openingVendorStall.position.set(-10.8, 0.28, -28);
      worldGroup.add(openingVendorStall);

      // Living Delhi Street Fauna: Sacred Indian Zebu Street Cows on Sidewalk Shoulders & Soaring Pigeon Flocks
      livingCows = [];
      pigeonFlocks = [];

      const cowSpots = [
        { x: 10.2, z: -24, ry: -0.45, phase: 0 },
        { x: -10.2, z: -totalWorldLen * 0.56, ry: 0.55, phase: 2.1 },
        { x: 11.4, z: -totalWorldLen - 10, ry: -0.8, phase: 4.2 },
      ];
      for (const cs of cowSpots) {
        const cow = buildSacredStreetCowMesh();
        cow.root.position.set(cs.x, 0.28, cs.z);
        cow.root.rotation.y = cs.ry;
        worldGroup.add(cow.root);
        livingCows.push({
          headPivot: cow.headPivot,
          tailPivot: cow.tailPivot,
          phase: cs.phase,
        });
      }

      const flockZones = [-36, -totalWorldLen * 0.5, -totalWorldLen - 26];
      for (const fz of flockZones) {
        const flock = buildAnimatedPigeonFlockMesh(7);
        flock.root.position.set(0, 0, fz);
        worldGroup.add(flock.root);
        pigeonFlocks.push(flock);
      }

      let rowIndex = 0;
      for (let z = 6; z > -totalWorldLen + 8; z -= 18) {
        for (const side of [-1, 1] as const) {
          // Double-Arm Streetlamp with Square Plinth Base on Curb Edge (Exact match to screenshots!)
          const lamp = buildStreetlampMesh();
          lamp.position.set(side * 9.35, 0.28, z - 8);
          worldGroup.add(lamp);

          // Lush Multi-Sphere Neem/Peepal Tree with White-and-Red PWD Painted Trunk Band!
          const tree = buildLushDelhiTreeMesh(
            barkPwdTex,
            foliageLightTex,
            foliageDarkTex,
            side
          );
          tree.position.set(side * 10.95, 0.28, z - 2);
          worldGroup.add(tree);

          // Multi-Story Urban Delhi Storefront Buildings on Both Sides from Start to Finish!
          const configs = side < 0 ? leftShopConfigs : rightShopConfigs;
          const sc = configs[rowIndex % configs.length];
          const storefront = buildDetailedStorefrontGroup(
            side,
            sc.tex,
            shutterTex,
            posterWallTex,
            sc.wall,
            sc.awning,
            'subSign' in sc ? (sc.subSign as THREE.CanvasTexture) : undefined
          );
          storefront.position.set(side * 16.4, 0.28, z - 7);
          worldGroup.add(storefront);

          // Additional Vendor Stalls along the avenue
          if (side === -1 && rowIndex > 2 && rowIndex % 4 === 0) {
            const stall = buildDharnaTentMesh(maxAnisotropy);
            stall.position.set(-10.8, 0.28, z - 11);
            worldGroup.add(stall);
          }
        }
        rowIndex++;
      }

      // Distant Horizon Delhi Skyline Silhouettes (visible in the golden haze of Screenshot 2!)
      const skylineMat = new THREE.MeshBasicMaterial({
        color: 0xb8865c,
        transparent: true,
        opacity: 0.45,
      });
      for (const sx of [-18, -7, 5, 16]) {
        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(8, 18 + Math.abs(sx) * 0.4, 6),
          skylineMat
        );
        tower.position.set(sx, 9, -125);
        worldGroup.add(tower);
      }

      // 6. Populate Opening Vista & Dynamic Level Obstacles (Matching Screenshot 1 & 2!)
      obstacles = [];

      // Opening Vista Elements (matching Screenshot 1 & 2):
      // - Khaki Police Officer walking with lathi in center-left lane at z = -15.5
      const firstPolice = buildEnemyOfficerMesh('khaki_police');
      firstPolice.root.position.set(-1.1, 0, -15.5);
      worldGroup.add(firstPolice.root);
      obstacles.push({
        id: 'opening_police_1',
        type: 'khaki_police',
        mesh: firstPolice.root,
        rightArm: firstPolice.rightArm,
        x: -1.1,
        z: -15.5,
        width: 1.45,
        depth: 1.45,
        height: 2.0,
        triggeredDodge: false,
        triggeredShout: false,
        hitPlayer: false,
        patrolDir: 1,
        patrolSpeed: 2.2,
      });

      // - Green & Yellow Delhi Auto-Rickshaw on Right Curb Lane at z = -22
      const openingAuto = buildAutoRickshawMesh();
      openingAuto.position.set(5.4, 0, -22);
      worldGroup.add(openingAuto);
      obstacles.push({
        id: 'opening_auto_1',
        type: 'auto_rickshaw',
        mesh: openingAuto,
        x: 5.4,
        z: -22,
        width: 1.85,
        depth: 2.6,
        height: 1.8,
        triggeredDodge: false,
        triggeredShout: false,
        hitPlayer: false,
        patrolDir: 0,
        patrolSpeed: 0,
      });

      // - Row of 3 Yellow/Black POLICE Barricades at z = -31
      for (const [idx, bx] of [-4.6, 0, 4.6].entries()) {
        const bMesh = buildBarricadeMesh(barricadeTex);
        bMesh.position.set(bx, 0, -31);
        worldGroup.add(bMesh);
        obstacles.push({
          id: `opening_bar_${idx}`,
          type: 'barricade',
          mesh: bMesh,
          x: bx,
          z: -31,
          width: 2.5,
          depth: 0.7,
          height: 1.25,
          triggeredDodge: false,
          triggeredShout: false,
          hitPlayer: false,
          patrolDir: 0,
          patrolSpeed: 0,
        });
      }

      // - White Police Van with Red/Blue Siren on Right Lane at z = -42
      const whitePoliceVan = buildPoliceBusMesh('green_onduty', maxAnisotropy);
      whitePoliceVan.position.set(4.8, 0, -42);
      worldGroup.add(whitePoliceVan);
      obstacles.push({
        id: 'opening_police_van',
        type: 'police_bus',
        mesh: whitePoliceVan,
        x: 4.8,
        z: -42,
        width: 3.2,
        depth: 8.8,
        height: 3.0,
        triggeredDodge: false,
        triggeredShout: false,
        hitPlayer: false,
        patrolDir: 0,
        patrolSpeed: 0,
      });

      // - Red Delhi Bus parked horizontally on Left/Center in distance at z = -64 (matching Screenshot 2!)
      const redHorizonBus = buildPoliceBusMesh('red_police', maxAnisotropy);
      redHorizonBus.rotation.y = Math.PI / 2;
      redHorizonBus.position.set(-2.6, 0, -64);
      worldGroup.add(redHorizonBus);
      obstacles.push({
        id: 'opening_red_bus',
        type: 'police_bus',
        mesh: redHorizonBus,
        x: -2.6,
        z: -64,
        width: 8.4,
        depth: 3.2,
        height: 3.0,
        triggeredDodge: false,
        triggeredShout: false,
        hitPlayer: false,
        patrolDir: 0,
        patrolSpeed: 0,
      });

      // Place Fountain Roundabouts at spaced intersections
      for (let r = 1; r <= lvl.roundaboutCount; r++) {
        const frac = r / (lvl.roundaboutCount + 1);
        const fZ = Math.min(-95, -frac * totalWorldLen);
        const { root, sprayGroup } = buildFountainRoundaboutMesh();
        root.position.set(0, 0, fZ);
        worldGroup.add(root);
        obstacles.push({
          id: `fountain_${r}`,
          type: 'fountain',
          mesh: root,
          sprayGroup,
          x: 0,
          z: fZ,
          width: 7.4,
          depth: 7.4,
          height: 0.65,
          triggeredDodge: false,
          triggeredShout: false,
          hitPlayer: false,
          patrolDir: 0,
          patrolSpeed: 0,
        });
      }

      const stepZ = 18.5 / Math.sqrt(lvl.hazardDensity);
      for (let z = -78; z > -totalWorldLen + 24; z -= stepZ) {
        if (obstacles.some((o) => o.type === 'fountain' && Math.abs(o.z - z) < 13)) {
          continue;
        }

        const roll = rand();

        if (roll < 0.34) {
          // Police Barricade row (2 or 3 barricades across lanes)
          const count = rand() > 0.45 ? 3 : 2;
          const lanes = [-5.4, -1.8, 1.8, 5.4];
          for (let i = 0; i < count; i++) {
            const laneIdx = Math.floor(rand() * lanes.length);
            const bx = lanes.splice(laneIdx, 1)[0];
            const bMesh = buildBarricadeMesh(barricadeTex);
            bMesh.position.set(bx, 0, z);
            worldGroup.add(bMesh);
            obstacles.push({
              id: `bar_${z}_${i}`,
              type: 'barricade',
              mesh: bMesh,
              x: bx,
              z,
              width: 2.5,
              depth: 0.7,
              height: 1.25,
              triggeredDodge: false,
              triggeredShout: false,
              hitPlayer: false,
              patrolDir: 0,
              patrolSpeed: 0,
            });
          }
        } else if (roll < 0.64) {
          // Police Officer / Stick Squad / Riot Police
          const subRoll = rand();
          const variant =
            subRoll < 0.42
              ? 'khaki_police'
              : subRoll < 0.76
              ? 'orange_goon'
              : 'riot_police';
          const ox = (rand() - 0.5) * 11.5;
          const officer = buildEnemyOfficerMesh(variant);
          officer.root.position.set(ox, 0, z);
          worldGroup.add(officer.root);
          obstacles.push({
            id: `off_${z}`,
            type: variant,
            mesh: officer.root,
            rightArm: officer.rightArm,
            x: ox,
            z,
            width: 1.45,
            depth: 1.45,
            height: 2.0,
            triggeredDodge: false,
            triggeredShout: false,
            hitPlayer: false,
            patrolDir: rand() > 0.5 ? 1 : -1,
            patrolSpeed: variant === 'orange_goon' ? 3.8 : 2.5,
          });
        } else if (roll < 0.74) {
          // Parked Red "DELHI POLICE" Blockade Bus
          const sideSign = rand() > 0.5 ? -1 : 1;
          const busX = sideSign * 4.9;
          const redBus = buildPoliceBusMesh('red_police', maxAnisotropy);
          redBus.position.set(busX, 0, z);
          worldGroup.add(redBus);
          obstacles.push({
            id: `pbus_${z}`,
            type: 'police_bus',
            mesh: redBus,
            x: busX,
            z,
            width: 3.2,
            depth: 8.8,
            height: 3.0,
            triggeredDodge: false,
            triggeredShout: false,
            hitPlayer: false,
            patrolDir: 0,
            patrolSpeed: 0,
          });
        } else if (roll < 0.85 && rand() < lvl.waterCannonChance + 0.25) {
          // Water Cannon Truck spraying water across lanes
          const truck = buildWaterCannonTruckMesh(maxAnisotropy);
          const tx = 5.4;
          truck.root.position.set(tx, 0, z);
          worldGroup.add(truck.root);
          obstacles.push({
            id: `wc_${z}`,
            type: 'water_cannon',
            mesh: truck.root,
            waterJetMesh: truck.waterJetMesh,
            x: tx,
            z,
            width: 3.4,
            depth: 8.0,
            height: 3.2,
            triggeredDodge: false,
            triggeredShout: false,
            hitPlayer: false,
            patrolDir: 0,
            patrolSpeed: 0,
          });
        } else if (roll < 0.93) {
          // Delhi Auto-Rickshaw
          const auto = buildAutoRickshawMesh();
          const ax = (rand() > 0.5 ? -1 : 1) * (3.5 + rand() * 2.5);
          auto.position.set(ax, 0, z);
          worldGroup.add(auto);
          obstacles.push({
            id: `auto_${z}`,
            type: 'auto_rickshaw',
            mesh: auto,
            x: ax,
            z,
            width: 1.85,
            depth: 2.6,
            height: 1.8,
            triggeredDodge: false,
            triggeredShout: false,
            hitPlayer: false,
            patrolDir: 0,
            patrolSpeed: 0,
          });
        } else {
          // Sikh Squad Langar / Josh Booster Station on Sidewalk Edge (+20% जान!)
          const sx = rand() > 0.5 ? -6.8 : 6.8;
          const sikhGroup = buildSikhLangarSevaGroup(maxAnisotropy);
          sikhGroup.position.set(sx, 0, z);
          worldGroup.add(sikhGroup);
          obstacles.push({
            id: `sikh_${z}`,
            type: 'sikh_squad',
            mesh: sikhGroup,
            x: sx,
            z,
            width: 3.2,
            depth: 3.2,
            height: 2.0,
            triggeredDodge: false,
            triggeredShout: false,
            hitPlayer: false,
            patrolDir: 0,
            patrolSpeed: 0,
          });
        }
      }

      renderer.compile(scene, camera);
    }

    rebuildTriggerRef.current = buildLevelScene;
    buildLevelScene();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animFrameId = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();

      const currentPhase = phaseRef.current;
      const wCfg = WEATHER_CONFIGS[weatherModeRef.current];

      // Smoothly transition Dynamic Weather Atmosphere, Visibility & Road Surface Wetness
      _targetFogColor.set(wCfg.fogColor);
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(_targetFogColor, dt * 3.5);
      }
      sceneFog.color.lerp(_targetFogColor, dt * 3.5);
      sceneFog.density = THREE.MathUtils.damp(sceneFog.density, wCfg.fogDensity, 4, dt);
      hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, wCfg.ambientIntensity, 4, dt);
      keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, wCfg.sunIntensity, 4, dt);

      if (roadMaterialRef) {
        roadMaterialRef.roughness = THREE.MathUtils.damp(
          roadMaterialRef.roughness,
          wCfg.roadRoughness,
          4,
          dt
        );
        roadMaterialRef.metalness = THREE.MathUtils.damp(
          roadMaterialRef.metalness,
          wCfg.roadMetalness,
          4,
          dt
        );
      }

      // Animate 3D Weather Particles around Camera
      weatherPoints.position.set(camera.position.x, 0, camera.position.z - 16);
      const posAttr = weatherGeo.getAttribute('position') as THREE.BufferAttribute;
      if (weatherModeRef.current === 'rainy') {
        weatherPoints.visible = true;
        weatherMat.color.setHex(0xbae6fd);
        weatherMat.size = 0.24;
        weatherMat.opacity = 0.78;
        for (let i = 0; i < weatherParticleCount; i++) {
          let py = posAttr.getY(i) - 24 * dt;
          let px = posAttr.getX(i) - 3.5 * dt;
          if (py < 0) {
            py = 15;
            px = (Math.random() - 0.5) * 32;
          }
          posAttr.setXY(i, px, py);
        }
        posAttr.needsUpdate = true;
      } else if (weatherModeRef.current === 'dusty') {
        weatherPoints.visible = true;
        weatherMat.color.setHex(0xfde68a);
        weatherMat.size = 0.34;
        weatherMat.opacity = 0.55;
        for (let i = 0; i < weatherParticleCount; i++) {
          let px = posAttr.getX(i) + Math.sin(elapsed * 1.5 + i) * 4.5 * dt;
          let py = posAttr.getY(i) + Math.cos(elapsed + i) * 1.2 * dt;
          if (px > 16) px = -16;
          if (px < -16) px = 16;
          if (py < 0.3) py = 12;
          posAttr.setXY(i, px, py);
        }
        posAttr.needsUpdate = true;
      } else {
        weatherPoints.visible = false;
      }

      // Animate Living Street Cows (Gentle Head Grazing Nod & Tail Swish)
      for (const cow of livingCows) {
        cow.headPivot.rotation.x = Math.sin(elapsed * 1.6 + cow.phase) * 0.14;
        cow.headPivot.rotation.y = Math.cos(elapsed * 0.9 + cow.phase) * 0.12;
        cow.tailPivot.rotation.z = Math.sin(elapsed * 3.8 + cow.phase) * 0.28;
      }

      // Animate Soaring Delhi Pigeon Flocks (Flapping Wings & Circular Gliding Orbits)
      for (const flock of pigeonFlocks) {
        for (const b of flock.birds) {
          const angle = elapsed * b.orbitSpeed + b.phaseOffset;
          b.birdGroup.position.set(
            Math.cos(angle) * b.orbitRadius,
            b.baseY + Math.sin(elapsed * 2.2 + b.phaseOffset) * 0.45,
            Math.sin(angle) * b.orbitRadius * 0.65
          );
          b.birdGroup.rotation.y = -angle + Math.PI;
          const flap = Math.sin(elapsed * 16 + b.phaseOffset * 3) * 0.62;
          b.leftWing.rotation.z = flap;
          b.rightWing.rotation.z = -flap;
        }
      }

      // Update Dust Puff Particles
      for (const p of dustPool) {
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          p.mesh.visible = false;
        } else {
          const t = p.life / p.maxLife;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          p.mesh.scale.multiplyScalar(1 + dt * 1.4);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.65 * (1 - t);
        }
      }

      // Sync Remote Multiplayer Runners
      for (const [pid, remote] of multiplayerClient.players.entries()) {
        if (pid === multiplayerClient.playerId) continue;
        let rMesh = remoteMeshes.get(pid);
        if (!rMesh) {
          rMesh = buildProtesterMesh(remote.protesterId, true);
          scene.add(rMesh.root);
          remoteMeshes.set(pid, rMesh);
        }
        rMesh.root.position.x = THREE.MathUtils.damp(rMesh.root.position.x, remote.x, 10, dt);
        rMesh.root.position.y = THREE.MathUtils.damp(rMesh.root.position.y, remote.y, 10, dt);
        rMesh.root.position.z = THREE.MathUtils.damp(rMesh.root.position.z, remote.z, 10, dt);
        rMesh.leftLeg.rotation.x = Math.sin(elapsed * 12) * 0.55;
        rMesh.rightLeg.rotation.x = -Math.sin(elapsed * 12) * 0.55;
      }
      for (const [pid, rMesh] of remoteMeshes.entries()) {
        if (!multiplayerClient.players.has(pid)) {
          scene.remove(rMesh.root);
          remoteMeshes.delete(pid);
        }
      }

      // Title / Select Screen Camera Framing (Matches Screenshot 1 & 2 Vista!)
      if (currentPhase === 'title' || currentPhase === 'select_protester') {
        titlePanTime += dt;
        const baseZ = currentPhase === 'select_protester' ? 4.8 : 7.2;
        const swayX = Math.sin(titlePanTime * 0.45) * 0.35;
        const swayZ = Math.sin(titlePanTime * 0.25) * 1.6;
        _camTargetPos.set(swayX, 4.35, baseZ + swayZ);
        _camLookAt.set(0, 2.35, -36);
        camera.position.lerp(_camTargetPos, 0.08);
        camera.lookAt(_camLookAt);
        playerRig.root.visible = false;
        renderer.render(scene, camera);
        return;
      }

      playerRig.root.visible = true;

      if (currentPhase === 'countdown') {
        _camTargetPos.set(0, 4.8, 7.6);
        _camLookAt.set(0, 1.8, -12);
        camera.position.lerp(_camTargetPos, 0.12);
        camera.lookAt(_camLookAt);
        playerRig.root.position.set(0, 0, 0);
        playerRig.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.08;
        renderer.render(scene, camera);
        return;
      }

      if (currentPhase === 'paused') {
        renderer.render(scene, camera);
        return;
      }

      if (currentPhase === 'arrested' || currentPhase === 'victory') {
        if (currentPhase === 'arrested') {
          arrestVanGroup.visible = true;
          arrestVanGroup.position.set(playerX, 0, playerZ - 4.8);
          const flash = Math.floor(elapsed * 8) % 2 === 0;
          (sirenRed.material as THREE.MeshBasicMaterial).color.setHex(
            flash ? 0xef4444 : 0x450a0a
          );
          (sirenBlue.material as THREE.MeshBasicMaterial).color.setHex(
            flash ? 0x1e3a8a : 0x3b82f6
          );
          _camTargetPos.set(playerX + Math.sin(elapsed * 0.6) * 2.2, 4.9, playerZ + 8.5);
          _camLookAt.set(playerX, 1.5, playerZ - 2.5);
        } else {
          // Victory: Player celebrates past the finish line while camera orbits to showcase the 3D Jantar Mantar Observatory Complex!
          const finZ = - (DYNAMIC_LEVELS.find((l) => l.id === levelIdRef.current) || DYNAMIC_LEVELS[0]).distanceM * Z_SCALE;
          playerRig.root.position.set(0, Math.abs(Math.sin(elapsed * 6)) * 0.28, finZ - 4.5);
          playerRig.rightArm.rotation.x = -Math.PI * 0.85 + Math.sin(elapsed * 10) * 0.3;
          playerRig.leftArm.rotation.x = -Math.PI * 0.78 - Math.sin(elapsed * 10) * 0.3;

          const orbitX = Math.sin(elapsed * 0.45) * 9.5;
          _camTargetPos.set(orbitX, 6.8, finZ + 8.5);
          _camLookAt.set(0, 4.8, finZ - 30);
        }
        camera.position.lerp(_camTargetPos, 0.06);
        camera.lookAt(_camLookAt);
        renderer.render(scene, camera);
        return;
      }

      if (hitstopTimer > 0) {
        hitstopTimer -= dt;
        renderer.render(scene, camera);
        return;
      }

      const cfg =
        PROTESTERS.find((p) => p.id === protesterIdRef.current) || PROTESTERS[3];
      const lvl =
        DYNAMIC_LEVELS.find((l) => l.id === levelIdRef.current) || DYNAMIC_LEVELS[0];

      telemetry.timeSec += dt;

      // Movement & Weather Surface Friction Physics
      const baseForwardSpeed = 16.5 * cfg.speedMultiplier;
      let targetVz = -baseForwardSpeed;
      if (heldKeys.has('KeyW') || heldKeys.has('ArrowUp')) {
        targetVz = -baseForwardSpeed * 1.28;
      } else if (heldKeys.has('KeyS') || heldKeys.has('ArrowDown')) {
        targetVz = -baseForwardSpeed * 0.45;
      }

      let targetVx = 0;
      const lateralSpeed = 11.2 * cfg.speedMultiplier;
      if (heldKeys.has('KeyA') || heldKeys.has('ArrowLeft')) {
        targetVx = -lateralSpeed;
      }
      if (heldKeys.has('KeyD') || heldKeys.has('ArrowRight')) {
        targetVx = lateralSpeed;
      }

      if (weatherModeRef.current === 'dusty') {
        targetVx += Math.sin(elapsed * 1.3) * 1.1;
      }

      const lateralDampLambda = Math.max(2.2, 13.5 * wCfg.lateralFriction);
      playerVx = THREE.MathUtils.damp(playerVx, targetVx, lateralDampLambda, dt);
      playerVz = THREE.MathUtils.damp(playerVz, targetVz, 10, dt);

      // Jump with Input Buffering & Coyote Time
      if (isGrounded) {
        coyoteTimer = 0.1;
      } else {
        coyoteTimer = Math.max(0, coyoteTimer - dt);
      }
      jumpBufferTimer = Math.max(0, jumpBufferTimer - dt);

      if (jumpBufferTimer > 0 && coyoteTimer > 0) {
        playerVy = 11.8 * cfg.jumpMultiplier;
        isGrounded = false;
        coyoteTimer = 0;
        jumpBufferTimer = 0;
        soundEngine.playJump();
        spawnDustPuff(playerX, 0, playerZ, 1.35);
      }

      playerVy -= 28.5 * dt;
      playerX += playerVx * dt;
      playerY += playerVy * dt;
      playerZ += playerVz * dt;

      playerX = THREE.MathUtils.clamp(playerX, -7.2, 7.2);

      let groundHeight = 0;
      for (const obs of obstacles) {
        if (obs.type === 'fountain') {
          const dist = Math.hypot(playerX - obs.x, playerZ - obs.z);
          if (dist < 4.9) {
            groundHeight = 0.42;
          }
        }
      }

      if (playerY <= groundHeight) {
        playerY = groundHeight;
        playerVy = 0;
        isGrounded = true;
      }

      // Update Player Mesh Transform & Procedural Run Cycle + Emote Animations (Keys 1-4)
      playerRig.root.position.set(playerX, playerY, playerZ);
      playerRig.root.rotation.y = THREE.MathUtils.damp(
        playerRig.root.rotation.y,
        -playerVx * 0.038,
        10,
        dt
      );

      if (isGrounded) {
        const strideFreq = Math.abs(playerVz) * 0.85;
        playerRig.leftLeg.rotation.x = Math.sin(elapsed * strideFreq) * 0.65;
        playerRig.rightLeg.rotation.x = -Math.sin(elapsed * strideFreq) * 0.65;
        playerRig.rightArm.rotation.x = Math.sin(elapsed * strideFreq) * 0.5;
        playerRig.rightArm.rotation.z = 0;
        playerRig.bodyGroup.position.y = Math.abs(Math.sin(elapsed * strideFreq * 2)) * 0.09;
        playerRig.bodyGroup.rotation.y = 0;

        dustSpawnTimer += dt;
        if (dustSpawnTimer > 0.14) {
          dustSpawnTimer = 0;
          spawnDustPuff(playerX, playerY, playerZ + 0.4, 0.85);
        }
      } else {
        playerRig.leftLeg.rotation.x = 0.45;
        playerRig.rightLeg.rotation.x = -0.35;
        playerRig.rightArm.rotation.x = -0.8;
      }

      // Apply Active Celebratory Protester Emote Overlay (Keys 1-4)
      if (activeEmoteKey !== null) {
        emoteTimer += dt;
        const p = Math.min(1, emoteTimer / emoteDuration);

        if (activeEmoteKey === 1) {
          playerRig.rightArm.rotation.x = -Math.PI * 0.88 + Math.sin(p * Math.PI * 6) * 0.35;
          playerRig.rightArm.rotation.z = -0.15;
          playerRig.bodyGroup.position.y += Math.abs(Math.sin(p * Math.PI * 3)) * 0.28;
        } else if (activeEmoteKey === 2) {
          playerRig.rightArm.rotation.x = -Math.PI * 0.82;
          playerRig.rightArm.rotation.z = Math.sin(p * Math.PI * 6) * 0.55 - 0.25;
          playerRig.bodyGroup.rotation.z = Math.sin(p * Math.PI * 4) * 0.1;
        } else if (activeEmoteKey === 3) {
          playerRig.bodyGroup.rotation.y = p * Math.PI * 2;
          playerRig.rightArm.rotation.x = -Math.PI * 0.75;
          playerRig.bodyGroup.position.y += Math.sin(p * Math.PI) * 0.35;
        } else if (activeEmoteKey === 4) {
          playerRig.rightArm.rotation.x = -Math.PI * 0.7;
          playerRig.rightArm.rotation.z = -0.45 + Math.sin(p * Math.PI * 8) * 0.25;
          playerRig.bodyGroup.position.y += Math.abs(Math.sin(p * Math.PI * 6)) * 0.32;
          playerRig.bodyGroup.rotation.z = Math.sin(p * Math.PI * 6) * 0.14;
        }

        if (emoteTimer >= emoteDuration) {
          activeEmoteKey = null;
          telemetry.activeEmote = null;
          playerRig.bodyGroup.rotation.set(0, 0, 0);
        }
      }

      // Update Obstacles & Check Collisions / Close Dodges
      for (const obs of obstacles) {
        if (obs.type === 'fountain' && obs.sprayGroup) {
          obs.sprayGroup.rotation.y += dt * 1.8;
          obs.sprayGroup.position.y = Math.sin(elapsed * 5) * 0.12;
        }

        const dz = obs.z - playerZ;
        if (Math.abs(dz) > 38) continue;

        if (
          obs.type === 'khaki_police' ||
          obs.type === 'orange_goon' ||
          obs.type === 'riot_police'
        ) {
          obs.x += obs.patrolDir * obs.patrolSpeed * dt;
          if (obs.x > 6.5) {
            obs.x = 6.5;
            obs.patrolDir = -1;
          } else if (obs.x < -6.5) {
            obs.x = -6.5;
            obs.patrolDir = 1;
          }
          obs.mesh.position.x = obs.x;

          if (obs.rightArm) {
            obs.rightArm.rotation.x = Math.sin(elapsed * 9) * 0.65;
          }

          if (!obs.triggeredShout && dz < 0 && dz > -16) {
            obs.triggeredShout = true;
            const shouts = [
              'OYE! RUK!',
              'DARO MAT, BHAAGO!',
              'IDHAR AA!',
              'SECTION 144 HAI!',
            ];
            const text = shouts[Math.abs(Math.round(obs.z)) % shouts.length];
            onAddCalloutRef.current({
              text,
              x: THREE.MathUtils.clamp(50 + obs.x * 4, 22, 78),
              y: 36,
              variant: 'speech',
            });
          }
        }

        if (obs.type === 'water_cannon' && obs.waterJetMesh) {
          const sweep = Math.sin(elapsed * 2.4 + obs.z) * 0.25;
          obs.waterJetMesh.scale.y = 0.92 + Math.sin(elapsed * 14) * 0.1;
          obs.waterJetMesh.rotation.y = sweep;

          if (!obs.triggeredShout && dz < 0 && dz > -22) {
            obs.triggeredShout = true;
            onAddCalloutRef.current({
              text: 'PAANI CHHODO!',
              x: 68,
              y: 32,
              variant: 'speech',
            });
          }

          if (!obs.hitPlayer && Math.abs(dz - 5.5) < 2.1 && playerX > -3.5 && playerY < 1.8) {
            obs.hitPlayer = true;
            telemetry.waterCannonHits += 1;
            const loss = Math.round(18 * cfg.damageMultiplier);
            telemetry.josh = Math.max(0, telemetry.josh - loss);
            playerX = Math.max(-7.0, playerX - 2.3);
            cameraShake = 0.45;
            soundEngine.playWaterSplash();
            onAddCalloutRef.current({
              text: 'SPLASH! छपाक!',
              subtext: `-${loss}% जान`,
              x: 48,
              y: 44,
              variant: 'hit',
            });
          }
        }

        if (obs.type === 'sikh_squad' && !obs.hitPlayer) {
          if (Math.abs(dz) < 2.2 && Math.abs(playerX - obs.x) < 2.5) {
            obs.hitPlayer = true;
            const gain = Math.round(20 * cfg.joshBoostMultiplier);
            telemetry.josh = Math.min(100, telemetry.josh + gain);
            telemetry.sikhBoostsTaken += 1;
            telemetry.score += Math.round(50 * cfg.scoreMultiplier);
            soundEngine.playJoshBoost();
            onAddCalloutRef.current({
              text: `+${gain}% जान!`,
              subtext: 'BOLE SO NIHAAL · LANGAR SEVA',
              x: THREE.MathUtils.clamp(50 + obs.x * 4, 24, 76),
              y: 38,
              variant: 'sikh',
            });
          }
        }

        if (
          obs.type === 'barricade' ||
          obs.type === 'khaki_police' ||
          obs.type === 'orange_goon' ||
          obs.type === 'riot_police' ||
          obs.type === 'auto_rickshaw' ||
          obs.type === 'police_bus' ||
          obs.type === 'water_cannon'
        ) {
          const halfW = obs.width * 0.46;
          const halfD = obs.depth * 0.45;

          if (Math.abs(dz) < halfD + 0.45 && Math.abs(playerX - obs.x) < halfW + 0.38) {
            if (obs.type === 'barricade' && playerY > 0.88) {
              if (!obs.triggeredDodge) {
                obs.triggeredDodge = true;
                telemetry.barricadesJumped += 1;
                const pts = Math.round(25 * cfg.scoreMultiplier);
                telemetry.score += pts;
                soundEngine.playWhooshDodge();
                onAddCalloutRef.current({
                  text: 'JUMPED!',
                  subtext: `+${pts} अंक`,
                  x: 50,
                  y: 42,
                  variant: 'whoosh',
                });
              }
            } else if (!obs.hitPlayer && playerY < obs.height - 0.15) {
              obs.hitPlayer = true;
              const rawDamage =
                obs.type === 'barricade'
                  ? 16
                  : obs.type === 'police_bus' || obs.type === 'water_cannon'
                  ? 26
                  : 50;
              const actualLoss = Math.round(rawDamage * cfg.damageMultiplier);
              telemetry.josh = Math.max(0, telemetry.josh - actualLoss);

              hitstopTimer = 0.065;
              cameraShake = 0.65;
              playerVz = 5.5;
              soundEngine.playLathiHit();

              onAddCalloutRef.current({
                text: obs.type === 'barricade' ? 'CRASH! धड़ाम!' : 'ISHUM! लाठी प्रहार!',
                subtext: `-${actualLoss}% जान`,
                x: 50,
                y: 45,
                variant: 'hit',
              });
            }
          } else if (
            !obs.triggeredDodge &&
            !obs.hitPlayer &&
            dz > 0.6 &&
            dz < 2.5 &&
            Math.abs(playerX - obs.x) < halfW + 1.55
          ) {
            obs.triggeredDodge = true;
            telemetry.closeDodges += 1;
            const bonus = Math.round(15 * cfg.scoreMultiplier);
            telemetry.score += bonus;
            soundEngine.playWhooshDodge();
            onAddCalloutRef.current({
              text: telemetry.closeDodges % 2 === 0 ? 'WHOOSH!' : 'BACH GAYA!',
              subtext: `+${bonus} अंक`,
              x: THREE.MathUtils.clamp(50 + (playerX - obs.x) * 8, 25, 75),
              y: 44,
              variant: 'whoosh',
            });
          }
        }
      }

      // Update Distance Progress & Halfway Banner ("आधा रास्ता पार! / HALFWAY THERE!")
      const totalWorldLen = lvl.distanceM * Z_SCALE;
      const currentDistM = Math.min(
        lvl.distanceM,
        Math.max(0, Math.round(Math.abs(playerZ) / Z_SCALE))
      );
      if (currentDistM > telemetry.distanceM) {
        const deltaM = currentDistM - telemetry.distanceM;
        telemetry.distanceM = currentDistM;
        telemetry.score += Math.round(deltaM * 2 * cfg.scoreMultiplier);
      }

      if (!telemetry.halfwayShown && telemetry.distanceM >= Math.round(lvl.distanceM * 0.5)) {
        telemetry.halfwayShown = true;
        onAddCalloutRef.current({
          text: 'आधा रास्ता पार!',
          subtext: 'HALFWAY THERE! KEEP RUNNING!',
          x: 50,
          y: 26,
          variant: 'banner',
        });
      }

      // Check Arrest / Game Over (जान <= 0)
      if (telemetry.josh <= 0) {
        telemetry.josh = 0;
        soundEngine.playPoliceSiren();
        onAddCalloutRef.current({
          text: 'PAKDA GAYA! पकड़ा गया!',
          subtext: 'SIR, EK BYTE DE DIJIYE!',
          x: 50,
          y: 32,
          variant: 'arrest',
        });
        onTelemetryRef.current({ ...telemetry });
        onRunFinishedRef.current({ status: 'arrested', telemetry: { ...telemetry } });
        return;
      }

      // Check Victory (Reached Jantar Mantar Gate)
      if (Math.abs(playerZ) >= totalWorldLen) {
        telemetry.distanceM = lvl.distanceM;
        telemetry.score += Math.round(250 * cfg.scoreMultiplier);
        soundEngine.playVictoryFanfare();
        onTelemetryRef.current({ ...telemetry });
        onRunFinishedRef.current({ status: 'completed', telemetry: { ...telemetry } });
        return;
      }

      // Follow Camera with Decaying Shake & Dynamic Shadow Frustum Tracking
      cameraShake = Math.max(0, cameraShake - dt * 2.2);
      const shakeX = (Math.random() - 0.5) * cameraShake * 0.85;
      const shakeY = (Math.random() - 0.5) * cameraShake * 0.65;

      _camTargetPos.set(playerX * 0.55 + shakeX, 5.2 + playerY * 0.35 + shakeY, playerZ + 9.2);
      _camLookAt.set(playerX * 0.35, 1.6 + playerY * 0.2, playerZ - 12);

      camera.position.lerp(_camTargetPos, 0.16);
      camera.lookAt(_camLookAt);

      keyLight.position.set(playerX + 20, 38, playerZ + 22);
      keyLight.target.position.set(playerX, 0, playerZ - 14);
      keyLight.target.updateMatrixWorld();

      // Network Sync (18Hz) & React HUD Telemetry Sync (15Hz)
      netSyncTimer += dt;
      if (netSyncTimer >= 0.055) {
        netSyncTimer = 0;
        multiplayerClient.sendMove({
          x: playerX,
          y: playerY,
          z: playerZ,
          vx: playerVx,
          vy: playerVy,
          vz: playerVz,
          josh: telemetry.josh,
          score: telemetry.score,
          progress: telemetry.distanceM / lvl.distanceM,
          status: 'running',
        });
      }

      uiSyncTimer += dt;
      if (uiSyncTimer >= 0.065) {
        uiSyncTimer = 0;
        onTelemetryRef.current({ ...telemetry });
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 w-screen h-screen overflow-hidden z-0" />;
};
