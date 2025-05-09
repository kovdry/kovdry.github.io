import crypto from "crypto";

const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const ENCRYPTION_KEY = Buffer.from(process.env.ORDER_ENCRYPTION_KEY, "hex");

function verifyLiqpaySignature(data, signature) {
    const expected = crypto
        .createHash("sha1")
        .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
        .digest("base64");
    return expected === signature;
}

function decrypt(text) {
    const [ivBase64, encrypted] = text.split(":");
    const iv = Buffer.from(ivBase64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).send("Only POST allowed");
        return;
    }

    const { data, signature } = req.body;

    if (!verifyLiqpaySignature(data, signature)) {
        res.status(403).send("Invalid signature");
        return;
    }

    try {
        const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf8"));

        if (decoded.order_id) {
            try {
                const decrypted = decrypt(decoded.order_id);
                const order = JSON.parse(decrypted);
                decoded.name = order.name;
                decoded.phone = order.phone;
                decoded.address = order.address;
                decoded.size = order.size;
                decoded.color = order.color;
                decoded.quantity = order.quantity;
            } catch (err) {
                console.error("Decryption error:", err);
            }
        }

        const forwardRes = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ data: Buffer.from(JSON.stringify(decoded)).toString("base64"), signature }),
        });

        forwardRes.ok ? res.status(200).send("Forwarded to Google Script") : res.status(502).send("Failed to forward to Google Script");
    } catch (err) {
        console.error("Error forwarding to Google Script:", err);
        res.status(500).send("Internal error");
    }
}
