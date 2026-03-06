function renderFullHistory() {
  const container = document.getElementById("historyList");
  if (!container) return;

  const transactions = getTransactions();
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const groups = {};
  transactions.forEach(t => {
    if (!t.date) return;
    const date = new Date(t.date);
    const groupKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(t);
  });

  container.innerHTML = "";
  Object.keys(groups).forEach((groupName, groupIdx) => {
    const sectionId = `historyGroup-${groupIdx}`;
    const groupHtml = `
    <div class="card shadow-sm mb-3">
      <div class="card-header bg-white d-flex justify-content-between align-items-center" onclick="toggleSection('${sectionId}')" style="cursor: pointer;">
        <h6 class="mb-0 fw-bold">${groupName}</h6>
        <span class="toggle-icon ${groupIdx === 0 ? 'open' : ''}" id="${sectionId}-icon">▼</span>
      </div>
      <div id="${sectionId}" class="card-body p-0" style="display: ${groupIdx === 0 ? 'block' : 'none'};">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th class="d-none d-md-table-cell">Category</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${groups[groupName].map(t => {
                const originalIndex = findOriginalIndex(t);
                return `
                <tr>
                  <td class="small">${t.date}</td>
                  <td class="text-truncate" style="max-width: 150px;">${t.description}</td>
                  <td><span class="badge ${t.type === 'income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} text-capitalize">${t.type}</span></td>
                  <td class="fw-bold">${Number(t.amount).toFixed(2)}</td>
                  <td class="d-none d-md-table-cell"><span class="badge bg-secondary-subtle text-secondary">${t.category}</span></td>
                  <td class="actions-cell">
                    <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${originalIndex})">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${originalIndex})">Delete</button>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `;
    container.innerHTML += groupHtml;
  });
}

function findOriginalIndex(t) {
  return getTransactions().findIndex(orig => 
    orig.date === t.date && 
    orig.description === t.description && 
    orig.amount === t.amount && 
    orig.type === t.type && 
    orig.category === t.category
  );
}