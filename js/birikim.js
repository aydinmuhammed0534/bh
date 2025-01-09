    // varlik sınıfı
    let varlik = document.getElementById("varlik")
    varlik.innerHTML="Hesaplanacak Varlıkları Seçiniz"

    const menuShowBtn = document.getElementById('menu-show-btn');
    const navElements = document.querySelector('.nav-elements');

    menuShowBtn.addEventListener('click', () => {
        navElements.classList.toggle('active');
    });

    const veriler = [
        { name: "Gram Altın",price: 2957.549},
        { name: "Dolar",price: 34.38},
        { name: "Euro",price: 36.50},
        { name: "İngiliz Sterlini",price: 43.80},
        { name: "Cumhuriyet Altını", comingSoon:true},
        { name: "Gümüş", comingSoon:true},
        { name: "Bitcoin", comingSoon:true},
        { name: "Borsa İstanbul  Hisseleri", comingSoon:true},

        

    // { name: "Cumhuriyet Altını", price: 20687 },
        //{ name: "THY-BIST100", price: 271.50 },
    ];
   
    
    // Check if item is coming soon
    
    
    

    const selectElement = document.getElementById("varliklar");
    const adetInput = document.getElementById("adet");
    const addButton = document.getElementById("btn-add");
    const calculateButton = document.getElementById("btn-calculate");
    const selectionsList = document.getElementById("selections-list");
    const savedSelectionsDiv = document.getElementById("saved-selections");

    let selections = [];

    // Verileri seçim kutusuna ekleyelim
    veriler.forEach(veri => {
        const option = document.createElement("option");
        option.value = veri.name;        
        option.textContent = `${veri.name} (${veri.price} TL)`;
        selectElement.appendChild(option);

        if (veri.comingSoon) {
            option.textContent = `${veri.name} (Çok Yakında)`;
            option.disabled = true;
        } else {
            option.textContent = `${veri.name} (${veri.price.toFixed(2)} TL)`;
        }
        
        selectElement.appendChild(option);
    });

    addButton.addEventListener("click", function() {
        const selectedVarlik = selectElement.value;
        const adet = parseFloat(adetInput.value);

        if (selectedVarlik && !isNaN(adet) && adet > 0) {
            const selectedData = veriler.find(v => v.name === selectedVarlik);
            selections.push({ name: selectedVarlik, amount: adet, price: selectedData.price });
            updateSelectionsList();
            clearInputs();
            savedSelectionsDiv.style.display = "block";
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Geçersiz Giriş!',
                text: 'Lütfen geçerli bir miktar girin.',
                confirmButtonText: 'Tamam'
            });
        }
    });

    calculateButton.addEventListener("click", function() {
        const totalPrice = selections.reduce((total, selection) => {
            return total + (selection.amount * selection.price);
        }, 0);
        
        const formattedTotalPrice = formatCurrency(totalPrice);  // Toplam fiyatı TL formatında

    Swal.fire({
            title: 'Toplam Değer',
            text: `Toplam Değer: ${formattedTotalPrice} TL`,
            icon: 'info',
            confirmButtonText: 'Tamam'
        });});
    function formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    }

    function updateSelectionsList() {
        selectionsList.innerHTML = "";
        selections.forEach((selection, index) => {
            const totalValue = selection.amount * selection.price;
            const formattedTotalValue = formatCurrency(totalValue);  // Türk Lirası formatında
            const formattedPrice = formatCurrency(selection.price);  // Birim fiyatını da formatla

            const li = document.createElement("li");
            li.innerHTML = `
                ${selection.name}: ${selection.amount} adet x ${formattedPrice} = ${formattedTotalValue}
                <button class="btn-delete">Sil</button>
            `;
            
            li.querySelector(".btn-delete").addEventListener("click", () => deleteSelection(index));
            
            selectionsList.appendChild(li);
        });
    }


    function deleteSelection(index) {
        selections.splice(index, 1);
        updateSelectionsList();
        if (selections.length === 0) {
            savedSelectionsDiv.style.display = "none";
        }
        Swal.fire({
            icon: 'success',
            title: 'Silindi!',
            text: 'Seçim başarıyla silindi.',
            confirmButtonText: 'Tamam'
        });
    }
    const resetButton = document.getElementById("btn-reset");

    resetButton.addEventListener("click", function() {
        selections = [];
        updateSelectionsList();
        savedSelectionsDiv.style.display = "none";
        Swal.fire({
            icon: 'info',
            title: 'Temizlendi',
            text: 'Tüm seçimler temizlendi.',
            confirmButtonText: 'Tamam'
        });
    });

    function clearInputs() {
        selectElement.selectedIndex = 0;
        adetInput.value = "";
    }
