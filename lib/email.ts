import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? "Segnalazioni Hotel <noreply@example.com>";
const issueSubject = process.env.EMAIL_SUBJECT_ISSUE ?? "Nuova segnalazione da un ospite";

const resendClient = resendKey ? new Resend(resendKey) : null;

type SendIssueEmailParams = {
  to: string;
  structureName: string;
  message: string;
  guestInfo?: string | null;
  createdAt: string;
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return dateString;
  }
};

export const sendIssueEmail = async ({
  to,
  structureName,
  message,
  guestInfo,
  createdAt,
}: SendIssueEmailParams) => {
  if (!to) {
    console.warn("[email] Destinatario email non valido:", to);
    return;
  }

  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY non configurata, email disabilitate.");
    return;
  }

  console.log(`[email] Invio email a ${to} per struttura ${structureName}...`);

  try {
    const formattedDate = formatDate(createdAt);
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: #1E3A8A;">Nuova segnalazione da un ospite</h2>
        <p><strong>Struttura:</strong> ${structureName}</p>
        <p><strong>Messaggio:</strong><br/>${message}</p>
        <p><strong>Info ospite:</strong> ${guestInfo ?? "Non specificato"}</p>
        <p><strong>Data:</strong> ${formattedDate}</p>
      </div>
    `;

    const textContent = [
      `Nuova segnalazione da un ospite`,
      `Struttura: ${structureName}`,
      `Messaggio: ${message}`,
      `Info ospite: ${guestInfo ?? "Non specificato"}`,
      `Data: ${formattedDate}`,
    ].join("\n");

    const result = await resendClient.emails.send({
      from: emailFrom,
      to,
      subject: issueSubject,
      html: htmlContent,
      text: textContent,
    });

    console.log(`[email] Email inviata con successo a ${to}. ID:`, result.data?.id);
  } catch (error) {
    console.error(`[email] Invio email fallito verso ${to}:`, error);
    if (error instanceof Error) {
      console.error(`[email] Dettagli errore:`, error.message);
    }
  }
};

