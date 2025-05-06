async function redirectToLiqpay() {
    const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: 250,
            description: "Футболка чорна, розмір L",
            order_id: "order_ABC123",
        }),
    });

    const { data, signature } = await response.json();

    // Створюємо форму
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
