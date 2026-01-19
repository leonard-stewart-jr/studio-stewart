// New: data/nba-logos.js
// Modeled after your nfl-logos.js style. Filenames are expected in:
//   public/images/prints/nba/{id}.jpg
// Conference logos:
//   public/images/prints/nba/eastern.jpg
//   public/images/prints/nba/western.jpg

// --- NBA DIVISION DATA ---
export const DIVISIONS = {
  EAST: {
    ATLANTIC: [
      { id: "nets", name: "Brooklyn Nets" },
      { id: "celtics", name: "Boston Celtics" },
      { id: "knicks", name: "New York Knicks" },
      { id: "76ers", name: "Philadelphia 76ers" },
      { id: "raptors", name: "Toronto Raptors" }
    ],
    CENTRAL: [
      { id: "bulls", name: "Chicago Bulls" },
      { id: "cavaliers", name: "Cleveland Cavaliers" },
      { id: "pistons", name: "Detroit Pistons" },
      { id: "bucks", name: "Milwaukee Bucks" },
      { id: "pacers", name: "Indiana Pacers" }
    ],
    SOUTHEAST: [
      { id: "hawks", name: "Atlanta Hawks" },
      { id: "hornets", name: "Charlotte Hornets" },
      { id: "heat", name: "Miami Heat" },
      { id: "magic", name: "Orlando Magic" },
      { id: "wizards", name: "Washington Wizards" }
    ]
  },
  WEST: {
    NORTHWEST: [
      { id: "nuggets", name: "Denver Nuggets" },
      { id: "timberwolves", name: "Minnesota Timberwolves" },
      { id: "thunder", name: "Oklahoma City Thunder" },
      { id: "jazz", name: "Utah Jazz" },
      { id: "trailblazers", name: "Portland Trail Blazers" }
    ],
    PACIFIC: [
      { id: "suns", name: "Phoenix Suns" },
      { id: "clippers", name: "LA Clippers" },
      { id: "lakers", name: "Los Angeles Lakers" },
      { id: "warriors", name: "Golden State Warriors" },
      { id: "kings", name: "Sacramento Kings" }
    ],
    SOUTHWEST: [
      { id: "mavs", name: "Dallas Mavericks" },
      { id: "rockets", name: "Houston Rockets" },
      { id: "pelicans", name: "New Orleans Pelicans" },
      { id: "spurs", name: "San Antonio Spurs" },
      { id: "grizzlies", name: "Memphis Grizzlies" }
    ]
  }
};

export const divisionNames = [
  "ATLANTIC",
  "CENTRAL",
  "SOUTHEAST",
  "NORTHWEST",
  "PACIFIC",
  "SOUTHWEST"
];

// Conference logo objects (used like AFC_LOGO / NFC_LOGO)
export const EAST_LOGO = {
  id: "nba-east-logo",
  image: "/images/prints/nba/eastern.jpg",
  name: "Eastern Conference"
};

export const WEST_LOGO = {
  id: "nba-west-logo",
  image: "/images/prints/nba/western.jpg",
  name: "Western Conference"
};

// FILTER BUTTONS for the NBA view — conference first, then divisions
export const FILTER_BUTTONS = [
  { label: "ALL", value: "ALL", type: "conference" },
  { label: "EAST", value: "EAST", type: "conference" },
  { label: "WEST", value: "WEST", type: "conference" },

  // Eastern divisions
  { label: "ATLANTIC", value: "ATLANTIC", type: "division" },
  { label: "CENTRAL", value: "CENTRAL", type: "division" },
  { label: "SOUTHEAST", value: "SOUTHEAST", type: "division" },

  // Western divisions
  { label: "NORTHWEST", value: "NORTHWEST", type: "division" },
  { label: "PACIFIC", value: "PACIFIC", type: "division" },
  { label: "SOUTHWEST", value: "SOUTHWEST", type: "division" }
];
