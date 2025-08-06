// --- NFL DIVISION DATA ---
export const DIVISIONS = {
  AFC: {
    EAST: [
      { id: "bills", name: "Buffalo Bills" },
      { id: "dolphins", name: "Miami Dolphins" },
      { id: "patriots", name: "New England Patriots" },
      { id: "jets", name: "New York Jets" }
    ],
    NORTH: [
      { id: "ravens", name: "Baltimore Ravens" },
      { id: "bengals", name: "Cincinnati Bengals" },
      { id: "browns", name: "Cleveland Browns" },
      { id: "steelers", name: "Pittsburgh Steelers" }
    ],
    SOUTH: [
      { id: "texans", name: "Houston Texans" },
      { id: "colts", name: "Indianapolis Colts" },
      { id: "jaguars", name: "Jacksonville Jaguars" },
      { id: "titans", name: "Tennessee Titans" }
    ],
    WEST: [
      { id: "broncos", name: "Denver Broncos" },
      { id: "chiefs", name: "Kansas City Chiefs" },
      { id: "raiders", name: "Las Vegas Raiders" },
      { id: "chargers", name: "Los Angeles Chargers" }
    ]
  },
  NFC: {
    EAST: [
      { id: "cowboys", name: "Dallas Cowboys" },
      { id: "giants", name: "New York Giants" },
      { id: "eagles", name: "Philadelphia Eagles" },
      { id: "commanders", name: "Washington Commanders" }
    ],
    NORTH: [
      { id: "bears", name: "Chicago Bears" },
      { id: "lions", name: "Detroit Lions" },
      { id: "packers", name: "Green Bay Packers" },
      { id: "vikings", name: "Minnesota Vikings" }
    ],
    SOUTH: [
      { id: "buccaneers", name: "Tampa Bay Buccaneers" },
      { id: "falcons", name: "Atlanta Falcons" },
      { id: "panthers", name: "Carolina Panthers" },
      { id: "saints", name: "New Orleans Saints" }
    ],
    WEST: [
      { id: "49ers", name: "San Francisco 49ers" },
      { id: "seahawks", name: "Seattle Seahawks" },
      { id: "rams", name: "Los Angeles Rams" },
      { id: "cardinals", name: "Arizona Cardinals" }
    ]
  }
};

export const divisionNames = ["EAST", "WEST", "SOUTH", "NORTH"];

export const CATEGORIES = [
  { label: "NFL LOGOS", value: "hueforge" },
  { label: "LITHOPHANES", value: "lithophanes" },
  { label: "CUSTOM CAD", value: "custom cad" },
  { label: "MORE", value: "more" }
];

export const AFC_LOGO = {
  id: "afc-logo",
  image: "/images/prints/nfl/afc.png",
  name: "AFC Conference"
};

export const NFC_LOGO = {
  id: "nfc-logo",
  image: "/images/prints/nfl/nfc.png",
  name: "NFC Conference"
};

export const LITHOPHANE = {
  id: "litho-family",
  image: "/images/prints/litho-family.png",
  name: "Family Portrait Lithophane",
  category: "lithophanes"
};

export const CUSTOM_CAD = {
  id: "chessboard",
  image: "/images/prints/chessboard.png",
  name: "Custom Chessboard",
  category: "custom cad"
};

export const MORE_SAMPLE = {
  id: "misc-keychain",
  image: "/images/prints/keychain.png",
  name: "Studio Keychain",
  category: "more"
};

export const FILTER_BUTTONS = [
  { label: "ALL", value: "ALL", type: "conference" },
  { label: "AFC", value: "AFC", type: "conference" },
  { label: "NFC", value: "NFC", type: "conference" },
  { label: "EAST", value: "EAST", type: "division" },
  { label: "WEST", value: "WEST", type: "division" },
  { label: "SOUTH", value: "SOUTH", type: "division" },
  { label: "NORTH", value: "NORTH", type: "division" },
];
