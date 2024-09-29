const { BASE_URL } = process.env;

export const PasswordResetTemplate = ({ code }) => (
    <div>
        <h1>Click the link below to reset your password:</h1>

        <a href={`${BASE_URL}/reset-password?token=${code}`}>Reset Password</a>

        <p>This link will expire in 1 hour.</p>

        <p>If you didn't request a password reset, you can ignore this email.</p>

        <EmailFooter />
    </div>
);

export const EmailCodeTemplate = ({ code }) => (
    <div>
        <h1>Your verification code is: {code}</h1>

        <EmailFooter />
    </div>
);

export const EmailVerifyTemplate = ({ code }) => (
    <div>
        <h1>Click the link below to verify your email:</h1>

        <a href={`${BASE_URL}/verify-email/${code}`}>Verify Email</a>

        <EmailFooter />
    </div>
);

export const PasswordChangedTemplate = () => (
    <div>
        <h1>Password changed</h1>

        <p>
            Your password has been changed. If you did not make this change, please reset your
            password immediately. If you need help, please contact us at{" "}
            <a href="mailto:support@alpaca.llama.coop">support@alpaca.llama.coop</a>.
        </p>

        <EmailFooter />
    </div>
);

export const EmailFooter = () => (
    <div>
        <p>
            Alpaca is a product of <a href="https://llama.coop">LLAMA LLC</a>.
        </p>

        <p>
            If you have any questions, please contact us at{" "}
            <a href="mailto:support@alpaca.llama.coop">support@alpaca.llama.coop</a>.
        </p>

        <p>
            You are receiving this email because you signed up for an Alpaca account. If you did not
            sign up, please ignore this email.
        </p>

        <p>Sent the {new Date().toLocaleString("en-US", { timeZone: "UTC" })}</p>
    </div>
);
