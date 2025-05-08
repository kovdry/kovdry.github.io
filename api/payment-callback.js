import crypto from "crypto";

const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

function verifyLiqpaySignature(data, signature) {
    const expected = crypto
        .createHash("sha1")
        .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
        .digest("base64");
    return expected === signature;
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
        const forwardRes = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ data, signature }),
        });

        if (forwardRes.ok) {
            res.status(200).send("Forwarded to Google Script");
        } else {
            res.status(502).send("Failed to forward to Google Script");
        }
    } catch (err) {
        console.error("Error forwarding to Google Script:", err);
        res.status(500).send("Internal error");
    }
}
