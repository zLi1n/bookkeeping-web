let pieChart;
let barChart;
let lineChart;
let currentTrendView = 'daily';
let currentCategoryView = 'all';

function updateCategoryView(view, btn) {
  currentCategoryView = view;
  
  // Update ALL category filter buttons across different sections
  const allCategoryButtons = document.querySelectorAll('.category-filter-btn');
  allCategoryButtons.forEach(b => {
    if (b.getAttribute('data-view') === view) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  
  renderCategoryChart();
  renderCategoryBarChart();
}

function getFilteredCategoryData() {
  const transactions = getTransactions();
  const categoryMap = {};

  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const monthStr = now.toISOString().substring(0, 7);
  const yearStr = now.toISOString().substring(0, 4);

  transactions.forEach(t => {
    if (t.type === "expense" && t.date) {
      let include = false;
      if (currentCategoryView === 'all') include = true;
      else if (currentCategoryView === 'daily' && t.date === todayStr) include = true;
      else if (currentCategoryView === 'monthly' && t.date.startsWith(monthStr)) include = true;
      else if (currentCategoryView === 'yearly' && t.date.startsWith(yearStr)) include = true;

      if (include) {
        const cat = t.category || "Others";
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
      }
    }
  });
  return categoryMap;
}

function renderCategoryChart() {
  const canvas = document.getElementById("categoryChart");
  if (!canvas) return;

  const categoryMap = getFilteredCategoryData();
  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  if (pieChart) pieChart.destroy();
  if (labels.length === 0) return;

  const ctx = canvas.getContext("2d");
  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4D5360']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function renderCategoryBarChart() {
  const canvas = document.getElementById("categoryBarChart");
  if (!canvas) return;

  const categoryMap = getFilteredCategoryData();
  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  if (barChart) barChart.destroy();
  if (labels.length === 0) return;

  const ctx = canvas.getContext("2d");
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: 'Expense Amount',
        data: values,
        backgroundColor: '#3498db',
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateTrendView(view, btn) {
  currentTrendView = view;
  const parent = btn.parentElement;
  const buttons = parent.querySelectorAll('.chart-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTrendChart();
}

function renderTrendChart() {
  const canvas = document.getElementById("trendChart");
  if (!canvas) return;

  const transactions = getTransactions();
  const map = {};

  transactions.forEach(t => {
    if (!t.date) return;
    let key;
    if (currentTrendView === 'daily') key = t.date;
    else if (currentTrendView === 'monthly') key = t.date.substring(0, 7);
    else if (currentTrendView === 'yearly') key = t.date.substring(0, 4);
    else key = 'Total';

    if (!map[key]) map[key] = { income: 0, expense: 0 };
    if (t.type === "income") map[key].income += Number(t.amount);
    else map[key].expense += Number(t.amount);
  });

  const labels = Object.keys(map).sort();
  const incomeData = labels.map(l => map[l].income);
  const expenseData = labels.map(l => map[l].expense);

  if (lineChart) lineChart.destroy();
  if (labels.length === 0) return;

  const ctx = canvas.getContext("2d");
  lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}