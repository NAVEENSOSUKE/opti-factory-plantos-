// factory-data.js - Industrial Plant Operations & Assembly Line Data Models

const FACTORY_DATA = {
  plantInfo: {
    name: "Apex Precision Manufacturing Plant #4",
    facility: "Industrial Robotics & EV Drivetrain Assembly Facility",
    location: "Sector 7, High-Tech Industrial Corridor",
    safetyDaysWithoutIncident: 412,
    activeShift: "Shift 1 (Day)",
    supervisor: "Markus Vance (Lead Operations Eng.)",
    plantStatus: "OPERATIONAL_STABLE"
  },

  // SHIFTS CONFIGURATION & HANDOVER NOTES
  shifts: {
    "shift_1": {
      id: "shift_1",
      name: "Shift 1 — Morning",
      hours: "06:00 - 14:00",
      supervisor: "Markus Vance",
      operatorsCount: 48,
      targetUnits: 12000,
      actualUnits: 10480,
      scrapUnits: 142,
      downtimeMinutes: 47,
      oee: 84.6,
      handoverNotes: [
        "Line C parts feeder had intermittent micro-stops around 10:45 AM. Tech cleaned opto-sensor.",
        "Buffer storage between Stamping and Welding is currently at 84% capacity.",
        "Batch #EV-409 completed full QA run with 99.2% first-pass yield.",
        "Hydraulic oil pressure on Press #2 was running slightly high (182 bar). Recommended filter check for Shift 2."
      ]
    },
    "shift_2": {
      id: "shift_2",
      name: "Shift 2 — Afternoon",
      hours: "14:00 - 22:00",
      supervisor: "Elena Rostova",
      operatorsCount: 46,
      targetUnits: 12000,
      actualUnits: 9850,
      scrapUnits: 168,
      downtimeMinutes: 62,
      oee: 81.4,
      handoverNotes: [
        "Robotic Welder Arm #4 underwent routine electrode tip dressing at 16:30.",
        "Line D paint spray viscosity calibrated to 22.4 cSt due to ambient temp fluctuation.",
        "Shift 3 team must confirm incoming shipment of raw aluminum coils from Bay 3."
      ]
    },
    "shift_3": {
      id: "shift_3",
      name: "Shift 3 — Night Maintenance",
      hours: "22:00 - 06:00",
      supervisor: "Chen Wei",
      operatorsCount: 32,
      targetUnits: 8000,
      actualUnits: 7620,
      scrapUnits: 89,
      downtimeMinutes: 34,
      oee: 87.2,
      handoverNotes: [
        "Completed preventative lubrication on CNC axis drives 1 through 6.",
        "Tool wear inspection cleared: CNC milling inserts replaced on Head #3.",
        "All emergency stops and light curtains passed pre-shift safety interlock self-test."
      ]
    }
  },

  // 4 PRIMARY INDUSTRIAL ASSEMBLY LINES
  lines: [
    {
      id: "line_a",
      name: "Line A: Precision Stamping & CNC Milling",
      tag: "Raw Ingot -> Structural Frame",
      status: "running", // running, warning, stopped
      speedPercent: 96,
      cycleTimeSec: 36.2,
      targetCycleTime: 35.0,
      unitsProduced: 2840,
      targetUnits: 3000,
      defectCount: 22,
      sensors: {
        temp: 68.4, // deg C
        pressure: 178, // bar
        vibration: 1.6, // mm/s
        motorRpm: 1450,
        loadPercent: 78
      },
      workstations: [
        { name: "Hydraulic Blanking Press (1200T)", status: "optimal", health: 98 },
        { name: "5-Axis High-Speed CNC Mill #1", status: "optimal", health: 95 },
        { name: "Laser Trimming & Deburring Cell", status: "optimal", health: 97 }
      ],
      activeAlert: null
    },
    {
      id: "line_b",
      name: "Line B: Robotic Welding & Chassis Joining",
      tag: "Robotic MIG/Laser Seam Assembly",
      status: "running",
      speedPercent: 98,
      cycleTimeSec: 41.5,
      targetCycleTime: 40.0,
      unitsProduced: 2790,
      targetUnits: 2900,
      defectCount: 34,
      sensors: {
        temp: 74.2,
        pressure: 88,
        vibration: 2.1,
        motorRpm: 1200,
        loadPercent: 82
      },
      workstations: [
        { name: "ABB 6-Axis Spot Welding Cell A", status: "optimal", health: 99 },
        { name: "KUKA Laser Seam Joining Station", status: "optimal", health: 96 },
        { name: "Ultrasonic Weld Integrity Scanner", status: "optimal", health: 94 }
      ],
      activeAlert: null
    },
    {
      id: "line_c",
      name: "Line C: Powertrain & Component Assembly",
      tag: "Motor, Inverter & Gearbox Integration",
      status: "warning", // Bottleneck!
      speedPercent: 72,
      cycleTimeSec: 54.8,
      targetCycleTime: 42.0,
      unitsProduced: 2310,
      targetUnits: 3000,
      defectCount: 58,
      sensors: {
        temp: 83.6,
        pressure: 64,
        vibration: 4.2, // high vibration
        motorRpm: 920,
        loadPercent: 91,
        safeThreshold: 3.5, // mm/s ISO 10816 Zone C alert ceiling
        normalVibration: 2.1
      },
      thresholds: {
        vibrationMax: 3.5,
        tempMax: 85.0,
        pressureMin: 50.0
      },
      workstations: [
        { name: "Inverter Mounting & Fastening Torque Station", status: "warning", health: 76 },
        { name: "Automated Parts Vibratory Feeder #2", status: "degraded", health: 68 },
        { name: "High-Voltage Cable Loom Connection", status: "optimal", health: 92 }
      ],
      activeAlert: {
        code: "ALM-FEED-301",
        severity: "WARNING",
        message: "Micro-jam & excessive vibration detected on Vibratory Feeder #2. Feed velocity throttled 28% below spec.",
        action: "Clear feeder track & inspect optical photocell sensor E-12."
      }
    },
    {
      id: "line_d",
      name: "Line D: Automated Paint & Quality Inspection",
      tag: "Electrostatic Coating & Vision AI QA",
      status: "running",
      speedPercent: 94,
      cycleTimeSec: 38.0,
      targetCycleTime: 38.0,
      unitsProduced: 2540,
      targetUnits: 2700,
      defectCount: 28,
      sensors: {
        temp: 52.1,
        pressure: 110,
        vibration: 0.9,
        motorRpm: 1100,
        loadPercent: 74
      },
      workstations: [
        { name: "Fanuc Electrostatic Robotic Spray Booth", status: "optimal", health: 97 },
        { name: "Infrared Curing Tunnel Oven", status: "optimal", health: 98 },
        { name: "Cognex High-Res 3D Vision AI Inspection", status: "optimal", health: 99 }
      ],
      activeAlert: null
    }
  ],

  // OVERALL EQUIPMENT EFFECTIVENESS (OEE) METRICS
  oeeMetrics: {
    overall: 84.6,
    target: 85.0,
    worldClassBenchmark: 85.0,
    availability: 91.2, // (Planned Time - Downtime) / Planned Time
    performance: 94.8,  // Actual Output / Theoretical Target Speed
    quality: 97.9       // Good Output / Total Output
  },

  // HOURLY THROUGHPUT HISTORY (Hour 1 to Hour 8)
  hourlyThroughput: [
    { hour: "06:00-07:00", target: 1500, actual: 1420, scrap: 18 },
    { hour: "07:00-08:00", target: 1500, actual: 1480, scrap: 12 },
    { hour: "08:00-09:00", target: 1500, actual: 1390, scrap: 24 },
    { hour: "09:00-10:00", target: 1500, actual: 1410, scrap: 15 },
    { hour: "10:00-11:00", target: 1500, actual: 1150, scrap: 32 }, // dip due to Feeder jam
    { hour: "11:00-12:00", target: 1500, actual: 1380, scrap: 16 },
    { hour: "12:00-13:00", target: 1500, actual: 1490, scrap: 11 },
    { hour: "13:00-14:00", target: 1500, actual: 1460, scrap: 14 }
  ],

  // DOWNTIME INCIDENT LOGS
  downtimeLog: [
    {
      id: "INC-1082",
      timestamp: "10:24 AM",
      lineId: "line_c",
      lineName: "Line C: Powertrain",
      workstation: "Vibratory Feeder #2",
      durationMin: 22,
      category: "Equipment / Feeder Jam",
      rootCause: "Foreign metal burr lodged in sensor chute, triggering optical sensor mismatch.",
      actionTaken: "Burr removed, opto-sensor cleaned with isopropyl alcohol, feeder recalibrated.",
      technician: "R. Gomez (Elec. Tech)",
      status: "RESOLVED_MONITORING"
    },
    {
      id: "INC-1081",
      timestamp: "08:42 AM",
      lineId: "line_a",
      lineName: "Line A: Stamping",
      workstation: "5-Axis CNC Mill #1",
      durationMin: 14,
      category: "Tool Changeover",
      rootCause: "Scheduled worn carbide endmill replacement & tool length touch-probe calibration.",
      actionTaken: "Inserted tool #T08 fresh insert, verified offsets within 0.005mm.",
      technician: "D. Kovacs (CNC Specialist)",
      status: "COMPLETED"
    },
    {
      id: "INC-1080",
      timestamp: "07:15 AM",
      lineId: "line_b",
      lineName: "Line B: Welding",
      workstation: "Laser Seam Joining",
      durationMin: 11,
      category: "Shielding Gas Pressure",
      rootCause: "Argon gas manifold solenoid valve slow to respond during initial line ramp-up.",
      actionTaken: "Regulator setpoint purged, valve actuator lubricated.",
      technician: "M. Vance (Lead Eng)",
      status: "COMPLETED"
    }
  ],

  // ROOT CAUSE PARETO ANALYSIS (% of total downtime)
  downtimePareto: [
    { cause: "Mechanical / Jam", percentage: 42, minutes: 19.7, color: "#ef4444" },
    { cause: "Sensor / Electrical Fault", percentage: 24, minutes: 11.3, color: "#f59e0b" },
    { cause: "Tooling & Die Changeover", percentage: 19, minutes: 8.9, color: "#3b82f6" },
    { cause: "Material Feed Starvation", percentage: 15, minutes: 7.1, color: "#8b5cf6" }
  ],

  // SOP & TROUBLESHOOTING DICTIONARY FOR AI COPILOT
  troubleshootingSOP: {
    "INC-LC-001": {
      title: "Line C Feeder #2 Severe Vibration Anomaly (4.2 mm/s > 3.5 mm/s Threshold)",
      steps: [
        "1. Stop Line C via controlled ramp-down to protect drivetrain components.",
        "2. Apply safety isolation / Lockout-Tagout (LOTO) procedure per NFPA 79 & ISO 45001.",
        "3. Inspect feeder bearing assembly and eccentric drive counterweight alignment.",
        "4. Check mechanical mounting and torque all chassis bolts to 85 Nm specification.",
        "5. Verify vibration telemetry post-service using IFM VVB001 IO-Link sensor.",
        "6. Return Line C to operation once vibration is verified below 3.5 mm/s safe threshold."
      ]
    },
    "ALM-FEED-301": {
      title: "Vibratory Parts Feeder Jam / Throttling (Line C)",
      steps: [
        "1. Depress the yellow pause button at Cell C-02 control pendant.",
        "2. Check the feeder track guide rails for interlocking fasteners or metal burrs.",
        "3. Inspect optic sensor E-12 lens for dust/oil mist accumulation and wipe clean.",
        "4. Verify vibratory frequency dial is tuned to standard resonance (50 Hz / 2.4 mm amplitude).",
        "5. Reset alarm on HMI terminal and test single-cycle indexing."
      ]
    },
    "ERR-STAMP-402": {
      title: "Hydraulic Press High Pressure Warning (Line A)",
      steps: [
        "1. Verify reservoir oil temperature on gauge G-4 (must be under 75°C).",
        "2. Inspect proportional pressure relief valve PV-1 for sticking.",
        "3. Check return line filter differential pressure indicator.",
        "4. If temperature exceeds 80°C, throttle line speed to 80% and engage secondary cooling chiller."
      ]
    },
    "ERR-WELD-108": {
      title: "Laser Seam Shielding Gas Deviation (Line B)",
      steps: [
        "1. Check Argon/CO2 blend tank head pressure (minimum 12 bar required).",
        "2. Inspect nozzle ceramic cup for weld spatter accumulation.",
        "3. Verify flow rate on mass flow meter is between 18-22 L/min.",
        "4. Perform auto-calibration test weld on coupon sample before resuming series run."
      ]
    }
  }
};

if (typeof window !== "undefined") {
  window.FACTORY_DATA = FACTORY_DATA;
}
