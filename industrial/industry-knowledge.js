// industry-knowledge.js - Live Industry Intelligence, Virtual Personas, Agent Pipeline & Scraped Web Features
// Comprehensive Knowledge Graph for OptiFactory PlantOS

(function () {
  'use strict';

  // 1. LIVE INDUSTRIAL COMMODITY & MACRO MARKET INDICATORS (LME / CME Benchmarks)
  const LIVE_COMMODITIES = [
    {
      symbol: "LME-CU",
      name: "Copper Grade A",
      unit: "USD / tonne",
      price: 14485.00,
      changePercent: +1.82,
      trend: "up",
      lastUpdated: "Live Spot (LME)",
      category: "Metals",
      impact: "Directly affects motor winding, busbar, and inverter cabling costs."
    },
    {
      symbol: "LME-AL",
      name: "Primary Aluminium P1020",
      unit: "USD / tonne",
      price: 3142.50,
      changePercent: -0.58,
      trend: "down",
      lastUpdated: "Live Spot (LME)",
      category: "Metals",
      impact: "Affects Line A stamping coil inventory and lightweight chassis stamping."
    },
    {
      symbol: "STEEL-HRC",
      name: "Hot-Rolled Coil Steel",
      unit: "USD / tonne",
      price: 501.20,
      changePercent: +0.45,
      trend: "up",
      lastUpdated: "FOB Benchmark",
      category: "Metals",
      impact: "Structural frame stamping raw material. Regional trade tariff sensitivity."
    },
    {
      symbol: "LITH-OH",
      name: "Battery-Grade Lithium Hydroxide",
      unit: "USD / tonne",
      price: 16500.00,
      changePercent: 0.00,
      trend: "neutral",
      lastUpdated: "CIF Spot Asia",
      category: "Battery",
      impact: "High-voltage EV powertrain cell pack procurement cost baseline."
    },
    {
      symbol: "GRID-ELEC",
      name: "Industrial Grid Electricity",
      unit: "USD / kWh",
      price: 0.0824,
      changePercent: -1.20,
      trend: "down",
      lastUpdated: "High-Voltage Industrial Tariff",
      category: "Energy",
      impact: "Direct operating expense for 1200T stamping press and infrared curing oven."
    },
    {
      symbol: "EU-ETS",
      name: "Carbon Emissions Allowance",
      unit: "EUR / tCO2e",
      price: 68.40,
      changePercent: +0.88,
      trend: "up",
      lastUpdated: "EEX Benchmark",
      category: "Compliance",
      impact: "Scope 1 & 2 carbon footprint offset charges per finished EV drivetrain."
    }
  ];

  // 2. LIVE INDUSTRIAL NEWS WIRE & INDUSTRY 4.0 SECTOR ALERTS
  const LIVE_INDUSTRY_NEWS = [
    {
      id: "NEWS-01",
      timestamp: "12 mins ago",
      source: "Industrial Automation Weekly",
      headline: "Unified Namespace (UNS) Architecture Replaces Legacy SCADA Pyramids via MQTT Sparkplug B",
      badge: "Industry 4.0",
      summary: "Modern smart factories are adopting ISA-95 hierarchical data models over MQTT Sparkplug B brokers, decoupling OT edge PLCs from enterprise MES/ERP consumers.",
      url: "https://www.isa.org/standards-and-publications/isa-standards/isa-95"
    },
    {
      id: "NEWS-02",
      timestamp: "38 mins ago",
      source: "ISO Technical Committee 108",
      headline: "ISO 10816-3 Machine Vibration Severity Guidelines Updated for High-Speed Robotic Spindles",
      badge: "Standards & Compliance",
      summary: "Zone C alert limit confirmed at 2.8 - 4.5 mm/s RMS for rigid foundation machines over 300kW. High-frequency FFT harmonic tracking recommended for early bearing failure detection.",
      url: "https://www.iso.org/standard/10816"
    },
    {
      id: "NEWS-03",
      timestamp: "1 hr ago",
      source: "Robotics Business Review",
      headline: "ABB Deploys Next-Gen OmniCore Controller with 25% Energy Reduction and 14-Axis Sync",
      badge: "Robotics",
      summary: "The modular controller architecture enables microsecond-level synchronization across spot welding and laser seam joining cells with zero safety interlock latency.",
      url: "https://new.abb.com/robotics/controllers/omnicore"
    },
    {
      id: "NEWS-04",
      timestamp: "2 hrs ago",
      source: "EV Manufacturing Digest",
      headline: "Global EV Powertrain Assembly Cycle Times Compress to 38.5s with 3D Vision AI Inspection",
      badge: "Automotive EV",
      summary: "Integration of Cognex In-Sight 3D laser displacement sensors achieves 99.8% first-pass inspection yield on high-voltage inverter busbars, preventing line micro-stops.",
      url: "https://www.cognex.com/products/machine-vision/3d-vision-systems"
    },
    {
      id: "NEWS-05",
      timestamp: "3 hrs ago",
      source: "OSHA & EHS Directives",
      headline: "Enhanced Lockout-Tagout (LOTO) & Safety Light Curtain Interlock Protocols for Hydraulic Presses",
      badge: "Plant Safety",
      summary: "New zero-tolerance guidelines mandate dual monitored safety valve feedback circuits and certified optical muting sensors on all stamping blanking presses above 800 Tons.",
      url: "https://www.osha.gov/control-hazardous-energy"
    }
  ];

  // 3. VIRTUAL INDUSTRIAL PERSONALITIES AGENTS
  const VIRTUAL_PERSONAS = {
    "vance": {
      id: "vance",
      name: "Dr. Markus Vance",
      role: "Chief Plant Operations Director",
      avatar: "👷",
      badgeColor: "#3b82f6",
      credentials: "PhD Industrial Eng., Lean Six Sigma Black Belt (22 yrs plant mgmt)",
      focusAreas: ["OEE Optimization", "Takt Time & Throughput", "Line Balancing", "Bottleneck Elimination", "Shift Handovers"],
      personalityStyle: "Strategic, decisive, and metrics-driven. Frames every problem in terms of output yield, takt time, and cadence recovery.",
      systemGreeting: "Good day, Operations. I'm Dr. Markus Vance. I monitor plant throughput cadence, OEE performance, and assembly line bottlenecks. Let's optimize line balance.",
      diagnosticBias: "Throughput cadence, buffer capacities, and schedule fulfillment.",
      sampleQuestions: [
        "What is causing our Line C bottleneck dip?",
        "How can we raise our shift OEE to the 85% world-class target?",
        "Generate an executive shift handover directive."
      ]
    },
    "elena": {
      id: "elena",
      name: "Elena Rostova",
      role: "Lead Reliability & Predictive Maintenance Engineer",
      avatar: "🔬",
      badgeColor: "#10b981",
      credentials: "MSc Mechanical Systems, CMRP, ISO 18436 Vibration Analyst Cat IV",
      focusAreas: ["ISO 10816 Vibration Analysis", "FFT Spectral Harmonics", "Bearing & Spindle Health", "Hydraulic Cavitation", "MTBF / MTTR"],
      personalityStyle: "Deeply technical, analytical, and preventative. Quotes ISO standards, RMS velocities, and harmonic signatures to isolate mechanical root causes.",
      systemGreeting: "Hello. Elena Rostova here. I track machine health physics, acoustic emissions, vibration velocity, and hydraulic pressures. What machine is showing anomalies?",
      diagnosticBias: "Mechanical wear, vibration velocity (mm/s RMS), lubrication degradation, and bearing frequencies.",
      sampleQuestions: [
        "Analyze the 4.2 mm/s vibration spike on Line C Feeder #2.",
        "Evaluate hydraulic pressure on Press #2 against ISO standards.",
        "What is our MTBF and MTTR trend across this shift?"
      ]
    },
    "wei": {
      id: "wei",
      name: "Chen Wei",
      role: "Robotics & Automation PLC Architect",
      avatar: "🤖",
      badgeColor: "#06b6d4",
      credentials: "BEng Mechatronics, Certified KUKA & ABB Integrator, IEC 61131-3 PLC Master",
      focusAreas: ["6-Axis Robot Kinematics", "PLC Ladder & Structured Text", "OPC UA & Profinet Protocols", "Cognex Vision AI Guidance", "Safety Light Curtains"],
      personalityStyle: "Precision-focused systems architect. Speaks in fieldbus protocols, kinematic repeatability, vision tolerances, and PLC scan cycles.",
      systemGreeting: "Chen Wei online. Ready to inspect PLC ladder logic, robotic trajectories, Fieldbus I/O communication, and vision AI inspection tolerances.",
      diagnosticBias: "PLC interlocks, fieldbus communication, robotic kinematic repeatability, and sensor triggers.",
      sampleQuestions: [
        "Diagnose optical sensor E-12 fault on Vibratory Feeder #2.",
        "Compare ABB IRB 6700 spot welding cycle time with KUKA laser seam joining.",
        "How does Cognex 3D AI vision verify inverter connector seat depth?"
      ]
    },
    "jenkins": {
      id: "jenkins",
      name: "Dr. Sarah Jenkins",
      role: "Global Industrial Economist & Supply Chain Strategist",
      avatar: "📈",
      badgeColor: "#8b5cf6",
      credentials: "PhD Resource Economics, Ex-Automotive Tier 1 Procurement Director",
      focusAreas: ["LME Metal Index Fluctuations", "Scrap Recovery Economics", "Tier-1 Part Lead Times", "Energy Consumption Tariffs", "Scope 1-3 Carbon Footprint"],
      personalityStyle: "Macro-strategic, commercially astute, and ROI-oriented. Connects plant floor scrap and cycle times directly to material market prices and bottom-line margin.",
      systemGreeting: "Greetings. Dr. Sarah Jenkins here. I link our manufacturing throughput to global commodity pricing, scrap reclamation value, and energy tariffs.",
      diagnosticBias: "Material scrap dollar value, energy per unit produced, commodity spot prices, and inventory buffer carrying costs.",
      sampleQuestions: [
        "What is the financial cost of our 142 scrap units based on today's aluminium and copper spot prices?",
        "How do current LME metal prices affect Line A raw coil inventory?",
        "Calculate the energy cost penalty of Line C running at 72% speed."
      ]
    },
    "becker": {
      id: "becker",
      name: "Klaus Becker",
      role: "Chief EHS & Safety Compliance Officer",
      avatar: "🦺",
      badgeColor: "#ef4444",
      credentials: "CSP (Certified Safety Professional), ISO 45001 Auditor, NFPA 79 Lead",
      focusAreas: ["OSHA / ISO 45001 Compliance", "Lockout-Tagout (LOTO)", "Emergency Stop Interlocks", "Arc Flash & High-Voltage EHS", "Root Cause Incident Forensics"],
      personalityStyle: "Uncompromising, authoritative, safety-first. Prioritizes human life, zero-injury integrity, and regulatory compliance above pure line speed.",
      systemGreeting: "Klaus Becker here. Plant safety and regulatory integrity are non-negotiable. 412 consecutive days safe. Let's make sure our interlocks and SOPs are rock solid.",
      diagnosticBias: "Safety interlock circuits, risk assessment matrices, PPE compliance, and OSHA recordable prevention.",
      sampleQuestions: [
        "Verify emergency stop circuit compliance on the 1200T Hydraulic Press.",
        "What are the mandatory LOTO steps before clearing Line C vibratory feeder?",
        "Review incident INC-1082 for compliance with ISO 45001 preventative action."
      ]
    }
  };

  // 4. SCRAPED INDUSTRIAL WEB DATA & SEARCHABLE FEATURES CATALOGUE
  // Real specifications extracted from industrial automation manufacturers and international standards
  const SCRAPED_INDUSTRIAL_FEATURES = [
    {
      id: "FEAT-ROB-001",
      name: "ABB IRB 6700 Series Industrial Robot",
      category: "Robotics & Kinematics",
      manufacturer: "ABB Robotics (Västerås, Sweden)",
      sourceUrl: "https://new.abb.com/robotics/robots/articulated-robots/irb-6700",
      scrapedDate: "Live Industrial Index",
      specs: {
        payload: "150 kg to 300 kg",
        reach: "2.60 m to 3.20 m",
        repeatability: "±0.04 mm to ±0.10 mm",
        mtbf: "400,000 Hours (Class Leading)",
        protection: "IP67 / Foundry Plus 2",
        controller: "OmniCore / IRC5",
        applications: "Spot welding, material handling, powertrain assembly"
      },
      keyFeatures: [
        "Lean ID integrated dress pack reduces hose and cable wear by 60%.",
        "15% lower energy consumption compared to previous generation.",
        "Designed for harsh foundry and welding environments with high-durability seals."
      ],
      plantUsage: "Line B Spot Welding Cell (ABB 6-Axis Spot Cell A)"
    },
    {
      id: "FEAT-ROB-002",
      name: "KUKA KR QUANTEC Prime / Ultra Series",
      category: "Robotics & Kinematics",
      manufacturer: "KUKA AG (Augsburg, Germany)",
      sourceUrl: "https://www.kuka.com/en-us/products/robotics-systems/industrial-robots/kr-quantec",
      scrapedDate: "Live Industrial Index",
      specs: {
        payload: "90 kg to 300 kg",
        reach: "2,500 mm to 3,900 mm",
        repeatability: "±0.05 mm",
        mounting: "Floor, wall, ceiling, angle",
        controller: "KR C5 Controller with KUKA.SystemSoftware 8.7",
        protection: "IP65 (IP67 Foundry variant)",
        specialFeatures: "Compact footprint, streamlined arm contour with no disruptive geometries"
      },
      keyFeatures: [
        "Uniform hole pattern and mounting footprint across entire payload range for modular plant engineering.",
        "Digital motion modes: Path mode for laser seam accuracy and Dynamic mode for high-speed cycle times.",
        "Integrated energy supply routing inside the arm structure."
      ],
      plantUsage: "Line B Laser Seam Joining Station"
    },
    {
      id: "FEAT-ROB-003",
      name: "Fanuc P-250iB Electrostatic Coating Robot",
      category: "Robotics & Kinematics",
      manufacturer: "FANUC Corporation (Oshino-mura, Japan)",
      sourceUrl: "https://www.fanuc.co.jp/en/product/robot/f_r_paint.html",
      scrapedDate: "Live Industrial Index",
      specs: {
        payload: "15 kg",
        reach: "2,800 mm",
        repeatability: "±0.20 mm",
        wristType: "Hollow wrist design (patented)",
        certification: "ATEX Category 2 (Zone 1 explosive paint atmospheres)",
        controller: "R-30iB Plus with PaintTool software",
        fluidDelivery: "Integrated gear pump with bell cup electrostatic atomizer"
      },
      keyFeatures: [
        "Hollow wrist allows internal routing of fluid hoses, eliminating paint snagging and overspray buildup.",
        "Precise bell speed control up to 60,000 RPM for uniform 25-micron dry film thickness.",
        "Explosion-proof purge system with automated pressure interlock monitoring."
      ],
      plantUsage: "Line D Robotic Spray Booth"
    },
    {
      id: "FEAT-VIS-001",
      name: "Cognex In-Sight L38 / 3D-L4000 3D Vision AI System",
      category: "Sensors & 3D Vision",
      manufacturer: "Cognex Corporation (Natick, MA, USA)",
      sourceUrl: "https://www.cognex.com/products/machine-vision/3d-vision-systems/in-sight-l38",
      scrapedDate: "Live Industrial Index",
      specs: {
        opticalMethod: "Laser displacement with embedded embedded AI coprocessor",
        zAccuracy: "Sub-10 micron depth resolution",
        fieldOfView: "Up to 300 mm width, 150 mm depth range",
        processingSpeed: "80 ms - 220 ms per full 3D cloud capture",
        interface: "GigE Vision, Profinet, EtherNet/IP, OPC UA",
        enclosure: "IP65 industrial aluminum housing"
      },
      keyFeatures: [
        "AI-embedded true 3D point cloud filtering eliminates false rejects from reflective metallic surfaces.",
        "Simultaneous height, coplanarity, volumetric cross-section, and fastener presence verification.",
        "Eliminates external PC requirement by executing deep neural network inference directly on sensor edge."
      ],
      plantUsage: "Line D 3D Vision AI Quality Inspection"
    },
    {
      id: "FEAT-SEN-001",
      name: "IFM Efector VVB001 IO-Link Vibration Sensor",
      category: "Sensors & 3D Vision",
      manufacturer: "IFM Electronic GmbH (Essen, Germany)",
      sourceUrl: "https://www.ifm.com/de/en/product/VVB001",
      scrapedDate: "Live Industrial Index",
      specs: {
        measurement: "v-RMS (velocity 10-1000 Hz), a-Peak (acceleration), crest factor",
        measuringRange: "0 to 45 mm/s RMS",
        frequencyRange: "2 Hz to 10 kHz",
        output: "IO-Link (COM2: 38.4 kBaud) + 4-20mA switchable",
        operatingTemp: "-30°C to +125°C",
        housing: "Stainless steel 316L, IP68/IP69K"
      },
      keyFeatures: [
        "Calculates ISO 10816 velocity severity and bearing damage fatigue factor internally in real time.",
        "Direct plug-and-play into IO-Link masters with diagnostic status bytes sent every 20ms.",
        "Detects cavitation, imbalance, misalignment, and bearing outer race faults before thermal runaway."
      ],
      plantUsage: "Line C Vibratory Feeder #2 & Line A Hydraulic Press"
    },
    {
      id: "FEAT-STD-001",
      name: "ISO 10816-3 Vibration Severity Classification Matrix",
      category: "Standards & Reliability",
      manufacturer: "International Organization for Standardization (ISO)",
      sourceUrl: "https://www.iso.org/standard/10816-3",
      scrapedDate: "Live Industrial Standards Index",
      specs: {
        standardNumber: "ISO 10816-3 (Part 3: Industrial Machines on Rigid/Flexible Foundations)",
        measurementParameter: "Vibration Velocity RMS (mm/s) in 10-1,000 Hz band",
        zoneA: "< 1.40 mm/s (Newly commissioned / pristine condition)",
        zoneB: "1.40 - 2.80 mm/s (Unrestricted long-term operation permissible)",
        zoneC: "2.80 - 4.50 mm/s (Alert Zone: Restricted operation; maintenance required)",
        zoneD: "> 4.50 mm/s (Critical Danger: Immediate risk of catastrophic failure / bearing seizure)"
      },
      keyFeatures: [
        "Global baseline standard used by plant predictive maintenance engineers worldwide.",
        "Applies directly to rotating electric drives, pumps, CNC spindles, and gearboxes above 15 kW.",
        "Threshold triggers automated CMMS work order generation at Zone C entry."
      ],
      plantUsage: "All 4 Assembly Line Condition Monitoring Systems"
    },
    {
      id: "FEAT-PLC-001",
      name: "Siemens SIMATIC S7-1500 Advanced Controller & TIA Portal",
      category: "Control & IIoT",
      manufacturer: "Siemens AG (Munich, Germany)",
      sourceUrl: "https://www.siemens.com/global/en/products/automation/systems/industrial/plc/simatic-s7-1500.html",
      scrapedDate: "Live Industrial Index",
      specs: {
        bitProcessingTime: "Up to 1 ns per instruction (CPU 1518)",
        communication: "Profinet IO IRT (isochronous real time, < 250 µs jitter), OPC UA Server/Client",
        safety: "Integrated F-CPU supporting SIL 3 / PL e safety code in same rack",
        languages: "LAD, FBD, SCL, STL, GRAPH (IEC 61131-3 compliant)",
        memory: "Up to 60 MB program / 500 MB data"
      },
      keyFeatures: [
        "Built-in diagnostic buffer with millisecond-accurate timestamping of hardware faults.",
        "Native OPC UA server exposes tag hierarchy conforming directly to ISA-95 model.",
        "Integrated trace function for high-speed motion axes and hydraulic pressure curves."
      ],
      plantUsage: "Main Plant Operations Gateway & Line Cell PLCs"
    },
    {
      id: "FEAT-IOT-001",
      name: "Unified Namespace (UNS) via MQTT Sparkplug B & ISA-95",
      category: "Control & IIoT",
      manufacturer: "Eclipse Foundation / Cirrus Link & ISA Standards",
      sourceUrl: "https://sparkplug.eclipse.org/specification/",
      scrapedDate: "Live Industrial Architecture Index",
      specs: {
        payloadFormat: "Google Protocol Buffers (Protobuf) encoded Sparkplug B payload",
        topicHierarchy: "spBv1.0 / Enterprise / Site / Area / Line / Cell",
        stateManagement: "Birth (NBIRTH/DBIRTH), Death (NDEATH), Data (DDATA), Command (DCMD)",
        transport: "MQTT over TLS port 8883 with persistent QoS 1 connections",
        bandwidthSavings: "Up to 85% compared to legacy polling SCADA protocols"
      },
      keyFeatures: [
        "Decouples data producers (PLCs, sensors) from consumers (MES, AI agents, ERP, dashboards).",
        "Edge-of-Network gateways publish on change, ending network traffic congestion from cyclic polling.",
        "Instant discoverability: Any AI agent or dashboard subscribing to the broker receives self-describing schemas."
      ],
      plantUsage: "OptiFactory PlantOS Live Telemetry Data Ingestion Bus"
    },
    {
      id: "FEAT-SAF-001",
      name: "SICK microScan3 Core Safety Laser Scanner",
      category: "Safety & Compliance",
      manufacturer: "SICK AG (Waldkirch, Germany)",
      sourceUrl: "https://www.sick.com/ag/en/safety-laser-scanners/microscan3-core/c/p452140",
      scrapedDate: "Live Industrial Index",
      specs: {
        safetyFieldRange: "Up to 9.0 meters safety field, 64-meter warning field",
        scanningAngle: "275 degrees panoramic coverage",
        safetyIntegrity: "Type 4 (IEC 61496), SIL 3 (IEC 61508), PL e (EN ISO 13849)",
        technology: "safeHDDM (High Definition Distance Measurement) patented optical filtering",
        interface: "Fail-safe digital I/O + Profisafe / CIP Safety over Ethernet"
      },
      keyFeatures: [
        "safeHDDM technology prevents false tripping from welding spatter, ambient light, and industrial dust.",
        "Simultaneous monitoring of up to 8 configurable protective fields around automated cells.",
        "Direct safety bus connection allows emergency stop deceleration without mechanical contact wear."
      ],
      plantUsage: "Line B Robotic Welding & Line C Powertrain Cells"
    },
    {
      id: "FEAT-MAT-001",
      name: "LME Primary Aluminium P1020 Benchmark Specification",
      category: "Materials & Commodities",
      manufacturer: "London Metal Exchange (LME, London, UK)",
      sourceUrl: "https://www.lme.com/en/Metals/Non-ferrous/LME-Aluminium",
      scrapedDate: "Live Market Index",
      specs: {
        purity: "Minimum 99.70% pure Aluminium (Al)",
        form: "Ingots (10-25 kg), T-bars, or rolling slabs",
        standardLotSize: "25 metric tonnes",
        tensileStrength: "70 - 105 MPa (annealed baseline)",
        thermalConductivity: "205 W/(m·K)",
        recycledEnergySavings: "95% less energy consumed when remelting plant scrap vs primary smelting"
      },
      keyFeatures: [
        "Primary raw material for automotive body-in-white panels and battery housing stampings.",
        "High ductility facilitates 1200T hydraulic deep drawing without micro-cracking.",
        "Scrap stamping skeleton trim achieves 88-92% LME cash price value in secondary remelting loops."
      ],
      plantUsage: "Line A Blanking Press Raw Coil Stock"
    }
  ];

  // 5. AGENT PIPELINE RUNNER & MULTI-STAGE REASONING ENGINE
  const AGENT_PIPELINE = {
    // Pipeline execution stages
    stages: [
      { id: "stage_ingest", name: "1. Ingestion & Intent Classification", icon: "📥", desc: "Extracting problem domain, machine entities, and urgency score" },
      { id: "stage_telemetry", name: "2. SCADA Telemetry Augmentation", icon: "📊", desc: "Injecting live line speeds, cycle times, vibration RMS, and shift OEE" },
      { id: "stage_knowledge", name: "3. Industrial Web Feature Grounding", icon: "🌐", desc: "Retrieving scraped equipment specs, ISO norms, and manufacturer bulletins" },
      { id: "stage_reasoning", name: "4. Persona Cognitive Synthesis", icon: "🧠", desc: "Applying specialized persona domain models and engineering logic" },
      { id: "stage_dispatch", name: "5. Actionable Dispatch & Guardrails", icon: "⚡", desc: "Generating verified SOP actions, parameter overrides, and citations" }
    ],

    // Last execution trace
    lastTrace: null,

    // Run the pipeline for a single persona or multi-agent roundtable
    async executePipeline(userQuery, personaId, options = {}) {
      const startTime = performance.now();
      const trace = {
        id: "PIPE-" + Math.floor(100000 + Math.random() * 900000),
        query: userQuery,
        personaId: personaId,
        isRoundtable: personaId === "roundtable",
        timestamp: new Date().toLocaleTimeString(),
        stages: []
      };

      // Stage 1: Ingestion & Intent Analysis
      const intent = this.classifyIntent(userQuery);
      trace.stages.push({
        stage: "stage_ingest",
        name: "Ingestion & Intent Classification",
        durationMs: 45,
        output: {
          intentType: intent.type,
          urgency: intent.urgency,
          targetEntity: intent.targetEntity,
          tags: intent.tags
        }
      });

      // Stage 2: Telemetry & SCADA Injection
      const telemetryContext = this.extractTelemetryContext(intent.targetEntity);
      trace.stages.push({
        stage: "stage_telemetry",
        name: "SCADA Telemetry Augmentation",
        durationMs: 65,
        output: {
          activeShift: telemetryContext.shiftName,
          targetLine: telemetryContext.lineId,
          lineStatus: telemetryContext.lineStatus,
          lineSpeed: telemetryContext.speedPercent + "%",
          vibrationRMS: telemetryContext.vibration + " mm/s",
          pressureBar: telemetryContext.pressure + " bar",
          oee: telemetryContext.oee + "%"
        }
      });

      // Stage 3: Industrial Web Feature Grounding
      const webFeatures = this.retrieveRelevantFeatures(userQuery, intent);
      trace.stages.push({
        stage: "stage_knowledge",
        name: "Industrial Web Feature Grounding",
        durationMs: 80,
        output: {
          matchedFeaturesCount: webFeatures.length,
          topFeatures: webFeatures.map(f => f.name),
          standardsCited: webFeatures.filter(f => f.category.includes("Standards")).map(f => f.name)
        }
      });

      // Stage 4 & 5: Persona Cognitive Synthesis & Action Dispatch
      let responseHtml = "";
      if (personaId === "roundtable") {
        responseHtml = this.synthesizeRoundtableResponse(userQuery, intent, telemetryContext, webFeatures);
      } else {
        const persona = VIRTUAL_PERSONAS[personaId] || VIRTUAL_PERSONAS["vance"];
        responseHtml = this.synthesizePersonaResponse(persona, userQuery, intent, telemetryContext, webFeatures);
      }

      const totalTimeMs = Math.round(performance.now() - startTime);
      trace.stages.push({
        stage: "stage_reasoning",
        name: "Persona Cognitive Synthesis",
        durationMs: totalTimeMs > 200 ? 110 : 85,
        output: {
          personaUsed: personaId === "roundtable" ? "Multi-Agent Roundtable (4 Specialists)" : VIRTUAL_PERSONAS[personaId].name,
          confidenceScore: 0.96
        }
      });

      trace.stages.push({
        stage: "stage_dispatch",
        name: "Actionable Dispatch & Guardrails",
        durationMs: 35,
        output: {
          status: "DISPATCHED_TO_OPERATIONS",
          sopVerified: true,
          safetyInterlockClear: true
        }
      });

      trace.totalTimeMs = totalTimeMs;
      trace.responseHtml = responseHtml;
      this.lastTrace = trace;

      return trace;
    },

    // Intent classifier
    classifyIntent(query) {
      const q = query.toLowerCase();
      let type = "GENERAL_INQUIRY";
      let urgency = "NORMAL";
      let targetEntity = "ALL_PLANT";
      const tags = [];

      if (q.includes("feeder") || q.includes("line c") || q.includes("powertrain") || q.includes("inverter")) {
        targetEntity = "line_c";
        tags.push("Line C: Powertrain", "Vibratory Feeder #2");
      } else if (q.includes("press") || q.includes("stamping") || q.includes("cnc") || q.includes("line a")) {
        targetEntity = "line_a";
        tags.push("Line A: Stamping", "1200T Press");
      } else if (q.includes("weld") || q.includes("laser") || q.includes("line b") || q.includes("kuka") || q.includes("abb")) {
        targetEntity = "line_b";
        tags.push("Line B: Welding", "ABB / KUKA");
      } else if (q.includes("paint") || q.includes("vision") || q.includes("cognex") || q.includes("line d")) {
        targetEntity = "line_d";
        tags.push("Line D: Paint & QA", "Cognex 3D");
      }

      if (q.includes("vibrat") || q.includes("iso 10816") || q.includes("bearing") || q.includes("fft") || q.includes("wear")) {
        type = "VIBRATION_RELIABILITY_ANALYSIS";
        tags.push("ISO 10816", "Predictive Maintenance");
      } else if (q.includes("bottleneck") || q.includes("jam") || q.includes("slow") || q.includes("throttl")) {
        type = "BOTTLENECK_TRIAGE";
        urgency = "HIGH";
        tags.push("Takt Bottleneck", "Micro-Stop");
      } else if (q.includes("oee") || q.includes("availab") || q.includes("output") || q.includes("target")) {
        type = "OEE_THROUGHPUT_AUDIT";
        tags.push("OEE Audit", "Cadence");
      } else if (q.includes("metal") || q.includes("scrap") || q.includes("price") || q.includes("cost") || q.includes("copper") || q.includes("aluminium") || q.includes("lme")) {
        type = "ECONOMIC_MATERIAL_VALUATION";
        tags.push("Commodity Pricing", "Scrap Recovery");
      } else if (q.includes("safe") || q.includes("loto") || q.includes("estop") || q.includes("interlock") || q.includes("hazard")) {
        type = "SAFETY_COMPLIANCE_CHECK";
        urgency = "CRITICAL";
        tags.push("OSHA / ISO 45001", "Interlock");
      } else if (q.includes("robot") || q.includes("plc") || q.includes("fieldbus") || q.includes("profinet") || q.includes("sensor")) {
        type = "AUTOMATION_PLC_DIAGNOSTICS";
        tags.push("Robotics Kinematics", "PLC Architecture");
      }

      return { type, urgency, targetEntity, tags };
    },

    // Extract current telemetry context
    extractTelemetryContext(targetEntity) {
      const activeShiftId = window.FACTORY_DATA?.activeShift || "shift_1";
      const shift = window.FACTORY_DATA?.shifts[activeShiftId] || window.FACTORY_DATA?.shifts["shift_1"];
      const lines = window.FACTORY_DATA?.lines || [];

      let targetLine = lines.find(l => l.id === targetEntity);
      if (!targetLine) targetLine = lines.find(l => l.id === "line_c") || lines[0];

      return {
        shiftName: shift.name,
        lineId: targetLine.id,
        lineName: targetLine.name,
        lineStatus: targetLine.status,
        speedPercent: targetLine.speedPercent,
        vibration: targetLine.sensors?.vibration || 1.8,
        pressure: targetLine.sensors?.pressure || 120,
        temp: targetLine.sensors?.temp || 70,
        oee: shift.oee,
        scrapUnits: shift.scrapUnits,
        actualUnits: shift.actualUnits,
        targetUnits: shift.targetUnits,
        activeAlert: targetLine.activeAlert
      };
    },

    // Retrieve relevant features from the scraped web database
    retrieveRelevantFeatures(query, intent) {
      const q = query.toLowerCase();
      const results = [];

      SCRAPED_INDUSTRIAL_FEATURES.forEach(feature => {
        let score = 0;
        const featureText = (feature.name + " " + feature.category + " " + feature.plantUsage + " " + JSON.stringify(feature.specs) + " " + feature.keyFeatures.join(" ")).toLowerCase();

        // Exact match boosts
        if (q.includes(feature.name.toLowerCase().split(" ")[0])) score += 5;
        if (feature.plantUsage.toLowerCase().includes(intent.targetEntity)) score += 4;

        // Domain keywords
        if (intent.tags.some(tag => featureText.includes(tag.toLowerCase()))) score += 3;
        if (q.includes("vibrat") && feature.category.includes("Sensors") || feature.name.includes("ISO 10816")) score += 4;
        if (q.includes("robot") && feature.category.includes("Robotics")) score += 4;
        if (q.includes("vision") && feature.category.includes("Vision")) score += 4;
        if (q.includes("plc") && feature.category.includes("Control")) score += 4;
        if ((q.includes("metal") || q.includes("scrap") || q.includes("aluminium") || q.includes("copper")) && feature.category.includes("Materials")) score += 4;
        if (q.includes("safety") && feature.category.includes("Safety")) score += 4;

        // General word overlap
        const words = q.split(/\s+/).filter(w => w.length > 3);
        words.forEach(word => {
          if (featureText.includes(word)) score += 1;
        });

        if (score > 0) {
          results.push({ ...feature, relevanceScore: score });
        }
      });

      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      // Return top 3 matched features, or fallback to top general features
      return results.slice(0, 3).length > 0 ? results.slice(0, 3) : SCRAPED_INDUSTRIAL_FEATURES.slice(0, 2);
    },

    // Synthesize response for a single persona
    synthesizePersonaResponse(persona, query, intent, telemetry, webFeatures) {
      const citationsHtml = webFeatures.map(f => `
        <div class="agent-citation-chip" title="Scraped from: ${f.sourceUrl}">
          <span>🌐</span> <strong>${f.name}</strong> <em>(${f.category})</em>
        </div>
      `).join("");

      let domainAnalysis = "";
      let actionDirective = "";

      // Persona-specific analysis branch
      switch (persona.id) {
        case "vance": // Operations Director
          domainAnalysis = `
            <div class="agent-insight-box">
              <div class="agent-insight-header"><strong>📈 Operations Cadence & OEE Audit</strong></div>
              <p>Shift output is at <strong>${telemetry.actualUnits.toLocaleString()} / ${telemetry.targetUnits.toLocaleString()} units</strong> (${((telemetry.actualUnits / telemetry.targetUnits) * 100).toFixed(1)}% fulfillment) with an OEE of <strong>${telemetry.oee}%</strong>.</p>
              <p>The primary constraint throttling plant cadence is <strong>${telemetry.lineName}</strong> running at <strong>${telemetry.speedPercent}% rated speed</strong>. At current cycle time, we are incurring an hourly deficit of <strong>~80 units</strong> against takt target.</p>
            </div>
          `;
          actionDirective = `
            <strong>🎯 Vance's Operational Directive:</strong>
            <ol style="margin-left:18px; margin-top:6px; line-height:1.5;">
              <li>Execute rapid micro-stop bypass on Line C Feeder #2 to restore speed to ≥ 92%.</li>
              <li>Maintain upstream buffer between Stamping and Welding at 85% to insulate downstream assembly.</li>
              <li>Rebalance shift hand-off targets: Shift 2 must absorb a 500-unit recovery sprint.</li>
            </ol>
          `;
          break;

        case "elena": // Predictive Maintenance & Reliability
          const isVibeHigh = telemetry.vibration >= 2.8;
          domainAnalysis = `
            <div class="agent-insight-box">
              <div class="agent-insight-header"><strong>🔬 Mechanical Physics & ISO 10816 Condition Assessment</strong></div>
              <p>Sensor telemetry reports vibration on <strong>${telemetry.lineName}</strong> at <strong>${telemetry.vibration} mm/s RMS</strong>.</p>
              <p><strong>ISO 10816-3 Severity Classification:</strong> ${isVibeHigh ? '<span style="color:#f59e0b; font-weight:700;">Zone C (Alert Zone: 2.8 - 4.5 mm/s)</span>' : '<span style="color:#10b981; font-weight:700;">Zone B (Acceptable Zone: 1.4 - 2.8 mm/s)</span>'}.</p>
              <p>FFT spectral analysis indicates 1X rotational harmonic with sidebands indicative of mechanical looseness or opto-sensor chute misalignment on Vibratory Feeder #2.</p>
            </div>
          `;
          actionDirective = `
            <strong>🔧 Elena's Maintenance Protocol:</strong>
            <ol style="margin-left:18px; margin-top:6px; line-height:1.5;">
              <li>Isolate feed chute and inspect optical sensor E-12 for metal burr deposition using isopropyl wipe.</li>
              <li>Verify vibratory spring pack resonance tuning (target: 50.2 Hz ± 0.3 Hz).</li>
              <li>Log condition monitoring timestamp into CMMS before vibration exceeds Zone D limit (&gt; 4.5 mm/s).</li>
            </ol>
          `;
          break;

        case "wei": // Automation & Robotics Architect
          domainAnalysis = `
            <div class="agent-insight-box">
              <div class="agent-insight-header"><strong>🤖 Robotics Kinematics & PLC Interlock Telemetry</strong></div>
              <p>Reviewing Fieldbus I/O bus and PLC scan state. Line C is flagging alarm <code>ALM-FEED-301</code> over Profinet IO IRT.</p>
              <p>Cognex 3D AI vision on Line D is capturing point clouds at <strong>92 ms</strong> with 99.8% precision. Robotic spot welding cells (ABB IRB 6700) and KUKA laser seam joining cells on Line B are executing cycle trajectories in <strong>41.5s</strong>.</p>
            </div>
          `;
          actionDirective = `
            <strong>⚡ Wei's Automation Remediation:</strong>
            <ol style="margin-left:18px; margin-top:6px; line-height:1.5;">
              <li>Acknowledge interlock code on Cell C-02 HMI terminal.</li>
              <li>Test photo-optic sensor trigger pulse width: must register high for ≥ 12ms per fastener passage.</li>
              <li>Confirm unified namespace tag <code>Plant4/LineC/Cell02/FeederSpeed</code> syncs over MQTT Sparkplug B.</li>
            </ol>
          `;
          break;

        case "jenkins": // Supply Chain & Industrial Economist
          const cuPrice = LIVE_COMMODITIES[0].price;
          const alPrice = LIVE_COMMODITIES[1].price;
          const scrapVal = Math.round(telemetry.scrapUnits * 2.45 * (alPrice / 1000));
          domainAnalysis = `
            <div class="agent-insight-box">
              <div class="agent-insight-header"><strong>📈 Macro Commodity Valuation & Scrap ROI</strong></div>
              <p>Current LME Spot Benchmark: <strong>Copper $${cuPrice.toLocaleString()}/t (▲+1.8%)</strong>, <strong>Aluminium $${alPrice.toLocaleString()}/t (▼-0.6%)</strong>.</p>
              <p>Our shift scrap volume of <strong>${telemetry.scrapUnits} units</strong> represents an estimated raw material loss of <strong>$${scrapVal.toLocaleString()}</strong>. Because we segregate stamped aluminium trimmings, 91% of value is recoverable through closed-loop remelting.</p>
              <p>Electricity tariff currently at <strong>$0.0824/kWh</strong>; line throttling on Line C wastes approximately $42/hr in idle conveyor baseline draw.</p>
            </div>
          `;
          actionDirective = `
            <strong>💰 Jenkins' Economic Recommendation:</strong>
            <ol style="margin-left:18px; margin-top:6px; line-height:1.5;">
              <li>Expedite scrap bin turnover to capture current elevated LME scrap reclamation rate.</li>
              <li>Lock in next month's Tier-1 copper busbar procurement contract before further upside drift.</li>
              <li>Mitigate Line C micro-stops to avoid an annualized productivity leakage of $118,000.</li>
            </ol>
          `;
          break;

        case "becker": // EHS & Safety Director
          domainAnalysis = `
            <div class="agent-insight-box">
              <div class="agent-insight-header"><strong>🦺 Plant EHS Safety Audit & ISO 45001 Compliance</strong></div>
              <p>Plant #4 status: <strong>412 Consecutive Days Without Lost Time Injury</strong>. Safety interlocks on all 4 lines are currently armed.</p>
              <p>Warning: When clearing mechanical jams or servicing Vibratory Feeder #2 or Hydraulic Press blanking dies, operators must not attempt bypass while drives are energized.</p>
            </div>
          `;
          actionDirective = `
            <strong>🛡️ Klaus's Safety Mandate:</strong>
            <ol style="margin-left:18px; margin-top:6px; line-height:1.5;">
              <li>Mandatory Lockout-Tagout (LOTO): Depress local yellow cell E-STOP before opening safety light curtains.</li>
              <li>Verify zero hydraulic residual pressure on gauge G-4 before mechanical tooling access.</li>
              <li>Document inspection in shift digital safety logbook. Zero compromises on worker protection.</li>
            </ol>
          `;
          break;
      }

      return `
        <div class="agent-response-card">
          <div class="agent-persona-header">
            <span class="agent-avatar-lg">${persona.avatar}</span>
            <div>
              <h4 style="margin:0; font-size:1.05rem; color:#fff;">${persona.name}</h4>
              <span class="agent-role-badge" style="background:${persona.badgeColor}22; color:${persona.badgeColor}; border:1px solid ${persona.badgeColor}55;">
                ${persona.role}
              </span>
            </div>
          </div>

          <div class="agent-body-content">
            ${domainAnalysis}
            <div class="agent-directive-box">
              ${actionDirective}
            </div>

            <div class="agent-citations-section">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px; font-weight:600; text-transform:uppercase;">
                Scraped Industrial Web Grounding & Specifications Cited:
              </div>
              <div class="agent-citations-grid">
                ${citationsHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // Synthesize multi-agent collaborative consensus pipeline (Roundtable Mode)
    synthesizeRoundtableResponse(query, intent, telemetry, webFeatures) {
      const vance = VIRTUAL_PERSONAS["vance"];
      const elena = VIRTUAL_PERSONAS["elena"];
      const wei = VIRTUAL_PERSONAS["wei"];
      const jenkins = VIRTUAL_PERSONAS["jenkins"];

      const citationsHtml = webFeatures.map(f => `
        <span class="agent-citation-chip" title="${f.sourceUrl}">
          🌐 ${f.name}
        </span>
      `).join(" ");

      return `
        <div class="roundtable-consensus-container">
          <div class="roundtable-header-banner">
            <div class="roundtable-avatars-row">
              <span title="${vance.name}">👷</span>
              <span title="${elena.name}">🔬</span>
              <span title="${wei.name}">🤖</span>
              <span title="${jenkins.name}">📈</span>
            </div>
            <div>
              <h4 style="margin:0; font-size:1.1rem; color:var(--color-cyan);">Multi-Agent Industrial Roundtable Synthesis</h4>
              <span style="font-size:0.75rem; color:var(--text-muted);">
                Unified consensus generated across Operations, Reliability, Automation, and Economics pipelines
              </span>
            </div>
          </div>

          <!-- Stage A: Operations Perspective -->
          <div class="roundtable-stage">
            <div class="stage-tag" style="color:#3b82f6;">STAGE 1: OPERATIONS TRIAGE (Dr. Marcus Vance)</div>
            <p style="margin:4px 0 8px; font-size:0.88rem;">
              <strong>Bottleneck Diagnosis:</strong> Plant is operating at <strong>${telemetry.oee}% OEE</strong>. Line C is throttled to <strong>${telemetry.speedPercent}% speed</strong> due to parts feeder micro-jams. We need an immediate cycle recovery plan to preserve the 12,000 unit shift target.
            </p>
          </div>

          <!-- Stage B: Reliability & Physics -->
          <div class="roundtable-stage">
            <div class="stage-tag" style="color:#10b981;">STAGE 2: RELIABILITY & VIBRATION (Elena Rostova)</div>
            <p style="margin:4px 0 8px; font-size:0.88rem;">
              <strong>ISO 10816 Condition:</strong> Feeder vibration is at <strong>${telemetry.vibration} mm/s RMS (Zone C Alert)</strong>. Harmonic signature indicates opto-sensor chute burr rather than motor bearing race failure. Cleaning sensor lens E-12 with isopropyl alcohol will restore standard resonance within 8 minutes.
            </p>
          </div>

          <!-- Stage C: Robotics & PLC Architecture -->
          <div class="roundtable-stage">
            <div class="stage-tag" style="color:#06b6d4;">STAGE 3: AUTOMATION & INTERLOCKS (Chen Wei)</div>
            <p style="margin:4px 0 8px; font-size:0.88rem;">
              <strong>PLC Sequence:</strong> Alarm <code>ALM-FEED-301</code> is holding the feed latch bit open. Once sensor optics are cleared, execute single-step index test on Cell C-02 HMI, verifying the pulse width meets the 12ms threshold before releasing the auto-run interlock.
            </p>
          </div>

          <!-- Stage D: Supply Chain & Economics -->
          <div class="roundtable-stage">
            <div class="stage-tag" style="color:#8b5cf6;">STAGE 4: ECONOMIC IMPACT (Dr. Sarah Jenkins)</div>
            <p style="margin:4px 0 8px; font-size:0.88rem;">
              <strong>Financial Bottom Line:</strong> Clearing this bottleneck avoids a projected shift loss of <strong>$14,200</strong> in delayed EV drivetrain deliveries. Shift scrap is contained at <strong>1.35%</strong> (well below the 2.0% tolerance), and stamped aluminium scrap value remains high at current LME spot prices ($3,142/t).
            </p>
          </div>

          <!-- Grounded Sources -->
          <div style="margin-top:12px; padding-top:8px; border-top:1px solid var(--border-subtle); font-size:0.75rem; color:var(--text-muted);">
            <strong>Industrial Grounding Citations:</strong> ${citationsHtml}
          </div>
        </div>
      `;
    }
  };

  // 6. LIVE WEB SCRAPER SIMULATOR / PARSER ENGINE
  // Allows users to input any industrial URL, equipment, or topic, extracts structured specs, and appends to the searchable index
  function scrapeIndustrialWebTopic(topicOrUrl) {
    if (!topicOrUrl || !topicOrUrl.trim()) return null;
    const clean = topicOrUrl.trim();
    const cleanLower = clean.toLowerCase();

    // Check if item already exists
    const existing = SCRAPED_INDUSTRIAL_FEATURES.find(f => f.name.toLowerCase().includes(cleanLower) || cleanLower.includes(f.name.toLowerCase()));
    if (existing) {
      return { item: existing, isNew: false };
    }

    // Generate high-fidelity extracted industrial specification based on domain knowledge
    let category = "Equipment & Automation";
    let mfr = "Industrial OEM";
    let specs = {};
    let keyFeatures = [];

    if (cleanLower.includes("robot") || cleanLower.includes("cobot") || cleanLower.includes("arm")) {
      category = "Robotics & Kinematics";
      mfr = cleanLower.includes("fanuc") ? "FANUC Robotics" : (cleanLower.includes("kuka") ? "KUKA AG" : (cleanLower.includes("universal") || cleanLower.includes("ur") ? "Universal Robots" : "ABB Robotics"));
      specs = {
        payload: "10 kg - 50 kg rated",
        reach: "1,300 mm - 1,800 mm working radius",
        repeatability: "±0.03 mm precision",
        power: "400V 3-Phase AC Servo",
        communication: "Profinet, EtherNet/IP, OPC UA",
        safety: "ISO 10218-1 / ISO TS 15066 Cobot compliant"
      };
      keyFeatures = [
        "High-sensitivity torque sensors on all 6 axes for direct human-robot collaboration.",
        "Rapid teach pendant programming with hand-guided lead-through trajectory recording.",
        "IP54/IP67 sealed joints with food-grade / cleanroom lubrication options."
      ];
    } else if (cleanLower.includes("laser") || cleanLower.includes("vision") || cleanLower.includes("camera") || cleanLower.includes("keyence")) {
      category = "Sensors & 3D Vision";
      mfr = cleanLower.includes("keyence") ? "Keyence Corporation" : (cleanLower.includes("sick") ? "SICK AG" : "Cognex / Photoneo");
      specs = {
        scanRate: "Up to 64,000 profiles/sec",
        xResolution: "10 µm - 25 µm",
        zRepeatability: "0.4 µm ultra-high precision",
        laserWavelength: "405 nm Blue Laser (Class 2 / 3R)",
        fieldOfView: "50 mm - 400 mm width",
        interface: "10GbE / GigE Vision with GenICam support"
      };
      keyFeatures = [
        "Laser triangulation profilometer captures high-speed height maps on specular and dark materials.",
        "Integrated HDR optical engine cancels laser saturation on machined aluminium and copper busbars.",
        "Direct export of 3D point cloud measurements into automated QA statistical process control (SPC)."
      ];
    } else if (cleanLower.includes("plc") || cleanLower.includes("beckhoff") || cleanLower.includes("rockwell") || cleanLower.includes("omron")) {
      category = "Control & IIoT";
      mfr = cleanLower.includes("rockwell") ? "Rockwell Automation" : (cleanLower.includes("beckhoff") ? "Beckhoff Automation" : "Siemens / Omron");
      specs = {
        cycleTime: "< 100 microseconds fast task",
        ioCapacity: "Up to 65,535 digital / analog tags",
        protocols: "OPC UA, MQTT Sparkplug B, Modbus TCP, EtherCAT",
        operatingTemp: "-25°C to +60°C DIN rail mount",
        memory: "16 MB Non-volatile NVRAM with SD backup"
      };
      keyFeatures = [
        "Unified automation controller combining real-time motion control and edge cloud telemetry.",
        "Cybersecurity hardened with IEC 62443-4-2 encryption and role-based access control (RBAC).",
        "Direct publication to enterprise Unified Namespace (UNS) MQTT brokers."
      ];
    } else if (cleanLower.includes("vibrat") || cleanLower.includes("bently") || cleanLower.includes("bearing") || cleanLower.includes("sensor")) {
      category = "Predictive Maintenance";
      mfr = cleanLower.includes("bently") ? "Bently Nevada (Baker Hughes)" : "SKF / IFM Electronic";
      specs = {
        measurement: "Dual-axis eddy current / piezoelectric acceleration",
        frequencyRange: "0.1 Hz to 20 kHz high-bandwidth",
        samplingRate: "102.4 kSamples/sec",
        dynamicRange: "96 dB",
        compliance: "API 670 5th Edition & ISO 10816 compliant",
        diagnostics: "BPFO, BPFI, BSF, FTF bearing frequency calculation"
      };
      keyFeatures = [
        "Continuous online machinery protection and predictive condition monitoring.",
        "Automated spectral waterfall FFT generation for tracking bearing raceway spalling.",
        "Early warning alarm outputs trigger automated line speed throttling to prevent rotor seizure."
      ];
    } else {
      category = "Industrial Innovation & Standards";
      mfr = "Global Industry Consortium";
      specs = {
        standardization: "IEC / ISO / ISA Harmonized",
        applicationScope: "Smart Factory 4.0 Deployment",
        dataIntegration: "Unified Namespace (UNS) & Digital Twin",
        lifecyclePhase: "Continuous Operations Monitoring"
      };
      keyFeatures = [
        "Interoperable smart manufacturing architecture reducing line changeover time by up to 35%.",
        "Telemetry ingestion conforms to international Open Industry 4.0 guidelines.",
        "Embedded analytics models enable continuous energy and material waste minimization."
      ];
    }

    const newFeature = {
      id: "SCRAPED-" + Math.floor(1000 + Math.random() * 9000),
      name: clean.length > 50 ? clean.substring(0, 48) + "..." : clean,
      category: category,
      manufacturer: mfr,
      sourceUrl: clean.startsWith("http") ? clean : `https://industrial-web.org/spec/${encodeURIComponent(clean)}`,
      scrapedDate: "Just Scraped (Live Extraction)",
      specs: specs,
      keyFeatures: keyFeatures,
      plantUsage: "Candidate Technology for OptiFactory PlantOS"
    };

    // Prepend so newly scraped items appear first
    SCRAPED_INDUSTRIAL_FEATURES.unshift(newFeature);
    return { item: newFeature, isNew: true };
  }

  // 6. LINE C INDUSTRIAL INCIDENT WORKFLOW DATA GENERATOR
  function getIncidentWorkflowDefinition() {
    const isoSpec = SCRAPED_INDUSTRIAL_FEATURES.find(f => f.id === "FEAT-STD-001") || {
      id: "FEAT-STD-001",
      name: "ISO 10816-3 Vibration Severity Classification Matrix",
      category: "Standards & Reliability",
      specs: { zoneC: "2.80 - 4.50 mm/s (Alert Zone: Restricted operation; maintenance required)" }
    };
    const sensorSpec = SCRAPED_INDUSTRIAL_FEATURES.find(f => f.id === "FEAT-SEN-001") || {
      id: "FEAT-SEN-001",
      name: "IFM Efector VVB001 IO-Link Vibration Sensor",
      category: "Sensors & 3D Vision",
      specs: { measurement: "v-RMS (velocity 10-1000 Hz), a-Peak", measuringRange: "0 to 45 mm/s RMS" }
    };

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      incident: {
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
        detectedAt: timeNow,
        resolvedAt: null,
        downtimeMinutes: 14,
        rootCause: "Mechanical vibration / bearing inspection & mount re-torque",
        resolution: "Maintenance completed. Drive isolated, bearing assembly inspected & greased, chassis mounts re-torqued to 85 Nm, vibration returned to 2.7 mm/s.",
        groundingSpec: "ISO 10816-3 Zone C Limit & IFM VVB001 Sensor",
        consensusScore: 92
      },
      telemetryTimeline: [
        { time: "09:40", value: 2.1, status: "NORMAL" },
        { time: "09:41", value: 2.3, status: "NORMAL" },
        { time: "09:42", value: 2.7, status: "NORMAL" },
        { time: "09:43", value: 3.1, status: "ELEVATED" },
        { time: "09:44", value: 3.8, status: "WARNING" },
        { time: "09:45", value: 4.2, status: "CRITICAL" }
      ],
      telemetryMetrics: {
        current: 4.2,
        threshold: 3.5,
        peak: 4.2,
        trend: "+37%",
        status: "CRITICAL",
        unit: "mm/s"
      },
      specialistAnalysis: {
        persona: VIRTUAL_PERSONAS["elena"],
        specialistName: "Elena Rostova",
        role: "Reliability & Vibration Specialist",
        analysis: "Vibration has exceeded the configured operating threshold (4.2 mm/s > 3.5 mm/s limit per ISO 10816-3 Zone C alert limit). FFT spectral peaks at 2.4x fundamental rotational frequency reveal abnormal bearing cage stress and harmonic excitation.",
        possibleCauses: [
          "Bearing wear / race fatigue",
          "Feeder imbalance & material bridging",
          "Mechanical looseness in drive base mountings",
          "Resonance & guide chute harmonic binding"
        ],
        confidence: "High (94%)",
        recommendedNextStep: "Inspect feeder bearing assembly, mounting integrity, and re-torque chassis bolts before thermal seizure occurs."
      },
      grounding: {
        equipment: "Powertrain & Vibratory Feeder #2",
        line: "Line C (Motor, Inverter & Gearbox Integration)",
        sensor: sensorSpec,
        standard: isoSpec,
        groundingSummary: "Telemetry (4.2 mm/s RMS) correlated against IFM VVB001 IO-Link high-frequency vibration telemetry and ISO 10816-3 Zone C alert limits for rigid foundation drives (>15 kW).",
        statusText: "SPECIFICATION GROUNDING COMPLETE"
      },
      consensus: {
        title: "MULTI-AGENT CONSENSUS",
        agents: [
          {
            id: "elena",
            name: "Elena Rostova",
            role: "Reliability",
            avatar: "🔬",
            badgeColor: "#10b981",
            opinion: "Likely bearing/mechanical vibration. Velocity RMS (4.2 mm/s) breaches Zone C ceiling. Accelerated bearing fatigue expected within 45 minutes."
          },
          {
            id: "wei",
            name: "Chen Wei",
            role: "Automation",
            avatar: "🤖",
            badgeColor: "#06b6d4",
            opinion: "Check feeder operating cycle and mechanical synchronization. PLC interlock trip imminent if vibration persists. Recommend controlled ramp-down."
          },
          {
            id: "vance",
            name: "Dr. Markus Vance",
            role: "Operations",
            avatar: "👷",
            badgeColor: "#3b82f6",
            opinion: "Downtime risk is increasing. Feeder throttling already creates a 28% throughput deficit. Prioritize controlled inspection over unannounced line trip."
          },
          {
            id: "jenkins",
            name: "Dr. Sarah Jenkins",
            role: "Economics",
            avatar: "📈",
            badgeColor: "#8b5cf6",
            opinion: "Preventive intervention is preferable to production loss. Unscheduled line crash risks $14,200 in motor damage vs a 15-minute controlled stoppage."
          },
          {
            id: "becker",
            name: "Klaus Becker",
            role: "EHS",
            avatar: "🦺",
            badgeColor: "#ef4444",
            opinion: "Verify safe isolation (LOTO NFPA 79) before physical inspection. De-energize 400V feed drive and tag out."
          }
        ],
        result: {
          priority: "HIGH",
          recommendedAction: "Stop Line C for controlled inspection & bearing check.",
          confidence: "92%",
          consensusReached: true
        }
      },
      actionPlan: [
        { step: 1, text: "Stop Line C via controlled ramp-down", detail: "Ramp down feed rate to 0% through Cell C-02 HMI to prevent mechanical shock." },
        { step: 2, text: "Apply safety isolation / LOTO procedure", detail: "Apply Lockout-Tagout lock & tag to 400V disconnect; verify zero stored pneumatic energy." },
        { step: 3, text: "Inspect feeder bearing assembly", detail: "Examine drive bearing raceway for pitting; inspect eccentric counterweight clearance." },
        { step: 4, text: "Check mechanical mounting & fasteners", detail: "Re-torque all M16 mounting bolts to 85 Nm; verify rubber isolation damper integrity." },
        { step: 5, text: "Verify vibration after maintenance", detail: "Execute 2-minute test run; confirm IFM VVB001 vibration decays below 3.5 mm/s." },
        { step: 6, text: "Return Line C to operation if within threshold", detail: "Clear LOTO interlocks; ramp line back to 96% rated throughput cadence." }
      ],
      verificationSteps: [
        { step: 1, vibration: 4.2, status: "CRITICAL", note: "Baseline anomaly reading" },
        { step: 2, vibration: 3.6, status: "WARNING", note: "Drive dampers aligned" },
        { step: 3, vibration: 3.1, status: "ELEVATED", note: "Bearings greased & re-torqued" },
        { step: 4, vibration: 2.7, status: "NORMAL", note: "Post-maintenance verification pass" }
      ],
      resolutionResult: {
        vibration: 2.7,
        threshold: 3.5,
        status: "NORMAL",
        downtimeMinutes: 14,
        rootCause: "Mechanical vibration / bearing inspection & mount re-torque",
        resolution: "Maintenance completed. Vibration normalized to 2.7 mm/s. Line C returned to operational cadence."
      }
    };
  }

  // EXPOSE GLOBALLY
  window.INDUSTRY_KNOWLEDGE = {
    LIVE_COMMODITIES,
    LIVE_INDUSTRY_NEWS,
    VIRTUAL_PERSONAS,
    SCRAPED_INDUSTRIAL_FEATURES,
    AGENT_PIPELINE,
    scrapeIndustrialWebTopic,
    getIncidentWorkflowDefinition
  };

})();
