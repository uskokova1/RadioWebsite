import nodemailer from "nodemailer";

const EMAIL     = process.env.EMAIL;
const EMAIL_PWD = process.env.EMAIL_PWD;

export const mailerConfigured = Boolean(EMAIL && EMAIL_PWD);

if (!mailerConfigured) {
    console.warn(
        '\n[nodemailer] EMAIL and/or EMAIL_PWD missing in server/.env — ' +
        'mail features (welcome / verify / reset) will be skipped.\n' +
        '  EMAIL=your.gmail@gmail.com\n' +
        '  EMAIL_PWD=<16-char Gmail App Password>\n'
    );
}

const transporter = mailerConfigured
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL, pass: EMAIL_PWD }, // 16-char App Password
    })
    : null;

// Safe wrapper — never throws. Returns true on success, false on failure or
// when the mailer isn't configured. Use this everywhere instead of
// transporter.sendMail directly so a single missing env var can't take down
// account creation or password reset.
export const sendMail = async (options) => {
    if (!transporter) return false;
    try {
        await transporter.sendMail(options);
        return true;
    } catch (err) {
        console.error('[nodemailer] sendMail failed:', err.message);
        return false;
    }
};

export default transporter;
