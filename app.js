// app.js - SportPulse AI Chatbot Core Application Engine

(function () {
  'use strict';

  // --- STATE ---
  let soundEnabled = true;
  let ttsEnabled = false;
  let currentTheme = 'midnight';
  let chatHistory = [];
  let bookmarkedMessages = [];
  let currentQuizIndex = 0;
  let quizScore = 0;
  let quizActive = false;
  let isListening = false;
  let recognitionInstance = null;
  let audioCtx = null;

  // --- WEB AUDIO API SYNTHESIZER SOUNDS ---
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'send') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'receive') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'correct') {
        // High celebratory chime
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.15, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.25);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  // --- TEXT TO SPEECH ---
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Strip HTML tags for clean speech
      const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[#*`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const sportsVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Alex'))) || voices[0];
      if (sportsVoice) utterance.voice = sportsVoice;
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS error:', err);
    }
  }

  // --- NLP QUERY PARSER & INTENT RECOGNITION ---
  function parseUserIntent(rawInput) {
    const input = rawInput.trim().toLowerCase();
    const cleanTokens = input.replace(/[?,.!/\\-]/g, ' ').split(/\s+/).filter(Boolean);

    // 1. GREETINGS & IDENTITY
    if (/^(hi|hello|hey|yo|howdy|sup|greetings|hola)\b/.test(input)) {
      return {
        type: 'greeting',
        content: `👋 **Welcome to SportPulse AI!** I am your 24/7 sports intelligence assistant. 

I have deep knowledge on:
* ⚽ **Football / Soccer**: Champions League, World Cup, Messi vs Ronaldo, Ballon d'Or, Offside rules
* 🏏 **Cricket**: IPL, ICC World Cups, Kohli, Dhoni, LBW rule, DRS technology
* 🏀 **Basketball**: NBA Finals, LeBron vs Jordan, Shot clock rules, Scoring records
* 🎾 **Tennis**: Grand Slams (Wimbledon, Roland Garros), Big Three records, Deuce scoring
* 🏎️ **Formula 1**: F1 World Champions, DRS rules, Grand Prix flags, Pit strategies
* 🏈 **NFL / Olympics / Boxing / MMA**: Super Bowl, medal standings, rules & records

Try tapping one of the quick suggestions below, or type your question!`
      };
    }

    if (/(who are you|what is your name|what can you do|help me|features)/i.test(input)) {
      return {
        type: 'bot_info',
        content: `🤖 **About SportPulse AI**:
I am an ultra-responsive sports intelligence chatbot built to answer anything about the sports universe:
- **Player Profiles & Stats**: Ask about any legend (e.g. *"Virat Kohli stats"*, *"Cristiano Ronaldo"*).
- **Rivalry & GOAT Comparisons**: Compare legends (e.g. *"Messi vs Ronaldo"*, *"Jordan vs LeBron"*, *"Djokovic vs Nadal"*).
- **Rules & Regulations**: Get simplified explanations (e.g. *"How does LBW work?"*, *"Explain offside in soccer"*, *"What is DRS in F1?"*).
- **Tournaments & Histories**: Learn about championships (e.g. *"World Cup winners"*, *"IPL champions"*).
- **Simulated Live Scores**: Ask *"What are the live matches?"* or *"latest scores"*.
- **Interactive Quiz Challenge**: Type *"play quiz"* to test your sports knowledge!`
      };
    }

    // 2. QUIZ INVOCATION
    if (/^(quiz|trivia|play quiz|start quiz|test my knowledge|sports quiz)/i.test(input)) {
      quizActive = true;
      currentQuizIndex = 0;
      quizScore = 0;
      return {
        type: 'quiz',
        quizItem: window.SPORTS_DB.quiz[0],
        total: window.SPORTS_DB.quiz.length,
        index: 0
      };
    }

    // 3. RANDOM FUN FACT / TRIVIA
    if (/(fun fact|random fact|trivia fact|tell me a fact|surprise me)/i.test(input)) {
      const facts = window.SPORTS_DB.funFacts;
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      return {
        type: 'fun_fact',
        fact: randomFact
      };
    }

    // 4. LIVE MATCHES / FIXTURES / SCORES
    if (/(live score|live match|scores|fixtures|match center|current matches|who is playing|todays matches)/i.test(input)) {
      return {
        type: 'live_matches',
        matches: window.SPORTS_DB.liveMatches
      };
    }

    // 5. HEAD-TO-HEAD COMPARISONS
    for (const comp of window.SPORTS_DB.comparisons) {
      if (comp.tags.some(tag => input.includes(tag)) ||
         (input.includes('vs') && comp.title.toLowerCase().split(' vs ').every(name => input.includes(name.trim().split(' ')[0].toLowerCase())))) {
        return {
          type: 'comparison',
          data: comp
        };
      }
    }

    // Generic check for "vs" or "better" or "comparison"
    if (input.includes(' vs ') || input.includes('versus') || (input.includes('who is better') && (input.includes('messi') || input.includes('ronaldo') || input.includes('jordan') || input.includes('lebron')))) {
      if ((input.includes('messi') && input.includes('ronaldo')) || input.includes('cr7')) {
        return { type: 'comparison', data: window.SPORTS_DB.comparisons.find(c => c.id === 'messi_vs_ronaldo') };
      }
      if (input.includes('jordan') && input.includes('lebron')) {
        return { type: 'comparison', data: window.SPORTS_DB.comparisons.find(c => c.id === 'jordan_vs_lebron') };
      }
      if (input.includes('djokovic') || input.includes('nadal') || input.includes('federer')) {
        return { type: 'comparison', data: window.SPORTS_DB.comparisons.find(c => c.id === 'big_three_tennis') };
      }
      if (input.includes('kohli') && (input.includes('sachin') || input.includes('tendulkar'))) {
        return { type: 'comparison', data: window.SPORTS_DB.comparisons.find(c => c.id === 'kohli_vs_sachin') };
      }
    }

    // 6. RULES & REGULATIONS
    for (const rule of window.SPORTS_DB.rules) {
      if (rule.tags.some(t => input.includes(t)) || input.includes(rule.id.replace('_', ' '))) {
        return {
          type: 'rule',
          data: rule
        };
      }
    }

    // Fuzzy check for common rule questions
    if (input.includes('offside')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'football_offside') };
    }
    if (input.includes('lbw')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'cricket_lbw') };
    }
    if (input.includes('drs') && (input.includes('cricket') || !input.includes('f1'))) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'cricket_drs') };
    }
    if (input.includes('drs') && (input.includes('f1') || input.includes('formula'))) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'f1_drs') };
    }
    if (input.includes('powerplay')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'cricket_powerplay') };
    }
    if (input.includes('shot clock') || input.includes('24 second')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'basketball_shot_clock') };
    }
    if (input.includes('deuce') || input.includes('tennis score') || input.includes('tennis scoring') || input.includes('love in tennis')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'tennis_scoring') };
    }
    if (input.includes('f1 flag') || input.includes('flags in f1') || input.includes('yellow flag') || input.includes('checkered flag')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'f1_flags') };
    }
    if (input.includes('touchdown') || input.includes('down in nfl') || input.includes('nfl score') || input.includes('american football rules')) {
      return { type: 'rule', data: window.SPORTS_DB.rules.find(r => r.id === 'nfl_downs_scoring') };
    }

    // 7. SPECIFIC ATHLETE / PLAYER SEARCH
    for (const player of window.SPORTS_DB.players) {
      if (player.tags.some(tag => input.includes(tag))) {
        return {
          type: 'player',
          data: player
        };
      }
    }

    // 8. TOURNAMENTS & CHAMPIONSHIPS
    for (const tour of window.SPORTS_DB.tournaments) {
      if (tour.tags.some(tag => input.includes(tag))) {
        return {
          type: 'tournament',
          data: tour
        };
      }
    }

    // 9. SPORTS CATEGORY OVERVIEWS
    if (input.includes('football') || input.includes('soccer')) {
      return {
        type: 'category_overview',
        sport: 'Football / Soccer ⚽',
        intro: "Football (Soccer) is the most popular sport in the world, played across 200+ nations. Governed globally by FIFA.",
        featuredPlayers: ["Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappé", "Erling Haaland"],
        featuredEvents: ["FIFA World Cup", "UEFA Champions League", "Copa América", "Euro Championship"],
        rulesHighlight: "11 players per side, 90 minutes (two 45-min halves), Offside rule, VAR technology, Yellow/Red cards."
      };
    }
    if (input.includes('cricket')) {
      return {
        type: 'category_overview',
        sport: 'Cricket 🏏',
        intro: "Cricket is the world's 2nd most popular sport, featuring Test, ODI, and ultra-exciting T20 formats.",
        featuredPlayers: ["Virat Kohli", "MS Dhoni", "Sachin Tendulkar", "Rohit Sharma"],
        featuredEvents: ["ICC Cricket World Cup (ODI)", "ICC T20 World Cup", "Indian Premier League (IPL)", "The Ashes"],
        rulesHighlight: "11 players per team, pitch 22 yards, LBW dismissals, Powerplay fielding restrictions, DRS reviews."
      };
    }
    if (input.includes('basketball') || input.includes('nba')) {
      return {
        type: 'category_overview',
        sport: 'Basketball 🏀',
        intro: "Fast-paced high-scoring game created by Dr. James Naismith in 1891. The NBA is the premier global professional league.",
        featuredPlayers: ["LeBron James", "Michael Jordan", "Stephen Curry", "Kobe Bryant"],
        featuredEvents: ["NBA Finals (Larry O'Brien Trophy)", "NBA All-Star Weekend", "Olympic Basketball"],
        rulesHighlight: "5 players on court, 10-foot hoops, 24-second shot clock, 3-pointers, 6 personal fouls to foul out."
      };
    }
    if (input.includes('tennis')) {
      return {
        type: 'category_overview',
        sport: 'Tennis 🎾',
        intro: "Racket sport played individually (singles) or in pairs (doubles) across Hard, Clay, and Grass surfaces.",
        featuredPlayers: ["Novak Djokovic", "Rafael Nadal", "Roger Federer", "Carlos Alcaraz"],
        featuredEvents: ["Australian Open (Hard)", "Roland Garros / French Open (Clay)", "Wimbledon (Grass)", "US Open (Hard)"],
        rulesHighlight: "Scoring: Love, 15, 30, 40, Deuce, Advantage. Best of 3 or 5 sets. Tiebreaks at 6-6."
      };
    }
    if (input.includes('f1') || input.includes('formula 1') || input.includes('racing')) {
      return {
        type: 'category_overview',
        sport: 'Formula 1 Racing 🏎️',
        intro: "The pinnacle of open-wheel motorsport, featuring hybrid turbocharged V6 power units reaching 350+ km/h.",
        featuredPlayers: ["Max Verstappen", "Lewis Hamilton", "Ayrton Senna", "Michael Schumacher"],
        featuredEvents: ["Monaco Grand Prix", "Silverstone GP", "Spa-Francorchamps", "Monza GP"],
        rulesHighlight: "Drag Reduction System (DRS), mandatory tire compound changes in dry races, Safety Car, Track limits."
      };
    }
    if (input.includes('olympics') || input.includes('olympic')) {
      const oly = window.SPORTS_DB.tournaments.find(t => t.id === 'olympic_games');
      return { type: 'tournament', data: oly };
    }

    // 10. ADVANCED FALLBACK: Search tokens across all players, rules, tournaments
    const fallbackResults = searchAllSportsData(cleanTokens);
    if (fallbackResults.length > 0) {
      return {
        type: 'search_results',
        query: rawInput,
        results: fallbackResults
      };
    }

    // 11. GENERAL AI RESPONSE (Sports related fallback)
    return {
      type: 'general_sports_fallback',
      query: rawInput
    };
  }

  function searchAllSportsData(tokens) {
    const results = [];
    const db = window.SPORTS_DB;

    // Search players
    for (const p of db.players) {
      const matchScore = tokens.filter(tok => 
        p.name.toLowerCase().includes(tok) || 
        p.sport.toLowerCase().includes(tok) ||
        p.tags.some(t => t.includes(tok))
      ).length;
      if (matchScore > 0) {
        results.push({ type: 'Player', name: p.name, sport: p.sport, item: p, score: matchScore });
      }
    }

    // Search tournaments
    for (const t of db.tournaments) {
      const matchScore = tokens.filter(tok => 
        t.name.toLowerCase().includes(tok) || 
        t.sport.toLowerCase().includes(tok) ||
        t.tags.some(tag => tag.includes(tok))
      ).length;
      if (matchScore > 0) {
        results.push({ type: 'Championship', name: t.name, sport: t.sport, item: t, score: matchScore });
      }
    }

    // Search rules
    for (const r of db.rules) {
      const matchScore = tokens.filter(tok => 
        r.ruleName.toLowerCase().includes(tok) || 
        r.sport.toLowerCase().includes(tok) ||
        r.tags.some(tag => tag.includes(tok))
      ).length;
      if (matchScore > 0) {
        results.push({ type: 'Rule / Concept', name: r.ruleName, sport: r.sport, item: r, score: matchScore });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 3);
  }

  // --- HTML RESPONSE BUILDERS ---
  function buildResponseHTML(intentResult) {
    let html = '';
    let speechSummary = '';

    switch (intentResult.type) {
      case 'greeting':
      case 'bot_info': {
        const parsed = formatMarkdown(intentResult.content);
        html = `<div class="bot-text">${parsed}</div>`;
        speechSummary = intentResult.content;
        break;
      }

      case 'player': {
        const p = intentResult.data;
        let statsRows = '';
        for (const [k, v] of Object.entries(p.stats)) {
          statsRows += `
            <div class="stat-pill">
              <span class="stat-label">${k}</span>
              <span class="stat-val">${v}</span>
            </div>`;
        }
        html = `
          <div class="player-card">
            <div class="player-card-header">
              <div class="player-title-group">
                <span class="sport-badge">${p.sport}</span>
                <h3 class="player-name">${p.name}</h3>
                <div class="player-meta">
                  <span>${p.country}</span> • <span>${p.role}</span> • <span>${p.currentTeam}</span>
                </div>
              </div>
              <div class="player-nickname-pill">"${p.nickname}"</div>
            </div>
            
            <div class="stats-grid">
              ${statsRows}
            </div>

            <div class="player-card-footer">
              <p><strong>Career Legacy:</strong> ${p.highlights}</p>
            </div>
          </div>`;
        speechSummary = `${p.name}, legendary athlete in ${p.sport}. ${p.highlights}`;
        break;
      }

      case 'comparison': {
        const comp = intentResult.data;
        let renderA = '';
        comp.playerA.stats.forEach(s => {
          renderA += `<li><strong>${s.label}:</strong> ${s.val}</li>`;
        });
        let renderB = '';
        comp.playerB.stats.forEach(s => {
          renderB += `<li><strong>${s.label}:</strong> ${s.val}</li>`;
        });

        let thirdCol = '';
        if (comp.playerC) {
          let renderC = '';
          comp.playerC.stats.forEach(s => {
            renderC += `<li><strong>${s.label}:</strong> ${s.val}</li>`;
          });
          thirdCol = `
            <div class="compare-col">
              <h4>${comp.playerC.name}</h4>
              <ul class="compare-list">${renderC}</ul>
            </div>`;
        }

        html = `
          <div class="comparison-card">
            <div class="comparison-header">
              <span class="sport-badge">${comp.sport}</span>
              <h3>${comp.title}</h3>
              <p class="subtitle">${comp.subtitle}</p>
            </div>
            
            <div class="comparison-grid ${comp.playerC ? 'three-way' : ''}">
              <div class="compare-col">
                <h4>${comp.playerA.name}</h4>
                <ul class="compare-list">${renderA}</ul>
              </div>
              <div class="compare-col">
                <h4>${comp.playerB.name}</h4>
                <ul class="compare-list">${renderB}</ul>
              </div>
              ${thirdCol}
            </div>

            <div class="compare-verdict">
              <strong>🏆 The Verdict:</strong> ${comp.conclusion}
            </div>
          </div>`;
        speechSummary = `Comparing ${comp.title}. ${comp.conclusion}`;
        break;
      }

      case 'rule': {
        const r = intentResult.data;
        let conditions = '';
        if (r.keyConditions) {
          conditions = `<ul class="rules-list">${r.keyConditions.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.components) {
          conditions = `<ul class="rules-list">${r.components.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.subRules) {
          conditions = `<ul class="rules-list">${r.subRules.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.types) {
          conditions = `<ul class="rules-list">${r.types.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.flow) {
          conditions = `<ul class="rules-list">${r.flow.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.flagList) {
          conditions = `<ul class="rules-list">${r.flagList.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.scoring) {
          conditions = `<ul class="rules-list">${r.scoring.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.formats) {
          conditions = `<ul class="rules-list">${r.formats.map(c => `<li>${c}</li>`).join('')}</ul>`;
        } else if (r.conditions) {
          conditions = `<ul class="rules-list">${r.conditions.map(c => `<li>${c}</li>`).join('')}</ul>`;
        }

        html = `
          <div class="rule-card">
            <div class="rule-card-header">
              <span class="sport-badge">${r.sport}</span>
              <h3>${r.ruleName}</h3>
            </div>
            <p class="rule-summary"><strong>Core Rule:</strong> ${r.summary}</p>
            <div class="rule-details">
              <strong>Key Regulations & Scenarios:</strong>
              ${conditions}
            </div>
            ${r.penalty ? `<div class="rule-penalty">⚠️ <strong>Sanction / Penalty:</strong> ${r.penalty}</div>` : ''}
          </div>`;
        speechSummary = `${r.ruleName} in ${r.sport}. ${r.summary}`;
        break;
      }

      case 'tournament': {
        const t = intentResult.data;
        let tableHTML = '';
        if (t.historyTable) {
          const rows = t.historyTable.map(row => `
            <tr>
              <td><strong>${row.year}</strong></td>
              <td>${row.winner}</td>
              <td>${row.runnerUp}</td>
              <td>${row.score || row.series || '-'}</td>
            </tr>
          `).join('');

          tableHTML = `
            <div class="table-responsive">
              <table class="sports-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Winner</th>
                    <th>Runner-Up</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>`;
        } else if (t.slams) {
          const rows = t.slams.map(s => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.surface}</td>
              <td>${s.location}</td>
              <td>${s.recordHolder}</td>
            </tr>
          `).join('');

          tableHTML = `
            <div class="table-responsive">
              <table class="sports-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Surface</th>
                    <th>Venue</th>
                    <th>Record Champion</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>`;
        }

        html = `
          <div class="tournament-card">
            <div class="tournament-header">
              <span class="sport-badge">${t.sport}</span>
              <h3>${t.name}</h3>
              <p>${t.description}</p>
            </div>
            <div class="tournament-meta-pills">
              ${t.currentChampion ? `<div class="meta-pill">🏆 Current Champion: <strong>${t.currentChampion}</strong></div>` : ''}
              ${t.mostSuccessful ? `<div class="meta-pill">👑 Most Successful: <strong>${t.mostSuccessful}</strong></div>` : ''}
              ${t.frequency ? `<div class="meta-pill">⏱️ Frequency: <strong>${t.frequency}</strong></div>` : ''}
            </div>
            ${tableHTML}
          </div>`;
        speechSummary = `${t.name} in ${t.sport}. ${t.description}`;
        break;
      }

      case 'live_matches': {
        const cards = intentResult.matches.map(m => `
          <div class="live-match-box">
            <div class="live-match-top">
              <span class="live-tag ${m.status.includes('LIVE') ? 'pulsing' : ''}">${m.status}</span>
              <span class="league-name">${m.sport} • ${m.league}</span>
            </div>
            <div class="teams-score-row">
              <div class="team-side left">
                <span class="team-icon">${m.teamA.logo}</span>
                <span class="team-title">${m.teamA.name}</span>
                <span class="score-num">${m.teamA.score}</span>
              </div>
              <div class="vs-divider">VS</div>
              <div class="team-side right">
                <span class="score-num">${m.teamB.score}</span>
                <span class="team-title">${m.teamB.name}</span>
                <span class="team-icon">${m.teamB.logo}</span>
              </div>
            </div>
            <div class="live-match-details">
              <div>📍 <em>${m.venue}</em></div>
              <div class="scorers-text">⚡ ${m.scorers}</div>
              <div class="match-highlight">📢 ${m.highlights}</div>
            </div>
          </div>
        `).join('');

        html = `
          <div class="live-matches-container">
            <div class="live-center-title">
              <span class="live-indicator"></span> <h3>Global Live Match Center</h3>
            </div>
            ${cards}
          </div>`;
        speechSummary = "Here are the latest simulated live scores and match results across football, cricket, basketball, tennis, and Formula 1.";
        break;
      }

      case 'quiz': {
        const q = intentResult.quizItem;
        const optionsHTML = q.options.map((opt, i) => `
          <button class="quiz-option-btn" data-qid="${q.id}" data-idx="${i}" onclick="window.SportPulseApp.handleQuizAnswer(${q.id}, ${i}, this)">
            <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
            <span class="opt-text">${opt}</span>
          </button>
        `).join('');

        html = `
          <div class="quiz-card" id="quiz-card-${q.id}">
            <div class="quiz-badge-bar">
              <span class="quiz-sport-pill">${q.sport}</span>
              <span class="quiz-counter">Question ${intentResult.index + 1} of ${intentResult.total}</span>
              <span class="quiz-score-pill">Score: <strong id="current-quiz-score">${quizScore}</strong></span>
              <span class="quiz-score-pill" style="margin-left:4px;" title="All-Time High Score">Best: <strong>${window.storage ? window.storage.getQuizHighScore() : 0}</strong></span>
            </div>
            <h4 class="quiz-question-text">${q.question}</h4>
            <div class="quiz-options-grid">
              ${optionsHTML}
            </div>
            <div class="quiz-explanation-box" id="quiz-exp-${q.id}" style="display:none;"></div>
          </div>`;
        speechSummary = `Quiz Question: ${q.question}`;
        break;
      }

      case 'fun_fact': {
        html = `
          <div class="fun-fact-card">
            <div class="fun-fact-header">
              <span class="fact-icon">🌟</span> <h4>Sports Trivia & Mind-Blowing Fact</h4>
            </div>
            <p class="fact-body">${intentResult.fact}</p>
            <button class="small-action-btn" onclick="window.SportPulseApp.askBot('Tell me another sports fun fact')">🎲 Another Fact</button>
          </div>`;
        speechSummary = intentResult.fact;
        break;
      }

      case 'category_overview': {
        html = `
          <div class="category-card">
            <div class="category-header">
              <h3>${intentResult.sport}</h3>
            </div>
            <p class="cat-intro">${intentResult.intro}</p>
            <div class="cat-grid">
              <div class="cat-block">
                <strong>⭐ Iconic Athletes:</strong>
                <p>${intentResult.featuredPlayers.join(', ')}</p>
              </div>
              <div class="cat-block">
                <strong>🏆 Major Tournaments:</strong>
                <p>${intentResult.featuredEvents.join(', ')}</p>
              </div>
            </div>
            <div class="cat-rules">
              <strong>📖 Fundamentals & Rules:</strong>
              <p>${intentResult.rulesHighlight}</p>
            </div>
            <div class="cat-actions">
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Tell me more about ${intentResult.featuredPlayers[0]}')">Profile: ${intentResult.featuredPlayers[0]}</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Tournament: ${intentResult.featuredEvents[0]}')">Event: ${intentResult.featuredEvents[0]}</button>
            </div>
          </div>`;
        speechSummary = `${intentResult.sport}: ${intentResult.intro}`;
        break;
      }

      case 'search_results': {
        const resultItems = intentResult.results.map(r => `
          <div class="search-item-card" onclick="window.SportPulseApp.askBot('${r.name}')">
            <span class="search-badge">${r.type}</span>
            <h4>${r.name}</h4>
            <p>${r.sport}</p>
          </div>
        `).join('');

        html = `
          <div class="bot-text">
            <p>I found these relevant sports topics matching "<em>${escapeHTML(intentResult.query)}</em>":</p>
            <div class="search-results-grid">
              ${resultItems}
            </div>
            <p style="margin-top:10px; font-size: 0.88rem; color: var(--text-secondary);">Click on any card above to explore its full stats or rules!</p>
          </div>`;
        speechSummary = `Found relevant topics for ${intentResult.query}.`;
        break;
      }

      default: {
        html = `
          <div class="bot-text">
            <p>I analyzed your question: "<strong>${escapeHTML(intentResult.query)}</strong>".</p>
            <p>While I didn't find an exact keyword hit in my instant indices, here are popular sports topics you can explore right now:</p>
            <div class="quick-suggest-cloud">
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Messi vs Ronaldo')">⚽ Messi vs Ronaldo</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Virat Kohli')">🏏 Virat Kohli Stats</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Jordan vs LeBron')">🏀 Jordan vs LeBron</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Explain LBW in Cricket')">🏏 LBW Cricket Rule</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('What is DRS in F1?')">🏎️ F1 DRS Rule</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Live Scores')">⚡ Live Scores</button>
              <button class="chip-btn" onclick="window.SportPulseApp.askBot('Play Quiz')">🎯 Sports Quiz</button>
            </div>
          </div>`;
        speechSummary = "I have extensive data on football, cricket, basketball, tennis, Formula 1, and the Olympics. Try selecting one of the suggested sports topics!";
        break;
      }
    }

    return { html, speechSummary };
  }

  // --- MARKDOWN FORMATTER HELPER ---
  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\* (.*)/g, '<br>• $1')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  }

  // --- MESSAGE STREAM CONTROLS ---
  function appendUserMessage(text) {
    const chatContainer = document.getElementById('chat-messages');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user-message';
    msgDiv.innerHTML = `
      <div class="message-bubble user-bubble">
        <div class="message-text">${escapeHTML(text)}</div>
        <div class="message-meta">${timeStr}</div>
      </div>
    `;
    chatContainer.appendChild(msgDiv);
    scrollChatToBottom();
    playSound('send');

    chatHistory.push({ sender: 'user', text, time: timeStr });
  }

  function appendBotMessage(htmlContent, speechText) {
    const chatContainer = document.getElementById('chat-messages');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgId = 'bot-msg-' + Date.now();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot-message';
    msgDiv.id = msgId;
    msgDiv.innerHTML = `
      <div class="bot-avatar-container">
        <img src="assets/avatar.jpg" alt="SportPulse AI" class="bot-avatar-img" />
      </div>
      <div class="message-bubble bot-bubble">
        <div class="message-header-bar">
          <span class="bot-badge">SportPulse AI</span>
          <div class="msg-action-icons">
            <button class="msg-icon-btn speak-btn" title="Read aloud" onclick="window.SportPulseApp.speakMessage('${msgId}')">
              🔊
            </button>
            <button class="msg-icon-btn bookmark-btn" title="Bookmark insight" onclick="window.SportPulseApp.toggleBookmark('${msgId}')">
              ⭐
            </button>
            <button class="msg-icon-btn copy-btn" title="Copy text" onclick="window.SportPulseApp.copyMessageText('${msgId}')">
              📋
            </button>
          </div>
        </div>
        <div class="message-content" id="content-${msgId}">
          ${htmlContent}
        </div>
        <div class="message-meta">${timeStr}</div>
      </div>
    `;

    chatContainer.appendChild(msgDiv);
    scrollChatToBottom();
    playSound('receive');

    chatHistory.push({ sender: 'bot', id: msgId, html: htmlContent, speech: speechText, time: timeStr });

    if (ttsEnabled && speechText) {
      speakText(speechText);
    }
  }

  function showTypingIndicator() {
    const chatContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator-row';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="bot-avatar-container">
        <img src="assets/avatar.jpg" alt="SportPulse" class="bot-avatar-img" />
      </div>
      <div class="typing-bubble">
        <span class="sport-ball-pulse">⚽</span>
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="typing-label">Analyzing sports records...</span>
      </div>
    `;
    chatContainer.appendChild(typingDiv);
    scrollChatToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function scrollChatToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  // --- BOT PROCESSING CONTROLLER ---
  function processUserQuery(text) {
    if (!text || !text.trim()) return;
    const userText = text.trim();

    // Hide welcome banner if visible
    const welcomeHero = document.getElementById('welcome-hero');
    if (welcomeHero) welcomeHero.style.display = 'none';

    appendUserMessage(userText);

    // Show simulated typing indicator
    showTypingIndicator();

    const latency = 350 + Math.random() * 250; // realistic analysis feel
    setTimeout(() => {
      removeTypingIndicator();
      const intentResult = parseUserIntent(userText);
      const { html, speechSummary } = buildResponseHTML(intentResult);
      appendBotMessage(html, speechSummary);
    }, latency);
  }

  // --- QUIZ INTERACTION HANDLER ---
  function handleQuizAnswer(questionId, selectedIdx, btnElement) {
    const q = window.SPORTS_DB.quiz.find(item => item.id === questionId);
    if (!q) return;

    const quizCard = document.getElementById(`quiz-card-${questionId}`);
    if (!quizCard) return;

    // Disable all options
    const allBtns = quizCard.querySelectorAll('.quiz-option-btn');
    allBtns.forEach(btn => btn.disabled = true);

    const isCorrect = selectedIdx === q.correct;
    const expBox = document.getElementById(`quiz-exp-${questionId}`);

    if (isCorrect) {
      btnElement.classList.add('correct');
      quizScore += 10;
      playSound('correct');
      expBox.className = 'quiz-explanation-box success';
      expBox.innerHTML = `
        <div class="exp-title">✅ Spot on! +10 Points</div>
        <p>${q.explanation}</p>
        <button class="next-quiz-btn" onclick="window.SportPulseApp.nextQuizQuestion()">Next Question ➡️</button>
      `;
    } else {
      btnElement.classList.add('wrong');
      allBtns[q.correct].classList.add('correct');
      playSound('wrong');
      expBox.className = 'quiz-explanation-box error';
      expBox.innerHTML = `
        <div class="exp-title">❌ Incorrect</div>
        <p>${q.explanation}</p>
        <button class="next-quiz-btn" onclick="window.SportPulseApp.nextQuizQuestion()">Next Question ➡️</button>
      `;
    }

    const scoreDisplay = document.getElementById('current-quiz-score');
    if (scoreDisplay) scoreDisplay.textContent = quizScore;

    expBox.style.display = 'block';
    scrollChatToBottom();
  }

  function nextQuizQuestion() {
    currentQuizIndex++;
    if (currentQuizIndex < window.SPORTS_DB.quiz.length) {
      const q = window.SPORTS_DB.quiz[currentQuizIndex];
      const result = {
        type: 'quiz',
        quizItem: q,
        total: window.SPORTS_DB.quiz.length,
        index: currentQuizIndex
      };
      const { html, speechSummary } = buildResponseHTML(result);
      appendBotMessage(html, speechSummary);
    } else {
      // Quiz complete!
      const totalPossible = window.SPORTS_DB.quiz.length * 10;
      const isNewBest = window.storage ? window.storage.saveQuizHighScore(quizScore) : false;
      const currentBest = window.storage ? window.storage.getQuizHighScore() : quizScore;
      const html = `
        <div class="quiz-completion-card">
          <div class="comp-trophy">🏆</div>
          <h3>Sports Quiz Challenge Complete!</h3>
          <p class="final-score-text">Final Score: <strong>${quizScore} / ${totalPossible}</strong> ${isNewBest ? '<span style="color:#00f5d4; font-size:0.85em; display:inline-block; margin-left:6px;">🔥 NEW HIGH SCORE!</span>' : `<span style="color:var(--text-muted); font-size:0.8em; display:inline-block; margin-left:6px;">(Best: ${currentBest})</span>`}</p>
          <p>${quizScore >= 80 ? "🔥 Unbelievable Sports Savant! You're a true MVP." : quizScore >= 50 ? "👏 Great sports knowledge! You definitely know your stats." : "Keep learning and exploring the arena!"}</p>
          <div class="quiz-end-actions">
            <button class="chip-btn" onclick="window.SportPulseApp.askBot('Play Quiz')">🔁 Play Again</button>
            <button class="chip-btn" onclick="window.SportPulseApp.askBot('Live Scores')">⚡ Check Live Scores</button>
          </div>
        </div>
      `;
      appendBotMessage(html, `Quiz complete! Your final score is ${quizScore} out of ${totalPossible}.`);
    }
  }

  // --- BOOKMARKS & UTILITIES ---
  function toggleBookmark(msgId) {
    const itemIndex = bookmarkedMessages.findIndex(b => b.id === msgId);
    const msg = chatHistory.find(m => m.id === msgId);
    const btn = document.querySelector(`#${msgId} .bookmark-btn`);

    if (itemIndex > -1) {
      bookmarkedMessages.splice(itemIndex, 1);
      if (btn) btn.classList.remove('active');
      showNotification('Removed from Saved Insights');
    } else if (msg) {
      bookmarkedMessages.push(msg);
      if (btn) btn.classList.add('active');
      showNotification('⭐ Saved to Bookmarks!');
    }
    renderBookmarksSidebar();
  }

  function speakMessage(msgId) {
    const msg = chatHistory.find(m => m.id === msgId);
    if (msg) {
      speakText(msg.speech || msg.html);
    }
  }

  function copyMessageText(msgId) {
    const contentEl = document.getElementById(`content-${msgId}`);
    if (contentEl) {
      const text = contentEl.innerText || contentEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Copied to clipboard!');
      }).catch(() => {
        showNotification('Failed to copy');
      });
    }
  }

  function showNotification(text) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function renderBookmarksSidebar() {
    const listEl = document.getElementById('bookmarks-list');
    if (!listEl) return;

    if (bookmarkedMessages.length === 0) {
      listEl.innerHTML = `<div class="empty-state">No saved insights yet. Click the ⭐ icon on any answer to bookmark it!</div>`;
      return;
    }

    listEl.innerHTML = bookmarkedMessages.map(b => `
      <div class="saved-item-box" onclick="window.SportPulseApp.jumpToMessage('${b.id}')">
        <div class="saved-time">${b.time}</div>
        <div class="saved-snippet">${b.speech || 'Sports Insight'}</div>
      </div>
    `).join('');
  }

  function jumpToMessage(msgId) {
    const target = document.getElementById(msgId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('highlight-pulse');
      setTimeout(() => target.classList.remove('highlight-pulse'), 1800);
    }
  }

  // --- SPEECH RECOGNITION (MIC) ---
  function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('mic-button');
    if (!SpeechRec) {
      if (micBtn) {
        micBtn.title = 'Speech recognition not supported in this browser';
        micBtn.style.opacity = '0.5';
      }
      return;
    }

    recognitionInstance = new SpeechRec();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      isListening = true;
      if (micBtn) micBtn.classList.add('listening');
      showNotification('🎙️ Listening... Speak your sports question!');
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const inputEl = document.getElementById('user-input');
      if (inputEl) inputEl.value = transcript;
      processUserQuery(transcript);
    };

    recognitionInstance.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      isListening = false;
      if (micBtn) micBtn.classList.remove('listening');
      showNotification('Speech recognition ended');
    };

    recognitionInstance.onend = () => {
      isListening = false;
      if (micBtn) micBtn.classList.remove('listening');
    };
  }

  function toggleSpeechInput() {
    if (!recognitionInstance) {
      showNotification('Microphone not supported on this browser');
      return;
    }
    if (isListening) {
      recognitionInstance.stop();
    } else {
      try {
        recognitionInstance.start();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  // --- LIVE TICKER ANIMATION SETUP ---
  function setupLiveTicker() {
    const tickerEl = document.getElementById('live-ticker-track');
    if (!tickerEl) return;
    const tickerItems = [
      "⚽ UCL: Real Madrid 2-2 Man City (78')",
      "🏏 IND vs AUS: Kohli 117* | IND 312/4",
      "🏀 NBA: Lakers 114 - 110 Warriors (FINAL)",
      "🎾 Wimbledon: Alcaraz def. Djokovic in 5 sets",
      "🏎️ F1: Verstappen claims Monaco GP victory",
      "🏈 NFL: Chiefs secure 25-22 Super Bowl win in OT",
      "🏏 IPL: KKR crowned champions of 2024 season",
      "⚽ Ballon d'Or: Lionel Messi wins historic 8th trophy"
    ];

    const content = tickerItems.map(item => `<span class="ticker-badge">${item}</span>`).join(' • ');
    tickerEl.innerHTML = content + ' • ' + content; // duplicate for seamless marquee
  }

  // --- THEME SWITCHER ---
  function applyTheme(themeName) {
    document.body.classList.remove('theme-midnight', 'theme-cyber', 'theme-crimson');
    document.body.classList.add(`theme-${themeName}`);
    currentTheme = themeName;
    localStorage.setItem('sportpulse_theme', themeName);
  }

  // --- EXPORT CHAT ---
  function exportChatHistory() {
    if (chatHistory.length === 0) {
      showNotification('Chat is empty!');
      return;
    }
    let transcript = "=== SPORTPULSE AI - CONVERSATION TRANSCRIPT ===\n";
    transcript += `Generated: ${new Date().toLocaleString()}\n\n`;

    chatHistory.forEach(item => {
      const sender = item.sender === 'user' ? 'YOU' : 'SPORTPULSE AI';
      const text = item.text || item.speech || item.html.replace(/<[^>]*>?/gm, ' ');
      transcript += `[${item.time}] ${sender}:\n${text.trim()}\n\n`;
    });

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportpulse-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('💾 Conversation exported!');
  }

  function clearChat() {
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = '';
    chatHistory = [];
    const welcomeHero = document.getElementById('welcome-hero');
    if (welcomeHero) welcomeHero.style.display = 'block';
    showNotification('Chat cleared');
  }

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme restore
    const savedTheme = localStorage.getItem('sportpulse_theme') || 'midnight';
    applyTheme(savedTheme);
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = savedTheme;

    // 2. Sound & TTS buttons
    const soundToggle = document.getElementById('toggle-sound');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Muted';
        soundToggle.classList.toggle('active', soundEnabled);
        showNotification(soundEnabled ? 'Sound feedback ON' : 'Sound feedback OFF');
      });
    }

    const ttsToggle = document.getElementById('toggle-tts');
    if (ttsToggle) {
      ttsToggle.addEventListener('click', () => {
        ttsEnabled = !ttsEnabled;
        ttsToggle.textContent = ttsEnabled ? '🗣️ Voice On' : '🗣️ Voice Off';
        ttsToggle.classList.toggle('active', ttsEnabled);
        showNotification(ttsEnabled ? 'Voice commentary enabled' : 'Voice commentary muted');
        if (!ttsEnabled && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    // 3. Theme change
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
      });
    }

    // 4. Input form
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    if (chatForm && userInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = userInput.value;
        if (query.trim()) {
          processUserQuery(query);
          userInput.value = '';
        }
      });
    }

    // 5. Speech Recognition
    initSpeechRecognition();
    const micBtn = document.getElementById('mic-button');
    if (micBtn) {
      micBtn.addEventListener('click', toggleSpeechInput);
    }

    // 6. Sidebar toggle for mobile/responsive
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // 7. Sidebar Tabs (Topics vs Saved Insights)
    const tabTopics = document.getElementById('tab-topics');
    const tabSaved = document.getElementById('tab-saved');
    const viewTopics = document.getElementById('view-topics');
    const viewSaved = document.getElementById('view-saved');

    if (tabTopics && tabSaved && viewTopics && viewSaved) {
      tabTopics.addEventListener('click', () => {
        tabTopics.classList.add('active');
        tabSaved.classList.remove('active');
        viewTopics.style.display = 'block';
        viewSaved.style.display = 'none';
      });
      tabSaved.addEventListener('click', () => {
        tabSaved.classList.add('active');
        tabTopics.classList.remove('active');
        viewTopics.style.display = 'none';
        viewSaved.style.display = 'block';
        renderBookmarksSidebar();
      });
    }

    // 8. Ticker setup
    setupLiveTicker();

    // 9. Input placeholder cycling
    const placeholders = [
      "Ask about Messi vs Ronaldo...",
      "What is the LBW rule in cricket?",
      "Who won the last Champions League?",
      "Explain the 24-second shot clock in NBA...",
      "What does DRS mean in Formula 1?",
      "How does tennis scoring work?",
      "Who has the most Grand Slams?",
      "Check live match scores..."
    ];
    let phIdx = 0;
    setInterval(() => {
      phIdx = (phIdx + 1) % placeholders.length;
      if (userInput && document.activeElement !== userInput) {
        userInput.placeholder = placeholders[phIdx];
      }
    }, 4000);
  });

  // --- GLOBAL EXPORTS FOR HTML ONCLICK BINDINGS ---
  window.SportPulseApp = {
    askBot: (text) => processUserQuery(text),
    handleQuizAnswer,
    nextQuizQuestion,
    toggleBookmark,
    speakMessage,
    copyMessageText,
    jumpToMessage,
    exportChatHistory,
    clearChat
  };

})();
