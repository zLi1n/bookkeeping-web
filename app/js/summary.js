function renderMonthlySummary() {
  const table = document.getElementById("monthlyTable");
  if (!table) return;

  const transactions = getTransactions();
  const map = {};

  transactions.forEach(t => {
    if (!t.date) return;
    const month = t.date.substring(0, 7);
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    if (t.type === "income") map[month].income += Number(t.amount);
    else map[month].expense += Number(t.amount);
  });

  let html = `
  <thead class="table-light">
    <tr>
      <th class="text-nowrap">Month</th>
      <th class="text-nowrap">Income</th>
      <th class="text-nowrap">Expense</th>
      <th class="text-nowrap">Balance</th>
    </tr>
  </thead>
  <tbody>`;

  const sortedMonths = Object.keys(map).sort().reverse();
  
  if (sortedMonths.length === 0) {
    html += `<tr><td colspan="4" class="text-center text-muted py-3">No data available</td></tr>`;
  } else {
    sortedMonths.forEach(m => {
      const balance = map[m].income - map[m].expense;
      html += `
      <tr>
        <td class="text-nowrap fw-medium">${m}</td>
        <td class="text-nowrap text-success">+${map[m].income.toFixed(2)}</td>
        <td class="text-nowrap text-danger">-${map[m].expense.toFixed(2)}</td>
        <td class="text-nowrap fw-bold ${balance >= 0 ? 'text-success' : 'text-danger'}">
          ${balance.toFixed(2)}
        </td>
      </tr>`;
    });
  }

  html += `</tbody>`;
  table.innerHTML = html;
}

function renderYearlySummary() {
  const table = document.getElementById("yearlyTable");
  if (!table) return;

  const transactions = getTransactions();
  const map = {};

  transactions.forEach(t => {
    if (!t.date) return;
    const year = t.date.substring(0, 4);
    if (!map[year]) map[year] = { income: 0, expense: 0 };
    if (t.type === "income") map[year].income += Number(t.amount);
    else map[year].expense += Number(t.amount);
  });

  let html = `
  <thead class="table-light">
    <tr>
      <th class="text-nowrap">Year</th>
      <th class="text-nowrap">Income</th>
      <th class="text-nowrap">Expense</th>
      <th class="text-nowrap">Balance</th>
    </tr>
  </thead>
  <tbody>`;

  const sortedYears = Object.keys(map).sort().reverse();

  if (sortedYears.length === 0) {
    html += `<tr><td colspan="4" class="text-center text-muted py-3">No data available</td></tr>`;
  } else {
    sortedYears.forEach(y => {
      const balance = map[y].income - map[y].expense;
      html += `
      <tr>
        <td class="text-nowrap fw-medium">${y}</td>
        <td class="text-nowrap text-success">+${map[y].income.toFixed(2)}</td>
        <td class="text-nowrap text-danger">-${map[y].expense.toFixed(2)}</td>
        <td class="text-nowrap fw-bold ${balance >= 0 ? 'text-success' : 'text-danger'}">
          ${balance.toFixed(2)}
        </td>
      </tr>`;
    });
  }

  html += `</tbody>`;
  table.innerHTML = html;
}