// app.js - Industrial Plant Operations & Assembly Line Cockpit Controller

(function () {
  'use strict';

  // --- STATE ---
  let activeShiftId = 'shift_1';
  let isEStopActive = false;
  let audioCtx = null;
  let liveSimTimer = null;
  let activeInspectLineId = 'line_c';

  // --- WEB AUDIO API (Industrial alerts & horn) ---
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playAlertSound(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'estop') {
        // Dual-tone industrial emergency siren
        [440, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          osc.frequency.exponentialRampToValueAtTime(freq / 2, now + idx * 0.15 + 0.4);
          gain.gain.setValueAtTime(0.2, now + idx * 0.15);
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
        osc.frequency.setValueAtTime(659.25, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // --- RENDER KPI ROW ---
  function renderKpis() {
    const shift = window.FACTORY_DATA.shifts[activeShiftId];
    const data = window.FACTORY_DATA;

    // 1. Production Throughput
    const actualUnitsEl = document.getElementById('kpi-actual-units');
    const targetUnitsEl = document.getElementById('kpi-target-units');
    const fulfillPercentEl = document.getElementById('kpi-fulfill-pct');
    const fulfillBarEl = document.getElementById('kpi-fulfill-bar');

    if (actualUnitsEl && shift) {
      actualUnitsEl.textContent = shift.actualUnits.toLocaleString();
      targetUnitsEl.textContent = `Target: ${shift.targetUnits.toLocaleString()}`;
      const pct = ((shift.actualUnits / shift.targetUnits) * 100).toFixed(1);
      fulfillPercentEl.textContent = `${pct}% Plan`;
      if (fulfillBarEl) fulfillBarEl.style.width = `${Math.min(pct, 100)}%`;
    }

    // 2. OEE Overall
    const oeeValEl = document.getElementById('kpi-oee-val');
    const oeeBarEl = document.getElementById('kpi-oee-bar');
    if (oeeValEl && shift) {
      oeeValEl.textContent = `${shift.oee}%`;
      if (oeeBarEl) oeeBarEl.style.width = `${shift.oee}%`;
    }

    // 3. Scrap & Quality
    const scrapValEl = document.getElementById('kpi-scrap-val');
    const scrapRateEl = document.getElementById('kpi-scrap-rate');
    const scrapBarEl = document.getElementById('kpi-scrap-bar');
    if (scrapValEl && shift) {
      scrapValEl.textContent = shift.scrapUnits;
      const rate = ((shift.scrapUnits / shift.actualUnits) * 100).toFixed(2);
      scrapRateEl.textContent = `${rate}% Scrap Rate`;
      if (scrapBarEl) scrapBarEl.style.width = `${Math.min(rate * 10, 100)}%`;
    }

    // 4. Downtime
    const downtimeValEl = document.getElementById('kpi-downtime-val');
    if (downtimeValEl && shift) {
      downtimeValEl.textContent = `${shift.downtimeMinutes}m`;
    }
  }

  // --- RENDER 4 ASSEMBLY LINES ---
  function renderLines() {
    const container = document.getElementById('lines-grid');
    if (!container) return;

    const lines = window.FACTORY_DATA.lines;
    container.innerHTML = lines.map(line => {
      const isWarn = line.status === 'warning' || isEStopActive;
      const statusText = isEStopActive ? 'E-STOPPED' : (line.status === 'running' ? 'Running' : 'Degraded (Bottleneck)');
      const statusClass = isEStopActive ? 'status-pill warning' : (line.status === 'running' ? 'status-pill running' : 'status-pill warning');
      const speed = isEStopActive ? 0 : line.speedPercent;

      let alarmBox = '';
      if (line.activeAlert && !isEStopActive) {
        alarmBox = `
          <div class="line-active-alarm">
            <strong>⚠️ [${line.activeAlert.code}]</strong> ${line.activeAlert.message}
          </div>
        `;
      } else if (isEStopActive) {
        alarmBox = `
          <div class="line-active-alarm" style="background:rgba(239,68,68,0.2); border-color:#ef4444; color:#fca5a5;">
            <strong>🚨 EMERGENCY STOP INTERLOCK ENGAGED</strong> Drives de-energized.
          </div>
        `;
      }

      return `
        <div class="line-card ${isWarn ? 'warning-status' : ''}" id="card-${line.id}">
          <div class="line-header-row">
            <div class="line-title-group">
              <h3>${line.name}</h3>
              <span class="line-subtag">${line.tag}</span>
            </div>
            <span class="${statusClass}">
              <span>●</span> ${statusText}
            </span>
          </div>

          <div class="line-speed-metric">
            <div>
              <span class="speed-gauge-text">${speed}%</span>
              <span style="font-size:0.72rem; color:var(--text-muted); margin-left:4px;">RATED SPEED</span>
            </div>
            <span class="cycle-time-tag">Cycle: ${isEStopActive ? '0.0s' : line.cycleTimeSec + 's'} (Target: ${line.targetCycleTime}s)</span>
          </div>

          <div class="telemetry-grid">
            <div class="tel-chip">
              <span class="tel-label">Thermal</span>
              <span class="tel-val ${line.sensors.temp > 80 ? 'hot' : ''}">${line.sensors.temp.toFixed(1)}°C</span>
            </div>
            <div class="tel-chip">
              <span class="tel-label">Vibration</span>
              <span class="tel-val ${line.sensors.vibration > 3.0 ? 'hot' : ''}">${line.sensors.vibration.toFixed(2)} mm/s</span>
            </div>
            <div class="tel-chip">
              <span class="tel-label">Hydraulic</span>
              <span class="tel-val">${line.sensors.pressure} bar</span>
            </div>
          </div>

          ${alarmBox}

          <div class="line-action-row">
            <button class="line-btn" onclick="window.PlantApp.openTelemetryModal('${line.id}')">🔍 Inspect Telemetry</button>
            <button class="line-btn" onclick="window.PlantApp.openSopModal('${line.id}')">📖 Maintenance SOP</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- RENDER HOURLY THROUGHPUT CHART ---
  function renderThroughputChart() {
    const chartEl = document.getElementById('throughput-chart-bars');
    if (!chartEl) return;

    const data = window.FACTORY_DATA.hourlyThroughput;
    const maxTarget = 1600;

    chartEl.innerHTML = data.map(item => {
      const heightPct = (item.actual / maxTarget) * 100;
      const isDip = item.actual < 1250;
      return `
        <div class="chart-bar-group">
          <div class="bar-val-tooltip">${item.actual}</div>
          <div class="chart-bar ${isDip ? 'dip' : ''}" style="height: ${heightPct}%;" title="${item.hour}: ${item.actual} units (Scrap: ${item.scrap})"></div>
          <span class="bar-time-label">${item.hour.split('-')[0]}</span>
        </div>
      `;
    }).join('');
  }

  // --- RENDER PARETO DOWNTIME BARS ---
  function renderParetoChart() {
    const listEl = document.getElementById('pareto-bars-list');
    if (!listEl) return;

    const pareto = window.FACTORY_DATA.downtimePareto;
    listEl.innerHTML = pareto.map(item => `
      <div class="pareto-item">
        <div class="pareto-item-header">
          <span>${item.cause}</span>
          <span style="font-family:var(--font-mono); color:${item.color};">${item.minutes}m (${item.percentage}%)</span>
        </div>
        <div class="pareto-track">
          <div class="pareto-fill" style="width: ${item.percentage}%; background-color: ${item.color};"></div>
        </div>
      </div>
    `).join('');
  }

  // --- RENDER RECENT DOWNTIME INCIDENTS TABLE ---
  function renderIncidentsTable() {
    const tbody = document.getElementById('incidents-tbody');
    if (!tbody) return;

    const logs = window.FACTORY_DATA.downtimeLog;
    tbody.innerHTML = logs.map(log => `
      <tr>
        <td><strong>${log.id}</strong></td>
        <td>${log.timestamp}</td>
        <td>${log.lineName} (${log.workstation})</td>
        <td><span style="color:#ef4444; font-weight:700;">${log.durationMin}m</span></td>
        <td>${log.category}</td>
        <td><span class="table-status-badge">${log.status}</span></td>
      </tr>
    `).join('');
  }

  // --- RENDER DIGITAL SHIFT HANDOVER LOG ---
  function renderHandoverNotes() {
    const listEl = document.getElementById('handover-notes-list');
    const supEl = document.getElementById('active-supervisor-name');
    const shift = window.FACTORY_DATA.shifts[activeShiftId];

    if (supEl && shift) {
      supEl.textContent = `${shift.supervisor} • ${shift.hours}`;
    }

    if (listEl && shift) {
      listEl.innerHTML = shift.handoverNotes.map(note => `
        <div class="handover-note-card">
          ${note}
        </div>
      `).join('');
    }
  }

  // --- LIVE TELEMETRY SIMULATION LOOP ---
  function startSimulation() {
    liveSimTimer = setInterval(() => {
      if (isEStopActive) return;

      const lines = window.FACTORY_DATA.lines;
      const shift = window.FACTORY_DATA.shifts[activeShiftId];

      // Subtle sensor flutters
      lines.forEach(line => {
        line.sensors.temp += (Math.random() * 0.6 - 0.3);
        line.sensors.vibration += (Math.random() * 0.1 - 0.05);
        if (line.sensors.vibration < 0.6) line.sensors.vibration = 0.6;
        if (line.sensors.temp < 45) line.sensors.temp = 45;

        // Random unit increments
        if (line.status === 'running') {
          line.unitsProduced += Math.floor(Math.random() * 2);
        }
      });

      // Increment plant output slowly
      shift.actualUnits += Math.floor(Math.random() * 3);

      renderKpis();
      renderLines();
    }, 2500);
  }

  // --- SHIFT SWITCHER ---
  function switchShift(shiftId) {
    if (!window.FACTORY_DATA.shifts[shiftId]) return;
    activeShiftId = shiftId;

    // Update pill buttons
    document.querySelectorAll('.shift-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shift === shiftId);
    });

    renderKpis();
    renderHandoverNotes();
    showToast(`Switched view to ${window.FACTORY_DATA.shifts[shiftId].name}`);
    playAlertSound('beep');
  }

  // --- EMERGENCY STOP (E-STOP) TOGGLE ---
  function toggleEmergencyStop() {
    isEStopActive = !isEStopActive;
    const estopBtn = document.getElementById('estop-toggle-btn');

    if (isEStopActive) {
      estopBtn.textContent = '🟢 RESUME PRODUCTION';
      estopBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      playAlertSound('estop');
      showToast('🚨 EMERGENCY STOP TRIPPED: All lines de-energized!');
    } else {
      estopBtn.textContent = '🚨 EMERGENCY STOP';
      estopBtn.style.background = 'linear-gradient(135deg, #b91c1c, #ef4444)';
      playAlertSound('beep');
      showToast('✅ Production interlocks cleared. Resuming normal line cadence.');
    }

    renderLines();
  }

  // --- MODAL CONTROLS ---
  function openIncidentModal() {
    const modal = document.getElementById('incident-modal');
    if (modal) modal.classList.add('open');
  }

  function closeIncidentModal() {
    const modal = document.getElementById('incident-modal');
    if (modal) modal.classList.remove('open');
  }

  function submitNewIncident(event) {
    event.preventDefault();
    const lineSelect = document.getElementById('modal-line-select').value;
    const workstation = document.getElementById('modal-workstation').value;
    const duration = parseInt(document.getElementById('modal-duration').value, 10) || 15;
    const category = document.getElementById('modal-category').value;
    const rootCause = document.getElementById('modal-rootcause').value;
    const tech = document.getElementById('modal-technician').value;

    const lineObj = window.FACTORY_DATA.lines.find(l => l.id === lineSelect) || window.FACTORY_DATA.lines[0];

    const newInc = {
      id: `INC-${1083 + window.FACTORY_DATA.downtimeLog.length}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lineId: lineSelect,
      lineName: lineObj.name.split(':')[0],
      workstation,
      durationMin: duration,
      category,
      rootCause,
      actionTaken: "Investigation logged by operator via PlantOS.",
      technician: tech,
      status: "OPEN_INVESTIGATING"
    };

    window.FACTORY_DATA.downtimeLog.unshift(newInc);
    window.FACTORY_DATA.shifts[activeShiftId].downtimeMinutes += duration;

    renderIncidentsTable();
    renderKpis();
    closeIncidentModal();
    showToast(`Logged Downtime Incident: ${newInc.id} (${duration} mins)`);
    playAlertSound('beep');
  }

  // --- TELEMETRY & SOP INSPECTION MODAL ---
  function openTelemetryModal(lineId) {
    activeInspectLineId = lineId;
    const line = window.FACTORY_DATA.lines.find(l => l.id === lineId);
    if (!line) return;

    const modal = document.getElementById('telemetry-modal');
    const content = document.getElementById('telemetry-modal-body');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="margin-bottom:14px;">
        <h4 style="font-family:var(--font-display); font-size:1.15rem; color:#fff;">${line.name}</h4>
        <p style="font-size:0.8rem; color:var(--text-muted);">${line.tag}</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:16px;">
        <div style="background:rgba(255,255,255,0.04); padding:10px; border-radius:8px;">
          <span style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Drive Motor RPM</span>
          <div style="font-family:var(--font-mono); font-size:1.1rem; color:var(--color-cyan); font-weight:700;">${line.sensors.motorRpm} RPM</div>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:10px; border-radius:8px;">
          <span style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Motor Load</span>
          <div style="font-family:var(--font-mono); font-size:1.1rem; color:#fff; font-weight:700;">${line.sensors.loadPercent}%</div>
        </div>
        <div style="background:rgba(255,255,255,0.04); padding:10px; border-radius:8px;">
          <span style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">Cycle Time</span>
          <div style="font-family:var(--font-mono); font-size:1.1rem; color:var(--color-optimal); font-weight:700;">${line.cycleTimeSec}s</div>
        </div>
      </div>

      <h5 style="font-size:0.8rem; text-transform:uppercase; color:var(--color-cyan); margin-bottom:8px;">Cell Workstations & Health Index:</h5>
      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
        ${line.workstations.map(ws => `
          <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.82rem;">${ws.name}</span>
            <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:${ws.health < 80 ? 'var(--color-warning)' : 'var(--color-optimal)'};">${ws.health}% Health</span>
          </div>
        `).join('')}
      </div>

      ${line.activeAlert ? `
        <div style="background:rgba(245,158,11,0.15); border:1px solid var(--color-warning); padding:12px; border-radius:8px; margin-bottom:12px;">
          <div style="font-weight:700; color:#fde68a; font-size:0.85rem;">⚠️ Active Alert: ${line.activeAlert.code}</div>
          <div style="font-size:0.8rem; color:#fff; margin-top:4px;">${line.activeAlert.message}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:6px;"><strong>Immediate Action:</strong> ${line.activeAlert.action}</div>
        </div>
      ` : '<div style="color:var(--color-optimal); font-size:0.82rem; margin-bottom:12px;">✅ No active machine faults on this line.</div>'}
    `;

    modal.classList.add('open');
  }

  function closeTelemetryModal() {
    const modal = document.getElementById('telemetry-modal');
    if (modal) modal.classList.remove('open');
  }

  function openSopModal(lineId) {
    const line = window.FACTORY_DATA.lines.find(l => l.id === lineId);
    let sopKey = 'ALM-FEED-301';
    if (lineId === 'line_a') sopKey = 'ERR-STAMP-402';
    if (lineId === 'line_b') sopKey = 'ERR-WELD-108';

    const sop = window.FACTORY_DATA.troubleshootingSOP[sopKey];
    const modal = document.getElementById('telemetry-modal');
    const content = document.getElementById('telemetry-modal-body');
    if (!modal || !content || !sop) return;

    content.innerHTML = `
      <div style="margin-bottom:14px;">
        <span style="background:rgba(6,182,212,0.15); border:1px solid var(--color-cyan); color:var(--color-cyan); font-size:0.72rem; padding:3px 8px; border-radius:999px; font-weight:700;">STANDARD OPERATING PROCEDURE</span>
        <h4 style="font-family:var(--font-display); font-size:1.2rem; color:#fff; margin-top:8px;">${sop.title}</h4>
      </div>

      <div style="background:rgba(0,0,0,0.3); border-radius:8px; padding:14px; margin-bottom:16px;">
        <h5 style="font-size:0.8rem; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px;">Mandatory Resolution Steps:</h5>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${sop.steps.map(step => `
            <div style="font-size:0.84rem; line-height:1.5; color:#f1f5f9; padding-left:4px; border-left:2px solid var(--color-cyan);">
              ${step}
            </div>
          `).join('')}
        </div>
      </div>
      <p style="font-size:0.75rem; color:var(--text-dim);">*Technicians must log resolution in the shift log after clearing faults.</p>
    `;

    modal.classList.add('open');
  }

  // --- SHIFT HANDOVER REPORT PRINT PREVIEW ---
  function openHandoverReportModal() {
    const modal = document.getElementById('report-modal');
    const content = document.getElementById('report-modal-body');
    const shift = window.FACTORY_DATA.shifts[activeShiftId];
    if (!modal || !content || !shift) return;

    content.innerHTML = `
      <div id="printable-handover-area" style="font-size:0.88rem; color:#fff;">
        <div style="border-bottom:2px solid var(--color-cyan); padding-bottom:12px; margin-bottom:16px;">
          <h2 style="font-family:var(--font-display); font-size:1.4rem; color:var(--color-cyan);">${window.FACTORY_DATA.plantInfo.name}</h2>
          <div style="font-size:0.8rem; color:var(--text-muted);">
            Executive Production & Shift Handover Report • ${new Date().toLocaleDateString()}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; background:rgba(255,255,255,0.03); padding:12px; border-radius:8px;">
          <div><strong>Active Shift:</strong> ${shift.name}</div>
          <div><strong>Supervisor:</strong> ${shift.supervisor}</div>
          <div><strong>Throughput:</strong> ${shift.actualUnits} / ${shift.targetUnits} (${((shift.actualUnits/shift.targetUnits)*100).toFixed(1)}%)</div>
          <div><strong>Overall OEE:</strong> ${shift.oee}%</div>
          <div><strong>Scrap Units:</strong> ${shift.scrapUnits} units</div>
          <div><strong>Downtime Total:</strong> ${shift.downtimeMinutes} minutes</div>
        </div>

        <h4 style="font-size:0.85rem; color:var(--color-cyan); text-transform:uppercase; margin-bottom:8px;">Handover Directives & Operational Notes:</h4>
        <ul style="padding-left:18px; margin-bottom:16px; font-size:0.82rem; line-height:1.6; color:#e2e8f0;">
          ${shift.handoverNotes.map(n => `<li>${n}</li>`).join('')}
        </ul>

        <h4 style="font-size:0.85rem; color:var(--color-warning); text-transform:uppercase; margin-bottom:8px;">Unresolved Alarms & Pending Work Orders:</h4>
        <div style="font-size:0.82rem; color:#fde68a; background:rgba(245,158,11,0.1); padding:10px; border-radius:6px;">
          • Line C Parts Feeder #2 running throttled. Scheduled opto-sensor replacement during upcoming changeover.
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  function closeHandoverReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('open');
  }

  function printReport() {
    window.print();
  }

  // ========================================================
  // STATE: VIRTUAL PERSONALITIES & WEB KNOWLEDGE
  // ========================================================
  let activePersonaId = 'vance';
  let injectedGroundingFeature = null;
  let currentFeatureFilterCategory = 'all';

  // --- LIVE INDUSTRY COMMODITY & SECTOR NEWS FEED ---
  function renderLiveMarketFeed() {
    const commodities = window.INDUSTRY_KNOWLEDGE?.LIVE_COMMODITIES || [];
    const newsItems = window.INDUSTRY_KNOWLEDGE?.LIVE_INDUSTRY_NEWS || [];

    // 1. Live Ticker Track Items
    const tickerTrack = document.getElementById('ticker-items-track');
    if (tickerTrack && commodities.length > 0) {
      // Repeat twice for seamless infinite marquee loop
      const chipHtml = commodities.map(c => {
        const deltaClass = c.trend === 'up' ? 'up' : (c.trend === 'down' ? 'down' : 'neutral');
        const arrow = c.trend === 'up' ? '▲' : (c.trend === 'down' ? '▼' : '▬');
        const sign = c.changePercent > 0 ? '+' : '';
        const priceStr = c.price < 1 ? `$${c.price.toFixed(4)}` : (c.price > 1000 ? `$${c.price.toLocaleString()}` : `${c.price}`);
        return `
          <span class="ticker-chip" onclick="PlantApp.toggleMacroTray()" title="${c.name} — ${c.impact}">
            <span class="ticker-symbol">${c.symbol}</span>
            <span class="ticker-price">${c.name.split(' ')[0]}: ${priceStr}</span>
            <span class="ticker-delta ${deltaClass}">${arrow} ${sign}${c.changePercent}%</span>
          </span>
        `;
      }).join('');
      tickerTrack.innerHTML = chipHtml + chipHtml;
    }

    // 2. Expandable Macro Tray Cards Grid
    const macroGrid = document.getElementById('macro-commodities-grid');
    if (macroGrid && commodities.length > 0) {
      macroGrid.innerHTML = commodities.map(c => {
        const deltaClass = c.trend === 'up' ? 'up' : (c.trend === 'down' ? 'down' : 'neutral');
        const arrow = c.trend === 'up' ? '▲' : (c.trend === 'down' ? '▼' : '▬');
        const sign = c.changePercent > 0 ? '+' : '';
        const priceStr = c.price < 1 ? `$${c.price.toFixed(4)}` : (c.price > 1000 ? `$${c.price.toLocaleString()}` : `${c.price}`);
        return `
          <div class="commodity-card">
            <div class="commodity-card-hdr">
              <span>${c.symbol} • ${c.category}</span>
              <span class="ticker-delta ${deltaClass}" style="font-weight:700;">${arrow} ${sign}${c.changePercent}%</span>
            </div>
            <div class="commodity-val-row">
              <span class="commodity-huge-val">${priceStr}</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">${c.unit}</span>
            </div>
            <div style="font-size:0.75rem; color:#fff; font-weight:600; margin-bottom:4px;">${c.name}</div>
            <div class="commodity-impact-text">${c.impact}</div>
          </div>
        `;
      }).join('');
    }

    // 3. News Wire List
    const newsList = document.getElementById('news-wire-list');
    if (newsList && newsItems.length > 0) {
      newsList.innerHTML = newsItems.map(n => `
        <article class="news-item-card">
          <div class="news-item-meta">
            <span>${n.source} • ${n.timestamp}</span>
            <span class="feature-category-badge" style="font-size:0.6rem; padding:1px 6px;">${n.badge}</span>
          </div>
          <a href="${n.url}" target="_blank" rel="noopener noreferrer" class="news-headline">${n.headline}</a>
          <p style="font-size:0.72rem; color:var(--text-muted); margin-top:3px; line-height:1.35;">${n.summary}</p>
        </article>
      `).join('');
    }
  }

  function toggleMacroTray() {
    const tray = document.getElementById('macro-tray');
    if (tray) {
      tray.classList.toggle('open');
      if (tray.classList.contains('open')) {
        renderLiveMarketFeed();
      }
    }
  }

  function refreshLiveMarketFeed() {
    const commodities = window.INDUSTRY_KNOWLEDGE?.LIVE_COMMODITIES || [];
    // Simulate real-time micro-fluctuations
    commodities.forEach(c => {
      const delta = (Math.random() * 0.4 - 0.2);
      c.changePercent = Number((c.changePercent + delta).toFixed(2));
      c.trend = c.changePercent >= 0 ? (c.changePercent === 0 ? 'neutral' : 'up') : 'down';
    });
    renderLiveMarketFeed();
    showToast('🔄 Live LME metal & energy commodities updated.');
  }

  // --- INDUSTRIAL WEB FEATURES SEARCH ENGINE & LIVE SCRAPER ---
  function renderFeaturesGrid(catFilter = 'all', searchKeyword = '') {
    const container = document.getElementById('features-grid-container');
    const countTag = document.getElementById('features-count-tag');
    if (!container) return;

    let items = window.INDUSTRY_KNOWLEDGE?.SCRAPED_INDUSTRIAL_FEATURES || [];

    // Filter by category
    if (catFilter !== 'all') {
      items = items.filter(f => f.category === catFilter);
    }

    // Filter by search query
    if (searchKeyword && searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      items = items.filter(f => {
        const fullText = (f.name + ' ' + f.manufacturer + ' ' + f.category + ' ' + f.plantUsage + ' ' + JSON.stringify(f.specs) + ' ' + f.keyFeatures.join(' ')).toLowerCase();
        return fullText.includes(q);
      });
    }

    if (countTag) {
      countTag.textContent = `${items.length} Specs Indexed`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:36px; color:var(--text-dim);">
          <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
          <h4>No industrial specifications matched your search.</h4>
          <p style="font-size:0.8rem; margin-top:4px;">Try searching for "ABB", "KUKA", "vibration", "ISO 10816", "Cognex", or "Siemens", or scrape a new target below.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(f => {
      // Build mini specs table rows
      const specRows = Object.entries(f.specs).slice(0, 4).map(([k, v]) => `
        <div class="spec-mini-row">
          <span class="spec-mini-k">${k.replace(/([A-Z])/g, ' $1').toUpperCase()}:</span>
          <span class="spec-mini-v">${v}</span>
        </div>
      `).join('');

      // Build key feature bullets
      const bullets = f.keyFeatures.slice(0, 2).map(b => `<li>${b}</li>`).join('');

      return `
        <div class="feature-card" id="card-${f.id}">
          <div>
            <div class="feature-top-meta">
              <span class="feature-category-badge">${f.category}</span>
              <span style="font-size:0.68rem; color:var(--color-cyan); font-family:var(--font-mono);">${f.scrapedDate}</span>
            </div>
            <h4>${f.name}</h4>
            <div class="feature-manufacturer">OEM: ${f.manufacturer}</div>
            
            <div class="feature-specs-mini-table">
              ${specRows}
            </div>

            <ul class="feature-bullets-list">
              ${bullets}
            </ul>

            <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">
              <strong>Plant Deployment:</strong> ${f.plantUsage}
            </div>
          </div>

          <div class="feature-card-actions">
            <button class="inject-spec-btn" onclick="PlantApp.injectFeatureIntoAgent('${f.id}')" title="Inject this scraped specification into the active Virtual Persona agent pipeline">
              <span>⚡</span> Inject into Agent
            </button>
            <button class="view-source-link" onclick="PlantApp.openFeatureDetailModal('${f.id}')" title="Inspect full technical specification datasheet">
              <span>🔍</span> Specs
            </button>
            <a href="${f.sourceUrl}" target="_blank" rel="noopener noreferrer" class="view-source-link" title="Visit scraped web source URL">
              <span>🌐</span> Source
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterFeatures() {
    const input = document.getElementById('feature-search-input');
    const q = input ? input.value : '';
    renderFeaturesGrid(currentFeatureFilterCategory, q);
  }

  function setFeatureCategory(cat) {
    currentFeatureFilterCategory = cat;
    document.querySelectorAll('.feature-filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    filterFeatures();
  }

  function clearFeatureSearch() {
    const input = document.getElementById('feature-search-input');
    if (input) input.value = '';
    filterFeatures();
  }

  function scrollToFeatures() {
    const el = document.getElementById('web-features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function scrollToScraperConsole() {
    const el = document.getElementById('scraper-console-box');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = document.getElementById('scraper-input-target');
      if (input) input.focus();
    }
  }

  // --- INJECT FEATURE INTO AGENT PIPELINE ---
  function injectFeatureIntoAgent(featureId) {
    const features = window.INDUSTRY_KNOWLEDGE?.SCRAPED_INDUSTRIAL_FEATURES || [];
    const item = features.find(f => f.id === featureId);
    if (!item) return;

    injectedGroundingFeature = item;

    // Show injected banner in drawer
    const banner = document.getElementById('injected-grounding-banner');
    const nameEl = document.getElementById('injected-feature-name');
    if (banner && nameEl) {
      nameEl.textContent = `${item.name} (${item.manufacturer})`;
      banner.classList.add('show');
    }

    // Open Copilot drawer
    const drawer = document.getElementById('copilot-drawer');
    if (drawer && !drawer.classList.contains('open')) {
      drawer.classList.add('open');
    }

    // Show toast
    showToast(`⚡ Grounded Agent with: ${item.name}`);

    // Pre-populate input or ask Copilot
    const input = document.getElementById('copilot-text-input');
    if (input) {
      input.value = `Evaluate how ${item.name} (${item.category}) integrates into our plant line telemetry.`;
      input.focus();
    }
  }

  function clearInjectedGrounding() {
    injectedGroundingFeature = null;
    const banner = document.getElementById('injected-grounding-banner');
    if (banner) banner.classList.remove('show');
    showToast('Cleared injected grounding feature.');
  }

  // --- FEATURE DETAIL MODAL ---
  function openFeatureDetailModal(featureId) {
    const features = window.INDUSTRY_KNOWLEDGE?.SCRAPED_INDUSTRIAL_FEATURES || [];
    const item = features.find(f => f.id === featureId);
    if (!item) return;

    const modal = document.getElementById('feature-detail-modal');
    const body = document.getElementById('feature-modal-body');
    const title = document.getElementById('feature-modal-title');
    const injectBtn = document.getElementById('feature-modal-inject-btn');

    if (title) title.textContent = `📄 ${item.name}`;
    if (injectBtn) {
      injectBtn.onclick = () => {
        injectFeatureIntoAgent(item.id);
        closeFeatureDetailModal();
      };
    }

    if (body) {
      const specsTable = Object.entries(item.specs).map(([k, v]) => `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
          <td style="padding:6px 10px; font-weight:700; color:var(--color-cyan); width:35%;">${k.replace(/([A-Z])/g, ' $1').toUpperCase()}</td>
          <td style="padding:6px 10px; color:#fff;">${v}</td>
        </tr>
      `).join('');

      const bulletsList = item.keyFeatures.map(b => `
        <li style="margin-bottom:6px; color:#e2e8f0;">${b}</li>
      `).join('');

      body.innerHTML = `
        <div style="font-size:0.82rem; line-height:1.5;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border-subtle);">
            <div>
              <span class="feature-category-badge">${item.category}</span>
              <span style="margin-left:8px; color:var(--text-muted); font-size:0.75rem;">OEM: <strong>${item.manufacturer}</strong></span>
            </div>
            <a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--color-cyan); font-size:0.75rem; text-decoration:none;">
              🌐 Web Datasheet ➔
            </a>
          </div>

          <h4 style="color:#fff; margin-bottom:6px;">Technical Specification Parameters:</h4>
          <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-family:var(--font-mono); font-size:0.76rem; background:rgba(0,0,0,0.3); border-radius:var(--radius-sm);">
            <tbody>${specsTable}</tbody>
          </table>

          <h4 style="color:#fff; margin-bottom:6px;">Key Architectural Features & Capabilities:</h4>
          <ul style="padding-left:18px; margin-bottom:16px; font-size:0.8rem;">
            ${bulletsList}
          </ul>

          <div style="background:rgba(6,182,212,0.1); border-left:3px solid var(--color-cyan); padding:8px 12px; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.78rem;">
            <strong>Plant Operations Context:</strong> ${item.plantUsage}
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add('open');
  }

  function closeFeatureDetailModal() {
    const modal = document.getElementById('feature-detail-modal');
    if (modal) modal.classList.remove('open');
  }

  // --- LIVE WEB SCRAPER SIMULATOR / EXTRACTOR ---
  function handleRunScraper(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('scraper-input-target');
    const logBox = document.getElementById('scraper-progress-log');
    if (!input || !input.value.trim()) return;

    const target = input.value.trim();
    if (logBox) {
      logBox.style.display = 'block';
      logBox.innerHTML = `
        <div>🕷️ <strong>[INIT]</strong> Connecting to target industrial endpoint: <em>${target}</em>...</div>
      `;
    }

    // Step 1: HTTP GET
    setTimeout(() => {
      if (logBox) {
        logBox.innerHTML += `
          <div>🌐 <strong>[FETCH]</strong> HTTP 200 OK — Ingested HTML & schema payload (48.2 KB).</div>
        `;
      }
    }, 450);

    // Step 2: DOM Parsing
    setTimeout(() => {
      if (logBox) {
        logBox.innerHTML += `
          <div>⚙️ <strong>[PARSE]</strong> Extracting engineering parameters, OEM tolerances & ISO compliance tags...</div>
        `;
      }
    }, 900);

    // Step 3: Vector Indexing & Knowledge Graph Land
    setTimeout(() => {
      const res = window.INDUSTRY_KNOWLEDGE?.scrapeIndustrialWebTopic(target);
      if (logBox) {
        logBox.innerHTML += `
          <div>✅ <strong>[INDEX]</strong> Successfully indexed <strong>"${res?.item?.name}"</strong> under <em>${res?.item?.category}</em>. Ready for Agent grounding!</div>
        `;
      }

      // Re-render features grid
      renderFeaturesGrid(currentFeatureFilterCategory, '');
      showToast(`🕷️ Scraped & indexed: ${res?.item?.name}`);
      playAlertSound('beep');
    }, 1450);
  }

  function setScraperPreset(presetText) {
    const input = document.getElementById('scraper-input-target');
    if (input) {
      input.value = presetText;
      handleRunScraper();
    }
  }

  // ========================================================
  // VIRTUAL INDUSTRIES PERSONALITIES & PIPELINE ENGINE
  // ========================================================
  function selectPersona(personaId) {
    activePersonaId = personaId;

    // Update carousel pills active class
    document.querySelectorAll('.persona-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.persona === personaId);
    });

    // Update active label
    const ind = document.getElementById('active-persona-role-indicator');
    if (ind) {
      if (personaId === 'roundtable') {
        ind.textContent = '🌟 Multi-Agent Roundtable (4 Specialists)';
      } else {
        const p = window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[personaId];
        if (p) ind.textContent = `${p.name} (${p.role.split(' ')[0]})`;
      }
    }

    updateQuickPrompts();

    // Append welcome message tailored to this persona
    const body = document.getElementById('copilot-chat-body');
    if (body) {
      const welcome = document.createElement('div');
      welcome.className = 'copilot-msg bot';

      if (personaId === 'roundtable') {
        welcome.innerHTML = `
          <strong>🌟 Multi-Agent Industrial Roundtable Online:</strong><br>
          Four virtual specialists (Operations, Reliability, Automation, and Economics) are connected in a synchronized consensus pipeline. Ask any plant incident or scenario for a complete multi-perspective dossier!
        `;
      } else {
        const p = window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[personaId];
        welcome.innerHTML = `
          <strong>${p.avatar} ${p.name}</strong> <em>(${p.role})</em><br>
          ${p.systemGreeting}
        `;
      }
      body.appendChild(welcome);
      body.scrollTop = body.scrollHeight;
    }
  }

  function updateQuickPrompts() {
    const container = document.getElementById('copilot-quick-prompts');
    if (!container) return;

    if (activePersonaId === 'roundtable') {
      container.innerHTML = `
        <button class="quick-chip" onclick="PlantApp.askCopilot('Conduct full 4-agent review on Line C feeder bottleneck')">⚠️ Feeder Bottleneck Review</button>
        <button class="quick-chip" onclick="PlantApp.askCopilot('Evaluate plant OEE recovery strategy for Shift 2')">📈 OEE Recovery Plan</button>
        <button class="quick-chip" onclick="PlantApp.askCopilot('Assess commodity price impact on current shift scrap')">💰 Scrap Economic Valuation</button>
        <button class="quick-chip" onclick="PlantApp.askCopilot('Audit plant safety interlocks and LOTO protocols')">🛡️ Safety Interlock Audit</button>
      `;
      return;
    }

    const persona = window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[activePersonaId] || window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS['vance'];
    if (persona && persona.sampleQuestions) {
      container.innerHTML = persona.sampleQuestions.map(q => `
        <button class="quick-chip" onclick="PlantApp.askCopilot('${q.replace(/'/g, "\\'")}')">${q}</button>
      `).join('');
    }
  }

  function animatePipelineStages(callback) {
    const nodes = [
      document.getElementById('pipe-node-1'),
      document.getElementById('pipe-node-2'),
      document.getElementById('pipe-node-3'),
      document.getElementById('pipe-node-4'),
      document.getElementById('pipe-node-5')
    ];

    nodes.forEach((n, idx) => {
      if (!n) return;
      n.classList.remove('completed');
      n.classList.remove('running');
    });

    let current = 0;
    const interval = setInterval(() => {
      if (current > 0 && nodes[current - 1]) {
        nodes[current - 1].classList.remove('running');
        nodes[current - 1].classList.add('completed');
      }
      if (current < nodes.length && nodes[current]) {
        nodes[current].classList.add('running');
        current++;
      } else {
        clearInterval(interval);
        nodes.forEach(n => {
          if (n) {
            n.classList.remove('running');
            n.classList.add('completed');
          }
        });
        if (callback) callback();
      }
    }, 90);
  }

  // --- COPILOT AGENT CHAT EXECUTION ---
  function toggleCopilot() {
    const drawer = document.getElementById('copilot-drawer');
    if (drawer) drawer.classList.toggle('open');
  }

  async function handleCopilotQuery(promptText) {
    const body = document.getElementById('copilot-chat-body');
    const input = document.getElementById('copilot-text-input');
    const text = promptText || (input ? input.value : '');
    if (!text || !text.trim()) return;

    if (input) input.value = '';

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'copilot-msg user';
    userMsg.textContent = text;
    body.appendChild(userMsg);

    // Thinking placeholder
    const botMsg = document.createElement('div');
    botMsg.className = 'copilot-msg bot';
    botMsg.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="ticker-live-dot"></span>
        <em>Executing 5-Stage Agent Pipeline with <strong>${activePersonaId === 'roundtable' ? 'Multi-Agent Roundtable' : window.INDUSTRY_KNOWLEDGE?.VIRTUAL_PERSONAS[activePersonaId]?.name}</strong>...</em>
      </div>
    `;
    body.appendChild(botMsg);
    body.scrollTop = body.scrollHeight;

    // Animate visual pipeline steps
    animatePipelineStages(async () => {
      try {
        const trace = await window.INDUSTRY_KNOWLEDGE?.AGENT_PIPELINE.executePipeline(text, activePersonaId, {
          injectedFeature: injectedGroundingFeature
        });

        botMsg.innerHTML = trace.responseHtml;
        body.scrollTop = body.scrollHeight;
        playAlertSound('beep');
      } catch (err) {
        console.error('Agent Pipeline Error:', err);
        botMsg.innerHTML = `⚠️ Pipeline processing error. Please retry.`;
      }
    });
  }

  // --- PIPELINE TRACE MODAL ---
  function openPipelineTraceModal() {
    const modal = document.getElementById('pipeline-trace-modal');
    const body = document.getElementById('pipeline-trace-modal-body');
    const trace = window.INDUSTRY_KNOWLEDGE?.AGENT_PIPELINE?.lastTrace;

    if (!trace) {
      showToast('Run an agent query first to generate a pipeline execution trace.');
      return;
    }

    if (body) {
      const stagesHtml = trace.stages.map(s => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:10px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="color:var(--color-cyan);">${s.name}</strong>
            <span style="color:#34d399;">${s.durationMs} ms</span>
          </div>
          <pre style="margin:0; overflow-x:auto; background:rgba(0,0,0,0.4); padding:8px; border-radius:4px; font-size:0.7rem; color:#a5f3fc;">${JSON.stringify(s.output, null, 2)}</pre>
        </div>
      `).join('');

      body.innerHTML = `
        <div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between;">
          <div>
            <strong>Trace ID:</strong> <code>${trace.id}</code><br>
            <strong>Target Query:</strong> <em>"${trace.query}"</em>
          </div>
          <div style="text-align:right;">
            <strong>Total Pipeline Latency:</strong> <span style="color:#34d399; font-weight:700;">${trace.totalTimeMs} ms</span><br>
            <strong>Agent Mode:</strong> ${trace.personaId.toUpperCase()}
          </div>
        </div>
        ${stagesHtml}
      `;
    }

    if (modal) modal.classList.add('open');
  }

  function closePipelineTraceModal() {
    const modal = document.getElementById('pipeline-trace-modal');
    if (modal) modal.classList.remove('open');
  }

  function showToast(msg) {
    const toast = document.getElementById('factory-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    renderKpis();
    renderLines();
    renderThroughputChart();
    renderParetoChart();
    renderIncidentsTable();
    renderHandoverNotes();
    startSimulation();

    // Initialize upgraded modules
    renderLiveMarketFeed();
    renderFeaturesGrid('all', '');
    selectPersona('vance');

    // Shift Switcher buttons
    document.querySelectorAll('.shift-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => switchShift(btn.dataset.shift));
    });

    // Copilot text form
    const copilotForm = document.getElementById('copilot-form');
    if (copilotForm) {
      copilotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCopilotQuery();
      });
    }

    // Incident form
    const incidentForm = document.getElementById('incident-form');
    if (incidentForm) {
      incidentForm.addEventListener('submit', submitNewIncident);
    }
  });

  // --- EXPOSE TO GLOBAL ---
  window.PlantApp = {
    switchShift,
    toggleEmergencyStop,
    openIncidentModal,
    closeIncidentModal,
    openTelemetryModal,
    closeTelemetryModal,
    openSopModal,
    openHandoverReportModal,
    closeHandoverReportModal,
    printReport,
    toggleCopilot,
    askCopilot: (text) => handleCopilotQuery(text),
    // Live Market Feed & Macro Tray
    toggleMacroTray,
    refreshLiveMarketFeed,
    // Web Features & Scraper Engine
    filterFeatures,
    setFeatureCategory,
    clearFeatureSearch,
    scrollToFeatures,
    scrollToScraperConsole,
    injectFeatureIntoAgent,
    clearInjectedGrounding,
    openFeatureDetailModal,
    closeFeatureDetailModal,
    handleRunScraper,
    setScraperPreset,
    // Virtual Personas & Pipeline
    selectPersona,
    openPipelineTraceModal,
    closePipelineTraceModal
  };

})();

