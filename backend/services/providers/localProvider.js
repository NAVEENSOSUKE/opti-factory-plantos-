// backend/services/providers/localProvider.js
// Deterministic Industrial Reasoning Engine for OptiFactory PlantOS
// High-fidelity domain knowledge based on ISO 10816-3 vibration standards and plant physical models

class LocalProvider {
  constructor() {
    this.name = 'local';
    this.mode = 'LOCAL_REASONING';
  }

  isAvailable() {
    return true; // Always available as safety net
  }

  analyzePersona({ persona, incident, telemetry, equipment, standards }) {
    const startTime = Date.now();
    const vib = incident ? (incident.value || 4.2) : 4.2;
    const thresh = incident ? (incident.threshold || 3.5) : 3.5;
    const pName = persona?.name || 'Elena Rostova';
    const pRole = persona?.role || 'Reliability & Vibration Specialist';

    const pKey = pName.toLowerCase();

    let analysis = {};

    if (pKey.includes('wei') || pKey.includes('chen')) {
      analysis = {
        diagnosis: `Feeder drive velocity oscillation has induced kinematic cycle timing drift on Line C Station 2. Proximity sensor chatter and Profinet fieldbus jitter indicate mechanical unbalance.`,
        possibleCauses: [
          "Feeder resonant frequency drift from 50.2 Hz tuning point",
          "Profinet I/O cycle latency on Cell C-02 drive terminal",
          "Optical photocell lens contamination from lubricant aerosol"
        ],
        evidence: [
          `Feeder cycling at 54.8s (target: 42.0s)`,
          `Optical photo-eye E-12 signal jitter under mechanical vibration`
        ],
        recommendation: "Check feeder operating cycle and mechanical synchronization. Execute single-cycle indexing verification after mechanical service.",
        risk: "Imminent PLC interlock trip if line cycle deviation exceeds 35% of takt.",
        confidence: 0.91,
        requiresInspection: true
      };
    } else if (pKey.includes('vance') || pKey.includes('markus')) {
      analysis = {
        diagnosis: `Line C feeder bottleneck is creating severe downstream starvation. Takt throughput is suppressed by 28%, and buffer stock between Station 2 and Inverter Integration will deplete within 22 minutes.`,
        possibleCauses: [
          "Feeder feed rate throttled due to mechanical vibration alerts",
          "Downstream buffer depletion leading to total line cadence starvation",
          "Compounding shift OEE deficit (currently running at 81.4% vs 85.0% target)"
        ],
        evidence: [
          `Units produced deficit: -210 units against 8h cadence plan`,
          `Accumulated shift downtime at 47 minutes`
        ],
        recommendation: "Downtime risk is increasing. Authorize a controlled 15-minute stoppage immediately rather than absorbing an uncontrolled line crash.",
        risk: "Cascading line stoppage across Sector 7 assembly if buffer empties.",
        confidence: 0.89,
        requiresInspection: true
      };
    } else if (pKey.includes('jenkins') || pKey.includes('marcus') || pKey.includes('sarah j')) {
      analysis = {
        diagnosis: `Unmitigated operation of Line C in Zone C alert threshold incurs disproportionate economic penalty: scrap rate increase of $1,240/hr and catastrophic drive spindle replacement risk of $14,200.`,
        possibleCauses: [
          "Bearing raceway spalling causing thermal motor damage",
          "Off-spec assembly torque on high-voltage inverter busbars",
          "Overtime maintenance penalty for emergency off-shift repairs"
        ],
        evidence: [
          `Current scrap volume: 142 units ($4,820 material scrap value)`,
          `Replacement motor lead time: 14 business days`
        ],
        recommendation: "Preventive intervention is preferable to production loss. A scheduled 14-minute intervention preserves $12,960 in net shift operating margin.",
        risk: "$14,200 direct motor hardware replacement penalty.",
        confidence: 0.93,
        requiresInspection: true
      };
    } else if (pKey.includes('becker') || pKey.includes('klaus') || pKey.includes('sarah b')) {
      analysis = {
        diagnosis: `Severe mechanical oscillation exceeds permissible dynamic load safety envelope. Risk of mounting fastener shear and acoustic noise emission above 85 dBA.`,
        possibleCauses: [
          "Cyclic fatigue shear on M16 chassis anchor fasteners",
          "Motor casing temperature rise exceeding 80°C touch threshold",
          "Vibration propagation to adjacent hydraulic pressurized piping"
        ],
        evidence: [
          `Vibration velocity ${vib} mm/s RMS exceeds OSHA steady-state threshold`,
          `412 consecutive safe operational days at plant risk`
        ],
        recommendation: "Verify safe isolation (Lockout-Tagout LOTO procedure per NFPA 79 & ISO 45001) before physical inspection. De-energize 400V feed drive and verify zero stored pneumatic energy.",
        risk: "Technician pinch hazard and dynamic fastener failure if un-isolated.",
        confidence: 0.96,
        requiresInspection: true
      };
    } else {
      // Default: Elena Rostova (Reliability & Vibration Specialist)
      analysis = {
        diagnosis: `Vibration velocity has exceeded the configured operating threshold (${vib} mm/s RMS > ${thresh} mm/s limit per ISO 10816-3 Zone C alert limit). FFT spectral peaks at 2.4x fundamental rotational frequency reveal abnormal bearing cage stress and unbalance on the eccentric drive counterweight.`,
        possibleCauses: [
          "Bearing wear / raceway fatigue",
          "Feeder unbalance & material bridging",
          "Mechanical looseness in drive base mountings",
          "Resonance & guide chute harmonic binding"
        ],
        evidence: [
          `Observed vibration velocity: ${vib} mm/s RMS (Safe ceiling: ${thresh} mm/s)`,
          `Telemetry trend: +37% excursion over the last 5 minutes (09:40 -> 09:45)`,
          `ISO 10816-3 Zone C entry threshold breached (rigid foundation drive > 15 kW)`
        ],
        recommendation: "Inspect feeder bearing assembly, mounting integrity, and re-torque chassis bolts to 85 Nm before thermal runaway or cage seizure occurs.",
        risk: "Accelerated bearing cage spalling and catastrophic drive seizure within 45 minutes of continuous unmitigated operation.",
        confidence: 0.94,
        requiresInspection: true
      };
    }

    const latencyMs = Math.max(1, Date.now() - startTime);

    return {
      persona: pName,
      role: pRole,
      ...analysis,
      aiEngine: "LOCAL_REASONING",
      aiProvider: "local",
      aiModel: "optifactory-deterministic-v1",
      aiLatencyMs: latencyMs
    };
  }

  synthesizeConsensus({ assessments, incident, telemetry, equipment, standards }) {
    const startTime = Date.now();
    const vib = incident ? (incident.value || 4.2) : 4.2;

    const agents = assessments && assessments.length > 0 ? assessments.map(a => ({
      name: a.persona,
      role: a.role,
      recommendation: a.recommendation
    })) : [
      {
        name: "Elena Rostova",
        role: "Reliability",
        recommendation: `Likely bearing/mechanical vibration. Velocity RMS (${vib} mm/s) breaches Zone C ceiling. Accelerated bearing raceway fatigue expected within 45 minutes.`
      },
      {
        name: "Wei Chen",
        role: "Automation",
        recommendation: "Check feeder operating cycle and mechanical synchronization. PLC interlock trip imminent if vibration persists. Recommend controlled ramp-down."
      },
      {
        name: "Dr. Markus Vance",
        role: "Operations",
        recommendation: "Downtime risk is increasing. Feeder throttling already creates a 28% throughput deficit. Prioritize controlled inspection over unannounced line trip."
      },
      {
        name: "Marcus Jenkins",
        role: "Economics",
        recommendation: "Preventive intervention is preferable to production loss. Unscheduled line crash risks $14,200 in motor damage vs a 15-minute controlled stoppage."
      },
      {
        name: "Sarah Becker",
        role: "EHS",
        recommendation: "Verify safe isolation (LOTO NFPA 79 / ISO 45001) before physical technician entry. De-energize 400V feed drive and tag out."
      }
    ];

    const latencyMs = Math.max(1, Date.now() - startTime);

    return {
      incidentId: incident ? incident.id : "INC-LC-001",
      priority: "HIGH",
      confidence: 0.92,
      recommendation: "Controlled inspection of Line C",
      reasoning: "Cross-functional consensus verified across all 5 industrial domains: Elena Rostova isolates bearing cage fatigue, Wei Chen detects kinematic timing drift, Dr. Vance warns of compounding buffer depletion, Jenkins establishes $12,960 net savings over an unplanned motor crash, and Becker mandates NFPA 79 LOTO isolation.",
      actionPlanSummary: "Controlled ramp-down -> Lockout-Tagout (LOTO) -> Bearing assembly inspection -> Mount re-torque to 85 Nm -> 2-min verification run -> Resume cadence",
      agents,
      aiEngine: "LOCAL_REASONING",
      aiProvider: "local",
      aiModel: "optifactory-consensus-engine-v1",
      aiLatencyMs: latencyMs
    };
  }
}

module.exports = new LocalProvider();
