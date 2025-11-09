import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0RpSF2FGvGQLC0qGAR4vR7GaQKWFGKpE",
  authDomain: "starrysky-77610.firebaseapp.com",
  projectId: "starrysky-77610",
  storageBucket: "starrysky-77610.firebasestorage.app",
  messagingSenderId: "683351652563",
  appId: "1:683351652563:web:daad932cf52af836b67c26",
  measurementId: "G-8GW11Z2MTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const puzzleContainer = document.getElementById("puzzle");
const statusEl = document.getElementById("status");

let tiles = [];
let selected = [];
let solvedGroups = new Set();

// 🧩 Load all group documents from the TestPuzzle collection
async function loadPuzzle() {
  const groupsSnapshot = await getDocs(collection(db, "TestPuzzle"));
  const puzzleData = {};

  groupsSnapshot.forEach(groupDoc => {
    puzzleData[groupDoc.id] = groupDoc.data();
  });

  console.log("Loaded puzzle:", puzzleData);
  buildPuzzle(puzzleData);
}

// 🧱 Build puzzle grid
function buildPuzzle(puzzle) {
  tiles = [];

  // For each group (Group1, Group2, etc.)
  Object.entries(puzzle).forEach(([groupName, items]) => {
    // Each group document has 4 fields: A, B, C, D
    Object.values(items).forEach(value => {
      const type = value.startsWith("http") ? "image" : "text";
      tiles.push({
        type,
        value,
        group: groupName,
        id: crypto.randomUUID()
      });
    });
  });

  // Shuffle the tiles
  tiles.sort(() => Math.random() - 0.5);

  // Clear old grid
  puzzleContainer.innerHTML = "";

  // Render tiles
  tiles.forEach(tile => {
    const div = document.createElement("div");
    div.classList.add("tile");
    div.dataset.group = tile.group;
    div.dataset.id = tile.id;

    if (tile.type === "image") {
      const img = document.createElement("img");
      img.src = tile.value;
      img.style.width = "100%";
      img.style.borderRadius = "8px";
      div.appendChild(img);
    } else {
      div.textContent = tile.value;
    }

    div.addEventListener("click", () => handleTileClick(tile, div));
    puzzleContainer.appendChild(div);
  });
}

function showRoomModal() {
  const modal = document.getElementById("roomModal");
  modal.style.display = "flex";

  const submitBtn = document.getElementById("submitRoom");
  submitBtn.onclick = () => {
    const room = document.getElementById("roomInput").value.trim();
    if (!room) {
      alert("Please enter a room number!");
      return;
    }

    // Option 1: Just log locally
    console.log("Room number submitted:", room);
    alert(`✅ Thanks! Room ${room} has been recorded.`);

    // Option 2 (later): Save to Firestore
    // addDoc(collection(db, "CompletedRooms"), { room, timestamp: new Date() });

    modal.style.display = "none";
  };
}

// 🧩 Handle tile clicks
function handleTileClick(tile, div) {
  if (solvedGroups.has(tile.group)) return; // ignore solved groups

  if (selected.find(sel => sel.id === tile.id)) {
    div.classList.remove("selected");
    selected = selected.filter(sel => sel.id !== tile.id);
    return;
  }

  if (selected.length < 4) {
    selected.push(tile);
    div.classList.add("selected");
  }

  if (selected.length === 4) {
    checkSelection();
  }
}

// ✅ Check if selection is correct
function checkSelection() {
  const allSameGroup = selected.every(t => t.group === selected[0].group);

  if (allSameGroup) {
    solvedGroups.add(selected[0].group);
    selected.forEach(t => {
      const el = document.querySelector(`[data-id='${t.id}']`);
      el.classList.remove("selected");
      el.classList.add("correct");
      el.style.pointerEvents = "none";
    });
    statusEl.textContent = `✅ Found group ${selected[0].group}`;
  } else {
    selected.forEach(t => {
      const el = document.querySelector(`[data-id='${t.id}']`);
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong", "selected"), 500);
    });
    statusEl.textContent = "❌ Not a match!";
  }

  selected = [];

  if (solvedGroups.size === new Set(tiles.map(t => t.group)).size) {
  statusEl.textContent = "Congratulations, you solved the puzzle!";
  showRoomModal();
}
}

// Start it up
loadPuzzle();

