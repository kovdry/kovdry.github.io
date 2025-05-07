async function redirectToLiqpay() {
    const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: 2,
            description: "Футболка чорна, розмір L",
            // order_id: "order_ABC123",
        }),
    });

    const { data, signature } = await response.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.liqpay.ua/api/3/checkout";
    form.style.display = "none";

    const dataInput = document.createElement("input");
    dataInput.type = "hidden";
    dataInput.name = "data";
    dataInput.value = data;

    const sigInput = document.createElement("input");
    sigInput.type = "hidden";
    sigInput.name = "signature";
    sigInput.value = signature;

    form.appendChild(dataInput);
    form.appendChild(sigInput);
    document.body.appendChild(form);

    form.submit();
}

const amountInput = document.querySelector('#amountInput');
const decrementButton = document.querySelector('#decrement');
const incrementButton = document.querySelector('#increment');

amountInput.value = 1;

function validateNumber(str) {
    if (typeof str !== "string") return false
    const num = Number(str)
    return !isNaN(num) && Number.isInteger(num) && num > 0
}

amountInput.addEventListener('change', () => {
    const amount = amountInput.value;

    if (validateNumber(amount)) {
        amountInput.value = amount;
    }
    else {
        amountInput.value = 1;
    }
})

decrementButton.addEventListener('click', () => {
    const amount = amountInput.value;

    if (amount > 1) {
        amountInput.value--;
    }
})

incrementButton.addEventListener('click', () => {
    amountInput.value++;
})
