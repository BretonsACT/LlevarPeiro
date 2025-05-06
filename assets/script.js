const tabs = { plan: document.getElementById('plan-section'), config: document.getElementById('config-section'), summary: document.getElementById('summary-section') };
const navButtons = { plan: document.getElementById('tab-plan'), config: document.getElementById('tab-config'), summary: document.getElementById('tab-summary') };

Object.entries(navButtons).forEach(([key, btn]) => {
  btn.addEventListener('click', () => {
    Object.values(tabs).forEach(s => s.classList.remove('active'));
    Object.values(navButtons).forEach(b => b.classList.remove('active'));
    tabs[key].classList.add('active');
    btn.classList.add('active');
    if (key === 'summary') renderSummary();
  });
});

let rides = JSON.parse(localStorage.getItem('rides') || '[]');
let distance = parseFloat(localStorage.getItem('distance') || 10);
let gasPrices = JSON.parse(localStorage.getItem('gasPrices') || '{}');

const rideList = document.getElementById('ride-list');
const gasPricesDiv = document.getElementById('gas-prices');

function saveData() {
  localStorage.setItem('rides', JSON.stringify(rides));
  localStorage.setItem('distance', distance);
  localStorage.setItem('gasPrices', JSON.stringify(gasPrices));
}

function renderRides() {
  rideList.innerHTML = '';
  rides.forEach((d, idx) => {
    const li = document.createElement('li');
    li.textContent = d;
    const btn = document.createElement('button');
    btn.textContent = '❌';
    btn.onclick = () => { rides.splice(idx, 1); saveData(); renderRides(); };
    li.appendChild(btn);
    rideList.appendChild(li);
  });
}

function renderGasPrices() {
  gasPricesDiv.innerHTML = '';
  const months = [...new Set(rides.map(d => new Date(d).toLocaleString('default', { month: 'long', year: 'numeric' })) )];
  months.forEach(m => {
    const label = document.createElement('label');
    label.textContent = `Precio gasolina para ${m}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.value = gasPrices[m] || 1.50;
    input.step = 0.01;
    input.onchange = () => { gasPrices[m] = parseFloat(input.value); };
    gasPricesDiv.appendChild(label);
    gasPricesDiv.appendChild(input);
  });
}

document.getElementById('add-ride').addEventListener('click', () => {
  const date = document.getElementById('ride-date').value;
  if (date && !rides.includes(date)) {
    rides.push(date);
    saveData();
    renderRides();
    renderGasPrices();
  }
});

document.getElementById('save-config').addEventListener('click', () => {
  distance = parseFloat(document.getElementById('distance').value);
  saveData();
  alert('Configuración guardada!');
});

function renderSummary() {
  const tbody = document.getElementById('summary-body');
  tbody.innerHTML = '';
  const months = {};
  rides.forEach(dateStr => {
    const d = new Date(dateStr);
    const monthKey = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!months[monthKey]) months[monthKey] = 0;
    months[monthKey]++;
  });
  Object.entries(months).forEach(([month, count]) => {
    const pricePerKm = gasPrices[month] ? gasPrices[month] / 100 : 1.50 / 100;
    const totalDistance = count * distance;
    const totalCost = totalDistance * pricePerKm * 7;
    const yourShare = totalCost / 2;
    const row = `<tr><td>${month}</td><td>${count}</td><td>${totalDistance.toFixed(1)}</td><td>€${totalCost.toFixed(2)}</td><td>€${yourShare.toFixed(2)}</td></tr>`;
    tbody.innerHTML += row;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Button and dropdown references
  const generateReportButton = document.getElementById("generate-report");
  const markPaidButton = document.getElementById("mark-paid");
  const monthSelect = document.getElementById("month-select");

  // Event listener for "Generar Reporte"
  generateReportButton.addEventListener("click", () => {
    const selectedMonth = monthSelect.value;
    if (!selectedMonth) {
      alert("Por favor, selecciona un mes.");
      return;
    }

    const reportData = generateMonthlyReport(selectedMonth); // Generate report data
    if (reportData) {
      alert(`Reporte generado para ${selectedMonth}:\n\n` +
        `- Viajes: ${reportData.trips}\n` +
        `- Distancia Total: ${reportData.totalDistance} km\n` +
        `- Costo Total: €${reportData.totalCost}\n` +
        `- Tu Parte: €${reportData.yourShare}\n` +
        `- CO2 Ahorrado: ${reportData.co2Saved} kg`);
    } else {
      alert("No hay datos disponibles para el mes seleccionado.");
    }
  });

  // Event listener for "Marcar como Pagado"
  markPaidButton.addEventListener("click", () => {
    const selectedMonth = monthSelect.value;
    if (!selectedMonth) {
      alert("Por favor, selecciona un mes.");
      return;
    }

    markMonthAsPaid(selectedMonth); // Mark the month as paid
    alert(`El mes ${selectedMonth} ha sido marcado como pagado.`);
  });
});

// Function to generate a monthly report (mock implementation)
function generateMonthlyReport(month) {
  // Replace this with actual logic to fetch and calculate data
  return {
    trips: 15,
    totalDistance: 300,
    totalCost: 120,
    yourShare: 60,
    co2Saved: 25
  };
}

// Function to mark a month as paid (mock implementation)
function markMonthAsPaid(month) {
  // Replace this with actual logic to update the data
  console.log(`Mes ${month} marcado como pagado.`);
}

renderRides();
renderGasPrices();
