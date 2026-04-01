import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgSwpGRg7kasPOE0YF8DJ1nCRV2kwoj6Y",
  authDomain: "eleto-industries.firebaseapp.com",
  projectId: "eleto-industries",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let allData = [];

// 🔐 AUTH CHECK
onAuthStateChanged(auth, (user) => {
  const appDiv = document.getElementById("app");
  const loadingDiv = document.getElementById("loading");

  if (!user) {
    // ❌ NOT LOGGED IN
    window.location.href = "/";
  } else {
    // ✅ LOGGED IN
    loadingDiv.style.display = "none";
    appDiv.style.display = "block";

    loadData();
  }
});

// 📊 LOAD DATA
function loadData() {
  const table = document.getElementById("table");

  onSnapshot(collection(db, "leads"), (snapshot) => {
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
      const d = doc.data();
      allData.push(d);

      const row = table.insertRow();
      row.insertCell(0).innerText = d.name || "";
      row.insertCell(1).innerText = d.email || "";
      row.insertCell(2).innerText = d.message || "";
      row.insertCell(3).innerText =
        d.createdAt ? d.createdAt.toDate().toLocaleString() : "";
    });
  });
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
      const row = table.insertRow();
      row.insertCell(0).innerText = d.name;
      row.insertCell(1).innerText = d.email;
      row.insertCell(2).innerText = d.message;
      row.insertCell(3).innerText =
        d.createdAt ? d.createdAt.toDate().toLocaleString() : "";
    }
  });
};

// 📤 EXPORT
window.exportCSV = function () {
  let csv = "Name,Email,Message,Date\n";

  allData.forEach(d => {
    const date = d.createdAt ? d.createdAt.toDate().toLocaleString() : "";
    csv += `"${d.name}","${d.email}","${d.message}","${date}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leads.csv";
  a.click();
};
