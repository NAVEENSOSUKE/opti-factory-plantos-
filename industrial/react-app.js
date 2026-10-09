// react-app.js - Apex OptiFactory PlantOS Vibrant React & Three.js Cockpit
// Full Interactive Digital Twin, Live Industry Intelligence & Multi-Agent Pipeline

(function () {
  'use strict';

  const { useState, useEffect, useRef, useMemo, useCallback } = React;

  // --- AUDIO SYSTEM ---
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playAlertSound(type) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      if (type === 'estop') {
        [440, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          osc.frequency.exponentialRampToValueAtTime(freq / 2, now + idx * 0.15 + 0.4);
          gain.gain.setValueAtTime(0.25, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.4);
        });
      } else if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // ========================================================
  // 1. THREE.JS 3D DIGITAL TWIN FACTORY FLOOR COMPONENT
  // ========================================================
  function ThreeDigitalTwin({ isEStopActive, activeLineId, onSelectLine, onOpenTelemetryModal, incidentActive, incidentState, focusLineTrigger }) {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const animFrameRef = useRef(null);
    const [cameraPreset, setCameraPreset] = useState('overview');
    const [fps, setFps] = useState(60);

    const incidentActiveRef = useRef(incidentActive);
    incidentActiveRef.current = incidentActive;
    const incidentStateRef = useRef(incidentState);
    incidentStateRef.current = incidentState;

    // Target positions for camera presets
    const PRESETS = useMemo(() => ({
      overview: { pos: [0, 16, 26], look: [0, 2, 0] },
      line_a: { pos: [-11, 7, 12], look: [-10.5, 3, 0] },
      line_b: { pos: [-3.5, 7, 12], look: [-3.5, 3, 0] },
      line_c: { pos: [3.5, 7, 12], look: [3.5, 3, 0] },
      line_d: { pos: [10.5, 7, 12], look: [10.5, 3, 0] }
    }), []);

    const setCameraView = useCallback((presetKey) => {
      setCameraPreset(presetKey);
      const preset = PRESETS[presetKey];
      if (!preset || !cameraRef.current || !controlsRef.current) return;

      const cam = cameraRef.current;
      const ctrl = controlsRef.current;

      // Smooth camera transition
      const startPos = cam.position.clone();
      const endPos = new THREE.Vector3(...preset.pos);
      const startLook = ctrl.target.clone();
      const endLook = new THREE.Vector3(...preset.look);

      let t = 0;
      function animateCam() {
        t += 0.05;
        if (t <= 1) {
          cam.position.lerpVectors(startPos, endPos, t);
          ctrl.target.lerpVectors(startLook, endLook, t);
          requestAnimationFrame(animateCam);
        } else {
          cam.position.copy(endPos);
          ctrl.target.copy(endLook);
        }
      }
      animateCam();
    }, [PRESETS]);

    useEffect(() => {
      if (focusLineTrigger) {
        setCameraView('line_c');
      }
    }, [focusLineTrigger, setCameraView]);

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      // 1. Scene & Camera
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0x060913);
      scene.fog = new THREE.FogExp2(0x060913, 0.022);

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 480;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 100);
      camera.position.set(0, 16, 26);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // OrbitControls
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
      controls.minDistance = 6;
      controls.maxDistance = 45;
      controls.target.set(0, 2, 0);
      controlsRef.current = controls;

      // 2. Cyber Factory Floor Grid
      const grid = new THREE.GridHelper(50, 50, 0x00f5d4, 0x1e293b);
      grid.position.y = 0.01;
      scene.add(grid);

      const floorGeo = new THREE.PlaneGeometry(50, 50);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0a1020,
        roughness: 0.85,
        metalness: 0.2
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(12, 24, 15);
      dirLight.castShadow = true;
      scene.add(dirLight);

      // Station Point Lights
      const lightA = new THREE.PointLight(0x00f5d4, 1.8, 12);
      lightA.position.set(-10.5, 5, 0);
      scene.add(lightA);

      const lightB = new THREE.PointLight(0x38bdf8, 2.5, 12);
      lightB.position.set(-3.5, 5, 0);
      scene.add(lightB);

      const lightC = new THREE.PointLight(0xffb703, 2.2, 12);
      lightC.position.set(3.5, 5, 0);
      scene.add(lightC);

      const lightD = new THREE.PointLight(0x10b981, 1.8, 12);
      lightD.position.set(10.5, 5, 0);
      scene.add(lightD);

      // E-STOP Emergency Flasher Light
      const estopBeacon = new THREE.PointLight(0xff0054, 0, 30);
      estopBeacon.position.set(0, 8, 0);
      scene.add(estopBeacon);

      // 3. Central Animated Conveyor Belt
      const conveyorGroup = new THREE.Group();
      const railGeo = new THREE.BoxGeometry(32, 0.5, 2.2);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.y = 1.0;
      conveyorGroup.add(rail);

      // Glowing Neon Guide Strips along conveyor
      const stripMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
      const stripLeft = new THREE.Mesh(new THREE.BoxGeometry(32, 0.08, 0.08), stripMat);
      stripLeft.position.set(0, 1.3, -1.1);
      const stripRight = new THREE.Mesh(new THREE.BoxGeometry(32, 0.08, 0.08), stripMat);
      stripRight.position.set(0, 1.3, 1.1);
      conveyorGroup.add(stripLeft, stripRight);
      scene.add(conveyorGroup);

      // Traveling EV Drivetrain Pallets
      const pallets = [];
      const palletCount = 5;
      const palletGeo = new THREE.BoxGeometry(1.6, 0.35, 1.4);
      const batteryGeo = new THREE.BoxGeometry(1.2, 0.45, 1.0);
      const palletMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
      const batteryMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 });

      for (let i = 0; i < palletCount; i++) {
        const pGroup = new THREE.Group();
        const base = new THREE.Mesh(palletGeo, palletMat);
        const batt = new THREE.Mesh(batteryGeo, batteryMat);
        batt.position.y = 0.4;
        pGroup.add(base, batt);
        pGroup.position.set(-14 + i * 6.5, 1.45, 0);
        scene.add(pGroup);
        pallets.push(pGroup);
      }

      // 4. WORKSTATION A: 1200T HYDRAULIC STAMPING PRESS
      const stationAGroup = new THREE.Group();
      stationAGroup.name = 'line_a';
      stationAGroup.position.set(-10.5, 0, 0);

      // 4 Pillars
      const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 16);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
      [[-1.2, -1.2], [-1.2, 1.2], [1.2, -1.2], [1.2, 1.2]].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, 3, pz);
        stationAGroup.add(pillar);
      });

      // Upper Crown & Bed
      const crownMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 3.2), crownMat);
      crown.position.y = 5.8;
      const bed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 3.2), crownMat);
      bed.position.y = 0.4;
      stationAGroup.add(crown, bed);

      // Hydraulic Moving Ram
      const ramMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.4), new THREE.MeshStandardMaterial({ color: 0x00f5d4, metalness: 0.9 }));
      ramMesh.position.y = 4.2;
      stationAGroup.add(ramMesh);
      scene.add(stationAGroup);

      // 5. WORKSTATION B: 6-AXIS ROBOTIC WELDING CELL (ABB / KUKA)
      const stationBGroup = new THREE.Group();
      stationBGroup.name = 'line_b';
      stationBGroup.position.set(-3.5, 0, 0);

      const kukaMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.7, roughness: 0.3 }); // Vibrant Orange
      const jointMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });

      const rBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.8, 20), jointMat);
      rBase.position.y = 0.4;
      stationBGroup.add(rBase);

      const rTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.9, 20), kukaMat);
      rTurret.position.y = 1.25;
      stationBGroup.add(rTurret);

      const rLowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.4, 0.6), kukaMat);
      rLowerArm.position.set(0, 2.6, 0.2);
      rLowerArm.rotation.x = 0.3;
      stationBGroup.add(rLowerArm);

      const rForeArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 0.5), kukaMat);
      rForeArm.position.set(0, 4.2, 0.9);
      rForeArm.rotation.x = -0.7;
      stationBGroup.add(rForeArm);

      const rWelderTorch = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 12), jointMat);
      rWelderTorch.position.set(0, 3.5, 1.8);
      rWelderTorch.rotation.x = 1.2;
      stationBGroup.add(rWelderTorch);

      // Dynamic Welding Sparks Particle System
      const sparksCount = 45;
      const sparkGeo = new THREE.BufferGeometry();
      const sparkPositions = new Float32Array(sparksCount * 3);
      for (let i = 0; i < sparksCount * 3; i++) sparkPositions[i] = (Math.random() - 0.5) * 0.3;
      sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
      const sparkMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.12, transparent: true, opacity: 0.9 });
      const sparksMesh = new THREE.Points(sparkGeo, sparkMat);
      sparksMesh.position.set(-3.5, 1.6, 1.6);
      scene.add(sparksMesh);
      scene.add(stationBGroup);

      // 6. WORKSTATION C: POWERTRAIN & VIBRATORY FEEDER (BOTTLENECK WARNING)
      const stationCGroup = new THREE.Group();
      stationCGroup.name = 'line_c';
      stationCGroup.position.set(3.5, 0, 0);

      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
      const feederBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.0, 1.6, 24), bowlMat);
      feederBowl.position.set(-1.0, 1.8, 1.6);
      stationCGroup.add(feederBowl);

      const feederChute = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.4), jointMat);
      feederChute.position.set(0, 1.9, 0.8);
      feederChute.rotation.z = -0.2;
      stationCGroup.add(feederChute);

      // Holographic Rotating Warning Halo above Station C
      const haloGeo = new THREE.TorusGeometry(1.6, 0.08, 12, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xffb703, wireframe: true });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(0, 5.2, 0);
      haloMesh.rotation.x = Math.PI / 2;
      stationCGroup.add(haloMesh);

      // Dedicated Line C Incident Warning Light & 3D Floating Alert Beacon
      const lineCAlertLight = new THREE.PointLight(0xff0054, 0, 16);
      lineCAlertLight.position.set(3.5, 6.2, 0);
      scene.add(lineCAlertLight);

      const lineCBeaconGroup = new THREE.Group();
      lineCBeaconGroup.position.set(3.5, 6.6, 0);
      const beaconGeo = new THREE.OctahedronGeometry(0.55);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0xff0054,
        emissive: 0xff0054,
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffb703, wireframe: true });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      lineCBeaconGroup.add(beaconMesh, ringMesh);
      lineCBeaconGroup.visible = false;
      scene.add(lineCBeaconGroup);

      scene.add(stationCGroup);

      // 7. WORKSTATION D: AUTOMATED PAINT & COGNEX 3D VISION QA TUNNEL
      const stationDGroup = new THREE.Group();
      stationDGroup.name = 'line_d';
      stationDGroup.position.set(10.5, 0, 0);

      const tunnelMat = new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85
      });
      const tunnel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.4, 3.2), tunnelMat);
      tunnel.position.y = 2.4;
      stationDGroup.add(tunnel);

      // Sweeping 3D Vision Laser Scanner Beam
      const laserGeo = new THREE.PlaneGeometry(0.12, 2.6);
      const laserMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
      const laserBeam = new THREE.Mesh(laserGeo, laserMat);
      laserBeam.rotation.x = Math.PI / 2;
      laserBeam.position.set(0, 1.5, 0);
      stationDGroup.add(laserBeam);
      scene.add(stationDGroup);

      // Interactive Raycaster for Machine Selection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      function onCanvasClick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const checkObjects = [stationAGroup, stationBGroup, stationCGroup, stationDGroup];
        const intersects = raycaster.intersectObjects(checkObjects, true);

        if (intersects.length > 0) {
          let root = intersects[0].object;
          while (root.parent && !['line_a', 'line_b', 'line_c', 'line_d'].includes(root.name)) {
            root = root.parent;
          }
          if (root && root.name) {
            onSelectLine(root.name);
            setCameraView(root.name);
            onOpenTelemetryModal(root.name);
            playAlertSound('beep');
          }
        }
      }

      renderer.domElement.addEventListener('click', onCanvasClick);

      // Handle Resize
      function onResize() {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      // Animation Loop
      let clock = new THREE.Clock();
      let frames = 0;
      let lastFpsCheck = performance.now();

      function animate() {
        animFrameRef.current = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // FPS counter
        frames++;
        if (performance.now() - lastFpsCheck >= 1000) {
          setFps(frames);
          frames = 0;
          lastFpsCheck = performance.now();
        }

        controls.update();

        // E-STOP BEHAVIOR
        if (isEStopActive) {
          estopBeacon.intensity = Math.sin(time * 12) > 0 ? 5.0 : 0.0;
          stripLeft.material.color.setHex(0xff0054);
          stripRight.material.color.setHex(0xff0054);
          renderer.render(scene, camera);
          return; // Freeze all machine animations during E-STOP
        } else {
          estopBeacon.intensity = 0;
          stripLeft.material.color.setHex(0x00f5d4);
          stripRight.material.color.setHex(0x00f5d4);
        }

        // 1. Hydraulic Stamping Ram Motion (Line A)
        const ramY = 4.2 - Math.abs(Math.sin(time * 2.2)) * 1.8;
        ramMesh.position.y = ramY;

        // 2. Robotic Arm Motion & Welding Sparks (Line B)
        rTurret.rotation.y = Math.sin(time * 1.8) * 0.45;
        rForeArm.rotation.x = -0.7 + Math.cos(time * 2.5) * 0.25;

        // Welding sparks emission
        if (Math.sin(time * 3.5) > 0.2) {
          lightB.intensity = 3.5 + Math.random() * 2.5;
          sparksMesh.visible = true;
          const pos = sparkGeo.attributes.position.array;
          for (let i = 0; i < sparksCount * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 0.8;
            pos[i + 1] = Math.random() * 0.9;
            pos[i + 2] = (Math.random() - 0.5) * 0.8;
          }
          sparkGeo.attributes.position.needsUpdate = true;
        } else {
          lightB.intensity = 1.2;
          sparksMesh.visible = false;
        }

        // 3. Vibratory Feeder Vibration & Warning Halo (Line C)
        haloMesh.rotation.z += 0.04;
        
        const isLineCIncident = Boolean(incidentActiveRef.current);
        if (isLineCIncident) {
          const alertPulse = Math.sin(time * 8);
          lineCAlertLight.intensity = alertPulse > 0 ? 5.5 : 1.2;
          haloMesh.material.color.setHex(alertPulse > 0 ? 0xff0054 : 0xffb703);
          lineCBeaconGroup.visible = true;
          lineCBeaconGroup.rotation.y += 0.04;
          ringMesh.rotation.z += 0.06;
          lineCBeaconGroup.position.y = 6.6 + Math.sin(time * 4) * 0.2;
          
          // Enhanced vibration anomaly amplitude unless under maintenance
          const vibAmp = incidentStateRef.current === 'MAINTENANCE' ? 0.006 : 0.065;
          feederBowl.position.x = -1.0 + (Math.random() - 0.5) * vibAmp;
        } else {
          lineCAlertLight.intensity = 0;
          haloMesh.material.color.setHex(0xffb703);
          lineCBeaconGroup.visible = false;
          feederBowl.position.x = -1.0 + (Math.random() - 0.5) * 0.03;
        }

        // 4. Sweeping Vision Laser (Line D)
        laserBeam.position.x = Math.sin(time * 3.0) * 1.4;

        // 5. Pallets Conveyor Flow
        pallets.forEach(p => {
          p.position.x += 0.055;
          if (p.position.x > 15) p.position.x = -15;
        });

        renderer.render(scene, camera);
      }

      animate();

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('click', onCanvasClick);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    }, [isEStopActive, onSelectLine, onOpenTelemetryModal]);

    return (
      <section className="three-viewport-section" aria-label="Interactive 3D Digital Twin Cockpit">
        <div className="three-viewport-header">
          <div className="three-title-left">
            <h2><span>🏭</span> 3D Digital Twin Factory Floor</h2>
            <span className="three-badge-3d">THREE.JS 3D ENGINE ACTIVE</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            INTERACTIVE KINEMATICS • RAYCAST MACHINE INSPECTOR
          </div>
        </div>

        <div className="three-canvas-container" ref={mountRef}>
          {/* Floating 3D HUD Camera Controls */}
          <div className="three-hud-controls">
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '700' }}>CAMERA:</span>
            <button className={`three-cam-btn ${cameraPreset === 'overview' ? 'active' : ''}`} onClick={() => setCameraView('overview')}>
              🌐 Wide View
            </button>
            <button className={`three-cam-btn ${cameraPreset === 'line_a' ? 'active' : ''}`} onClick={() => setCameraView('line_a')}>
              🗜️ Line A Press
            </button>
            <button className={`three-cam-btn ${cameraPreset === 'line_b' ? 'active' : ''}`} onClick={() => setCameraView('line_b')}>
              ⚡ Line B Robot
            </button>
            <button className={`three-cam-btn ${cameraPreset === 'line_c' ? 'active' : ''} ${incidentActive ? 'active-pulse' : ''}`} onClick={() => setCameraView('line_c')}>
              {incidentActive ? '🚨 Line C Anomaly' : '⚠️ Line C Bottleneck'}
            </button>
            <button className={`three-cam-btn ${cameraPreset === 'line_d' ? 'active' : ''}`} onClick={() => setCameraView('line_d')}>
              👁️ Line D Vision QA
            </button>
          </div>

          {/* Floating 3D Telemetry HUD Pill */}
          <div className="three-hud-status-badge">
            <span className="ticker-live-dot"></span>
            <span>{isEStopActive ? '🚨 DRIVE INTERLOCK ENGAGED' : `STABLE • ${fps} FPS`}</span>
          </div>
        </div>

        {/* 3D Legend Strip */}
        <div className="three-legend-strip">
          <div className="three-legend-item">
            <div className="three-legend-color" style={{ background: '#0284c7' }}></div>
            <span>Line A: 1200T Hydraulic Press</span>
          </div>
          <div className="three-legend-item">
            <div className="three-legend-color" style={{ background: '#f97316' }}></div>
            <span>Line B: 6-Axis Spot Welder & Laser Arc</span>
          </div>
          <div className="three-legend-item">
            <div className="three-legend-color" style={{ background: '#ffb703' }}></div>
            <span>Line C: Powertrain Feeder (Bottleneck)</span>
          </div>
          <div className="three-legend-item">
            <div className="three-legend-color" style={{ background: '#10b981' }}></div>
            <span>Line D: Cognex 3D AI Laser Tunnel</span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>Tip: Click any 3D machine to zoom and inspect SOP</span>
        </div>
      </section>
    );
  }

  // ========================================================
  // 2. INCIDENT RESPONSE WORKFLOW & TELEMETRY COMPONENTS
  // ========================================================

  // 2.1 TELEMETRY TIMELINE & SVG WAVEFORM CHART
  function TelemetryChart({ timeline, currentVal, thresholdVal }) {
    const points = timeline && timeline.length ? timeline : [
      { time: "09:40", value: 2.1 },
      { time: "09:41", value: 2.3 },
      { time: "09:42", value: 2.7 },
      { time: "09:43", value: 3.1 },
      { time: "09:44", value: 3.8 },
      { time: "09:45", value: 4.2 }
    ];

    const minV = 1.5;
    const maxV = 4.6;
    const range = maxV - minV;
    const chartW = 520;
    const chartH = 110;
    const startX = 35;
    const stepX = (chartW - startX - 25) / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = startX + idx * stepX;
      const y = chartH - ((p.value - minV) / range) * 80 - 14;
      return { x, y, ...p };
    });

    const pathD = coords.reduce((acc, c, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`, '');
    const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)},${chartH} L ${coords[0].x.toFixed(1)},${chartH} Z`;
    const thresholdY = (chartH - ((thresholdVal - minV) / range) * 80 - 14).toFixed(1);

    return (
      <div className="telemetry-chart-wrapper">
        <svg className="svg-telemetry-chart" viewBox={`0 0 ${chartW} ${chartH + 26}`}>
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0054" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ffb703" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="60%" stopColor="#ffb703" />
              <stop offset="100%" stopColor="#ff0054" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[2.0, 3.0, 4.0].map((gl, gIdx) => {
            const gy = (chartH - ((gl - minV) / range) * 80 - 14).toFixed(1);
            return (
              <g key={gIdx}>
                <line x1={startX} y1={gy} x2={chartW - 20} y2={gy} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x="5" y={Number(gy) + 3} fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="var(--font-mono)">{gl}</text>
              </g>
            );
          })}

          {/* Safe Threshold Danger Line */}
          <line x1={startX} y1={thresholdY} x2={chartW - 20} y2={thresholdY} stroke="#ff0054" strokeWidth="1.5" strokeDasharray="5 3" />
          <text x={chartW - 215} y={Number(thresholdY) - 5} fill="#ff0054" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)">
            THRESHOLD: {thresholdVal} mm/s (ISO 10816 Zone C Alert)
          </text>

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#chartAreaGrad)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="url(#chartLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Text */}
          {coords.map((c, idx) => {
            const isCritical = c.value > thresholdVal;
            return (
              <g key={idx}>
                <circle cx={c.x} cy={c.y} r={isCritical ? "5" : "3.5"} fill={isCritical ? "#ff0054" : "#00f5d4"} stroke="#fff" strokeWidth="1.5" />
                <text x={c.x} y={c.y - 7} fill={isCritical ? "#ff0054" : "#a5f3fc"} fontSize="9.5" fontWeight="800" fontFamily="var(--font-mono)" textAnchor="middle">
                  {c.value}
                </text>
                <text x={c.x} y={chartH + 16} fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
                  {c.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  // 2.2 INCIDENT HERO RIBBON (At-a-glance < 5s)
  function IncidentHeroRibbon({ incident, backendConnected, aiStatus, onOpenCenter, onStartDemo, isDemoRunning, onStopDemo, onResetIncident }) {
    if (!incident) return null;

    const isResolved = incident.state === 'RESOLVED';
    const isLlm = aiStatus?.mode === 'LLM';

    return (
      <aside className={`incident-hero-ribbon ${isResolved ? 'resolved-banner' : ''}`} role="alert" aria-label="Line C Incident Alert Banner">
        <div className="incident-hero-left">
          <div className="incident-beacon-badge">
            <span className={`incident-beacon-dot ${isResolved ? 'resolved-dot' : ''}`}></span>
            <span>{isResolved ? 'INCIDENT RESOLVED' : 'CRITICAL INCIDENT'} • {incident.id}</span>
          </div>

          <div className="incident-glance-metrics">
            <div className="glance-chip">
              <span className="glance-chip-label">Target Line</span>
              <span className="glance-chip-val" style={{ color: 'var(--neon-cyan)' }}>{incident.line} (Powertrain)</span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">Anomaly</span>
              <span className="glance-chip-val">{incident.type}</span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">Vibration (RMS)</span>
              <span className={`glance-chip-val ${incident.value > incident.threshold ? 'critical' : ''}`} style={{ color: incident.value <= incident.threshold ? '#34d399' : undefined }}>
                {incident.value} mm/s
              </span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">Safe Threshold</span>
              <span className="glance-chip-val" style={{ color: 'var(--neon-amber)' }}>&le; {incident.threshold} mm/s</span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">Severity</span>
              <span className="glance-chip-val high">{incident.severity}</span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">Stage</span>
              <span className="glance-chip-val" style={{ color: '#fff' }}>{incident.state}</span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">Backend</span>
              <span className="glance-chip-val" style={{ color: backendConnected ? '#00f5d4' : '#f59e0b', fontSize: '0.74rem' }}>
                {backendConnected ? '● CONNECTED' : '○ LOCAL MODE'}
              </span>
            </div>
            <div className="glance-chip">
              <span className="glance-chip-label">AI Engine</span>
              <span className="glance-chip-val" style={{ color: isLlm ? '#a78bfa' : '#38bdf8', fontSize: '0.74rem' }}>
                {isLlm ? `● LLM CONNECTED (${(aiStatus?.provider || 'GROQ').toUpperCase()})` : '● LOCAL REASONING'}
              </span>
            </div>
          </div>
        </div>

        <div className="incident-hero-actions">
          <button className="btn-incident-sim" onClick={onOpenCenter} title="Focus interactive incident cockpit">
            <span>🚨</span> Incident Cockpit
          </button>
          {isDemoRunning ? (
            <button className="btn-incident-demo running" onClick={onStopDemo} title="Stop automated demo sequence">
              <span>⏹️</span> Stop Demo
            </button>
          ) : (
            <button className="btn-incident-demo" onClick={onStartDemo} title="Execute complete 23s incident-response demo">
              <span>🎬</span> Run Demo
            </button>
          )}
          <button className="btn-incident-reset" onClick={onResetIncident} title="Reset incident and restore nominal state">
            <span>🔄</span> Reset
          </button>
        </div>
      </aside>
    );
  }

  // 2.3 INCIDENT CENTER COCKPIT COMPONENT
  function IncidentCenter({
    incident,
    incidentState,
    workflowData,
    backendConnected,
    aiStatus,
    onAdvanceState,
    onStartMaintenance,
    maintenanceProgress,
    verificationVibration,
    onCloseIncident,
    onResetIncident,
    onStartDemo,
    onStopDemo,
    isDemoRunning,
    onOpenHistory,
    traceLogs,
    onOpenTraceModal,
    onClosePanel
  }) {
    if (!incident) return null;

    const data = workflowData || window.INDUSTRY_KNOWLEDGE?.getIncidentWorkflowDefinition() || {};
    const specialist = data.specialistAnalysis || {};
    const grounding = data.grounding || {};
    const consensus = data.consensus || {};
    const actionPlan = data.actionPlan || [];

    const STEPS = [
      { key: 'DETECTED', label: '1. DETECTED', icon: '🚨' },
      { key: 'ANALYZING', label: '2. ANALYSIS', icon: '🔬' },
      { key: 'CONSENSUS', label: '3. CONSENSUS', icon: '👥' },
      { key: 'ACTION_REQUIRED', label: '4. ACTION', icon: '⚡' },
      { key: 'MAINTENANCE', label: '5. MAINTENANCE', icon: '🛠️' },
      { key: 'VERIFICATION', label: '6. VERIFY', icon: '📐' },
      { key: 'RESOLVED', label: '7. RESOLVED', icon: '✅' }
    ];

    const currentStepIdx = STEPS.findIndex(s => s.key === incidentState);

    const curVib = incidentState === 'VERIFICATION' || incidentState === 'RESOLVED' 
      ? verificationVibration 
      : incident.value;

    const isLlm = aiStatus?.mode === 'LLM';

    return (
      <section className={`incident-center-container ${incidentState !== 'RESOLVED' ? 'active-threat' : ''}`} aria-label="Incident Response Cockpit">
        
        {/* Header Bar */}
        <div className="incident-center-header">
          <div className="incident-center-title-group">
            <h2>
              <span>🚨</span>
              <span>Industrial Incident Response Cockpit — {incident.line}</span>
            </h2>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>INCIDENT ID: <strong style={{ color: 'var(--neon-cyan)' }}>{incident.id}</strong> • TARGET: <strong>{incident.machine}</strong> • DETECTED: <strong>{incident.detectedAt}</strong></span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.62rem',
                fontWeight: '700',
                border: backendConnected ? '1px solid rgba(0, 245, 212, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                background: backendConnected ? 'rgba(0, 245, 212, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: backendConnected ? 'var(--neon-cyan)' : 'var(--neon-amber)'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: backendConnected ? '#00f5d4' : '#f59e0b' }}></span>
                {backendConnected ? 'BACKEND ● CONNECTED' : 'BACKEND ○ LOCAL MODE'}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.62rem',
                fontWeight: '700',
                border: isLlm ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                background: isLlm ? 'rgba(167, 139, 250, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                color: isLlm ? '#c4b5fd' : '#7dd3fc'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isLlm ? '#a78bfa' : '#38bdf8' }}></span>
                {isLlm ? `AI ENGINE ● LLM CONNECTED (${(aiStatus?.provider || 'GROQ').toUpperCase()})` : 'AI ENGINE ● LOCAL REASONING'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isDemoRunning ? (
              <button className="btn-incident-demo running" onClick={onStopDemo}>
                <span>⏹️</span> Stop Demo
              </button>
            ) : (
              <button className="btn-incident-demo" onClick={onStartDemo}>
                <span>🎬</span> Start Demo Mode
              </button>
            )}
            <button className="btn-incident-sim" onClick={() => onAdvanceState('DETECTED')}>
              <span>⚡</span> Simulate Line C
            </button>
            <button className="ticker-btn" onClick={onOpenHistory} title="View all persisted past incidents">
              <span>📋</span> Incident History
            </button>
            <button className="btn-incident-reset" onClick={onResetIncident}>
              <span>🔄</span> Reset Incident
            </button>
            {onClosePanel && (
              <button className="close-drawer-btn" onClick={onClosePanel} title="Minimize Cockpit">✕</button>
            )}
          </div>
        </div>

        {/* 7-Stage State Machine Stepper */}
        <nav className="incident-stepper-bar" aria-label="Incident Lifecycle Stepper">
          {STEPS.map((s, idx) => {
            const isActive = s.key === incidentState;
            const isCompleted = currentStepIdx > idx;
            const isCritical = isActive && (s.key === 'DETECTED' || s.key === 'ANALYZING');
            return (
              <React.Fragment key={s.key}>
                <div className={`stepper-node ${isActive ? 'active' : ''} ${isCritical ? 'critical' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <span>{isCompleted ? '✓' : (isActive ? '●' : '○')}</span>
                  <span>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && <span className="stepper-arrow">➔</span>}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Workflow Split Layout */}
        <div className="incident-workflow-grid">
          
          {/* LEFT COLUMN: Telemetry, AI Specialist & Web Grounding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 1. Telemetry Timeline & Waveform */}
            <div className="workflow-section-box">
              <div className="workflow-section-hdr">
                <h3><span>📊</span> Stage 2: Telemetry Analysis & Anomaly Trend</h3>
                <span className={`status-pill ${curVib > incident.threshold ? 'warning' : 'running'}`} style={{ fontSize: '0.66rem' }}>
                  ● {curVib > incident.threshold ? 'CRITICAL EXCURSION' : 'NORMALIZED'}
                </span>
              </div>

              {/* KPI Bar */}
              <div className="telemetry-metrics-bar">
                <div className={`telemetry-pill-stat ${curVib > incident.threshold ? 'critical' : ''}`}>
                  <div className="telemetry-stat-label">CURRENT</div>
                  <div className="telemetry-stat-val" style={{ color: curVib > incident.threshold ? '#ff0054' : '#34d399' }}>
                    {curVib} mm/s
                  </div>
                </div>
                <div className="telemetry-pill-stat warning">
                  <div className="telemetry-stat-label">THRESHOLD</div>
                  <div className="telemetry-stat-val" style={{ color: 'var(--neon-amber)' }}>{incident.threshold} mm/s</div>
                </div>
                <div className="telemetry-pill-stat">
                  <div className="telemetry-stat-label">PEAK</div>
                  <div className="telemetry-stat-val">{incident.peakValue} mm/s</div>
                </div>
                <div className="telemetry-pill-stat">
                  <div className="telemetry-stat-label">TREND</div>
                  <div className="telemetry-stat-val" style={{ color: curVib > incident.threshold ? '#ff0054' : '#34d399' }}>
                    {curVib > incident.threshold ? '↑ +37%' : '↓ -35%'}
                  </div>
                </div>
                <div className="telemetry-pill-stat">
                  <div className="telemetry-stat-label">STATUS</div>
                  <div className="telemetry-stat-val" style={{ color: curVib > incident.threshold ? '#ff0054' : '#34d399' }}>
                    {curVib > incident.threshold ? 'CRITICAL' : 'SAFE'}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <TelemetryChart 
                timeline={data.telemetryTimeline} 
                currentVal={curVib} 
                thresholdVal={incident.threshold} 
              />
            </div>

            {/* 2. Specialist AI Analysis (Elena Rostova) */}
            <div className="workflow-section-box">
              <div className="workflow-section-hdr">
                <h3><span>🔬</span> Stage 3: Specialist AI Analysis</h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>CONFIDENCE: {specialist.confidence || '94%'}</span>
              </div>

              <div className="specialist-card-box">
                <div className="specialist-header-row">
                  <div className="specialist-avatar">🔬</div>
                  <div className="specialist-info">
                    <h4>{specialist.specialistName || 'Elena Rostova'}</h4>
                    <span>{specialist.role || 'Lead Reliability & Vibration Specialist'} • ISO 18436 Cat IV</span>
                  </div>
                </div>

                <div className="specialist-diagnosis-text">
                  <strong>ANALYSIS:</strong> "{specialist.analysis}"
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '700' }}>
                  POSSIBLE ROOT CAUSES:
                </div>
                <div className="causes-chips-list">
                  {(specialist.possibleCauses || []).map((cause, cIdx) => (
                    <span key={cIdx} className="cause-tag">• {cause}</span>
                  ))}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#e2e8f0', background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '4px', borderLeft: '3px solid var(--neon-cyan)' }}>
                  <strong>RECOMMENDED NEXT STEP:</strong> {specialist.recommendedNextStep}
                </div>
              </div>
            </div>

            {/* 3. Web Specification Grounding */}
            <div className="workflow-section-box">
              <div className="workflow-section-hdr">
                <h3><span>🌐</span> Stage 4: Industrial Web Specification Grounding</h3>
                <span className="grounding-complete-badge">✓ SPECIFICATION GROUNDING COMPLETE</span>
              </div>

              <div className="grounding-verified-card">
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                  GROUNDING PIPELINE: TELEMETRY ➔ EQUIPMENT ID ➔ SPEC MATCH ➔ AI REASONING
                </div>

                <div className="grounding-pipeline-steps">
                  <div className="grounding-step-box">
                    <span style={{ color: 'var(--text-muted)' }}>TELEMETRY:</span> <strong style={{ color: '#ff0054' }}>4.2 mm/s RMS</strong>
                  </div>
                  <span style={{ color: 'var(--neon-cyan)' }}>➔</span>
                  <div className="grounding-step-box">
                    <span style={{ color: 'var(--text-muted)' }}>EQUIPMENT:</span> <strong>{grounding.equipment}</strong>
                  </div>
                  <span style={{ color: 'var(--neon-cyan)' }}>➔</span>
                  <div className="grounding-step-box">
                    <span style={{ color: 'var(--text-muted)' }}>KNOWLEDGE MATCH:</span> <strong style={{ color: 'var(--neon-cyan)' }}>ISO 10816-3 & IFM VVB001</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.45', margin: '8px 0 0' }}>
                  {grounding.groundingSummary}
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Multi-Agent Consensus, Action Plan, Verification & Trace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 4. Multi-Agent Roundtable Consensus */}
            <div className="workflow-section-box">
              <div className="workflow-section-hdr">
                <h3><span>👥</span> Stage 5: Multi-Agent Industrial Consensus</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
                  5 INDUSTRIAL PERSONAS CONVENED
                </span>
              </div>

              <div className="consensus-agents-grid">
                {(consensus.agents || []).map(agent => (
                  <div key={agent.id} className="consensus-agent-row">
                    <span className="agent-icon-badge">{agent.avatar}</span>
                    <div className="agent-statement-col">
                      <strong style={{ color: agent.badgeColor }}>
                        {agent.name} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({agent.role})</span>
                      </strong>
                      <p>"{agent.opinion}"</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consensus Result Card */}
              <div className="consensus-result-card">
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    CONSENSUS RESULT
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: '800', marginTop: '2px' }}>
                    {consensus.result?.recommendedAction}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', display: 'block' }}>PRIORITY</span>
                    <span style={{ color: '#ff0054', fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                      {consensus.result?.priority}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', display: 'block' }}>CONFIDENCE</span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                      {consensus.result?.confidence}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Action Plan & Maintenance State Machine */}
            <div className="workflow-section-box">
              <div className="workflow-section-hdr">
                <h3><span>⚡</span> Stage 6: Actionable Maintenance Plan & Execution</h3>
                <span style={{ fontSize: '0.7rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>CURRENT: {incidentState}</span>
              </div>

              {/* Step Checklist */}
              <div className="action-plan-steps">
                {actionPlan.map(item => {
                  const isDone = incidentState === 'RESOLVED' || 
                    (incidentState === 'VERIFICATION' && item.step <= 5) || 
                    (incidentState === 'MAINTENANCE' && item.step <= Math.floor(maintenanceProgress / 20));
                  return (
                    <div key={item.step} className={`action-step-item ${isDone ? 'completed' : ''}`}>
                      <span className="action-step-num">{isDone ? '✓' : `[${item.step}]`}</span>
                      <div>
                        <strong style={{ color: isDone ? '#10b981' : '#fff' }}>{item.text}</strong>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Maintenance Progress Simulation */}
              {incidentState === 'MAINTENANCE' && (
                <div className="maintenance-progress-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                    <span style={{ color: '#ffd166', fontWeight: '700' }}>🛠️ Active Maintenance in Progress...</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: '800' }}>{maintenanceProgress}%</span>
                  </div>
                  <div className="maint-progress-track">
                    <div className="maint-progress-bar-fill" style={{ width: `${maintenanceProgress}%` }}></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {maintenanceProgress < 30 ? '1. Safety isolation (LOTO) interlocks engaged.' :
                     maintenanceProgress < 70 ? '2. Feeder bearing assembly inspected & greased.' :
                     maintenanceProgress < 95 ? '3. Base fasteners re-torqued to 85 Nm.' :
                     '4. Optical guide chute cleared. Ready for verification run.'}
                  </div>
                </div>
              )}

              {/* Verification Decay Display */}
              {(incidentState === 'VERIFICATION' || incidentState === 'RESOLVED') && (
                <div className="verification-live-row">
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                      POST-MAINTENANCE VERIFICATION
                    </span>
                    <strong style={{ color: curVib <= incident.threshold ? '#10b981' : '#ffb703', fontSize: '0.92rem' }}>
                      {curVib <= incident.threshold ? 'VERIFICATION COMPLETE: SAFE OPERATIONAL CADENCE' : 'VIBRATION DECAY IN PROGRESS...'}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>VIBRATION</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: '800', color: curVib <= incident.threshold ? '#10b981' : '#ff0054' }}>
                      {curVib} mm/s
                    </span>
                  </div>
                </div>
              )}

              {/* Resolved Summary Box */}
              {incidentState === 'RESOLVED' && (
                <div className="resolution-summary-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#10b981', fontSize: '0.88rem' }}>🎉 INCIDENT RESOLVED & LOGGED</strong>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--neon-cyan)' }}>Downtime: 14 min</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    <strong>Root Cause:</strong> Mechanical vibration / bearing inspection & mount re-torque.<br/>
                    <strong>Resolution:</strong> Maintenance completed. Vibration decayed to 2.7 mm/s (&le; 3.5 mm/s ISO limit). Line C operational.
                  </div>
                </div>
              )}

              {/* Interactive Workflow Trigger Buttons */}
              <div className="action-buttons-row">
                {incidentState === 'DETECTED' && (
                  <button className="btn-primary" onClick={() => onAdvanceState('ANALYZING')}>
                    <span>🔬</span> Proceed to Telemetry & AI Analysis
                  </button>
                )}

                {incidentState === 'ANALYZING' && (
                  <button className="btn-primary" onClick={() => onAdvanceState('CONSENSUS')}>
                    <span>👥</span> Convene Multi-Agent Roundtable
                  </button>
                )}

                {incidentState === 'CONSENSUS' && (
                  <button className="btn-primary" onClick={() => onAdvanceState('ACTION_REQUIRED')}>
                    <span>⚡</span> Dispatch Action Plan
                  </button>
                )}

                {incidentState === 'ACTION_REQUIRED' && (
                  <>
                    <button className="btn-start-maint" onClick={onStartMaintenance}>
                      <span>🛠️</span> START MAINTENANCE
                    </button>
                    <button className="btn-ack-incident" onClick={() => onAdvanceState('ACKNOWLEDGED')}>
                      <span>📝</span> ACKNOWLEDGE INCIDENT
                    </button>
                  </>
                )}

                {incidentState === 'VERIFICATION' && (
                  <button 
                    className="btn-close-incident" 
                    disabled={curVib > incident.threshold} 
                    onClick={onCloseIncident}
                  >
                    <span>✅</span> CLOSE INCIDENT
                  </button>
                )}

                {incidentState === 'RESOLVED' && (
                  <button className="btn-incident-reset" onClick={onResetIncident}>
                    <span>🔄</span> Clear Incident / Normal State
                  </button>
                )}
              </div>
            </div>

            {/* 6. Incident Real-Time Execution Trace Terminal */}
            <div className="workflow-section-box">
              <div className="workflow-section-hdr">
                <h3><span>📜</span> Stage 7: Execution Trace & SCADA Dispatch Log</h3>
                <button className="ticker-btn" style={{ padding: '2px 8px', fontSize: '0.66rem' }} onClick={onOpenTraceModal}>
                  <span>🔍</span> Full Trace Modal
                </button>
              </div>

              <div className="incident-trace-terminal">
                {traceLogs && traceLogs.length ? traceLogs.map((log, lIdx) => (
                  <div key={lIdx} className="trace-line-row">
                    <span className="trace-line-timestamp">[{log.time}]</span>
                    <span className="trace-line-tag">[{log.tag}]</span>
                    <span>{log.message}</span>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-dim)' }}>Awaiting telemetry alert events...</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </section>
    );
  }

  // 2.4 INCIDENT HISTORY MODAL
  function IncidentHistoryModal({ isOpen, onClose, incidents, onSelectIncident, onClearHistory }) {
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filtered = (incidents || []).filter(item => {
      const q = search.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.line.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });

    return (
      <div className="modal-overlay open" role="dialog" aria-modal="true">
        <div className="modal-content-box" style={{ maxWidth: '820px' }}>
          <div className="modal-header">
            <h3><span>📋</span> Plant Incident & Downtime History</h3>
            <button className="close-drawer-btn" onClick={onClose}>✕</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
            <input 
              type="text" 
              className="scraper-input" 
              placeholder="Search by ID, line, type or status..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '6px 12px' }} onClick={onClearHistory}>
              Reset History
            </button>
          </div>

          <div className="incidents-table-wrapper" style={{ maxHeight: '340px' }}>
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Line</th>
                  <th>Anomaly Type</th>
                  <th>Severity</th>
                  <th>Detected</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => (
                  <tr key={inc.id} style={{ cursor: 'pointer' }} onClick={() => onSelectIncident(inc)}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: '700' }}>{inc.id}</td>
                    <td style={{ fontWeight: '600' }}>{inc.line}</td>
                    <td>{inc.type}</td>
                    <td>
                      <span className={`status-pill ${inc.severity === 'HIGH' ? 'warning' : 'running'}`} style={{ fontSize: '0.64rem' }}>
                        {inc.severity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{inc.detectedAt}</td>
                    <td>
                      <span className={`status-pill ${inc.status === 'RESOLVED' ? 'running' : 'warning'}`} style={{ fontSize: '0.64rem' }}>
                        {inc.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-source-link" onClick={(e) => { e.stopPropagation(); onSelectIncident(inc); }}>
                        🔍 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-btn-row">
            <button className="btn-primary" onClick={onClose}>Close History</button>
          </div>
        </div>
      </div>
    );
  }

  // 2.5 INCIDENT DETAIL MODAL
  function IncidentDetailModal({ incident, isOpen, onClose }) {
    if (!isOpen || !incident) return null;

    return (
      <div className="modal-overlay open" role="dialog" aria-modal="true">
        <div className="modal-content-box" style={{ maxWidth: '680px' }}>
          <div className="modal-header">
            <h3><span>🔍</span> Incident Dossier — {incident.id}</h3>
            <button className="close-drawer-btn" onClick={onClose}>✕</button>
          </div>

          <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <div>
                <h4 style={{ color: '#fff', margin: 0 }}>{incident.line}: {incident.machine}</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Anomaly: {incident.type} • Severity: {incident.severity}</span>
              </div>
              <span className={`status-pill ${incident.status === 'RESOLVED' ? 'running' : 'warning'}`}>
                ● {incident.status}
              </span>
            </div>

            <div className="sensors-mini-cluster" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '14px' }}>
              <div className="sensor-box"><span className="sensor-label">RECORDED VALUE</span><span className="sensor-val" style={{ color: '#ff0054' }}>{incident.value} {incident.unit || 'mm/s'}</span></div>
              <div className="sensor-box"><span className="sensor-label">THRESHOLD</span><span className="sensor-val" style={{ color: 'var(--neon-amber)' }}>{incident.threshold} {incident.unit || 'mm/s'}</span></div>
              <div className="sensor-box"><span className="sensor-label">DETECTED AT</span><span className="sensor-val">{incident.detectedAt}</span></div>
              <div className="sensor-box"><span className="sensor-label">DOWNTIME</span><span className="sensor-val">{incident.downtimeMinutes || 14} min</span></div>
            </div>

            <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '4px' }}>Root Cause Forensic Analysis:</h4>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', color: '#e2e8f0' }}>
              {incident.rootCause || "Drive harmonic resonance & bearing raceway fatigue."}
            </div>

            <h4 style={{ color: 'var(--neon-emerald)', marginBottom: '4px' }}>Corrective Maintenance Action Taken:</h4>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', color: '#e2e8f0' }}>
              {incident.resolution || "Bearing assembly inspected, fasteners re-torqued to 85 Nm, vibration returned within specification."}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              <span>📐 Standard Cited: <strong>{incident.groundingSpec || "ISO 10816-3 Severity Matrix"}</strong></span>
              <span>👥 Consensus Confidence: <strong style={{ color: 'var(--neon-cyan)' }}>{incident.consensusScore || 92}%</strong></span>
            </div>
          </div>

          <div className="modal-btn-row">
            <button className="btn-primary" onClick={onClose}>Close Dossier</button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // 3. ROOT REACT APPLICATION COMPONENT
  // ========================================================
  function App() {
    // --- STATE ---
    const [activeShiftId, setActiveShiftId] = useState('shift_1');
    const [isEStopActive, setIsEStopActive] = useState(false);
    const [activeLineId, setActiveLineId] = useState('line_c');
    const [isMacroTrayOpen, setIsMacroTrayOpen] = useState(false);
    const [commodities, setCommodities] = useState(window.INDUSTRY_KNOWLEDGE?.LIVE_COMMODITIES || []);
    const [newsItems] = useState(window.INDUSTRY_KNOWLEDGE?.LIVE_INDUSTRY_NEWS || []);
    
    // Feature Search & Scraper State
    const [featureCat, setFeatureCat] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [scrapedFeatures, setScrapedFeatures] = useState(window.INDUSTRY_KNOWLEDGE?.SCRAPED_INDUSTRIAL_FEATURES || []);
    const [scraperTarget, setScraperTarget] = useState('');
    const [scraperLogs, setScraperLogs] = useState([]);
    
    // Virtual Persona & Agent Pipeline State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activePersonaId, setActivePersonaId] = useState('vance');
    const [injectedGroundingFeature, setInjectedGroundingFeature] = useState(null);
    const [chatMessages, setChatMessages] = useState([
      {
        sender: 'bot',
        html: `<strong>👋 Hello Operations Engineer.</strong><br>Connected directly to Plant #4 telemetry, machine PLCs, and digital handover notes. Select any specialist agent or run the Multi-Agent Roundtable!`
      }
    ]);
    const [inputText, setInputText] = useState('');
    const [pipelineNodes, setPipelineNodes] = useState([
      { id: 1, name: '1. Ingest', status: 'completed' },
      { id: 2, name: '2. Telemetry', status: 'completed' },
      { id: 3, name: '3. Web Specs', status: 'completed' },
      { id: 4, name: '4. Synthesis', status: 'completed' },
      { id: 5, name: '5. Dispatch', status: 'completed' }
    ]);

    // Modals State
    const [activeModal, setActiveModal] = useState(null); // 'incident', 'telemetry', 'report', 'trace', 'featureDetail', 'incidentHistory', 'incidentDetail'
    const [selectedFeatureDetail, setSelectedFeatureDetail] = useState(null);
    const [toastMsg, setToastMsg] = useState('');

    // --- INCIDENT WORKFLOW & INTELLIGENCE STATE ---
    const [incidentHistory, setIncidentHistory] = useState(() => {
      return window.storage ? window.storage.getIncidents() : [];
    });
    const [activeIncident, setActiveIncident] = useState(null);
    const [incidentState, setIncidentState] = useState('IDLE'); // 'IDLE' | 'DETECTED' | 'ANALYZING' | 'CONSENSUS' | 'ACTION_REQUIRED' | 'MAINTENANCE' | 'VERIFICATION' | 'RESOLVED'
    const [isIncidentCenterVisible, setIsIncidentCenterVisible] = useState(false);
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const [maintenanceProgress, setMaintenanceProgress] = useState(0);
    const [verificationVibration, setVerificationVibration] = useState(4.2);
    const [focusLineTrigger, setFocusLineTrigger] = useState(0);
    const [selectedHistoryIncident, setSelectedHistoryIncident] = useState(null);
    const [traceLogs, setTraceLogs] = useState([]);
    const [backendConnected, setBackendConnected] = useState(false);
    const [aiStatus, setAiStatus] = useState({ available: false, provider: null, model: null, mode: 'LOCAL_REASONING' });
    const [aiLatency, setAiLatency] = useState(null);
    const demoTimersRef = useRef([]);

    const shiftData = window.FACTORY_DATA.shifts[activeShiftId];
    const linesData = window.FACTORY_DATA.lines;

    // Toast helper
    const showToast = useCallback((msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 2800);
    }, []);

    const clearDemoTimers = useCallback(() => {
      demoTimersRef.current.forEach(t => clearTimeout(t));
      demoTimersRef.current = [];
    }, []);

    useEffect(() => {
      return () => clearDemoTimers();
    }, [clearDemoTimers]);

    // Backend Connectivity, AI Status & Initial Incident Hydration
    useEffect(() => {
      let isMounted = true;
      if (window.api) {
        const refreshAi = () => {
          if (window.api.getAiStatus) {
            window.api.getAiStatus().then(st => {
              if (isMounted && st) setAiStatus(st);
            }).catch(() => {});
          }
        };

        window.api.health().then(res => {
          if (isMounted) {
            setBackendConnected(res.ok);
            if (res.ok) refreshAi();
          }
        }).catch(() => {
          if (isMounted) setBackendConnected(false);
        });

        window.api.onStatusChange((connected) => {
          if (isMounted) {
            setBackendConnected(connected);
            if (connected) refreshAi();
          }
        });

        refreshAi();

        window.api.getIncidents().then(list => {
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setIncidentHistory(list);
          }
        }).catch(err => {
          console.warn('[PlantOS] Initial incident load fallback to storage:', err);
        });
      }
      return () => { isMounted = false; };
    }, []);

    const addTraceEvent = useCallback((tag, message) => {
      const time = new Date().toLocaleTimeString();
      setTraceLogs(prev => [...prev, { time, tag, message }]);
    }, []);

    // 1. Trigger / Simulate Line C Incident (Connected to POST /api/incidents)
    const handleSimulateIncident = useCallback(async () => {
      clearDemoTimers();
      setIsDemoRunning(false);

      const incidentPayload = {
        line: "Line C",
        machine: "Powertrain & Vibratory Feeder #2",
        type: "Vibration Anomaly",
        severity: "HIGH",
        value: 4.2,
        threshold: 3.5,
        status: "OPEN",
        state: "DETECTED"
      };

      let createdInc = null;
      if (window.api) {
        try {
          createdInc = await window.api.createIncident(incidentPayload);
        } catch (e) {
          console.warn('[Simulate] Backend API error, using fallback:', e);
        }
      }

      const finalInc = createdInc || {
        ...incidentPayload,
        id: "INC-LC-001",
        lineId: "line_c",
        peakValue: 4.2,
        trend: "+37%",
        detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveIncident(finalInc);
      setIncidentState('DETECTED');
      setIsIncidentCenterVisible(true);
      setActiveLineId('line_c');
      setVerificationVibration(4.2);
      setMaintenanceProgress(0);
      setFocusLineTrigger(p => p + 1);

      // Record telemetry stream in backend too
      if (window.api) {
        window.api.recordTelemetry('Line C', { vibration: 4.2 });
      }

      // Mutate Line C in FACTORY_DATA
      const lineC = window.FACTORY_DATA?.lines?.find(l => l.id === 'line_c');
      if (lineC) {
        lineC.sensors.vibration = 4.2;
        lineC.status = 'warning';
        lineC.speedPercent = 55;
      }

      setTraceLogs([
        { time: new Date().toLocaleTimeString(), tag: 'INCIDENT_DETECTED', message: `Line C Feeder #2 vibration spiked to 4.2 mm/s [Backend ID: ${finalInc.id}]` },
        { time: new Date().toLocaleTimeString(), tag: 'TELEMETRY_GROUNDED', message: 'SCADA telemetry bound: 4.2 mm/s RMS, 83.6°C, 920 RPM' }
      ]);

      playAlertSound('estop');
      showToast(`🚨 INCIDENT ${finalInc.id}: Line C Vibration spiked to 4.2 mm/s!`);
    }, [clearDemoTimers, showToast]);

    // 2. Reset Incident
    const handleResetIncident = useCallback(() => {
      clearDemoTimers();
      setIsDemoRunning(false);
      setActiveIncident(null);
      setIncidentState('IDLE');
      setIsIncidentCenterVisible(false);
      setVerificationVibration(2.1);
      setMaintenanceProgress(0);

      // Restore Line C
      const lineC = window.FACTORY_DATA?.lines?.find(l => l.id === 'line_c');
      if (lineC) {
        lineC.sensors.vibration = 2.1;
        lineC.status = 'running';
        lineC.speedPercent = 96;
      }

      playAlertSound('beep');
      showToast('🔄 Incident cleared. Line C operating nominally.');
    }, [clearDemoTimers, showToast]);

    // 3. Stop Demo
    const handleStopDemo = useCallback(() => {
      clearDemoTimers();
      setIsDemoRunning(false);
      showToast('⏹️ Demo Mode stopped. Interactive control active.');
    }, [clearDemoTimers, showToast]);

    // 4. Close Incident (Resolved) - Connected to PATCH /api/incidents/:id & SQLite
    const handleCloseIncident = useCallback(async () => {
      const incId = activeIncident?.id || 'INC-LC-001';
      const resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updates = {
        status: "RESOLVED",
        state: "RESOLVED",
        resolvedAt: resolvedAt,
        downtime: 14,
        value: 2.7,
        rootCause: "Mechanical vibration / bearing inspection & mount re-torque",
        correctiveAction: "Maintenance completed. Vibration normalized to 2.7 mm/s. Line C restored to 96% operational cadence."
      };

      let resolvedInc = null;
      if (window.api) {
        try {
          resolvedInc = await window.api.updateIncident(incId, updates);
        } catch (e) {
          console.warn('Backend updateIncident error:', e);
        }
      }

      const finalInc = resolvedInc || {
        ...(activeIncident || {}),
        ...updates,
        id: incId,
        line: "Line C",
        machine: "Powertrain & Vibratory Feeder #2"
      };

      setIncidentState('RESOLVED');
      setActiveIncident(finalInc);

      // Refresh incident history from backend (or fallback to localStorage)
      if (window.api) {
        try {
          const freshList = await window.api.getIncidents();
          if (Array.isArray(freshList)) setIncidentHistory(freshList);
        } catch (e) {
          if (window.storage) setIncidentHistory(window.storage.getIncidents());
        }
      } else if (window.storage) {
        window.storage.saveIncident(finalInc);
        setIncidentHistory(window.storage.getIncidents());
      }

      // Restore Line C
      const lineC = window.FACTORY_DATA?.lines?.find(l => l.id === 'line_c');
      if (lineC) {
        lineC.sensors.vibration = 2.7;
        lineC.status = 'running';
        lineC.speedPercent = 96;
      }

      addTraceEvent('INCIDENT_RESOLVED', `Incident ${incId} closed. Total downtime: 14 min. Root cause persisted to SQLite database.`);
      playAlertSound('beep');
      showToast(`✅ Incident ${incId} closed & persisted to database.`);
    }, [activeIncident, addTraceEvent, showToast]);

    // 5. Start Maintenance - Connected to POST /api/maintenance/start, complete, & verify
    const handleStartMaintenance = useCallback(async () => {
      const incId = activeIncident?.id || 'INC-LC-001';
      setIncidentState('MAINTENANCE');
      setMaintenanceProgress(10);
      addTraceEvent('MAINTENANCE_STARTED', `Line C feed ramped to 0%; safety LOTO isolation engaged [${incId}]`);

      if (window.api) {
        try {
          await window.api.startMaintenance(incId);
        } catch (e) {
          console.warn('Backend startMaintenance error:', e);
        }
      }

      const t1 = setTimeout(() => {
        setMaintenanceProgress(40);
        addTraceEvent('MAINTENANCE_PROGRESS', 'Bearing assembly disassembled; outer race wear cleaned; high-temp synthetic grease applied');
      }, 1200);

      const t2 = setTimeout(() => {
        setMaintenanceProgress(75);
        addTraceEvent('MAINTENANCE_PROGRESS', 'Chassis mounting fasteners torqued to 85 Nm; rubber isolation bushings aligned');
      }, 2400);

      const t3 = setTimeout(async () => {
        setMaintenanceProgress(100);
        addTraceEvent('MAINTENANCE_COMPLETED', 'Single-cycle indexing verified; interlocks cleared. Commencing verification run.');

        if (window.api) {
          try {
            await window.api.completeMaintenance(incId);
          } catch (e) {
            console.warn('Backend completeMaintenance error:', e);
          }
        }

        setIncidentState('VERIFICATION');
        setVerificationVibration(3.6);
        addTraceEvent('VERIFICATION_STARTED', 'Post-maintenance vibration stepping down: 4.2 -> 3.6 mm/s');

        setTimeout(() => {
          setVerificationVibration(3.1);
          addTraceEvent('VERIFICATION_PROGRESS', 'Vibration decayed to 3.1 mm/s (< 3.5 mm/s threshold)');

          setTimeout(async () => {
            let verifyRes = null;
            if (window.api) {
              try {
                verifyRes = await window.api.verifyIncident(incId);
              } catch (e) {
                console.warn('Backend verifyIncident error:', e);
              }
            }
            const finalVib = verifyRes?.vibration || 2.7;
            setVerificationVibration(finalVib);
            addTraceEvent('VERIFICATION_COMPLETE', `Verification confirmed at ${finalVib} mm/s (Zone B Normal). Ready to close incident.`);
          }, 1200);
        }, 1200);
      }, 3600);

      demoTimersRef.current.push(t1, t2, t3);
    }, [activeIncident, addTraceEvent]);

    // 6. Start Demo - 23s sequence calling Backend APIs throughout
    const handleStartDemo = useCallback(() => {
      clearDemoTimers();
      setIsDemoRunning(true);
      handleSimulateIncident();

      const schedule = (ms, fn) => {
        const t = setTimeout(fn, ms);
        demoTimersRef.current.push(t);
      };

      // 2s: Highlight & camera focus
      schedule(2000, () => {
        setFocusLineTrigger(p => p + 1);
        addTraceEvent('TELEMETRY_GROUNDED', 'Camera focused on Line C; high-frequency FFT window synchronized');
      });

      // 4s: Telemetry analysis (calls backend API)
      schedule(4000, async () => {
        setIncidentState('ANALYZING');
        if (window.api) {
          try { await window.api.getTelemetry('Line C'); } catch (e) {}
        }
        addTraceEvent('SPECIALIST_ANALYSIS', 'Elena Rostova: Vibration exceeds 3.5 mm/s ISO limit; bearing fatigue suspected');
      });

      // 6s: Specialist AI Analysis API (Groq LLM / Local Orchestrator)
      schedule(6000, async () => {
        if (window.api) {
          try {
            const incId = activeIncident?.id || 'INC-LC-001';
            const agentRes = await window.api.analyzeIncident({ incidentId: incId, persona: 'Elena Rostova' });
            if (agentRes) {
              if (agentRes.aiLatencyMs) setAiLatency(agentRes.aiLatencyMs);
              if (Array.isArray(agentRes.traces) && agentRes.traces.length > 0) {
                agentRes.traces.forEach(t => addTraceEvent(t.event, t.details));
              } else {
                addTraceEvent('SPECIALIST_ANALYSIS', `${agentRes.persona}: ${agentRes.diagnosis?.slice(0, 80)}...`);
              }
            }
          } catch (e) {
            console.warn('[Demo] Specialist AI error:', e);
          }
        }
      });

      // 8s: Grounding match (calls backend API)
      schedule(8000, async () => {
        if (window.api) {
          try { await window.api.getKnowledge('powertrain-vibratory-feeder'); } catch (e) {}
        }
        addTraceEvent('KNOWLEDGE_MATCH', 'Specification grounding complete: ISO 10816-3 Zone C Alert Limit & IFM VVB001 sensor matched');
      });

      // 10s: Multi-Agent Consensus (calls backend API)
      schedule(10000, async () => {
        setIncidentState('CONSENSUS');
        if (window.api) {
          try {
            const incId = activeIncident?.id || 'INC-LC-001';
            const consRes = await window.api.runConsensus({ incidentId: incId });
            if (consRes) {
              if (consRes.aiLatencyMs) setAiLatency(consRes.aiLatencyMs);
              if (Array.isArray(consRes.traces) && consRes.traces.length > 0) {
                consRes.traces.forEach(t => addTraceEvent(t.event, t.details));
              } else {
                addTraceEvent('CONSENSUS_COMPLETE', `Consensus reached (${Math.round((consRes.confidence || 0.92) * 100)}%): ${consRes.recommendation}`);
              }
            }
          } catch (e) {
            console.warn('[Demo] Consensus error:', e);
            addTraceEvent('CONSENSUS_COMPLETE', 'Consensus achieved (92% confidence): Controlled Line C stoppage recommended');
          }
        } else {
          addTraceEvent('CONSENSUS_STARTED', 'Convened 5-specialist industrial roundtable');
          setTimeout(() => {
            addTraceEvent('CONSENSUS_COMPLETE', 'Consensus achieved (92% confidence): Controlled Line C stoppage recommended');
          }, 1200);
        }
      });

      // 13s: Action recommendation
      schedule(13000, () => {
        setIncidentState('ACTION_REQUIRED');
        addTraceEvent('ACTION_RECOMMENDED', 'Dispatched 6-step SOP: LOTO isolation, bearing inspection, mount re-torque');
      });

      // 16s: Maintenance (calls backend API)
      schedule(16000, () => {
        handleStartMaintenance();
      });

      // 23s: Incident Resolved (calls backend API & persists to database)
      schedule(23500, () => {
        handleCloseIncident();
        setIsDemoRunning(false);
        showToast('🎉 Demo Completed: Line C incident fully resolved & saved to backend database!');
      });

    }, [clearDemoTimers, handleSimulateIncident, addTraceEvent, handleStartMaintenance, handleCloseIncident, activeIncident, showToast]);

    // 7. Advance State Manually
    const handleAdvanceState = useCallback((targetState) => {
      setIncidentState(targetState);
      if (targetState === 'ANALYZING') {
        if (window.api) {
          const incId = activeIncident?.id || 'INC-LC-001';
          window.api.analyzeIncident({ incidentId: incId, persona: 'Elena Rostova' })
            .then(res => {
              if (res) {
                if (res.aiLatencyMs) setAiLatency(res.aiLatencyMs);
                if (Array.isArray(res.traces)) {
                  res.traces.forEach(t => addTraceEvent(t.event, t.details));
                }
              }
            }).catch(() => {});
        } else {
          addTraceEvent('SPECIALIST_ANALYSIS', 'Elena Rostova: Vibration exceeds 3.5 mm/s ISO limit; bearing fatigue suspected');
          addTraceEvent('KNOWLEDGE_MATCH', 'Specification grounding complete: ISO 10816-3 Zone C Alert Limit & IFM VVB001 sensor matched');
        }
      } else if (targetState === 'CONSENSUS') {
        if (window.api) {
          const incId = activeIncident?.id || 'INC-LC-001';
          window.api.runConsensus({ incidentId: incId })
            .then(res => {
              if (res) {
                if (res.aiLatencyMs) setAiLatency(res.aiLatencyMs);
                if (Array.isArray(res.traces)) {
                  res.traces.forEach(t => addTraceEvent(t.event, t.details));
                }
              }
            }).catch(() => {});
        } else {
          addTraceEvent('CONSENSUS_STARTED', 'Convened 5-specialist industrial roundtable');
          addTraceEvent('CONSENSUS_COMPLETE', 'Consensus achieved (92% confidence): Controlled Line C stoppage recommended');
        }
      } else if (targetState === 'ACTION_REQUIRED') {
        addTraceEvent('ACTION_RECOMMENDED', 'Dispatched 6-step SOP: LOTO isolation, bearing inspection, mount re-torque');
      } else if (targetState === 'ACKNOWLEDGED') {
        addTraceEvent('INCIDENT_ACKNOWLEDGED', 'Incident acknowledged by Lead Operations Engineer. Maintenance dispatched.');
        showToast('📝 Incident acknowledged by Operations.');
      }
    }, [addTraceEvent, showToast, activeIncident]);

    // Toggle E-STOP
    const toggleEmergencyStop = useCallback(() => {
      setIsEStopActive(prev => {
        const next = !prev;
        playAlertSound(next ? 'estop' : 'beep');
        showToast(next ? '🚨 EMERGENCY STOP ENGAGED: All line drives de-energized!' : '✅ E-STOP RESET: Drives re-armed and operational.');
        return next;
      });
    }, [showToast]);

    // Refresh live commodities with simulated micro-drift
    const refreshLiveMarketFeed = useCallback(() => {
      setCommodities(prev => prev.map(c => {
        const delta = Number((Math.random() * 0.5 - 0.25).toFixed(2));
        const newPct = Number((c.changePercent + delta).toFixed(2));
        return {
          ...c,
          changePercent: newPct,
          trend: newPct >= 0 ? 'up' : 'down'
        };
      }));
      showToast('🔄 Live LME metal & energy commodities updated.');
    }, [showToast]);

    // Filter Features
    const filteredFeatures = useMemo(() => {
      let items = scrapedFeatures;
      if (featureCat !== 'all') {
        items = items.filter(f => f.category === featureCat);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(f => {
          const str = (f.name + ' ' + f.manufacturer + ' ' + f.category + ' ' + JSON.stringify(f.specs) + ' ' + f.keyFeatures.join(' ')).toLowerCase();
          return str.includes(q);
        });
      }
      return items;
    }, [scrapedFeatures, featureCat, searchQuery]);

    // Run Scraper Pipeline
    const handleRunScraper = useCallback((targetOverride) => {
      const target = (targetOverride || scraperTarget).trim();
      if (!target) return;

      setScraperLogs([`🕷️ [INIT] Connecting to target industrial endpoint: "${target}"...`]);

      setTimeout(() => {
        setScraperLogs(l => [...l, `🌐 [FETCH] HTTP 200 OK — Ingested HTML & schema payload (52.4 KB).`]);
      }, 450);

      setTimeout(() => {
        setScraperLogs(l => [...l, `⚙️ [PARSE] Extracting engineering parameters, OEM tolerances & ISO compliance tags...`]);
      }, 900);

      setTimeout(() => {
        const res = window.INDUSTRY_KNOWLEDGE?.scrapeIndustrialWebTopic(target);
        if (res && res.item) {
          setScrapedFeatures(window.INDUSTRY_KNOWLEDGE.SCRAPED_INDUSTRIAL_FEATURES);
          setScraperLogs(l => [...l, `✅ [INDEX] Successfully indexed "${res.item.name}" under ${res.item.category}. Ready for Agent grounding!`]);
          showToast(`🕷️ Scraped & indexed: ${res.item.name}`);
          playAlertSound('beep');
        }
      }, 1400);
    }, [scraperTarget, showToast]);

    // Inject Feature into Agent
    const injectFeatureIntoAgent = useCallback((feature) => {
      setInjectedGroundingFeature(feature);
      setIsDrawerOpen(true);
      setInputText(`Evaluate how ${feature.name} (${feature.category}) integrates into our plant line telemetry.`);
      showToast(`⚡ Grounded Agent with: ${feature.name}`);
      playAlertSound('beep');
    }, [showToast]);

    // Select Persona
    const selectPersona = useCallback((personaId) => {
      setActivePersonaId(personaId);
      const persona = window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[personaId];
      if (personaId === 'roundtable') {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          html: `<strong>🌟 Multi-Agent Industrial Roundtable Online:</strong><br>Four virtual specialists (Operations, Reliability, Automation, and Economics) are connected in a synchronized consensus pipeline. Ask any plant incident or scenario!`
        }]);
      } else if (persona) {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          html: `<strong>${persona.avatar} ${persona.name}</strong> <em>(${persona.role})</em><br>${persona.systemGreeting}`
        }]);
      }
      playAlertSound('beep');
    }, []);

    // Execute Agent Pipeline Query
    const handleSendAgentQuery = useCallback(async (promptOverride) => {
      const text = promptOverride || inputText;
      if (!text || !text.trim()) return;

      setInputText('');
      setChatMessages(prev => [...prev, { sender: 'user', text: text }]);

      // Animate 5-Stage visual pipeline
      let step = 1;
      const interval = setInterval(() => {
        setPipelineNodes(nodes => nodes.map(n => ({
          ...n,
          status: n.id === step ? 'running' : (n.id < step ? 'completed' : 'idle')
        })));
        step++;
        if (step > 6) clearInterval(interval);
      }, 100);

      // Execute pipeline
      try {
        const trace = await window.INDUSTRY_KNOWLEDGE?.AGENT_PIPELINE.executePipeline(text, activePersonaId, {
          injectedFeature: injectedGroundingFeature
        });

        setTimeout(() => {
          setPipelineNodes(nodes => nodes.map(n => ({ ...n, status: 'completed' })));
          setChatMessages(prev => [...prev, { sender: 'bot', html: trace.responseHtml }]);
          playAlertSound('beep');
        }, 600);
      } catch (err) {
        console.error('Pipeline error:', err);
      }
    }, [inputText, activePersonaId, injectedGroundingFeature]);

    return (
      <div className="react-root-container">
        
        {/* 1. TOP HEADER */}
        <header className="plant-header" aria-label="Plant Control Header">
          <div className="plant-brand-left">
            <img src="assets/logo.jpg" alt="OptiFactory Logo" className="logo-badge" />
            <div className="plant-title-block">
              <h1>OptiFactory PlantOS</h1>
              <div className="facility-label">
                <span>FACILITY #04 • ROBOTICS & DRIVETRAIN ASSEMBLY</span>
                <span className="live-safety-badge">🛡️ 412 Days Safe</span>
              </div>
            </div>
          </div>

          <div className="header-status-cluster">
            {/* Shift Selector */}
            <div className="shift-pills-group" aria-label="Shift Switcher">
              <button className={`shift-pill-btn ${activeShiftId === 'shift_1' ? 'active' : ''}`} onClick={() => setActiveShiftId('shift_1')}>Shift 1 (Day)</button>
              <button className={`shift-pill-btn ${activeShiftId === 'shift_2' ? 'active' : ''}`} onClick={() => setActiveShiftId('shift_2')}>Shift 2 (Aft)</button>
              <button className={`shift-pill-btn ${activeShiftId === 'shift_3' ? 'active' : ''}`} onClick={() => setActiveShiftId('shift_3')}>Shift 3 (Night)</button>
            </div>

            <div className="header-quick-actions">
              <div 
                className="backend-status-pill" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 11px',
                  borderRadius: '16px',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  fontFamily: 'var(--font-mono)',
                  border: backendConnected ? '1px solid rgba(0, 245, 212, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)',
                  background: backendConnected ? 'rgba(0, 245, 212, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  color: backendConnected ? 'var(--neon-cyan)' : 'var(--neon-amber)'
                }}
                title={backendConnected ? "Connected to Node.js/Express backend & SQLite database at http://localhost:3000" : "Local Mode: Connected to browser localStorage fallback"}
              >
                <span style={{ 
                  width: '7px', 
                  height: '7px', 
                  borderRadius: '50%', 
                  background: backendConnected ? '#00f5d4' : '#f59e0b',
                  boxShadow: backendConnected ? '0 0 8px #00f5d4' : 'none'
                }}></span>
                <span>{backendConnected ? 'BACKEND ● CONNECTED' : 'BACKEND ○ LOCAL MODE'}</span>
              </div>
              <button 
                className={`action-hdr-btn ${isIncidentCenterVisible ? 'active' : ''} ${(activeIncident && incidentState !== 'RESOLVED' && incidentState !== 'IDLE') ? 'active-pulse' : ''}`} 
                onClick={() => setIsIncidentCenterVisible(prev => !prev)} 
                title="Toggle Incident Response Cockpit"
              >
                <span>🚨</span> Incident Center {(activeIncident && incidentState !== 'RESOLVED' && incidentState !== 'IDLE') ? '●' : ''}
              </button>
              <button 
                className="action-hdr-btn" 
                style={{ borderColor: 'rgba(255, 0, 84, 0.4)', color: '#ff3366' }}
                onClick={handleSimulateIncident} 
                title="Simulate Line C severe vibration anomaly (4.2 mm/s)"
              >
                <span>⚡</span> Sim Line C
              </button>
              <button 
                className={`action-hdr-btn ${isDemoRunning ? 'active-pulse' : ''}`}
                style={{ borderColor: 'rgba(114, 9, 183, 0.4)', color: 'var(--neon-purple)' }}
                onClick={isDemoRunning ? handleStopDemo : handleStartDemo} 
                title="Execute automated 23s end-to-end incident demo sequence"
              >
                <span>{isDemoRunning ? '⏹️' : '🎬'}</span> {isDemoRunning ? 'Stop Demo' : 'Demo Mode'}
              </button>
              <button 
                className="action-hdr-btn" 
                onClick={handleResetIncident} 
                title="Reset incident to nominal operational status"
              >
                <span>🔄</span> Reset
              </button>
              <button className={`action-hdr-btn ${isMacroTrayOpen ? 'active-pulse' : ''}`} onClick={() => setIsMacroTrayOpen(prev => !prev)} title="Toggle live LME metals & commodity indicators">
                <span>📈</span> Live Market
              </button>
              <button className="action-hdr-btn" onClick={() => document.getElementById('web-features-section')?.scrollIntoView({ behavior: 'smooth' })} title="Search scraped industrial specifications">
                <span>🌐</span> Web Features
              </button>
              <button className="action-hdr-btn" onClick={() => setActiveModal('incidentHistory')} title="View shift & plant incident history log">
                <span>📋</span> History
              </button>
              <button className="action-hdr-btn" onClick={() => setActiveModal('incident')} title="Log a machine stoppage or incident">
                <span>➕</span> Log Downtime
              </button>
              <a href="../index.html" className="action-hdr-btn" style={{ textDecoration: 'none' }} title="Switch to Sports Chatbot">
                ⚽ Sports Chat
              </a>
              <button className={`action-hdr-btn estop-btn ${isEStopActive ? 'active' : ''}`} onClick={toggleEmergencyStop} title="Trip all line drives and engage interlock siren">
                {isEStopActive ? '⚠️ RESET E-STOP' : '🚨 EMERGENCY STOP'}
              </button>
            </div>
          </div>
        </header>

        {/* 2. LIVE INDUSTRY COMMODITY TICKER BAR */}
        <section className="live-industry-ticker-bar" aria-label="Live Industry Market Feed">
          <div className="ticker-left-cluster">
            <span className="ticker-live-tag">
              <span className="ticker-live-dot"></span> Live Industry Feed
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>LME / CME / SPOT</span>
          </div>

          <div className="ticker-scroll-wrapper">
            <div className="ticker-items-track">
              {commodities.concat(commodities).map((c, idx) => {
                const arrow = c.trend === 'up' ? '▲' : (c.trend === 'down' ? '▼' : '▬');
                const sign = c.changePercent > 0 ? '+' : '';
                const priceStr = c.price < 1 ? `$${c.price.toFixed(4)}` : (c.price > 1000 ? `$${c.price.toLocaleString()}` : `${c.price}`);
                return (
                  <span key={idx} className="ticker-chip" onClick={() => setIsMacroTrayOpen(true)} title={`${c.name} — ${c.impact}`}>
                    <span className="ticker-symbol">{c.symbol}</span>
                    <span className="ticker-price">{c.name.split(' ')[0]}: {priceStr}</span>
                    <span className={`ticker-delta ${c.trend}`}>{arrow} {sign}{c.changePercent}%</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="ticker-actions-right">
            <button className="ticker-btn" onClick={() => setIsMacroTrayOpen(prev => !prev)}>
              <span>📊</span> Macro Tray
            </button>
            <button className="ticker-btn" onClick={refreshLiveMarketFeed} title="Fetch latest commodity & sector updates">
              <span>🔄</span> Refresh
            </button>
          </div>
        </section>

        {/* 3. EXPANDABLE MACRO INTELLIGENCE TRAY */}
        <section className={`macro-tray ${isMacroTrayOpen ? 'open' : ''}`} aria-label="Live Macro Tray">
          <div className="macro-tray-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>📊 Global Industrial Market Intelligence & Benchmarks</h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                GROUNDED WITH LIVE COMMODITY INDICES, SECTOR NEWS & WORLD-CLASS INDUSTRY 4.0 BENCHMARKS
              </span>
            </div>
            <button className="close-drawer-btn" onClick={() => setIsMacroTrayOpen(false)}>✕</button>
          </div>

          <div className="macro-grid-top">
            {commodities.map((c, idx) => {
              const arrow = c.trend === 'up' ? '▲' : (c.trend === 'down' ? '▼' : '▬');
              const sign = c.changePercent > 0 ? '+' : '';
              const priceStr = c.price < 1 ? `$${c.price.toFixed(4)}` : (c.price > 1000 ? `$${c.price.toLocaleString()}` : `${c.price}`);
              return (
                <div key={idx} className="commodity-card">
                  <div className="commodity-card-hdr">
                    <span>{c.symbol} • {c.category}</span>
                    <span className={`ticker-delta ${c.trend}`}>{arrow} {sign}{c.changePercent}%</span>
                  </div>
                  <div className="commodity-val-row">
                    <span className="commodity-huge-val">{priceStr}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.unit}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: '700', marginBottom: '4px' }}>{c.name}</div>
                  <div className="commodity-impact-text">{c.impact}</div>
                </div>
              );
            })}
          </div>

          <div className="news-wire-row">
            <div className="news-wire-panel">
              <div className="section-hdr" style={{ marginBottom: '10px' }}>
                <h4><span>📡</span> Live Industrial News Wire & Industry 4.0 Dispatches</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>LIVE OT / IT WIRE</span>
              </div>
              <div className="news-items-list">
                {newsItems.map(n => (
                  <article key={n.id} className="news-item-card">
                    <div className="news-item-meta">
                      <span>{n.source} • {n.timestamp}</span>
                      <span className="feature-category-badge" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{n.badge}</span>
                    </div>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="news-headline">{n.headline}</a>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.35' }}>{n.summary}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="benchmarks-panel">
              <div className="section-hdr" style={{ marginBottom: '10px' }}>
                <h4><span>🎯</span> Industry 4.0 Benchmark Radar</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WORLD CLASS SPECS</span>
              </div>
              <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>Overall Equipment Effectiveness (OEE)</span>
                    <span style={{ color: '#10b981' }}>≥ 85.0% World Class</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Plant #4 Shift 1 currently at 84.6% (-0.4% from benchmark).</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--neon-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>First-Pass QA Yield (FPY)</span>
                    <span style={{ color: 'var(--neon-cyan)' }}>≥ 98.5% Benchmark</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Line D Cognex Vision AI passing 98.65% (within spec).</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #ffb703' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>ISO 10816 Vibration Alert Limit</span>
                    <span style={{ color: '#ffb703' }}>Zone C: 2.8 - 4.5 mm/s</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Line C Feeder #2 flagged at 4.2 mm/s (Alert status active).</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. MAIN DASHBOARD CONTENT */}
        <main className="dashboard-grid-container" id="main-cockpit">

          {/* INCIDENT ALERT HERO RIBBON (At-a-glance < 5s) */}
          <IncidentHeroRibbon 
            incident={activeIncident} 
            backendConnected={backendConnected}
            aiStatus={aiStatus}
            onOpenCenter={() => setIsIncidentCenterVisible(true)} 
            onStartDemo={handleStartDemo} 
            isDemoRunning={isDemoRunning} 
            onStopDemo={handleStopDemo} 
            onResetIncident={handleResetIncident} 
          />

          {/* THREE.JS 3D DIGITAL TWIN VIEWPORT */}
          <ThreeDigitalTwin 
            isEStopActive={isEStopActive} 
            activeLineId={activeLineId} 
            onSelectLine={(lineId) => setActiveLineId(lineId)}
            onOpenTelemetryModal={(lineId) => {
              setActiveLineId(lineId);
              setActiveModal('telemetry');
            }}
            incidentActive={Boolean(activeIncident && incidentState !== 'IDLE' && incidentState !== 'RESOLVED')}
            incidentState={incidentState}
            focusLineTrigger={focusLineTrigger}
          />

          {/* INCIDENT RESPONSE WORKFLOW COCKPIT */}
          {(isIncidentCenterVisible || (activeIncident && incidentState !== 'IDLE')) && (
            <IncidentCenter
              incident={activeIncident || {
                id: "INC-LC-001",
                line: "Line C",
                lineId: "line_c",
                machine: "Powertrain & Vibratory Feeder #2",
                type: "Vibration Anomaly",
                severity: "HIGH",
                value: 4.2,
                unit: "mm/s",
                threshold: 3.5,
                peakValue: 4.2,
                trend: "+37%",
                status: "OPEN",
                state: "DETECTED",
                detectedAt: "Just now"
              }}
              incidentState={incidentState === 'IDLE' ? 'DETECTED' : incidentState}
              workflowData={window.INDUSTRY_KNOWLEDGE?.getIncidentWorkflowDefinition()}
              backendConnected={backendConnected}
              aiStatus={aiStatus}
              onAdvanceState={handleAdvanceState}
              onStartMaintenance={handleStartMaintenance}
              maintenanceProgress={maintenanceProgress}
              verificationVibration={verificationVibration}
              onCloseIncident={handleCloseIncident}
              onResetIncident={handleResetIncident}
              onStartDemo={handleStartDemo}
              onStopDemo={handleStopDemo}
              isDemoRunning={isDemoRunning}
              onOpenHistory={() => setActiveModal('incidentHistory')}
              traceLogs={traceLogs}
              onOpenTraceModal={() => setActiveModal('trace')}
              onClosePanel={() => setIsIncidentCenterVisible(false)}
            />
          )}

          {/* KPI CARDS ROW */}
          <section className="kpi-row" aria-label="Key Performance Indicators">
            {/* Throughput Target vs Actual */}
            <article className="kpi-card optimal">
              <div className="kpi-top-meta">
                <span className="kpi-label">Production Throughput</span>
                <span className="kpi-badge success">{((shiftData.actualUnits / shiftData.targetUnits) * 100).toFixed(1)}% Plan</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-num">{shiftData.actualUnits.toLocaleString()}</span>
                <span className="kpi-sub-num">Target: {shiftData.targetUnits.toLocaleString()}</span>
              </div>
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: `${Math.min((shiftData.actualUnits / shiftData.targetUnits) * 100, 100)}%` }}></div>
              </div>
              <div className="kpi-footer-note">
                <span>Paced against 8h cadence</span>
                <span>Delta: {(shiftData.actualUnits - shiftData.targetUnits).toLocaleString()} units</span>
              </div>
            </article>

            {/* OEE Metrics */}
            <article className="kpi-card">
              <div className="kpi-top-meta">
                <span className="kpi-label">OEE Performance</span>
                <span className="kpi-badge" style={{ color: 'var(--neon-cyan)' }}>Benchmark: 85.0%</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-num">{shiftData.oee}%</span>
                <span className="kpi-sub-num">Avail: 91.2% • Perf: 94.8%</span>
              </div>
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: `${shiftData.oee}%`, background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-cyan))' }}></div>
              </div>
              <div className="kpi-footer-note">
                <span>Quality Rate: 97.9%</span>
                <span style={{ color: 'var(--neon-amber)' }}>Opportunity: +1.6%</span>
              </div>
            </article>

            {/* Scrap & Defect Rate */}
            <article className="kpi-card">
              <div className="kpi-top-meta">
                <span className="kpi-label">Scrap & Defect Volume</span>
                <span className="kpi-badge" style={{ color: 'var(--neon-crimson)' }}>{((shiftData.scrapUnits / shiftData.actualUnits) * 100).toFixed(2)}% Scrap</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-num">{shiftData.scrapUnits}</span>
                <span className="kpi-sub-num">Rejected by Vision QA</span>
              </div>
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: '14%', background: 'linear-gradient(90deg, var(--neon-amber), var(--neon-crimson))' }}></div>
              </div>
              <div className="kpi-footer-note">
                <span>Threshold limit: &lt; 2.0%</span>
                <span style={{ color: '#10b981' }}>Tolerance: PASS</span>
              </div>
            </article>

            {/* Shift Machine Downtime */}
            <article className="kpi-card warning">
              <div className="kpi-top-meta">
                <span className="kpi-label">Accumulated Downtime</span>
                <span className="kpi-badge" style={{ color: 'var(--neon-amber)' }}>3 Incidents</span>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-huge-num" style={{ color: 'var(--neon-amber)' }}>{shiftData.downtimeMinutes}m</span>
                <span className="kpi-sub-num">MTBF: 14.8h • MTTR: 18.2m</span>
              </div>
              <div className="kpi-progress-bar">
                <div className="kpi-progress-fill" style={{ width: '32%', background: 'var(--neon-amber)' }}></div>
              </div>
              <div className="kpi-footer-note">
                <span>Main cause: Feeder micro-jam</span>
                <span style={{ color: 'var(--neon-cyan)', cursor: 'pointer' }} onClick={() => { setActivePersonaId('elena'); setIsDrawerOpen(true); handleSendAgentQuery('Diagnose the 4.2 mm/s vibration spike on Line C'); }}>
                  Inspect ➔
                </span>
              </div>
            </article>
          </section>

          {/* ASSEMBLY LINES WORKSTATIONS GRID */}
          <section className="assembly-section" aria-label="Assembly Lines Workstations">
            <div className="section-hdr">
              <h2><span>⚙️</span> Real-Time Assembly Line Cadence & Workstations</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                TELEMETRY SYNCHRONIZED: 2.5s CADENCE
              </span>
            </div>

            <div className="lines-grid">
              {linesData.map(line => {
                const isWarn = line.status === 'warning' || isEStopActive;
                const statusText = isEStopActive ? 'E-STOPPED' : (line.status === 'running' ? 'Running' : 'Degraded (Bottleneck)');
                const statusClass = isEStopActive ? 'status-pill warning' : (line.status === 'running' ? 'status-pill running' : 'status-pill warning');
                const speed = isEStopActive ? 0 : line.speedPercent;

                return (
                  <div key={line.id} className={`line-card ${isWarn ? 'warning-status' : ''}`} id={`card-${line.id}`}>
                    <div className="line-header-row">
                      <div className="line-title-group">
                        <h3>{line.name}</h3>
                        <span className="line-subtag">{line.tag}</span>
                      </div>
                      <span className={statusClass}>● {statusText}</span>
                    </div>

                    <div className="line-speed-metric">
                      <div>
                        <span className="speed-gauge-text">{speed}%</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: '6px' }}>RATED SPEED</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{line.cycleTimeSec}s</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Takt: {line.targetCycleTime}s</span>
                      </div>
                    </div>

                    {line.activeAlert && !isEStopActive && (
                      <div className="line-active-alarm">
                        <strong>⚠️ [{line.activeAlert.code}]</strong> {line.activeAlert.message}
                      </div>
                    )}

                    {/* Sensor cluster */}
                    <div className="sensors-mini-cluster">
                      <div className="sensor-box">
                        <span className="sensor-label">TEMP</span>
                        <span className="sensor-val">{line.sensors.temp}°C</span>
                      </div>
                      <div className="sensor-box">
                        <span className="sensor-label">HYDR. PRESS</span>
                        <span className="sensor-val">{line.sensors.pressure} bar</span>
                      </div>
                      <div className="sensor-box">
                        <span className="sensor-label">VIBRATION</span>
                        <span className="sensor-val" style={{ color: line.sensors.vibration > 2.8 ? 'var(--neon-amber)' : '#34d399' }}>
                          {line.sensors.vibration} mm/s
                        </span>
                      </div>
                    </div>

                    {/* Workstations health list */}
                    <div className="workstations-health-list">
                      {line.workstations.map((ws, wIdx) => (
                        <div key={wIdx} className="station-health-row">
                          <span style={{ color: ws.status === 'optimal' ? '#e2e8f0' : 'var(--neon-amber)' }}>{ws.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="station-health-bar">
                              <div style={{ width: `${ws.health}%`, height: '100%', background: ws.health >= 90 ? 'var(--neon-emerald)' : 'var(--neon-amber)' }}></div>
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{ws.health}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="line-card-btn-row">
                      <button className="line-action-btn" onClick={() => { setActiveLineId(line.id); setActiveModal('telemetry'); }}>
                        <span>🔍</span> Telemetry & SOP
                      </button>
                      <button className="line-action-btn" style={{ borderColor: 'rgba(255,183,3,0.3)', color: 'var(--neon-amber)' }} onClick={() => { setActivePersonaId('wei'); setIsDrawerOpen(true); handleSendAgentQuery(`Analyze ${line.name} robotic kinematics and PLC interlocks`); }}>
                        <span>🤖</span> Ask Wei
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TWO-COLUMN ANALYTICS: HOURLY THROUGHPUT & DOWNTIME PARETO */}
          <section className="analytics-split-row">
            <article className="analytics-panel">
              <div className="section-hdr">
                <h2><span>📈</span> Hourly Production Throughput Profile</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>CADENCE PROFILE (HOURS 1-8)</span>
              </div>
              <div className="chart-container">
                {window.FACTORY_DATA.hourlyThroughput.map((h, idx) => {
                  const maxTarget = 1500;
                  const pct = (h.actual / maxTarget) * 100;
                  const isDip = h.actual < 1300;
                  return (
                    <div key={idx} className="chart-bar-col">
                      <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: isDip ? 'var(--neon-amber)' : 'var(--neon-cyan)' }}>
                        {h.actual}
                      </span>
                      <div className={`chart-bar ${isDip ? 'dip' : ''}`} style={{ height: `${pct}%` }}></div>
                      <span className="chart-bar-label">{h.hour.split('-')[0]}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>🔵 Optimal Cadence: ~1,500 units/h</span>
                <span style={{ color: 'var(--neon-amber)' }}>🟡 10:00 AM Feeder Jam Bottleneck</span>
              </div>
            </article>

            <article className="analytics-panel">
              <div className="section-hdr">
                <h2><span>📉</span> Downtime Pareto Analysis</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>ROOT CAUSE BREAKDOWN</span>
              </div>
              <div className="pareto-bars-list">
                {window.FACTORY_DATA.downtimePareto.map((p, idx) => (
                  <div key={idx} className="pareto-item">
                    <div className="pareto-item-header">
                      <span>{p.cause}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: p.color }}>{p.minutes}m ({p.percentage}%)</span>
                    </div>
                    <div className="pareto-track">
                      <div className="pareto-fill" style={{ width: `${p.percentage}%`, backgroundColor: p.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '14px', fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                💡 <em>Mechanical & feeder jams account for 66% of lost operational time. Preventative sensor cleaning will eliminate recurrent faults.</em>
              </div>
            </article>
          </section>

          {/* INCIDENTS TABLE & SHIFT HANDOVER NOTES */}
          <section className="bottom-split-row">
            <article className="analytics-panel">
              <div className="section-hdr">
                <h2><span>📋</span> Shift Incident & Downtime Event Log</h2>
                <button className="action-hdr-btn" onClick={() => setActiveModal('incident')} style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                  + Log Incident
                </button>
              </div>
              <div className="incidents-table-wrapper">
                <table className="incidents-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Time</th>
                      <th>Cell / Station</th>
                      <th>Lost Time</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {window.FACTORY_DATA.downtimeLog.map(inc => (
                      <tr key={inc.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: '700' }}>{inc.id}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{inc.timestamp}</td>
                        <td style={{ fontWeight: '600' }}>{inc.workstation}</td>
                        <td style={{ color: 'var(--neon-amber)', fontWeight: '700' }}>{inc.durationMin}m</td>
                        <td>{inc.category}</td>
                        <td>
                          <span className={`status-pill ${inc.status.includes('RESOLVED') ? 'running' : 'warning'}`}>
                            {inc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="analytics-panel">
              <div className="section-hdr">
                <h2><span>🤝</span> Digital Shift Handover Notes</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {shiftData.supervisor} • {shiftData.hours}
                </span>
              </div>
              <div className="handover-notes-list">
                {shiftData.handoverNotes.map((note, idx) => (
                  <div key={idx} className="handover-note-item">
                    {note}
                  </div>
                ))}
              </div>
              <div className="handover-footer-actions">
                <button className="handover-btn" onClick={() => setActiveModal('report')}>
                  <span>📑</span> Executive Report
                </button>
                <button className="handover-btn" onClick={() => { setActivePersonaId('vance'); setIsDrawerOpen(true); handleSendAgentQuery('Summarize shift handover directives'); }}>
                  <span>🤖</span> AI Briefing
                </button>
              </div>
            </article>
          </section>

          {/* 5. INDUSTRIAL WEB KNOWLEDGE & FEATURE SEARCH ENGINE */}
          <section className="web-features-section" id="web-features-section" aria-label="Industrial Web Knowledge & Feature Search">
            <div className="features-header-bar">
              <div className="section-hdr" style={{ marginBottom: 0 }}>
                <h2><span>🌐</span> Industrial Web Knowledge & Feature Search Engine</h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  SCRAPED SPECIFICATIONS, OEM DATA SHEETS & ISO COMPLIANCE STANDARDS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ticker-live-tag">{filteredFeatures.length} Specs Indexed</span>
                <button className="ticker-btn" onClick={() => document.getElementById('scraper-console-box')?.scrollIntoView({ behavior: 'smooth' })}>
                  <span>🕷️</span> Scrape New Target
                </button>
              </div>
            </div>

            {/* Search Input Box & Filter Chips */}
            <div className="features-search-controls">
              <div className="search-input-box-wrapper">
                <span style={{ color: 'var(--neon-cyan)', fontSize: '1.1rem' }}>🔍</span>
                <input 
                  type="text" 
                  className="feature-search-input" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search industrial features, equipment models, sensors, ISO standards, or PLCs..." 
                />
                {searchQuery && (
                  <button className="clear-grounding-btn" onClick={() => setSearchQuery('')} title="Clear search">✕</button>
                )}
              </div>

              <div className="feature-filter-chips-row">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'Robotics & Kinematics', label: '🤖 Robotics & Kinematics' },
                  { id: 'Sensors & 3D Vision', label: '👁️ Sensors & 3D Vision' },
                  { id: 'Control & IIoT', label: '⚡ Control & IIoT' },
                  { id: 'Standards & Reliability', label: '📐 Standards & Reliability' },
                  { id: 'Materials & Commodities', label: '🪙 Materials & Commodities' },
                  { id: 'Safety & Compliance', label: '🦺 Safety & Compliance' }
                ].map(cat => (
                  <button 
                    key={cat.id} 
                    className={`feature-filter-chip ${featureCat === cat.id ? 'active' : ''}`}
                    onClick={() => setFeatureCat(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="features-grid-container">
              {filteredFeatures.map(f => (
                <div key={f.id} className="feature-card" id={`card-${f.id}`}>
                  <div>
                    <div className="feature-top-meta">
                      <span className="feature-category-badge">{f.category}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{f.scrapedDate}</span>
                    </div>
                    <h4>{f.name}</h4>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '10px' }}>OEM: {f.manufacturer}</div>
                    
                    <div className="feature-specs-mini-table">
                      {Object.entries(f.specs).slice(0, 4).map(([k, v], sIdx) => (
                        <div key={sIdx} className="spec-mini-row">
                          <span style={{ color: 'var(--text-muted)' }}>{k.replace(/([A-Z])/g, ' $1').toUpperCase()}:</span>
                          <span style={{ color: '#fff', fontWeight: '700' }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    <ul style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px', paddingLeft: '14px' }}>
                      {f.keyFeatures.slice(0, 2).map((b, bIdx) => <li key={bIdx}>{b}</li>)}
                    </ul>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                      <strong>Plant Deployment:</strong> {f.plantUsage}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button className="inject-spec-btn" onClick={() => injectFeatureIntoAgent(f)} title="Inject this scraped spec into the active Virtual Persona agent pipeline">
                      <span>⚡</span> Inject into Agent
                    </button>
                    <button className="view-source-link" onClick={() => { setSelectedFeatureDetail(f); setActiveModal('featureDetail'); }}>
                      <span>🔍</span> Specs
                    </button>
                    <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="view-source-link">
                      <span>🌐</span> Source
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE WEB SCRAPER TERMINAL CONSOLE */}
            <div className="scraper-console-box" id="scraper-console-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🕷️</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.94rem', color: '#fff' }}>Live Industrial Web Scraper Pipeline</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Crawl, parse, and extract real technical specifications from industrial URLs or equipment models
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-purple)', fontFamily: 'var(--font-mono)' }}>
                  HTTP GET ➔ DOM PARSER ➔ ENTITY EXTRACTOR
                </span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleRunScraper(); }}>
                <div className="scraper-form-row">
                  <input 
                    type="text" 
                    className="scraper-input"
                    value={scraperTarget}
                    onChange={(e) => setScraperTarget(e.target.value)}
                    placeholder="e.g. Keyence LJ-X 3D Laser, Fanuc CRX-25iA Cobot, Siemens S120 Drive, or URL..." 
                    required 
                  />
                  <button type="submit" className="run-scrape-btn">
                    <span>🕷️</span> Run Scraper Pipeline
                  </button>
                </div>
              </form>

              <div className="scraper-presets-row">
                <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Quick Presets:</span>
                {[
                  'Fanuc CRX-25iA Collaborative Robot',
                  'Keyence LJ-X8000 3D Laser Profilometer',
                  'Bently Nevada 3500 Machinery Protection System',
                  'Siemens SINAMICS S120 Multi-Axis Drive',
                  'Schneider Modicon M580 PAC Controller'
                ].map((preset, pIdx) => (
                  <span key={pIdx} className="scraper-preset-chip" onClick={() => { setScraperTarget(preset); handleRunScraper(preset); }}>
                    {preset.split(' ')[0]} {preset.split(' ')[1]}
                  </span>
                ))}
              </div>

              {scraperLogs.length > 0 && (
                <div className="scraper-progress-log">
                  {scraperLogs.map((log, lIdx) => <div key={lIdx}>{log}</div>)}
                </div>
              )}
            </div>

          </section>

        </main>

        {/* FLOATING VIRTUAL AGENT TOGGLE BUTTON */}
        <button className="copilot-floating-toggle" onClick={() => setIsDrawerOpen(prev => !prev)} aria-label="Open Virtual Agents Pipeline">
          <span>🤖</span>
          <span>Virtual Agents Pipeline</span>
        </button>

        {/* SLIDE-OUT VIRTUAL INDUSTRIES PERSONALITIES AGENT & PIPELINE DRAWER */}
        <aside className={`copilot-drawer ${isDrawerOpen ? 'open' : ''}`} aria-label="Plant AI Assistant Drawer">
          <div className="copilot-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>🤖 OptiFactory AI — Virtual Personalities Pipeline</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Multi-Agent Diagnostics & Real-Time Reasoning Engine</span>
            </div>
            <button className="close-drawer-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
          </div>

          {/* Persona Selector Carousel */}
          <div className="persona-selector-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
              <span>Select Virtual Specialist:</span>
              <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
                {activePersonaId === 'roundtable' ? '🌟 Roundtable (4 Specialists)' : window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[activePersonaId]?.name}
              </span>
            </div>
            <div className="persona-chips-carousel">
              {[
                { id: 'vance', icon: '👷', label: 'Vance (Ops)' },
                { id: 'elena', icon: '🔬', label: 'Elena (Reliability)' },
                { id: 'wei', icon: '🤖', label: 'Wei (Automation)' },
                { id: 'jenkins', icon: '📈', label: 'Jenkins (Economics)' },
                { id: 'becker', icon: '🦺', label: 'Becker (Safety)' },
                { id: 'roundtable', icon: '🌟', label: 'Roundtable (Consensus)' }
              ].map(p => (
                <button 
                  key={p.id} 
                  className={`persona-pill-btn ${p.id === 'roundtable' ? 'roundtable-btn' : ''} ${activePersonaId === p.id ? 'active' : ''}`}
                  onClick={() => selectPersona(p.id)}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual 5-Stage Agent Pipeline Bar */}
          <div className="pipeline-visual-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase' }}>
                5-Stage Execution Pipeline
              </span>
              <button className="ticker-btn" style={{ padding: '2px 8px', fontSize: '0.66rem' }} onClick={() => setActiveModal('trace')}>
                <span>🔍</span> Inspect Trace
              </button>
            </div>
            <div className="pipeline-steps-flow">
              {pipelineNodes.map((n, nIdx) => (
                <React.Fragment key={n.id}>
                  <div className={`pipeline-step-node ${n.status}`}>
                    <span>{n.name}</span>
                  </div>
                  {nIdx < pipelineNodes.length - 1 && <span className="pipeline-arrow">➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Injected Grounding Context Banner */}
          {injectedGroundingFeature && (
            <div className="injected-grounding-banner show">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚡</span>
                <span>Active Grounding: <strong>{injectedGroundingFeature.name}</strong></span>
              </div>
              <button className="clear-grounding-btn" onClick={() => setInjectedGroundingFeature(null)} title="Clear grounding">✕</button>
            </div>
          )}

          {/* Quick prompt chips tailored to active persona */}
          <div className="copilot-quick-prompts" style={{ padding: '8px 18px', display: 'flex', gap: '6px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)' }}>
            {activePersonaId === 'roundtable' ? [
              'Conduct full 4-agent review on Line C feeder bottleneck',
              'Evaluate plant OEE recovery strategy for Shift 2',
              'Assess commodity price impact on current shift scrap'
            ].map((q, qIdx) => (
              <button key={qIdx} className="quick-chip" onClick={() => handleSendAgentQuery(q)}>{q}</button>
            )) : (window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[activePersonaId]?.sampleQuestions || []).map((q, qIdx) => (
              <button key={qIdx} className="quick-chip" onClick={() => handleSendAgentQuery(q)}>{q}</button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="copilot-chat-body">
            {chatMessages.map((msg, mIdx) => (
              <div 
                key={mIdx} 
                className={`copilot-msg ${msg.sender}`}
                dangerouslySetInnerHTML={{ __html: msg.html || msg.text }}
              />
            ))}
          </div>

          {/* Input Form */}
          <form className="copilot-input-bar" onSubmit={(e) => { e.preventDefault(); handleSendAgentQuery(); }}>
            <input 
              type="text" 
              className="copilot-text-input" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${activePersonaId === 'roundtable' ? 'the roundtable' : window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[activePersonaId]?.name}...`}
              required 
            />
            <button type="submit" className="copilot-send-btn">➔</button>
          </form>
        </aside>

        {/* MODAL 1: INCIDENT SUBMISSION */}
        <div className={`modal-overlay ${activeModal === 'incident' ? 'open' : ''}`}>
          <div className="modal-content-box">
            <div className="modal-header">
              <h3>➕ Log Machine Downtime Incident</h3>
              <button className="close-drawer-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              showToast('✅ Incident recorded into shift maintenance logbook.');
              setActiveModal(null);
              playAlertSound('beep');
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Assembly Line</label>
                <select className="modal-select" style={{ width: '100%', background: '#0a1020', color: '#fff', padding: '8px', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                  <option value="line_a">Line A: Precision Stamping & CNC Milling</option>
                  <option value="line_b">Line B: Robotic Welding & Chassis Joining</option>
                  <option value="line_c">Line C: Powertrain & Component Assembly</option>
                  <option value="line_d">Line D: Paint & Quality Inspection</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Workstation</label>
                  <input type="text" className="scraper-input" defaultValue="Vibratory Feeder #2" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Lost Time (min)</label>
                  <input type="number" className="scraper-input" defaultValue="18" required />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Root Cause Technical Summary</label>
                <textarea className="scraper-input" rows="2" defaultValue="Micro-jam cleared, sensor cleaned with isopropyl." required style={{ width: '100%' }}></textarea>
              </div>
              <div className="modal-btn-row">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Record Downtime</button>
              </div>
            </form>
          </div>
        </div>

        {/* MODAL 2: MACHINE TELEMETRY & SOP INSPECTION */}
        <div className={`modal-overlay ${activeModal === 'telemetry' ? 'open' : ''}`}>
          <div className="modal-content-box" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3>🔍 Machine Telemetry & Maintenance SOP</h3>
              <button className="close-drawer-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            {(() => {
              const line = linesData.find(l => l.id === activeLineId) || linesData[2];
              return (
                <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0 }}>{line.name}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{line.tag}</span>
                    </div>
                    <span className={`status-pill ${line.status === 'running' ? 'running' : 'warning'}`}>
                      ● {line.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="sensors-mini-cluster" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
                    <div className="sensor-box"><span className="sensor-label">TEMPERATURE</span><span className="sensor-val">{line.sensors.temp}°C</span></div>
                    <div className="sensor-box"><span className="sensor-label">PRESSURE</span><span className="sensor-val">{line.sensors.pressure} bar</span></div>
                    <div className="sensor-box"><span className="sensor-label">VIBRATION (RMS)</span><span className="sensor-val" style={{ color: line.sensors.vibration > 2.8 ? 'var(--neon-amber)' : '#34d399' }}>{line.sensors.vibration} mm/s</span></div>
                    <div className="sensor-box"><span className="sensor-label">MOTOR SPEED</span><span className="sensor-val">{line.sensors.motorRpm} RPM</span></div>
                  </div>

                  <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>Standard Operating Maintenance Procedure:</h4>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                    <ol style={{ paddingLeft: '18px', color: '#e2e8f0', fontSize: '0.78rem', lineHeight: '1.6' }}>
                      <li>Depress local cell pause button and verify zero pneumatic residual pressure.</li>
                      <li>Inspect sensor optics and guide track for interlocking fastener burrs.</li>
                      <li>Clean optic lens using 99% isopropyl alcohol wipes.</li>
                      <li>Verify vibratory frequency dial matches calibrated 50.2 Hz resonance.</li>
                      <li>Reset latch on cell terminal and execute single-cycle indexing test.</li>
                    </ol>
                  </div>
                </div>
              );
            })()}
            <div className="modal-btn-row">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Close Inspection</button>
            </div>
          </div>
        </div>

        {/* MODAL 3: PIPELINE TRACE INSPECTOR */}
        <div className={`modal-overlay ${activeModal === 'trace' ? 'open' : ''}`}>
          <div className="modal-content-box" style={{ maxWidth: '760px' }}>
            <div className="modal-header">
              <h3>🔍 Execution Trace Diagnostics</h3>
              <button className="close-drawer-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#cbd5e1', maxHeight: '440px', overflowY: 'auto' }}>
              {/* Incident Workflow Trace Stream */}
              {traceLogs && traceLogs.length > 0 && (
                <div style={{ marginBottom: '18px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ color: 'var(--neon-amber)' }}>⚡ INCIDENT WORKFLOW REAL-TIME TRACE STREAM</strong>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.66rem',
                        fontWeight: '700',
                        background: 'rgba(52, 211, 153, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(52, 211, 153, 0.3)'
                      }}>
                        AI Latency: {aiLatency !== null ? `${aiLatency} ms` : (aiStatus?.mode === 'LLM' ? 'Active (Groq)' : '3 ms (Local)')}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        [{aiStatus?.mode === 'LLM' ? `Groq Cloud / ${aiStatus?.model || 'openai/gpt-oss-120b'}` : 'Deterministic Physics Engine'}]
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{traceLogs.length} events logged</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {traceLogs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>[{log.time}]</span>
                        <span style={{ color: 'var(--neon-cyan)', fontWeight: '700', fontSize: '0.7rem' }}>{log.tag}</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.72rem' }}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Stage Agent Pipeline Trace */}
              <div>
                <strong style={{ display: 'block', color: 'var(--neon-cyan)', marginBottom: '8px' }}>🤖 5-STAGE AGENT PIPELINE REASONING TRACE</strong>
                {(() => {
                  const trace = window.INDUSTRY_KNOWLEDGE?.AGENT_PIPELINE?.lastTrace;
                  if (!trace) return <div style={{ color: 'var(--text-muted)' }}>No conversational agent trace recorded yet. Ask a question in the Specialist Copilot drawer to generate synthesis traces.</div>;
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div><strong>Trace ID:</strong> <code>{trace.id}</code><br/><strong>Query:</strong> <em>"{trace.query}"</em></div>
                        <div style={{ textAlign: 'right' }}><strong>Latency:</strong> <span style={{ color: '#34d399', fontWeight: '800' }}>{trace.totalTimeMs} ms</span><br/><strong>Persona:</strong> {trace.personaId.toUpperCase()}</div>
                      </div>
                      {trace.stages.map((s, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', padding: '10px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <strong style={{ color: 'var(--neon-cyan)' }}>{s.name}</strong>
                            <span style={{ color: '#34d399' }}>{s.durationMs} ms</span>
                          </div>
                          <pre style={{ margin: 0, overflowX: 'auto', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '4px', fontSize: '0.68rem', color: '#a5f3fc' }}>
                            {JSON.stringify(s.output, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="modal-btn-row">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Close Trace</button>
            </div>
          </div>
        </div>

        {/* MODAL 4: FEATURE DETAIL DATASHEET */}
        <div className={`modal-overlay ${activeModal === 'featureDetail' ? 'open' : ''}`}>
          <div className="modal-content-box" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3>📄 {selectedFeatureDetail?.name}</h3>
              <button className="close-drawer-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            {selectedFeatureDetail && (
              <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <div>
                    <span className="feature-category-badge">{selectedFeatureDetail.category}</span>
                    <span style={{ marginLeft: '10px', color: 'var(--text-muted)' }}>OEM: <strong>{selectedFeatureDetail.manufacturer}</strong></span>
                  </div>
                  <a href={selectedFeatureDetail.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
                    🌐 Web Datasheet ➔
                  </a>
                </div>

                <h4 style={{ color: '#fff', marginBottom: '6px' }}>Technical Parameters:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                  <tbody>
                    {Object.entries(selectedFeatureDetail.specs).map(([k, v], idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '6px 10px', color: 'var(--neon-cyan)', fontWeight: '700', width: '35%' }}>{k.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
                        <td style={{ padding: '6px 10px', color: '#fff' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4 style={{ color: '#fff', marginBottom: '6px' }}>Key Capabilities:</h4>
                <ul style={{ paddingLeft: '18px', marginBottom: '16px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                  {selectedFeatureDetail.keyFeatures.map((b, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{b}</li>)}
                </ul>

                <div style={{ background: 'rgba(0,245,212,0.1)', borderLeft: '3px solid var(--neon-cyan)', padding: '8px 12px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '0.78rem' }}>
                  <strong>Plant Operations Context:</strong> {selectedFeatureDetail.plantUsage}
                </div>
              </div>
            )}
            <div className="modal-btn-row">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
              <button className="btn-primary" onClick={() => {
                injectFeatureIntoAgent(selectedFeatureDetail);
                setActiveModal(null);
              }}>
                ⚡ Inject into Agent Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 5: EXECUTIVE SHIFT HANDOVER REPORT */}
        <div className={`modal-overlay ${activeModal === 'report' ? 'open' : ''}`}>
          <div className="modal-content-box" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3>📑 Executive Shift Handover Report ({shiftData.name})</h3>
              <button className="close-drawer-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
                <div><strong>PLANT:</strong> Apex Precision Plant #4 • Sector 7</div>
                <div><strong>SHIFT:</strong> {shiftData.name} ({shiftData.hours})</div>
                <div><strong>SUPERVISOR:</strong> {shiftData.supervisor}</div>
                <div><strong>OEE ACHIEVED:</strong> {shiftData.oee}% (Target: 85.0%)</div>
                <div><strong>OUTPUT:</strong> {shiftData.actualUnits.toLocaleString()} / {shiftData.targetUnits.toLocaleString()} units ({((shiftData.actualUnits / shiftData.targetUnits) * 100).toFixed(1)}%)</div>
                <div><strong>SCRAP UNITS:</strong> {shiftData.scrapUnits} (Defect rate: 1.35%)</div>
              </div>

              <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '6px' }}>Shift Directives for Relieving Supervisor:</h4>
              <ul style={{ paddingLeft: '18px', color: '#e2e8f0', fontSize: '0.78rem', marginBottom: '14px' }}>
                {shiftData.handoverNotes.map((note, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{note}</li>)}
              </ul>
            </div>
            <div className="modal-btn-row">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>Close</button>
              <button className="btn-primary" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
            </div>
          </div>
        </div>

        {/* MODAL 6: INCIDENT HISTORY */}
        <IncidentHistoryModal 
          isOpen={activeModal === 'incidentHistory'} 
          incidents={incidentHistory} 
          onClose={() => setActiveModal(null)}
          onSelectIncident={(inc) => {
            setSelectedHistoryIncident(inc);
            setActiveModal('incidentDetail');
          }}
          onClearHistory={() => {
            if (window.storage) {
              window.storage.clearIncidents();
              setIncidentHistory([]);
              showToast('Incident history cleared from storage.');
            }
          }}
        />

        {/* MODAL 7: INCIDENT DETAIL DOSSIER */}
        <IncidentDetailModal 
          isOpen={activeModal === 'incidentDetail'} 
          incident={selectedHistoryIncident} 
          onClose={() => {
            setActiveModal(null);
            setSelectedHistoryIncident(null);
          }}
        />

        {/* FACTORY TOAST POPUP */}
        <div className={`factory-toast ${toastMsg ? 'show' : ''}`} role="status">
          {toastMsg}
        </div>

      </div>
    );
  }

  // MOUNT REACT APPLICATION
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  }

})();
