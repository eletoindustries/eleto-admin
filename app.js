import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let allData = [];

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, password);
};

// AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadRealtime();
  }
});

// REAL-TIME DATA (IMPORTANT)
function loadRealtime() {
  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allData = [];
    const table = document.getElementById("table");

    // Clear table except header
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

      // 🔔 REAL-TIME POPUP
      showPopup("New Lead: " + data.name);
    });
  });
}

// ADD ROW
function addRow(data) {
  const table = document.getElementById("table");
  const row = table.insertRow();

  row.insertCell(0).innerText = data.name;
  row.insertCell(1).innerText = data.email;
  row.insertCell(2).innerText = data.message;
  row.insertCell(3).innerText = data.createdAt?.toDate();
}

// SEARCH FILTER
window.filterData = function () {
  const search = document.getElementById("search").value.toLowerCase();
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
    if (
      data.name.toLowerCase().includes(search) ||
      data.email.toLowerCase().includes(search) ||
      data.message.toLowerCase().includes(search)
    ) {
      addRow(data);
    }
  });
};

// EXPORT CSV
window.exportCSV = function () {
  let csv = "Name,Email,Message\n";

  allData.forEach(d => {
    csv += `${d.name},${d.email},${d.message}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leads.csv";
  a.click();
};

// POPUP NOTIFICATION
function showPopup(text) {
  alert(text);
}
