const { Resend } = require("resend");
const { RESEND_API_KEY, FRONTEND_URL, RESEND_TEST_TO_EMAIL, RESEND_FROM_EMAIL, NODE_ENV } = require("../../config/misc/constants");

const resend = new Resend(RESEND_API_KEY);

const sendActivationEmail = async (email, activationToken) => {
    const activationUrl = `${FRONTEND_URL}/activate/${activationToken}`;

    await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: NODE_ENV === "production" ? email : RESEND_TEST_TO_EMAIL,
        subject: "Activa tu cuenta en Obraction",
        html: `
        <h1>Bienvenido a Obraction</h1>
        <p>Haz click en el enlace para activar tu cuenta:</p>
        <p><a href="${activationUrl}">Activar cuenta</a></p>
        <p>El enlace expira en 24h.</p>
        `
    })
}

module.exports = {
    sendActivationEmail
}