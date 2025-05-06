import crypto from "crypto";

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    const { amount, description, order_id } = req.body;

    const params = {
        public_key: LIQPAY_PUBLIC_KEY,
        version: "3",
        action: "pay",
        amount,
        currency: "UAH",
        description,
        order_id,
        result_url: "https://yourdomain.com/success",
    };

    const data = Buffer.from(JSON.stringify(params)).toString("base64");
    const signature = crypto
        .createHash("sha1")
        .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
        .digest("base64");

    res.status(200).json({ data, signature });
}
