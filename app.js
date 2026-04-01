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

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let allData = [];

// 🔐 AUTH CHECK (NO .style ANYWHERE)
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

  if (!table) return;

  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allData = [];

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

// ➕ ROW
function addRow(data) {
  const table = document.getElementById("table");
  if (!table) return;

  const row = table.insertRow();

  row.insertCell(0).innerText = data.name || "";
  row.insertCell(1).innerText = data.email || "";
  row.insertCell(2).innerText = data.message || "";

  let date = "";
  if (data.createdAt) {
    date = data.createdAt.toDate().toLocaleString();
  }

  row.insertCell(3).innerText = date;
}

// 🔍 FILTER
window.filterData = function () {
  const search = document.getElementById("search").value.toLowerCase();
  const dateFilter = document.getElementById("dateFilter").value;
  const table = document.getElementById("table");

  table.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Message</th>
      <th>Date</th>
    </tr>
  `;

  allData.forEach(d => {
    const matchSearch =
      (d.name || "").toLowerCase().includes(search) ||
      (d.email || "").toLowerCase().includes(search) ||
      (d.message || "").toLowerCase().includes(search);

    let matchDate = true;

    if (dateFilter && d.createdAt) {
      const date = d.createdAt.toDate().toISOString().split("T")[0];
      matchDate = date === dateFilter;
    }

    if (matchSearch && matchDate) {
      addRow(d);
    }
  });
};

// 📤 EXPORT
window.exportCSV = function () {
  let csv = "Name,Email,Message,Date\n";

  allData.forEach(d => {
    const date = d.createdAt
      ? d.createdAt.toDate().toLocaleString()
      : "";

    csv += `"${d.name}","${d.email}","${d.message}","${date}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leads.csv";
  a.click();
};
