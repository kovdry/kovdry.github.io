const redirectToLiqpay = async (e) => {
    const payload = {
        name: document.querySelector("#name").value,
        phone: document.querySelector("#phone").value,
        address: document.querySelector("#address").value,
        size: sizeSelect.value,
        color: colorSelect.value,
        amount: Number(amountInput.value),
    };

    const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const { data, signature, error } = await response.json();

    if (error) {
        alert("Помилка: " + error);
        return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.liqpay.ua/api/3/checkout";
    form.style.display = "none";

    form.innerHTML = `
        <input type="hidden" name="data" value="${data}">
        <input type="hidden" name="signature" value="${signature}">
    `;

    document.body.appendChild(form);
    form.submit();
};


const amountInput = document.querySelector('#amountInput');
const decrementButton = document.querySelector('#decrement');
const incrementButton = document.querySelector('#increment');
const totalPrice = document.querySelector('#price');
const colorSelect = document.querySelector('#color');
const sizeSelect = document.querySelector('#size');

let amount = 1;
let sizePrice = 950;
let colorPrice = 0;
let price = (sizePrice + colorPrice) * amount;
let color = 'Сірий';
let size = '155x210';

amountInput.value = amount;
totalPrice.innerHTML = (sizePrice + colorPrice) * amount + ' грн';

function validateNumber(str) {
    if (typeof str !== "string") return false
    const num = Number(str)
    return !isNaN(num) && Number.isInteger(num) && num > 0
}

function updatePrice() {
    price = (sizePrice + colorPrice) * amount;
    totalPrice.innerHTML = price + ' грн';
}

colorSelect.addEventListener('change', (e) => {
    switch (e.target.value) {
        case 'grey':
            color = 'Сірий';
            colorPrice = 0;
            break;
        case 'chocolate':
            color = 'Шоколад';
            colorPrice = 100;
            break;
        case 'blue':
            color = 'Блакитний';
            colorPrice = 150;
            break;
    }

    updatePrice();
})

sizeSelect.addEventListener('change', (e) => {
    switch (e.target.value) {
        case '155x210':
            size = '155x210';
            sizePrice = 950;
            break;
        case '175x210':
            size = '175x210';
            sizePrice = 1250;
            break;
        case '200x220':
            size = '200x220';
            sizePrice = 1500;
            break;
    }

    updatePrice();
})

amountInput.addEventListener('change', () => {
    const inputedAmount = amountInput.value;

    if (validateNumber(inputedAmount)) {
        amount = Number(inputedAmount);
        amountInput.value = amount;
    }
    else {
        amount = 1;
        amountInput.value = amount;
    }

    updatePrice();
})

decrementButton.addEventListener('click', () => {
    if (amount > 1) {
        amount--;
        amountInput.value = amount;

        updatePrice();
    }
})

incrementButton.addEventListener('click', () => {
    amount++;
    amountInput.value = amount;

    updatePrice();
})