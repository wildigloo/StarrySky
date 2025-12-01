import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

let tiles = [];
let selected = [];
let solvedGroups = new Set();
let explanations = {}; // store explanations separately

// 🧩 Load all group documents from the TestPuzzle collection
async function loadPuzzle() {
  const groupsSnapshot = await getDocs(collection(db, "12-1-25"));
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

  Object.entries(puzzle).forEach(([groupName, fields]) => {
    // save explanation
    explanations[groupName] = fields.Explanation;

    // only take A, B, C, D as puzzle tiles
    ["A", "B", "C", "D"].forEach(key => {
      const value = fields[key];
      if (value) {
        const type = value.startsWith("http") ? "image" : "text";
        tiles.push({
          type,
          value,
          group: groupName,
          id: self.crypto?.randomUUID ? self.crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
        });
      }
    });
  });

  // shuffle tiles
  tiles.sort(() => Math.random() - 0.5);

  // clear old grid
  puzzleContainer.innerHTML = "";

  // render tiles
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

// 💬 Show room modal
function showRoomModal() {
  const modal = document.getElementById("roomModal");
  modal.style.display = "flex";

  const submitBtn = document.getElementById("submitRoom");
  submitBtn.onclick = async () => {
    const room = document.getElementById("roomInput").value.trim();
    if (!room) {
      alert("Please enter a room number!");
      return;
    }

    try {
      await addDoc(collection(db, "CompletedRooms"), {
        room,
        timestamp: new Date()
      });
      alert(`✅ Thanks! Room ${room} has been recorded.`);
    } catch (err) {
      console.error("Error saving room:", err);
      alert("⚠️ Could not save your room. Please try again.");
    }

    modal.style.display = "none";
  };
}

// 🧩 Handle tile clicks
function handleTileClick(tile, div) {
  if (solvedGroups.has(tile.group)) return;

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
    const group = selected[0].group;
    solvedGroups.add(group);

    selected.forEach(t => {
      const el = document.querySelector(`[data-id='${t.id}']`);
      el.classList.remove("selected");
      el.classList.add("correct");
      el.style.pointerEvents = "none";
    });

    // 💡 Show explanation text for the solved group
    const explanationText = explanations[group] || `✅ Found ${group}!`;
    const explanationEl = document.createElement("div");
    explanationEl.classList.add("explanation");
    explanationEl.textContent = explanationText;
    puzzleContainer.prepend(explanationEl);

  } else {
    selected.forEach(t => {
      const el = document.querySelector(`[data-id='${t.id}']`);
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong", "selected"), 500);
    });
  }

  selected = [];

  // 🎉 Puzzle complete
  if (solvedGroups.size === new Set(tiles.map(t => t.group)).size) {
    showRoomModal();
  }
}

// 🚀 Start
loadPuzzle();
