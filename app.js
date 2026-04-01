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

// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// STORE DATA
let allData = [];

// 🔐 AUTH PROTECTION
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ❌ Not logged in → redirect to login page
    window.location.href = "/";
  } else {
    // ✅ Logged in → load data
    loadData();
  }
});

// 📊 LOAD DATA (REAL-TIME)
function loadData() {
  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allData = [];

    const table = document.getElementById("table");

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

// 🔍 SEARCH + FILTER
window.filterData = function () {
  const search = document.getElementById("search").value.toLowerCase();
  const selectedDate = document.getElementById("dateFilter").value;

  const table = document.getElementById("table");

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Message</th>
      <th>Date</th>
    </tr>
  `;

  allData.forEach(data => {
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
    alert("No data to export");
    return;
  }

  let csv = "Name,Email,Message,Date\n";

  allData.forEach(d => {
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
