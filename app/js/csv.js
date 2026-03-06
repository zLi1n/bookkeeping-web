//Export CSV
function exportCSV(){

  const transactions = getTransactions();

  let csv = "Date,Description,Amount,Type,Category\n";

  transactions.forEach(t => {
    csv += `${t.date},${t.description},${t.amount},${t.type},${t.category}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
}

//Import CSV
function importCSV(event){

  const file = event.target.files[0];

  const reader = new FileReader();

  reader.onload = function(e){

    const text = e.target.result;

    const rows = text.split("\n").slice(1);

    const transactions = rows.map(r => {

      const cols = r.split(",");

      return {
        date: cols[0],
        description: cols[1],
        amount: Number(cols[2]) || 0,
        type: cols[3] || "expense",
        category: cols[4]
      };

    }).filter(r => r.date);

    setTransactions(transactions);

    renderTable();

  };

  reader.readAsText(file);

}