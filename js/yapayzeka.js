const slides = document.querySelectorAll('.slide');
let currentIndex = 0;

function showSlide(index) {
    if (index >= slides.length) {
        currentIndex = 0;
    } else if (index < 0) {
        currentIndex = slides.length - 1;
    } else {
        currentIndex = index;
    }

    const offset = -currentIndex * 100; // Her slayt %100 genişliğe sahip olduğu için
    document.querySelector('.slider').style.transform = `translateX(${offset}%)`;
}

document.querySelector('.next').addEventListener('click', () => {
    showSlide(currentIndex + 1);
});

document.querySelector('.prev').addEventListener('click', () => {
    showSlide(currentIndex - 1);
});

// Otomatik kaydırma
setInterval(() => {
    showSlide(currentIndex + 1);
}, 3000);

// Döviz tahminlerini almak için API çağrısı
async function getCurrencyForecast(name, adet) {
    const apiUrl = 'http://127.0.0.1:5000/yapayzeka-tahmin';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ name: name, amount: parseFloat(adet) }])
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error('API isteği başarısız oldu: ' + errorText);
    }

    return await response.json();
}

// Tahmin butonuna tıklama olayı
document.getElementById('btn-yapayzeka').addEventListener('click', async function () {
    // Onay mesajını göster
    const { value: accepted } = await Swal.fire({
        title: 'Yatırım Tavsiyesi Olmadığına Dair Bilgilendirme',
        text: "Bu tahmin, yatırım tavsiyesi niteliği taşımamaktadır. Lütfen devam etmeden önce bu durumu kabul ettiğinizi onaylayınız.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Kabul Ediyorum',
        cancelButtonText: 'İptal'
    });

    if (!accepted) {
        return; // Kullanıcı onaylamazsa işlem yapma
    }

    console.log('Seçimler:', selections); // Seçimlerin içeriği

    if (selections.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Lütfen en az bir varlık ekleyin.',
            confirmButtonText: 'Tamam',
            customClass: {
                title: 'my-title-class',
                content: 'my-content-class'
            }
        });
        return;
    }

    Swal.fire({
        title: 'Yükleniyor...',
        html: 'Tahmin yapılıyor, lütfen bekleyiniz. Eğer beklenmedik bir hata alırsanız lütfen tekrar deneyiniz.',
        onBeforeOpen: () => {
            Swal.showLoading();
        },
        customClass: {
            title: 'loading-title',
            content: 'loading-content'
        }
    });

    try {
        const responses = await Promise.all(selections.map(selection => 
            getCurrencyForecast(selection.name, selection.amount)
        ));

        console.log('Yanıtlar:', responses); // API yanıtlarını kontrol et

        let resultHtml = responses.map((data, index) => {
            
            return `<p>${selections[index].amount} ${selections[index].name}'nin 1 YIL sonraki tahmini değeri  🚀 ${data.tahmini_deger}</p>`; // Use the correct key
        }).join('');

        // Add total estimated value to the result

      
        Swal.fire({
            title: 'Tahmin Sonucu',
            html: resultHtml,
            icon: 'success'
        }); 

    } catch (error) {
        console.error('Hata:', error);
        Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: error.message,
        });
    }
});
