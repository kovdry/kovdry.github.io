import crypto from "crypto";

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;

const sizePrices = {
    '155x210': 950,
    '175x210': 1250,
    '200x220': 1500,
};

const colorPrices = {
    grey: 0,
    chocolate: 100,
    blue: 150,
};

function encodeOrderId(formData) {
    const json = JSON.stringify(formData);
    return Buffer.from(json).toString("base64");
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { name, phone, address, size, color, amount } = req.body;

    if (
        !name || !phone || !address ||
        !(size in sizePrices) ||
        !(color in colorPrices) ||
        !Number.isInteger(amount) || amount < 1
    ) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    const unitPrice = sizePrices[size] + colorPrices[color];
    const total = unitPrice * amount;

    const readableColor = {
        grey: "Сірий",
        chocolate: "Шоколад",
        blue: "Блакитний",
    }[color];

    const description = 'Оплата за товар';

    const order_id = encodeOrderId({
        name,
        phone,
        address,
        size,
        color,
        amount,
        total,
    });

    const params = {
        public_key: LIQPAY_PUBLIC_KEY,
        version: "3",
        action: "pay",
        amount: total,
        currency: "UAH",
        description,
        order_id,
        result_url: "https://kovdry-github-io.vercel.app/",
        server_url: "https://kovdry-github-io.vercel.app/api/payment-callback",
    };

    const data = Buffer.from(JSON.stringify(params)).toString("base64");
    const signature = crypto
        .createHash("sha1")
        .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
        .digest("base64");

    return res.status(200).json({ data, signature });
}
