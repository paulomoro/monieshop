import { useState } from "react";

function FileUploader() {

    const [files, setFiles] = useState(null);
    const [transactions, setTransactions] = useState({
        highestSalesVolumeDay: null,
        highestSalesValueDay: null,
        mostSoldProduct: null,
        highestSalesStaffByMonth: {},
        highestHourByVolume: null,
      });

      const handleFileChange = (e) => {
        setFiles(e.target.files);
      };
    
    
      const processFiles = () => {
        if (!files) {
          console.log("Please select files first!");
          return;
        }
    
      
        const dailySalesVolume = {}; 
        const dailySalesValue = {}; 
        const productSales = {}; 
        const monthlySalesStaff = {};
        const hourlyTransactionVolume = {}; 
    
        // Processing each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
    
          reader.onload = function (e) {
            const lines = e.target.result.split("\n");
    
            lines.forEach((line) => {
              if (!line) return; 
    
              
              const [salesStaffId, transactionTime, productsSold, saleAmount] = line.split(",");
    
    
              const date = transactionTime.split("T")[0];
              const hour = transactionTime.split("T")[1].split(":")[0];
              const month = date.split("-")[1]; 
    
              const products = productsSold
                .replace(/\[|\]/g, "")
                .split("|")
                .map((item) => {
                  const [productId, quantity] = item.split(":");
                  return { productId, quantity: parseInt(quantity) };
                });
    
             
              const totalVolume = products.reduce((sum, product) => sum + product.quantity, 0);
              const totalValue = parseFloat(saleAmount);
    
             
              dailySalesVolume[date] = (dailySalesVolume[date] || 0) + totalVolume;
    
             
              dailySalesValue[date] = (dailySalesValue[date] || 0) + totalValue;
    
              products.forEach((product) => {
                productSales[product.productId] = (productSales[product.productId] || 0) + product.quantity;
              });
    
              if (!monthlySalesStaff[month]) {
                monthlySalesStaff[month] = {};
              }
              monthlySalesStaff[month][salesStaffId] = (monthlySalesStaff[month][salesStaffId] || 0) + totalValue;
    
              if (!hourlyTransactionVolume[hour]) {
                hourlyTransactionVolume[hour] = { totalVolume: 0, count: 0 };
              }
              hourlyTransactionVolume[hour].totalVolume += totalVolume;
              hourlyTransactionVolume[hour].count += 1;
            });
    
            if (i === files.length - 1) {
              const highestSalesVolumeDay = Object.entries(dailySalesVolume).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
              const highestSalesValueDay = Object.entries(dailySalesValue).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
              const mostSoldProduct = Object.entries(productSales).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    
              const highestSalesStaffByMonth = {};
              for (const month in monthlySalesStaff) {
                highestSalesStaffByMonth[month] = Object.entries(monthlySalesStaff[month]).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
              }
    
              const highestHourByVolume = Object.entries(hourlyTransactionVolume).reduce((a, b) => {
                const avgA = a[1].totalVolume / a[1].count;
                const avgB = b[1].totalVolume / b[1].count;
                return avgA > avgB ? a : b;
              })[0];
    
              setTransactions({
                highestSalesVolumeDay,
                highestSalesValueDay,
                mostSoldProduct,
                highestSalesStaffByMonth,
                highestHourByVolume,
              });
            }
          };
    
          reader.readAsText(file);
        }
      };
    return (
        <div>
        <h1>Monieshop Analytics</h1>
        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={processFiles}>Process Files</button>
  
        <div>
          <h2>Metrics</h2>
          <p>Highest Sales Volume in a Day: {transactions.highestSalesVolumeDay}</p>
          <p>Highest Sales Value in a Day: {transactions.highestSalesValueDay}</p>
          <p>Most Sold Product ID by Volume: {transactions.mostSoldProduct}</p>
          <p>
            Highest Sales Staff ID by Month:
            <ul>
              {Object.entries(transactions.highestSalesStaffByMonth).map(([month, staffId]) => (
                <li key={month}>
                  Month {month}: Staff ID {staffId}
                </li>
              ))}
            </ul>
          </p>
          <p>Highest Hour of the Day by Average Transaction Volume: {transactions.highestHourByVolume}</p>
        </div>
      </div>
    );
}

export default FileUploader;