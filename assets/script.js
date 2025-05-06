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
    populateMonthSelect(); // Actualizar selector después de añadir un viaje
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

  populateMonthSelect(); // Llenar el selector de meses al cargar la página
});

function generateMonthlyReport(monthValue) {
    // Convertir el valor del selector (YYYY-MM) a Date para comparar
    const [year, month] = monthValue.split('-');
    
    // Filtrar viajes para el mes seleccionado
    const ridesForMonth = rides.filter(dateStr => {
        const rideDate = new Date(dateStr);
        return rideDate.getFullYear() === parseInt(year) && 
               rideDate.getMonth() === parseInt(month) - 1;
    });

    if (ridesForMonth.length === 0) {
        return null;
    }

    // Calculate total trips, distance, and costs
    const trips = ridesForMonth.length;
    const totalDistance = trips * distance; // Total distance in km
    const gasPricePerLiter = gasPrices[month] || 1.50; // Default gas price if not set
    const totalCost = (totalDistance / 100) * gasPricePerLiter * 6.5; // Total cost based on 6.5 liters/100 km
    const yourShare = totalCost / 2; // Split cost between two people

    // Calculate CO2 generated (2.31 kg CO2 per liter of gasoline)
    const litersUsed = (totalDistance / 100) * 6.5; // Total liters of gasoline used
    const co2Generated = litersUsed * 2.31; // CO2 in kilograms

    return {
        trips,
        totalDistance,
        totalCost,
        yourShare,
        co2Saved: co2Generated.toFixed(2) // Round CO2 to 2 decimal places
    };
}

function populateMonthSelect() {
    const monthSelect = document.getElementById("month-select");
    monthSelect.innerHTML = '<option value="" disabled selected>Elige un mes</option>';

    // Obtener fechas únicas y ordenarlas
    const uniqueDates = [...new Set(rides)].map(dateStr => new Date(dateStr))
        .sort((a, b) => b - a); // Ordenar de más reciente a más antiguo

    // Convertir fechas a formato mes-año
    const monthYears = uniqueDates.map(date => {
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return {
            value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            text: `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
        };
    });

    // Filtrar duplicados por valor (mes-año)
    const uniqueMonthYears = monthYears.filter((monthYear, index, self) =>
        index === self.findIndex((m) => m.value === monthYear.value)
    );

    // Crear opciones para cada mes disponible
    uniqueMonthYears.forEach(({ value, text }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        monthSelect.appendChild(option);
    });
}

// Llamar a esta función cuando se cargue la página o cambien los datos
document.addEventListener("DOMContentLoaded", () => {
  populateMonthSelect(); // Llenar el selector de meses al cargar la página
});

renderRides();
renderGasPrices();
