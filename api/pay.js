import crypto from "crypto";

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;
const ENCRYPTION_KEY = Buffer.from(process.env.ORDER_ENCRYPTION_KEY, "hex");

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

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return iv.toString("base64") + ":" + encrypted;
}

function encryptOrderId(formData) {
    const json = JSON.stringify(formData);
    return encrypt(json);
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { name, phone, address, size, color, quantity } = req.body;

    if (
        !name || !phone || !address ||
        !(size in sizePrices) ||
        !(color in colorPrices) ||
        !Number.isInteger(quantity) || quantity < 1
    ) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    const unitPrice = sizePrices[size] + colorPrices[color];
    const total = unitPrice * quantity;

    const readableColor = {
        grey: "Сірий",
        chocolate: "Шоколад",
        blue: "Блакитний"
    }[color];

    const order_id = encryptOrderId({ name, phone, address, size, color: readableColor, quantity, total });

    const params = {
        public_key: LIQPAY_PUBLIC_KEY,
        version: "3",
        action: "pay",
        amount: total,
        currency: "UAH",
        description: "Оплата за товар",
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
