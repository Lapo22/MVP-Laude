import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.RESEND_FROM_EMAIL;
const issueSubject = process.env.EMAIL_SUBJECT_ISSUE ?? "Nuova segnalazione da un ospite";

// Log env status (without exposing values)
console.log("[email] Environment check:", {
  hasResendKey: !!resendKey,
  hasFromEmail: !!emailFrom,
});

if (!resendKey) {
  console.warn("[email] RESEND_API_KEY non configurata, email disabilitate.");
}

if (!emailFrom) {
  console.warn("[email] RESEND_FROM_EMAIL non configurata, email non possono essere inviate.");
}

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
}: SendIssueEmailParams): Promise<{ success: boolean; error?: string }> => {
  if (!to) {
    const error = "Destinatario email non valido";
    console.error("[ISSUE_EMAIL_ERROR] Destinatario mancante");
    return { success: false, error };
  }

  if (!resendClient) {
    const error = "RESEND_API_KEY non configurata";
    console.error("[ISSUE_EMAIL_ERROR]", error);
    return { success: false, error };
  }

  if (!emailFrom) {
    const error = "RESEND_FROM_EMAIL non configurata";
    console.error("[ISSUE_EMAIL_ERROR]", error);
    return { success: false, error };
  }

  console.log(`[ISSUE_EMAIL] Invio email a ${to} per struttura ${structureName}...`);

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

    // Check for Resend API errors in response
    if (result.error) {
      const error = `Resend API error: ${JSON.stringify(result.error)}`;
      console.error("[ISSUE_EMAIL_ERROR]", error);
      return { success: false, error };
    }

    console.log(`[ISSUE_EMAIL] Email inviata con successo a ${to}. ID:`, result.data?.id);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ISSUE_EMAIL_ERROR] Invio email fallito verso ${to}:`, errorMessage);
    
    // Log full error details for debugging (server-side only)
    if (error instanceof Error) {
      console.error("[ISSUE_EMAIL_ERROR] Stack:", error.stack);
    }
    
    return { success: false, error: "EMAIL_SEND_FAILED" };
  }
};
