// sports-db.js - Comprehensive Sports Intelligence Knowledge Graph & Database

const SPORTS_DB = {
  // 1. PLAYERS & ATHLETES
  players: [
    {
      id: "lionel_messi",
      name: "Lionel Messi",
      sport: "Football / Soccer",
      country: "Argentina 🇦🇷",
      currentTeam: "Inter Miami CF / Argentina National Team",
      role: "Forward / Playmaker",
      nickname: "La Pulga (The Flea), The GOAT",
      stats: {
        "Career Goals": "840+ senior career goals",
        "Assists": "375+ career assists",
        "Ballon d'Or": "8 (Record: 2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023)",
        "World Cup": "Winner (Qatar 2022) & Golden Ball (2014, 2022)",
        "UCL Titles": "4 (2006, 2009, 2011, 2015 with Barcelona)",
        "Copa América": "2 Titles (2021, 2024)"
      },
      highlights: "Captained Argentina to their 3rd FIFA World Cup in 2022. Holds the record for most goals in a calendar year (91 goals in 2012). Widely considered the greatest footballer of all time.",
      tags: ["messi", "leo messi", "lionel messi", "pulga", "inter miami", "barcelona messi"]
    },
    {
      id: "cristiano_ronaldo",
      name: "Cristiano Ronaldo",
      sport: "Football / Soccer",
      country: "Portugal 🇵🇹",
      currentTeam: "Al Nassr / Portugal National Team",
      role: "Forward / Striker",
      nickname: "CR7, Mr. Champions League",
      stats: {
        "Career Goals": "900+ official goals (All-time Men's Record)",
        "UCL Goals": "140 (All-time Record)",
        "Ballon d'Or": "5 (2008, 2013, 2014, 2016, 2017)",
        "UCL Titles": "5 (1 with Man Utd, 4 with Real Madrid)",
        "Euro Championship": "Winner (Euro 2016)"
      },
      highlights: "First male player to score 900 official career goals. Top scorer in UEFA Champions League history. Iconic spells at Manchester United, Real Madrid, Juventus, and Al Nassr.",
      tags: ["ronaldo", "cristiano", "cr7", "cristiano ronaldo", "al nassr ronaldo"]
    },
    {
      id: "kylian_mbappe",
      name: "Kylian Mbappé",
      sport: "Football / Soccer",
      country: "France 🇫🇷",
      currentTeam: "Real Madrid / France National Team",
      role: "Forward / Winger",
      nickname: "Donatello",
      stats: {
        "World Cup 2018": "Winner (Young Player Award)",
        "World Cup 2022": "Golden Boot (8 goals, including final Hat-trick)",
        "Ligue 1 Top Scorer": "6 consecutive seasons",
        "Top Speed": "38 km/h recorded sprint"
      },
      highlights: "Became the second teenager after Pelé to score in a World Cup final (2018). Scored a legendary hat-trick in the 2022 World Cup Final against Argentina. Transferred to Real Madrid in 2024.",
      tags: ["mbappe", "kylian mbappe", "mbappe real madrid", "donatello"]
    },
    {
      id: "erling_haaland",
      name: "Erling Haaland",
      sport: "Football / Soccer",
      country: "Norway 🇳🇴",
      currentTeam: "Manchester City",
      role: "Striker",
      nickname: "The Terminator, The Cyborg",
      stats: {
        "Premier League Record": "36 goals in a debut 38-game season (2022-23)",
        "Treble Winner": "Premier League, FA Cup, Champions League (2023)",
        "UCL Golden Boot": "2020-21, 2022-23"
      },
      highlights: "Fastest player in Premier League history to reach 50 goals. Unmatched physical presence, aerial dominance, and lethal finishing inside the box.",
      tags: ["haaland", "erling haaland", "cyborg haaland"]
    },
    {
      id: "virat_kohli",
      name: "Virat Kohli",
      sport: "Cricket",
      country: "India 🇮🇳",
      currentTeam: "Royal Challengers Bengaluru (RCB) / India",
      role: "Right-hand Top-order Batter",
      nickname: "King Kohli, The Chase Master",
      stats: {
        "ODI Centuries": "50 (World Record, surpassing Tendulkar's 49)",
        "International Runs": "27,000+ across formats",
        "IPL Runs": "8,000+ runs (All-time IPL highest scorer)",
        "T20 World Cup": "Winner (2024) & 2x Player of the Tournament",
        "ICC ODI World Cup": "Winner (2011), Player of the Tournament (2023 with 765 runs)"
      },
      highlights: "Renowned for extraordinary consistency in run chases and aggressive fitness transformation that changed modern Indian cricket. Broke Sachin Tendulkar's record with 50 ODI centuries at Wankhede Stadium in 2023.",
      tags: ["kohli", "virat kohli", "king kohli", "chase master"]
    },
    {
      id: "ms_dhoni",
      name: "MS Dhoni",
      sport: "Cricket",
      country: "India 🇮🇳",
      currentTeam: "Chennai Super Kings (CSK)",
      role: "Wicketkeeper-Batter / Legendary Captain",
      nickname: "Captain Cool, Thala, MSD",
      stats: {
        "ICC Trophies as Captain": "3 (T20 WC 2007, ODI WC 2011, Champions Trophy 2013)",
        "IPL Titles as Captain": "5 Titles (2010, 2011, 2018, 2021, 2023 with CSK)",
        "ODI Average": "50.57 (with 84 not outs)",
        "Stumpings Record": "123 ODI stumpings (World Record lightning speed)"
      },
      highlights: "The only captain in international cricket history to win all three ICC white-ball trophies. Hit the famous winning six in the 2011 World Cup final. Known for finishing matches in ice-cold fashion.",
      tags: ["dhoni", "ms dhoni", "captain cool", "thala", "msd"]
    },
    {
      id: "rohit_sharma",
      name: "Rohit Sharma",
      sport: "Cricket",
      country: "India 🇮🇳",
      currentTeam: "Mumbai Indians / India Captain",
      role: "Right-hand Opening Batter",
      nickname: "Hitman",
      stats: {
        "ODI Double Centuries": "3 (World Record, including 264 vs Sri Lanka - highest ODI score)",
        "IPL Titles as Captain": "5 Titles with Mumbai Indians",
        "T20 World Cup": "Winner as Captain (2024), Winner as player (2007)",
        "World Cup Centuries": "7 in ODI World Cups (Highest in history)"
      },
      highlights: "Holds the record for the highest individual score in ODI history (264). Led India to an unbeaten T20 World Cup victory in 2024.",
      tags: ["rohit", "rohit sharma", "hitman", "sharma"]
    },
    {
      id: "sachin_tendulkar",
      name: "Sachin Tendulkar",
      sport: "Cricket",
      country: "India 🇮🇳",
      currentTeam: "Retired (Legend)",
      role: "Top-order Batter",
      nickname: "Master Blaster, God of Cricket",
      stats: {
        "International Centuries": "100 (Unmatched all-time world record)",
        "International Runs": "34,357 runs (Highest in cricket history)",
        "World Cup": "Winner (2011) & All-time highest World Cup run scorer (2,278 runs)",
        "Career Span": "24 years (1989-2013)"
      },
      highlights: "Revered globally as the 'God of Cricket'. First player to score a double century in men's ODI cricket (200* vs South Africa, 2010).",
      tags: ["sachin", "tendulkar", "sachin tendulkar", "master blaster"]
    },
    {
      id: "lebron_james",
      name: "LeBron James",
      sport: "Basketball",
      country: "USA 🇺🇸",
      currentTeam: "Los Angeles Lakers",
      role: "Small Forward / Power Forward",
      nickname: "King James, The Chosen One",
      stats: {
        "NBA All-Time Scoring Leader": "40,000+ regular season points (surpassed Kareem Abdul-Jabbar)",
        "NBA Championships": "4 (2012, 2013 with Heat, 2016 with Cavaliers, 2020 with Lakers)",
        "Finals MVP": "4 times",
        "Regular Season MVP": "4 times (2009, 2010, 2012, 2013)",
        "Olympic Golds": "3 (2008, 2012, 2024 MVP)"
      },
      highlights: "Only player in NBA history with 40,000 points, 11,000 rebounds, and 11,000 assists. Led Cleveland Cavaliers from a 3-1 deficit to win the 2016 NBA Finals against 73-9 Warriors.",
      tags: ["lebron", "lebron james", "king james"]
    },
    {
      id: "michael_jordan",
      name: "Michael Jordan",
      sport: "Basketball",
      country: "USA 🇺🇸",
      currentTeam: "Retired (Chicago Bulls Legend)",
      role: "Shooting Guard",
      nickname: "Air Jordan, His Airness, MJ",
      stats: {
        "NBA Championships": "6 (2 Three-peats: 1991-1993, 1996-1998)",
        "Finals MVP": "6 times (Undefeated 6-0 in Finals)",
        "Scoring Titles": "10 (All-time NBA record)",
        "Career PPG": "30.12 PPG (Highest regular season average in NBA history)",
        "Defensive Player of the Year": "1988"
      },
      highlights: "Global basketball icon who popularized the NBA worldwide. Renowned for supreme competitive drive, clutch buzzer-beaters, and iconic Nike Jordan brand.",
      tags: ["jordan", "michael jordan", "air jordan", "his airness"]
    },
    {
      id: "stephen_curry",
      name: "Stephen Curry",
      sport: "Basketball",
      country: "USA 🇺🇸",
      currentTeam: "Golden State Warriors",
      role: "Point Guard",
      nickname: "Chef Curry, Baby-Faced Assassin",
      stats: {
        "All-Time 3-Pointers": "3,700+ made 3s (All-time NBA Record)",
        "NBA Championships": "4 (2015, 2017, 2018, 2022)",
        "MVP Awards": "2 (2015, 2016 - only unanimous MVP in NBA history)",
        "Finals MVP": "2022",
        "Olympic Gold": "2024 Paris (clutch 3s in final)"
      },
      highlights: "Revolutionized basketball completely by normalizing high-volume, deep-range 3-point shooting. Led the Warriors to an all-time record 73-9 regular season in 2015-16.",
      tags: ["curry", "stephen curry", "steph curry", "chef curry"]
    },
    {
      id: "novak_djokovic",
      name: "Novak Djokovic",
      sport: "Tennis",
      country: "Serbia 🇷🇸",
      currentTeam: "ATP Tour",
      role: "Singles Player",
      nickname: "Nole, The Joker",
      stats: {
        "Grand Slam Titles": "24 (All-time Men's Singles Record)",
        "Australian Open": "10 Titles (Record)",
        "Wimbledon": "7 Titles",
        "US Open": "4 Titles",
        "French Open": "3 Titles",
        "Weeks at World No. 1": "428+ weeks (All-time record)",
        "Olympic Gold": "Paris 2024 (Career Golden Slam achieved)"
      },
      highlights: "Most decorated men's tennis player in history. Only male player to win all four Grand Slams at least three times each, and every Masters 1000 tournament at least twice.",
      tags: ["djokovic", "novak djokovic", "nole"]
    },
    {
      id: "rafael_nadal",
      name: "Rafael Nadal",
      sport: "Tennis",
      country: "Spain 🇪🇸",
      currentTeam: "ATP Tour (Legend)",
      role: "Left-handed Singles Player",
      nickname: "The King of Clay, Rafa, El Matador",
      stats: {
        "Grand Slam Titles": "22",
        "Roland Garros (French Open)": "14 Titles (Unmatched record in any single sport)",
        "Clay Court Win Rate": "Over 90% across career",
        "Olympic Golds": "2 (Singles 2008, Doubles 2016)"
      },
      highlights: "Absolute master of clay courts with a staggering 112-4 win-loss record at Roland Garros. Renowned for ferocious topspin, relentless stamina, and never-say-die fighting spirit.",
      tags: ["nadal", "rafael nadal", "rafa", "king of clay"]
    },
    {
      id: "roger_federer",
      name: "Roger Federer",
      sport: "Tennis",
      country: "Switzerland 🇨🇭",
      currentTeam: "Retired (Legend)",
      role: "Single-handed Backhand Master",
      nickname: "Maestro, Fedex",
      stats: {
        "Grand Slam Titles": "20 (First male to reach 20)",
        "Wimbledon": "8 Titles (Men's record)",
        "Consecutive Weeks at No. 1": "237 consecutive weeks (Record)",
        "Total ATP Titles": "103 titles"
      },
      highlights: "Celebrated for balletic grace, effortless one-handed backhand, and elegant sportsmanship. Won 5 consecutive Wimbledons (2003-2007) and 5 consecutive US Opens (2004-2008).",
      tags: ["federer", "roger federer", "fedex", "maestro federer"]
    },
    {
      id: "carlos_alcaraz",
      name: "Carlos Alcaraz",
      sport: "Tennis",
      country: "Spain 🇪🇸",
      currentTeam: "ATP Tour",
      role: "Singles Player",
      nickname: "Carlitos",
      stats: {
        "Grand Slam Titles": "4 (US Open 2022, Wimbledon 2023 & 2024, French Open 2024)",
        "Youngest World No. 1": "19 years, 4 months (ATP history record)"
      },
      highlights: "Youngest man to win Grand Slams on all three surfaces (Hard, Grass, Clay). Defeated Djokovic in back-to-back Wimbledon finals (2023, 2024).",
      tags: ["alcaraz", "carlos alcaraz", "carlitos"]
    },
    {
      id: "max_verstappen",
      name: "Max Verstappen",
      sport: "Formula 1 (F1)",
      country: "Netherlands 🇳🇱",
      currentTeam: "Red Bull Racing",
      role: "Driver #1",
      nickname: "Super Max, The Flying Dutchman",
      stats: {
        "World Championships": "3+ (2021, 2022, 2023, 2024)",
        "Wins in a Single Season": "19 wins out of 22 races (2023 record: 86.4% win rate)",
        "Consecutive Wins": "10 consecutive Grand Prix wins (2023 record)",
        "Youngest F1 Race Winner": "18 years, 228 days (Spain 2016)"
      },
      highlights: "Youngest ever driver to race in F1 and youngest Grand Prix winner. Produced the most dominant individual season in Formula 1 history in 2023 with Red Bull's RB19.",
      tags: ["verstappen", "max verstappen", "super max"]
    },
    {
      id: "lewis_hamilton",
      name: "Lewis Hamilton",
      sport: "Formula 1 (F1)",
      country: "United Kingdom 🇬🇧",
      currentTeam: "Mercedes-AMG / Scuderia Ferrari (2025+)",
      role: "Driver #44",
      nickname: "Sir Lewis, Hammer Time",
      stats: {
        "World Championships": "7 (Tied record with Michael Schumacher: 2008, 2014, 2015, 2017, 2018, 2019, 2020)",
        "Grand Prix Wins": "105+ (All-time F1 Record)",
        "Pole Positions": "104+ (All-time F1 Record)",
        "Podiums": "200+ (All-time F1 Record)"
      },
      highlights: "Most successful Formula 1 driver in history by pole positions and race victories. Knighted by the British monarchy in 2021. Historic move to Ferrari for 2025.",
      tags: ["hamilton", "lewis hamilton", "sir lewis"]
    },
    {
      id: "usain_bolt",
      name: "Usain Bolt",
      sport: "Athletics / Track & Field",
      country: "Jamaica 🇯🇲",
      currentTeam: "Retired (Legend)",
      role: "Sprinter",
      nickname: "Lightning Bolt",
      stats: {
        "100m World Record": "9.58 seconds (Berlin 2009)",
        "200m World Record": "19.19 seconds (Berlin 2009)",
        "Olympic Golds": "8 Gold Medals (100m & 200m titles in 2008, 2012, 2016)",
        "World Championship Golds": "11"
      },
      highlights: "Widely regarded as the fastest human ever timed. The only sprinter to win Olympic 100 m and 200 m titles at three consecutive Olympics (2008, 2012 and 2016).",
      tags: ["bolt", "usain bolt", "lightning bolt"]
    }
  ],

  // 2. TOURNAMENTS & CHAMPIONSHIPS
  tournaments: [
    {
      id: "fifa_world_cup",
      name: "FIFA World Cup",
      sport: "Football / Soccer",
      governingBody: "FIFA",
      founded: "1930",
      frequency: "Every 4 years",
      currentChampion: "Argentina 🇦🇷 (2022)",
      mostSuccessful: "Brazil 🇧🇷 (5 titles: 1958, 1962, 1970, 1994, 2002)",
      nextEdition: "2026 (USA, Canada, Mexico - expanding to 48 teams)",
      historyTable: [
        { year: "2022", winner: "Argentina 🇦🇷", runnerUp: "France 🇫🇷", score: "3-3 (4-2 pen)", venue: "Qatar" },
        { year: "2018", winner: "France 🇫🇷", runnerUp: "Croatia 🇭🇷", score: "4-2", venue: "Russia" },
        { year: "2014", winner: "Germany 🇩🇪", runnerUp: "Argentina 🇦🇷", score: "1-0 (a.e.t)", venue: "Brazil" },
        { year: "2010", winner: "Spain 🇪🇸", runnerUp: "Netherlands 🇳🇱", score: "1-0 (a.e.t)", venue: "South Africa" },
        { year: "2006", winner: "Italy 🇮🇹", runnerUp: "France 🇫🇷", score: "1-1 (5-3 pen)", venue: "Germany" }
      ],
      description: "The most watched sporting event in the world. 32 teams (expanding to 48 in 2026) compete for the coveted 18-karat gold FIFA World Cup trophy.",
      tags: ["world cup", "fifa", "fifa world cup", "football world cup", "soccer world cup", "qatar 2022"]
    },
    {
      id: "uefa_champions_league",
      name: "UEFA Champions League (UCL)",
      sport: "Football / Soccer",
      governingBody: "UEFA",
      founded: "1955 (European Cup)",
      frequency: "Annual",
      currentChampion: "Real Madrid 🇪🇸 (2023-24, 15th title)",
      mostSuccessful: "Real Madrid (15 titles)",
      historyTable: [
        { year: "2024", winner: "Real Madrid 🇪🇸", runnerUp: "Borussia Dortmund 🇩🇪", score: "2-0", venue: "Wembley, London" },
        { year: "2023", winner: "Manchester City 🏴󠁧󠁢󠁥󠁮󠁧󠁿", runnerUp: "Inter Milan 🇮🇹", score: "1-0", venue: "Istanbul" },
        { year: "2022", winner: "Real Madrid 🇪🇸", runnerUp: "Liverpool 🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: "1-0", venue: "Paris" },
        { year: "2021", winner: "Chelsea 🏴󠁧󠁢󠁥󠁮󠁧󠁿", runnerUp: "Manchester City 🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: "1-0", venue: "Porto" }
      ],
      description: "Europe's premier club football tournament featuring the highest-ranked clubs across European domestic leagues.",
      tags: ["champions league", "ucl", "uefa", "european cup"]
    },
    {
      id: "icc_cricket_world_cup",
      name: "ICC Men's Cricket World Cup (ODI)",
      sport: "Cricket",
      governingBody: "International Cricket Council (ICC)",
      founded: "1975",
      frequency: "Every 4 years",
      currentChampion: "Australia 🇦🇺 (2023)",
      mostSuccessful: "Australia 🇦🇺 (6 titles: 1987, 1999, 2003, 2007, 2015, 2023)",
      historyTable: [
        { year: "2023", winner: "Australia 🇦🇺", runnerUp: "India 🇮🇳", score: "AUS won by 6 wickets", venue: "Ahmedabad, India" },
        { year: "2019", winner: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿", runnerUp: "New Zealand 🇳🇿", score: "Tied (Eng won on boundaries)", venue: "Lord's, London" },
        { year: "2015", winner: "Australia 🇦🇺", runnerUp: "New Zealand 🇳🇿", score: "AUS won by 7 wickets", venue: "Melbourne, Australia" },
        { year: "2011", winner: "India 🇮🇳", runnerUp: "Sri Lanka 🇱🇰", score: "IND won by 6 wickets", venue: "Mumbai, India" }
      ],
      description: "The flagship 50-over One Day International (ODI) cricket tournament determining the world champion.",
      tags: ["cricket world cup", "icc world cup", "odi world cup", "cwc"]
    },
    {
      id: "ipl",
      name: "Indian Premier League (IPL)",
      sport: "Cricket",
      governingBody: "BCCI",
      founded: "2008",
      frequency: "Annual (March - May)",
      currentChampion: "Kolkata Knight Riders (KKR - 2024)",
      mostSuccessful: "Mumbai Indians (5 titles) & Chennai Super Kings (5 titles)",
      historyTable: [
        { year: "2024", winner: "Kolkata Knight Riders", runnerUp: "Sunrisers Hyderabad", venue: "Chennai" },
        { year: "2023", winner: "Chennai Super Kings", runnerUp: "Gujarat Titans", venue: "Ahmedabad" },
        { year: "2022", winner: "Gujarat Titans", runnerUp: "Rajasthan Royals", venue: "Ahmedabad" },
        { year: "2021", winner: "Chennai Super Kings", runnerUp: "Kolkata Knight Riders", venue: "Dubai" },
        { year: "2020", winner: "Mumbai Indians", runnerUp: "Delhi Capitals", venue: "Dubai" }
      ],
      description: "The most attended and commercially lucrative T20 cricket league in the world, featuring 10 franchise teams.",
      tags: ["ipl", "indian premier league", "ipl champions"]
    },
    {
      id: "nba_finals",
      name: "NBA Finals",
      sport: "Basketball",
      governingBody: "National Basketball Association (NBA)",
      founded: "1947",
      frequency: "Annual (June)",
      currentChampion: "Boston Celtics ☘️ (2024 - 18th title, all-time record)",
      mostSuccessful: "Boston Celtics (18 titles), Los Angeles Lakers (17 titles)",
      historyTable: [
        { year: "2024", winner: "Boston Celtics", runnerUp: "Dallas Mavericks", series: "4-1", mvp: "Jaylen Brown" },
        { year: "2023", winner: "Denver Nuggets", runnerUp: "Miami Heat", series: "4-1", mvp: "Nikola Jokić" },
        { year: "2022", winner: "Golden State Warriors", runnerUp: "Boston Celtics", series: "4-2", mvp: "Stephen Curry" },
        { year: "2021", winner: "Milwaukee Bucks", runnerUp: "Phoenix Suns", series: "4-2", mvp: "Giannis Antetokounmpo" },
        { year: "2020", winner: "Los Angeles Lakers", runnerUp: "Miami Heat", series: "4-2", mvp: "LeBron James" }
      ],
      description: "Best-of-seven championship series between Eastern and Western conference champions for the Larry O'Brien Trophy.",
      tags: ["nba finals", "larry obrien", "nba champion", "nba champions"]
    },
    {
      id: "grand_slam_tennis",
      name: "Tennis Grand Slams (The Majors)",
      sport: "Tennis",
      governingBody: "ITF / ATP / WTA",
      description: "The four most prestigious tennis tournaments held annually: Australian Open (Hard, Jan), French Open / Roland Garros (Clay, May-June), Wimbledon (Grass, July), and US Open (Hard, Aug-Sept).",
      slams: [
        { name: "Australian Open", surface: "Hard Court (Plexicushion)", location: "Melbourne Park", recordHolder: "Novak Djokovic (10 titles)" },
        { name: "Roland Garros (French Open)", surface: "Clay Court", location: "Paris, France", recordHolder: "Rafael Nadal (14 titles)" },
        { name: "Wimbledon", surface: "Grass Court", location: "London, UK", recordHolder: "Roger Federer (8 titles men) / Navratilova (9 titles women)" },
        { name: "US Open", surface: "Hard Court (DecoTurf)", location: "Flushing Meadows, New York", recordHolder: "Federer, Sampras, Connors (5 titles each)" }
      ],
      tags: ["grand slam", "grand slams", "wimbledon", "french open", "roland garros", "us open", "australian open"]
    },
    {
      id: "f1_world_championship",
      name: "Formula 1 World Championship",
      sport: "Formula 1",
      governingBody: "FIA",
      founded: "1950",
      frequency: "Annual season (~24 Grand Prix)",
      currentChampion: "Max Verstappen (Drivers) / Red Bull Racing (Constructors)",
      mostSuccessfulDrivers: "Michael Schumacher (7) & Lewis Hamilton (7)",
      mostSuccessfulConstructors: "Ferrari (16 Constructors' titles)",
      description: "The pinnacle of open-wheel motorsport racing where cutting-edge engineering meets elite driving prowess across global circuits.",
      tags: ["f1 championship", "formula 1 championship", "constructors championship"]
    },
    {
      id: "olympic_games",
      name: "Olympic Games",
      sport: "Multi-sport (Summer & Winter)",
      governingBody: "International Olympic Committee (IOC)",
      founded: "1896 (Modern Athens Olympics)",
      frequency: "Every 4 years (Summer & Winter staggered by 2 years)",
      latestEdition: "Paris 2024 (Summer) - Top nation: USA (40 Gold, 126 Total)",
      allTimeLeader: "United States (1,000+ Gold Medals all-time)",
      description: "The world's foremost multi-sport event where thousands of athletes from over 200 nations compete for gold, silver, and bronze medals.",
      tags: ["olympics", "olympic games", "summer olympics", "paris 2024", "winter olympics"]
    }
  ],

  // 3. SPORTS RULES & TACTICAL CONCEPTS
  rules: [
    {
      id: "football_offside",
      sport: "Football / Soccer",
      ruleName: "The Offside Rule (Law 11)",
      summary: "A player is in an offside position if any part of their head, body, or feet is nearer to the opponents' goal line than both the ball and the second-last opponent (usually the last outfield defender) at the instant the ball is played to them.",
      keyConditions: [
        "Positioning alone is not an offence: A player must be actively involved in play (touching the ball, interfering with play, interfering with an opponent, or gaining an advantage).",
        "Exceptions: There is NO offside directly from a Throw-in, Corner kick, or Goal kick.",
        "Own Half: A player cannot be offside while inside their own defensive half.",
        "Behind the Ball: If the attacking player is level with or behind the ball when passed, they are onside."
      ],
      penalty: "Indirect free kick awarded to the opposing team at the spot where the infringement occurred.",
      tags: ["offside", "offside rule", "law 11"]
    },
    {
      id: "cricket_lbw",
      sport: "Cricket",
      ruleName: "LBW (Leg Before Wicket - Law 36)",
      summary: "A batter is out LBW if the ball pitched in-line or outside off-stump, hits the batter's body/pad without touching the bat first, and in the umpire's judgement would have gone on to hit the stumps.",
      keyConditions: [
        "Pitching: The ball must NOT pitch outside leg stump (an automatic Not Out).",
        "Impact: The point of impact on the pad must be in-line with the stumps (unless no shot is offered, where impact outside off is also out).",
        "No Bat First: The ball must not hit the bat, glove, or edge before hitting the pad.",
        "Wickets: The ball tracking trajectory must be projected to hit the stumps."
      ],
      penalty: "The batter is dismissed (Out) and must leave the field.",
      tags: ["lbw", "leg before wicket", "law 36"]
    },
    {
      id: "cricket_drs",
      sport: "Cricket",
      ruleName: "DRS (Decision Review System)",
      summary: "A technology-based system used in cricket to review on-field umpire decisions for dismissals (LBW, catches, run-outs) within a 15-second timer.",
      components: [
        "UltraEdge / Snicko: Audio spike technology to detect contact between ball and bat/glove.",
        "Hawk-Eye / Ball Tracking: Camera-based computer vision simulating the trajectory, bounce, and whether the ball would strike the stumps.",
        "HotSpot: Infrared camera imaging showing heat friction created by ball impact.",
        "Umpire's Call: If technology shows marginal contact (less than 50% of the ball hitting stumps or zone of impact), on-field umpire's original decision stands."
      ],
      tags: ["drs", "decision review system", "ball tracking", "ultraedge", "umpires call"]
    },
    {
      id: "cricket_powerplay",
      sport: "Cricket",
      ruleName: "Powerplay & Fielding Restrictions",
      summary: "Specific overs during limited-overs matches where strict field restrictions apply to encourage attacking batting.",
      formats: [
        "T20 Cricket: Overs 1-6 (Mandatory Powerplay) - Only 2 fielders allowed outside the 30-yard circle.",
        "Overs 7-20 (T20): Maximum 5 fielders allowed outside the circle.",
        "ODI (50 overs): P1 (Overs 1-10, max 2 outside), P2 (Overs 11-40, max 4 outside), P3 (Overs 41-50, max 5 outside)."
      ],
      tags: ["powerplay", "fielding restrictions"]
    },
    {
      id: "basketball_shot_clock",
      sport: "Basketball",
      ruleName: "24-Second Shot Clock & Timing Violations",
      summary: "In the NBA and FIBA, the offensive team must attempt a field goal that hits the rim within 24 seconds of gaining possession.",
      subRules: [
        "Shot Clock Reset: Resets to 14 seconds on offensive rebound or defensive foul in the frontcourt.",
        "8-Second Rule: Offensive team must advance the ball across half-court within 8 seconds.",
        "3-Second Rule: Offensive player cannot remain inside the painted key area for more than 3 consecutive seconds without actively making a play."
      ],
      penalty: "Turnover; ball awarded to opposing team for an inbound.",
      tags: ["shot clock", "24 second", "24 second clock", "3 second rule"]
    },
    {
      id: "basketball_fouls",
      sport: "Basketball",
      ruleName: "Basketball Fouls & Free Throws",
      summary: "Violations involving illegal personal contact with an opposing player.",
      types: [
        "Personal Foul: Hitting, pushing, holding, illegal screening. In NBA, 6 personal fouls results in ejection (fouling out); FIBA is 5.",
        "Shooting Foul: Contact made while a player is in the act of shooting (awards 2 or 3 free throws).",
        "Technical Foul: Unsportsmanlike conduct, arguing with refs, delaying game (awards 1 free throw + possession).",
        "Flagrant Foul (1 & 2): Unnecessary and/or excessive contact. Flagrant 2 leads to automatic ejection."
      ],
      tags: ["fouls", "nba fouls", "free throws", "flagrant foul", "technical foul"]
    },
    {
      id: "tennis_scoring",
      sport: "Tennis",
      ruleName: "Tennis Scoring System (Love, 15, 30, 40, Deuce)",
      summary: "Tennis matches are structured in Points, Games, and Sets.",
      flow: [
        "Points: 0 = 'Love', 1st point = 15, 2nd point = 30, 3rd point = 40, 4th point = Game.",
        "Deuce: When tied at 40-40. One player must score two consecutive points to win the game (Advantage -> Game).",
        "Games & Sets: A player must win 6 games with a 2-game margin to win a set.",
        "Tiebreak: At 6-6 in games, a 7-point tiebreak (win by 2) is played. Grand Slam final sets use a 10-point match tiebreak."
      ],
      tags: ["tennis scoring", "deuce", "love in tennis", "tiebreak"]
    },
    {
      id: "f1_drs",
      sport: "Formula 1",
      ruleName: "DRS (Drag Reduction System)",
      summary: "A driver-controlled mechanical flap in the rear wing that opens to reduce aerodynamic drag, increasing straight-line top speed by 10-12 km/h to promote overtaking.",
      conditions: [
        "Detection Point: The chasing car must be within 1.000 second behind the car ahead at the designated DRS detection line.",
        "Activation Zone: The flap can only be opened when entering marked DRS activation zones.",
        "Restrictions: Disabled during safety cars, wet track conditions, and for the first lap after race start/restart."
      ],
      tags: ["f1 drs", "drs rule", "drag reduction system"]
    },
    {
      id: "f1_flags",
      sport: "Formula 1",
      ruleName: "F1 Racing Flags Explained",
      summary: "Crucial trackside communication flags marshals use to control race safety.",
      flagList: [
        "🟡 Yellow Flag: Danger on track ahead. Drivers must slow down; strictly NO overtaking allowed.",
        "🟢 Green Flag: Track is clear, normal racing resumed.",
        "🔴 Red Flag: Session suspended/stopped immediately due to severe accident or extreme weather. Return to pit lane.",
        "🔵 Blue Flag: A faster leading car is about to lap you; you must safely yield and let them pass.",
        "🏁 Checkered Flag: The race or session has officially finished."
      ],
      tags: ["f1 flags", "yellow flag", "red flag", "blue flag", "checkered flag"]
    },
    {
      id: "nfl_downs_scoring",
      sport: "American Football / NFL",
      ruleName: "NFL Downs & Scoring System",
      summary: "The offensive team has 4 chances ('downs') to advance the ball 10 yards forward to earn a fresh set of downs (First Down).",
      scoring: [
        "Touchdown (TD): 6 Points - Carrying or catching the ball in the opponent's endzone.",
        "Extra Point (PAT): 1 Point (kick) or 2-Point Conversion (run/pass play from 2-yard line).",
        "Field Goal (FG): 3 Points - Kicking the ball through the upright goalposts.",
        "Safety: 2 Points - Tackling an offensive player inside their own endzone."
      ],
      tags: ["touchdown", "nfl downs", "first down", "super bowl scoring", "field goal"]
    }
  ],

  // 4. HEAD-TO-HEAD COMPARISONS
  comparisons: [
    {
      id: "messi_vs_ronaldo",
      title: "Lionel Messi vs Cristiano Ronaldo",
      subtitle: "The Greatest Football Rivalry of the 21st Century",
      sport: "Football / Soccer",
      playerA: {
        name: "Lionel Messi 🇦🇷",
        stats: [
          { label: "Ballon d'Or", val: "8 (All-time Record)" },
          { label: "FIFA World Cup", val: "1 Winner (2022) + 2 Golden Balls" },
          { label: "UEFA Champions League", val: "4 Titles" },
          { label: "Career Goals", val: "840+ goals" },
          { label: "Career Assists", val: "375+ assists (Playmaking King)" },
          { label: "European Golden Shoes", val: "6 (Record)" },
          { label: "Style", val: "Dribbling maestro, playmaking, visionary passes, low center of gravity" }
        ]
      },
      playerB: {
        name: "Cristiano Ronaldo 🇵🇹",
        stats: [
          { label: "Ballon d'Or", val: "5 Titles" },
          { label: "FIFA World Cup", val: "Quarter-final best, Euro 2016 Winner" },
          { label: "UEFA Champions League", val: "5 Titles (All-time UCL Top Scorer: 140)" },
          { label: "Career Goals", val: "900+ goals (All-time Men's Record)" },
          { label: "Career Assists", val: "250+ assists" },
          { label: "European Golden Shoes", val: "4" },
          { label: "Style", val: "Physical powerhouse, lethal aerial threat, clutch striker, elite athleticism" }
        ]
      },
      conclusion: "Messi edges the trophy cabinet with 8 Ballon d'Ors and the coveted 2022 World Cup alongside extraordinary playmaking, while Ronaldo stands as the supreme goalscorer in football history with 900+ official goals and unmatched Champions League dominance.",
      tags: ["messi vs ronaldo", "ronaldo vs messi", "cr7 vs messi", "goat debate", "football rivalry"]
    },
    {
      id: "jordan_vs_lebron",
      title: "Michael Jordan vs LeBron James",
      subtitle: "The Ultimate NBA GOAT Debate",
      sport: "Basketball",
      playerA: {
        name: "Michael Jordan 🔴",
        stats: [
          { label: "Championships", val: "6 (Undefeated 6-0 in Finals)" },
          { label: "Finals MVP", val: "6 (Record)" },
          { label: "Regular Season MVP", val: "5" },
          { label: "Scoring Titles", val: "10 (Record)" },
          { label: "Career Scoring PPG", val: "30.12 PPG (All-time highest)" },
          { label: "Defensive Honors", val: "1x DPOY, 9x All-Defensive 1st Team" },
          { label: "Era Dominance", val: "1990s Bulls Dynasty (Two 3-peats)" }
        ]
      },
      playerB: {
        name: "LeBron James 👑",
        stats: [
          { label: "Championships", val: "4 (With 3 different franchises)" },
          { label: "Finals MVP", val: "4" },
          { label: "Regular Season MVP", val: "4" },
          { label: "All-Time Scoring", val: "40,000+ points (All-time NBA #1)" },
          { label: "Longevity", val: "22+ elite seasons at All-NBA level" },
          { label: "All-Around Stats", val: "Only player with 40k pts, 11k reb, 11k ast" },
          { label: "Finals Appearances", val: "10 Finals (8 consecutive: 2011-2018)" }
        ]
      },
      conclusion: "Jordan holds peak dominance perfection (6-0 Finals record, 10 scoring titles, unmatched global icon status), whereas LeBron holds the ultimate crown of career longevity, all-around playmaking, and total cumulative statistical records.",
      tags: ["jordan vs lebron", "lebron vs jordan", "nba goat", "mj vs lebron"]
    },
    {
      id: "big_three_tennis",
      title: "Djokovic vs Nadal vs Federer",
      subtitle: "The Big Three - Golden Era of Men's Tennis",
      sport: "Tennis",
      playerA: {
        name: "Novak Djokovic 🇷🇸",
        stats: [
          { label: "Grand Slams", val: "24 (All-time men's record)" },
          { label: "Weeks at No. 1", val: "428+ weeks (Record)" },
          { label: "Masters 1000", val: "40 titles (Record, Double Golden Masters)" },
          { label: "Head-to-Head", val: "Leads vs Nadal (31-29) and Federer (27-23)" },
          { label: "Olympic Gold", val: "2024 Paris (Career Golden Slam)" }
        ]
      },
      playerB: {
        name: "Rafael Nadal 🇪🇸",
        stats: [
          { label: "Grand Slams", val: "22" },
          { label: "French Open Dominance", val: "14 titles (Unmatched clay court record)" },
          { label: "Masters 1000", val: "36 titles" },
          { label: "Olympic Gold", val: "Singles 2008 & Doubles 2016" }
        ]
      },
      playerC: {
        name: "Roger Federer 🇨🇭",
        stats: [
          { label: "Grand Slams", val: "20" },
          { label: "Wimbledon", val: "8 titles" },
          { label: "Consecutive No. 1", val: "237 weeks consecutive" },
          { label: "Legacy", val: "Pioneered modern tennis popularity with unmatched aesthetic elegance" }
        ]
      },
      conclusion: "Djokovic holds the statistical crown across Grand Slams (24), Weeks at No. 1, and Masters 1000 titles. Nadal is the indisputable King of Clay (14 Roland Garros crowns). Federer remains the transcendent global ambassador of elegance and grace.",
      tags: ["big three", "djokovic vs nadal", "federer vs nadal", "tennis goat", "big 3"]
    },
    {
      id: "kohli_vs_sachin",
      title: "Virat Kohli vs Sachin Tendulkar",
      subtitle: "India's Batting Royalty Across Two Generations",
      sport: "Cricket",
      playerA: {
        name: "Virat Kohli 👑",
        stats: [
          { label: "ODI Centuries", val: "50 (World Record, broke Sachin's 49)" },
          { label: "Total Int'l Centuries", val: "80 centuries" },
          { label: "Chase Average", val: "65+ average in successful ODI run chases" },
          { label: "World Cups Won", val: "ODI WC 2011 & T20 WC 2024" },
          { label: "Fitness & Era", val: "Pioneered modern ultra-athletic fielding and fitness standards" }
        ]
      },
      playerB: {
        name: "Sachin Tendulkar 🏏",
        stats: [
          { label: "Total Int'l Centuries", val: "100 (Only player in cricket history)" },
          { label: "Total Int'l Runs", val: "34,357 runs (All-time Record)" },
          { label: "Career Longevity", val: "24 years against hostile bowling attacks" },
          { label: "World Cups Won", val: "ODI WC 2011 (Top run-scorer in 1996 and 2003)" }
        ]
      },
      conclusion: "Sachin remains the supreme monument of cricket with 100 centuries and 34,000+ runs across 24 grueling years. Kohli is the greatest white-ball run chaser cricket has ever seen, holding the record with 50 ODI tons.",
      tags: ["kohli vs sachin", "sachin vs kohli", "virat vs sachin", "cricket goat"]
    }
  ],

  // 5. SIMULATED LIVE SCORES & RECENT FIXTURES
  liveMatches: [
    {
      id: "match_ucl_1",
      sport: "Football",
      league: "UEFA Champions League",
      status: "LIVE - 78'",
      teamA: { name: "Real Madrid", score: 2, logo: "⚪" },
      teamB: { name: "Manchester City", score: 2, logo: "🔵" },
      scorers: "Vini Jr. 23', Bellingham 61' | De Bruyne 34', Haaland 72'",
      venue: "Santiago Bernabéu, Madrid",
      highlights: "High-intensity clash with end-to-end attacks and world-class saves."
    },
    {
      id: "match_ipl_1",
      sport: "Cricket",
      league: "Indian Premier League",
      status: "LIVE - 2nd Innings (Over 17.4)",
      teamA: { name: "Royal Challengers Bengaluru", score: "198/5 (20.0)", logo: "🔴" },
      teamB: { name: "Chennai Super Kings", score: "182/4 (17.4)", logo: "🟡" },
      scorers: "Kohli 82 (49), Maxwell 44 (21) | Gaikwad 68 (42), Dube 41* (20)",
      venue: "M. Chinnaswamy Stadium, Bengaluru",
      highlights: "CSK need 17 runs from 14 balls. Dhoni on strike!"
    },
    {
      id: "match_nba_1",
      sport: "Basketball",
      league: "NBA Regular Season",
      status: "FINAL",
      teamA: { name: "Los Angeles Lakers", score: 114, logo: "🟣" },
      teamB: { name: "Golden State Warriors", score: 110, logo: "🟡" },
      scorers: "LeBron 32 pts, 11 ast | Curry 36 pts (8-14 3PT)",
      venue: "Crypto.com Arena, Los Angeles",
      highlights: "Lakers edge out thriller after clutch block by Anthony Davis in final seconds."
    },
    {
      id: "match_tennis_1",
      sport: "Tennis",
      league: "Wimbledon Men's Championship",
      status: "FINAL (5 Sets)",
      teamA: { name: "Carlos Alcaraz", score: "1 6 7 4 6", logo: "🇪🇸" },
      teamB: { name: "Novak Djokovic", score: "6 7 1 6 4", logo: "🇷🇸" },
      scorers: "Epic 4-hour 42-minute marathon duel",
      venue: "Centre Court, All England Club, London",
      highlights: "Alcaraz triumphs in a classic generational final with crosscourt winners."
    },
    {
      id: "match_f1_1",
      sport: "Formula 1",
      league: "Monaco Grand Prix",
      status: "FINISHED",
      teamA: { name: "Max Verstappen (Red Bull)", score: "P1 🥇", logo: "🇳🇱" },
      teamB: { name: "Lewis Hamilton (Ferrari)", score: "P2 🥈", logo: "🇬🇧" },
      scorers: "Podium: Verstappen, Hamilton, Leclerc",
      venue: "Circuit de Monaco, Monte Carlo",
      highlights: "Flawless tire management and pit-stop strategy under damp coastal conditions."
    }
  ],

  // 6. INTERACTIVE TRIVIA QUIZ QUESTIONS
  quiz: [
    {
      id: 1,
      sport: "Football",
      question: "Which nation has won the most FIFA World Cup titles in history?",
      options: ["Germany", "Brazil", "Italy", "Argentina"],
      correct: 1,
      explanation: "Brazil has won 5 FIFA World Cup tournaments (1958, 1962, 1970, 1994, and 2002), more than any other nation."
    },
    {
      id: 2,
      sport: "Cricket",
      question: "Who is the only batter in international cricket history to score 100 international centuries?",
      options: ["Virat Kohli", "Ricky Ponting", "Sachin Tendulkar", "Brian Lara"],
      correct: 2,
      explanation: "Sachin Tendulkar scored 100 international centuries (51 in Tests, 49 in ODIs) across his 24-year illustrious career."
    },
    {
      id: 3,
      sport: "Basketball",
      question: "How many seconds does an NBA team have on the shot clock to attempt a field goal that hits the rim?",
      options: ["18 seconds", "24 seconds", "30 seconds", "35 seconds"],
      correct: 1,
      explanation: "The NBA uses a 24-second shot clock. If an offensive team does not attempt a shot that contacts the rim within 24 seconds, they commit a turnover."
    },
    {
      id: 4,
      sport: "Tennis",
      question: "Who holds the record for the most Grand Slam Men's singles titles (24 titles)?",
      options: ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Pete Sampras"],
      correct: 2,
      explanation: "Novak Djokovic leads the all-time men's tally with 24 Grand Slam singles titles, followed by Rafael Nadal with 22 and Roger Federer with 20."
    },
    {
      id: 5,
      sport: "Formula 1",
      question: "What does the abbreviation 'DRS' stand for in Formula 1 racing?",
      options: ["Dynamic Racing System", "Drag Reduction System", "Direct Radius Steering", "Downforce Regulation Standard"],
      correct: 1,
      explanation: "DRS stands for 'Drag Reduction System', an adjustable flap in the rear wing that lowers air resistance to promote overtaking."
    },
    {
      id: 6,
      sport: "Cricket",
      question: "What happens if a bowler bowls a front-foot No-ball in limited-overs T20 cricket?",
      options: ["Batter gets 2 extra runs only", "Opponents get 1 penalty run & a Free Hit on next ball", "The bowler is banned from bowling", "Dead ball called"],
      correct: 1,
      explanation: "A front-foot no-ball awards the batting team 1 run, an extra ball, and the subsequent delivery is declared a 'Free Hit' where the batter cannot be out except by run-out."
    },
    {
      id: 7,
      sport: "Football",
      question: "Who holds the all-time record for the most Ballon d'Or awards won (8 trophies)?",
      options: ["Cristiano Ronaldo", "Lionel Messi", "Johan Cruyff", "Michel Platini"],
      correct: 1,
      explanation: "Lionel Messi has won 8 Ballon d'Or trophies (2009, 2010, 2011, 2012, 2015, 2019, 2021, and 2023), followed by Cristiano Ronaldo with 5."
    },
    {
      id: 8,
      sport: "Athletics",
      question: "What is Usain Bolt's standing world record time for the Men's 100-meter sprint?",
      options: ["9.69 seconds", "9.58 seconds", "9.48 seconds", "9.63 seconds"],
      correct: 1,
      explanation: "Usain Bolt ran a breathtaking 9.58 seconds at the 2009 World Athletics Championships in Berlin, a record that remains unbroken."
    },
    {
      id: 9,
      sport: "American Football",
      question: "How many points is a touchdown worth in American football / NFL?",
      options: ["3 points", "6 points", "7 points", "4 points"],
      correct: 1,
      explanation: "A touchdown is worth 6 points. After scoring, the team attempts an Extra Point kick (1 pt) or a Two-Point Conversion (2 pts)."
    },
    {
      id: 10,
      sport: "Tennis",
      question: "On which playing surface is the French Open (Roland Garros) held?",
      options: ["Grass", "Hard Court", "Red Clay", "Carpet"],
      correct: 2,
      explanation: "Roland Garros is played on red clay courts, famed for slow ball speed, high bounce, and long baseline rallies (where Rafael Nadal won 14 titles)."
    }
  ],

  // 7. SPORTS TRIVIA & FUN FACTS
  funFacts: [
    "⚽ During the 2010 World Cup, a common octopus named 'Paul' successfully predicted the winner of all 7 of Germany's matches and the final!",
    "🏏 Sachin Tendulkar was the first player in international cricket history to be dismissed by third umpire TV replay (1992 in Durban vs South Africa).",
    "🏀 Wilt Chamberlain once scored 100 points in a single NBA game on March 2, 1962, for the Philadelphia Warriors against the New York Knicks.",
    "🎾 The longest professional tennis match in history was played at Wimbledon 2010 between John Isner and Nicolas Mahut: it lasted 11 hours and 5 minutes over 3 days!",
    "🏎️ An F1 engine generates so much downforce at speeds over 150 km/h (93 mph) that the car could theoretically drive upside down on the ceiling of a tunnel!",
    "🏅 In the 1904 Olympic marathon, the first runner to cross the finish line had actually traveled 11 miles of the race inside his manager's car!",
    "🏈 The Super Bowl is the second-largest day for U.S. food consumption, trailing only Thanksgiving dinner.",
    "🏏 In 2013, Chris Gayle blasted 175* off just 66 balls in the IPL for RCB against Pune Warriors, the highest individual score in T20 cricket history.",
    "⚽ Only two players have scored in four different FIFA World Cup finals: Pelé and Kylian Mbappé.",
    "🥊 In 1997, the infamous 'Bite Fight' occurred between Mike Tyson and Evander Holyfield, leading to Tyson's disqualification."
  ]
};

if (typeof window !== "undefined") {
  window.SPORTS_DB = SPORTS_DB;
}
