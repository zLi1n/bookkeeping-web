let currentEditIndex = null;
let deleteIndex = null;

function initPage(pageName) {
  if (pageName === 'home') {
    checkEditMode();
    renderHomeHistory();
  } else if (pageName === 'summary') {
    renderMonthlySummary();
    renderYearlySummary();
    updateSummary();
  } else if (pageName === 'analysis') {
    renderCategoryChart();
    renderCategoryBarChart();
    renderTrendChart();
  } else if (pageName === 'history') {
    renderFullHistory();
  }
}

function showToast(message, type = 'success') {
  const toastEl = document.getElementById('liveToast');
  if (!toastEl) return;
  
  const toastBody = document.getElementById('toastBody');
  const toastTitle = document.getElementById('toastTitle');
  
  toastBody.innerText = message;
  toastTitle.innerText = type === 'success' ? 'Success' : 'Error';
  toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
  
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function checkEditMode() {
  const editIndex = localStorage.getItem('editIndex');
  if (editIndex !== null) {
    const index = parseInt(editIndex);
    const transactions = getTransactions();
    const t = transactions[index];
    
    if (t) {
      document.getElementById("date").value = t.date;
      document.getElementById("description").value = t.description;
      document.getElementById("amount").value = t.amount;
      document.getElementById("type").value = t.type;
      document.getElementById("category").value = t.category;

      currentEditIndex = index;
      document.getElementById("addPageTitle").innerText = "Edit Transaction";
      document.getElementById("addBtn").innerText = "Update Transaction";
      document.getElementById("cancelBtn").style.display = "block";
    }
    localStorage.removeItem('editIndex');
  }
}

function toggleSection(sectionId) {
  const content = document.getElementById(sectionId);
  const icon = document.getElementById(sectionId + '-icon');
  
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    if (icon) icon.classList.add('open');
  } else {
    content.style.display = 'none';
    if (icon) icon.classList.remove('open');
  }
}

function addTransaction() {
  const dateInput = document.getElementById("date");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const categoryInput = document.getElementById("category");

  const data = {
    date: dateInput.value,
    description: descriptionInput.value,
    amount: Number(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value
  };

  if (!data.date || !data.amount) {
    showToast("Please fill in at least the date and amount.", "error");
    return;
  }

  const transactions = getTransactions();

  if (currentEditIndex !== null) {
    transactions[currentEditIndex] = data;
    resetEditMode();
    showToast("Transaction updated successfully!");
  } else {
    transactions.push(data);
    showToast("Transaction added successfully!");
  }

  setTransactions(transactions);
  clearInputs();
  renderHomeHistory();
}

function cancelEdit() {
  resetEditMode();
  clearInputs();
  renderHomeHistory();
}

function resetEditMode() {
  currentEditIndex = null;
  document.getElementById("addPageTitle").innerText = "Add Transaction";
  document.getElementById("addBtn").innerText = "Add Transaction";
  document.getElementById("cancelBtn").style.display = "none";
}

function clearInputs() {
  document.getElementById("date").value = "";
  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("type").value = "expense";
  document.getElementById("category").selectedIndex = 0;
}

function deleteTransaction(index) {
  deleteIndex = index;
  const modalEl = document.getElementById('deleteModal');
  if (!modalEl) {
    // Fallback if modal missing on some page
    if (confirm("Are you sure you want to delete this?")) {
      performDelete();
    }
    return;
  }
  
  const modal = new bootstrap.Modal(modalEl);
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  
  // Remove old listeners to avoid multiple deletions
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  newConfirmBtn.addEventListener('click', () => {
    performDelete();
    modal.hide();
  });
  
  modal.show();
}

function performDelete() {
  const transactions = getTransactions();
  transactions.splice(deleteIndex, 1);
  setTransactions(transactions);
  showToast("Transaction deleted successfully!");
  
  // Refresh current view
  if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    renderHomeHistory();
  } else {
    location.reload();
  }
}

function editTransaction(index) {
  localStorage.setItem('editIndex', index);
  window.location.href = "index.html";
}

function updateSummary() {
  const transactions = getTransactions();
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  if (document.getElementById("totalIncome")) {
    document.getElementById("totalIncome").innerText = income.toFixed(2);
    document.getElementById("totalExpense").innerText = expense.toFixed(2);
    document.getElementById("balance").innerText = (income - expense).toFixed(2);
  }
}

function renderHomeHistory() {
  const container = document.getElementById("homeHistory");
  const summaryContainer = document.getElementById("homeSummary");
  if (!container) return;

  const transactions = getTransactions();
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  
  const filtered = transactions.filter(t => t.date && t.date.startsWith(currentMonth));
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate totals for the filtered data (current month)
  let monthIncome = 0;
  let monthExpense = 0;
  filtered.forEach(t => {
    if (t.type === 'income') monthIncome += Number(t.amount);
    else monthExpense += Number(t.amount);
  });
  const monthBalance = monthIncome - monthExpense;

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="col-4">
        <div class="card shadow-sm border-0 bg-success-subtle text-success h-100 p-2 text-center">
          <div class="small fw-bold">INCOME</div>
          <div class="fw-bold">${monthIncome.toFixed(2)}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="card shadow-sm border-0 bg-danger-subtle text-danger h-100 p-2 text-center">
          <div class="small fw-bold">EXPENSE</div>
          <div class="fw-bold">${monthExpense.toFixed(2)}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="card shadow-sm border-0 bg-secondary-subtle text-dark h-100 p-2 text-center">
          <div class="small fw-bold">BALANCE</div>
          <div class="fw-bold">${monthBalance.toFixed(2)}</div>
        </div>
      </div>
    `;
  }

  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  let html = `<h5 class="mb-3 fw-bold mt-4">Recent History (${monthName})</h5>`;
  
  if (filtered.length === 0) {
    html += `<div class="alert alert-info">No transactions recorded for this month.</div>`;
  } else {
    html += `
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th class="d-none d-md-table-cell">Category</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => {
              const originalIndex = getTransactions().findIndex(orig => 
                orig.date === t.date && 
                orig.description === t.description && 
                orig.amount === t.amount && 
                orig.type === t.type && 
                orig.category === t.category
              );
              return `
              <tr>
                <td class="text-muted small">${t.date}</td>
                <td class="fw-medium">${t.description}</td>
                <td class="fw-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}">
                  ${t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                </td>
                <td class="d-none d-md-table-cell"><span class="badge bg-light text-dark border">${t.category}</span></td>
                <td class="actions-cell pe-3">
                  <button class="btn btn-sm btn-light border text-primary" onclick="editTransaction(${originalIndex})">Edit</button>
                  <button class="btn btn-sm btn-light border text-danger" onclick="deleteTransaction(${originalIndex})">Delete</button>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    `;
  }
  
  container.innerHTML = html;
  updateSummary();
}