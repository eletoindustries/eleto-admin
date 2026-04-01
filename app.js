// 🔥 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 YOUR FIREBASE CONFIG (PUT YOUR VALUES)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 📦 STORE DATA
let allData = [];

// 🔐 AUTH CHECK (NO STYLE USAGE HERE)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  } else {
    loadData();
  }
});

// 📊 LOAD DATA
function loadData() {
  const table = document.getElementById("table");

  // 🛑 SAFETY CHECK (PREVENT NULL ERROR)
  if (!table) {
    console.error("Table not found in HTML");
    return;
  }

  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allData = [];

    // RESET TABLE
    table.innerHTML = `
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Message</th>
        <th>Date</th>
      </tr>
    `;

    snapshot.forEach((doc) => {
      const data = doc.data();
      allData.push(data);
      addRow(data);
    });
  });
}

// ➕ ADD ROW
function addRow(data) {
  const table = document.getElementById("table");

  if (!table) return;

  const row = table.insertRow();

  row.insertCell(0).innerText = data.name || "";
  row.insertCell(1).innerText = data.email || "";
  row.insertCell(2).innerText = data.message || "";

  let dateText = "";
  if (data.createdAt) {
    dateText = data.createdAt.toDate().toLocaleString();
  }

  row.insertCell(3).innerText = dateText;
}

// 🔍 FILTER
window.filterData = function () {
  const searchInput = document.getElementById("search");
  const dateInput = document.getElementById("dateFilter");
  const table = document.getElementById("table");

  if (!table) return;

  const search = searchInput ? searchInput.value.toLowerCase() : "";
  const selectedDate = dateInput ? dateInput.value : "";

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Message</th>
      <th>Date</th>
    </tr>
  `;

  allData.forEach((data) => {
    const name = (data.name || "").toLowerCase();
    const email = (data.email || "").toLowerCase();
    const message = (data.message || "").toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      email.includes(search) ||
      message.includes(search);

    let matchesDate = true;

    if (selectedDate && data.createdAt) {
      const date = data.createdAt.toDate().toISOString().split("T")[0];
      matchesDate = date === selectedDate;
    }

    if (matchesSearch && matchesDate) {
      addRow(data);
    }
  });
};

// 📤 EXPORT CSV
window.exportCSV = function () {
  if (allData.length === 0) {
    alert("No data available to export");
    return;
  }

  let csv = "Name,Email,Message,Date\n";

  allData.forEach((d) => {
    const date = d.createdAt
      ? d.createdAt.toDate().toLocaleString()
      : "";

    csv += `"${d.name}","${d.email}","${d.message}","${date}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "leads.csv";
  a.click();
};
