import { Resend } from "resend";

const { RESEND_TOKEN, BASE_URL } = process.env;

if (!RESEND_TOKEN) {
    throw new Error("RESEND_TOKEN is not defined.");
}

if (!BASE_URL) {
    throw new Error("BASE_URL is not defined.");
}

const resend = new Resend(RESEND_TOKEN);

export async function sendEmail({ email, code, type }) {
    try {
        const res = await resend.emails.send({
            from: "Alpaca <support@updates.mart1d4.dev>",
            to: email,
            subject:
                type === "password-reset"
                    ? "Reset your password"
                    : "Verify your email",
            html:
                type === "password-reset"
                    ? `<p>Click the link below to reset your password:</p>
                <a href="${BASE_URL}/reset-password?token=${code}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, you can ignore this email.</p>`
                    : type === "code"
                      ? `<p>Your verification code is: <b>${code}</b></p>`
                      : `
                <p>Click the link below to verify your email:</p>
                <a href="${BASE_URL}/verify-email/${code}">Verify Email</a>
            `,
        });
    } catch (error) {
        console.error(error);
    }
}
