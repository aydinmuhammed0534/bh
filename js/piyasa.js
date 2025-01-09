window.onload = function() {
    const toast = document.getElementById("toast");

    // Toast mesajını göster
    toast.classList.add("show");

    setTimeout(function() {
        toast.classList.remove("show");
    }, 5000); // 5 saniye sonra kaybolur
};

// const API_KEY = 'ZNZVMJH3YX645BLS';

// const symbols = ['USD/TRY', 'EUR/TRY', 'XAU/USD', 'XAG/USD'];

// async function fetchData(symbol) {
//     const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.split('/')[0]}&to_currency=${symbol.split('/')[1]}&apikey=${API_KEY}`;

//     console.log(`Fetching data for ${symbol}...`);
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log(`Data received for ${symbol}:`, data);
//         return data;
//     } catch (error) {
//         console.error(`Error fetching data for ${symbol}:`, error);
//         return null;
//     }
// }

// async function updateData() {
//     console.log('Starting data update...');

//     for (const symbol of symbols) {
//         const data = await fetchData(symbol);
//         if (data && data['Realtime Currency Exchange Rate']) {
//             const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
//             console.log(`${symbol}: ${rate.toFixed(4)}`);
//         } else {
//             console.log(`Failed to get data for ${symbol}`);
//         }
//     }

//     console.log('Data update complete.');
// }

// // Run updateData immediately and then every 5 minutes
// updateData();
// setInterval(updateData, 300000);

