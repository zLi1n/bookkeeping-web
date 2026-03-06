const STORAGE_KEY = "transactions";

function getTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function addTransaction(data) {
  const transactions = getTransactions();
  transactions.push(data);
  saveTransactions(transactions);
}

function setTransactions(data){
  saveTransactions(data);
}