import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
    },
});

export async function sendVerificationEmail(to: string, verifyUrl: string, name: string) {
    await transporter.sendMail({
        from: `"ThunderCoding" <${env.GMAIL_USER}>`,
        to,
        subject: "Ative sua conta na Thunder ⚡",
        html: activationEmailTemplate({
            name,
            url: verifyUrl.toString(),
        }),
    });
}

export function activationEmailTemplate({
    name,
    url,
}: {
    name: string;
    url: string;
}) {
    const firstName = name?.split(" ")[0] ?? "dev";

    return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ative sua conta</title>
  </head>

  <body style="margin:0;padding:0;background:#f8f7ff;font-family:Inter,Arial,sans-serif;color:#151225;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f8f7ff;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #e7e3f6;box-shadow:0 20px 50px rgba(90,65,220,.12);">

            <tr>
              <td style="padding:34px 32px;background:linear-gradient(135deg,#6d38f5 0%,#356df3 55%,#9b6df7 100%);color:#ffffff;">
                <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.16);font-size:12px;font-weight:700;margin-bottom:18px;">
                  ✨ Bem-vindo à Thunder
                </div>

                <h1 style="margin:0;font-size:32px;line-height:1.15;font-weight:900;">
                  Olá, ${firstName}!<br />
                  Ative sua conta
                </h1>

                <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,.92);">
                  Falta só confirmar seu email para liberar sua jornada, ganhar XP e começar a evoluir nas trilhas.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:18px;border-radius:20px;background:#f4f1ff;border:1px solid #e6ddff;">
                      <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#6d38f5;">
                        🚀 Próximo passo
                      </p>
                      <p style="margin:0;font-size:15px;line-height:1.6;color:#514b6b;">
                        Clique no botão abaixo para verificar seu email e ativar sua conta.
                      </p>
                    </td>
                  </tr>
                </table>

                <div style="text-align:center;margin:32px 0;">
                  <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#6d38f5,#356df3);color:#ffffff;text-decoration:none;font-size:16px;font-weight:900;padding:15px 28px;border-radius:999px;box-shadow:0 12px 28px rgba(109,56,245,.28);">
                    Ativar minha conta
                  </a>
                </div>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                  <tr>
                    <td width="33.3%" style="padding:12px;border-radius:16px;background:#fbfaff;border:1px solid #eee9ff;text-align:center;">
                      <div style="font-size:20px;font-weight:900;color:#6d38f5;">0 XP</div>
                      <div style="font-size:12px;color:#77718f;">comece hoje</div>
                    </td>
                    <td width="8"></td>
                    <td width="33.3%" style="padding:12px;border-radius:16px;background:#fbfaff;border:1px solid #eee9ff;text-align:center;">
                      <div style="font-size:20px;font-weight:900;color:#6d38f5;">Nível 1</div>
                      <div style="font-size:12px;color:#77718f;">sua jornada</div>
                    </td>
                    <td width="8"></td>
                    <td width="33.3%" style="padding:12px;border-radius:16px;background:#fbfaff;border:1px solid #eee9ff;text-align:center;">
                      <div style="font-size:20px;font-weight:900;color:#6d38f5;">0 dias</div>
                      <div style="font-size:12px;color:#77718f;">streak inicial</div>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#7a748f;">
                  Se o botão não funcionar, copie e cole este link no navegador:
                </p>

                <p style="margin:8px 0 0;padding:12px;border-radius:14px;background:#f5f3fb;border:1px solid #ebe7f5;font-size:12px;line-height:1.5;color:#5f5877;word-break:break-all;">
                  ${url}
                </p>

                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#9b95ad;">
                  Se você não criou essa conta, pode ignorar este email com segurança.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#fbfaff;border-top:1px solid #eee9ff;text-align:center;">
                <p style="margin:0;font-size:12px;color:#9b95ad;">
                  Thunder • Aprenda, pratique e suba de nível ⚡
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}