const resend = require("../config/resend");
const logger = require("../config/logger");
const usuarioRepo = require("../repositories/usuario.repository");

const enviar = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Error al enviar email: ${error.message}`);
};

const enviarVerificacion = async (usuario, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/confirmar?token=${token}`;

  await enviar({
    to: usuario.correo,
    subject: "Verificá tu cuenta — Apple Store",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
        <h2 style="color:#1d1d1f;margin-bottom:8px;">Hola, ${usuario.nombreUsuario}</h2>
        <p style="color:#3a3a3c;line-height:1.6;">
          Gracias por registrarte. Para activar tu cuenta hacé clic en el botón de abajo.
          El enlace vence en <strong>24 horas</strong>.
        </p>
        <a href="${url}"
           style="display:inline-block;margin-top:24px;padding:12px 28px;background:#0071e3;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Verificar cuenta
        </a>
        <p style="margin-top:32px;color:#8e8e93;font-size:13px;">
          Si no creaste esta cuenta podés ignorar este correo.
        </p>
      </div>
    `,
  });
};

const enviarResetPassword = async (usuario, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  await enviar({
    to: usuario.correo,
    subject: "Restablecé tu contraseña — Apple Store",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
        <h2 style="color:#1d1d1f;margin-bottom:8px;">Hola, ${usuario.nombreUsuario}</h2>
        <p style="color:#3a3a3c;line-height:1.6;">
          Recibimos una solicitud para restablecer tu contraseña.
          El enlace vence en <strong>15 minutos</strong>.
        </p>
        <a href="${url}"
           style="display:inline-block;margin-top:24px;padding:12px 28px;background:#0071e3;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Restablecer contraseña
        </a>
        <p style="margin-top:32px;color:#8e8e93;font-size:13px;">
          Si no solicitaste este cambio podés ignorar este correo. Tu contraseña no se modificará.
        </p>
      </div>
    `,
  });
};

const enviarNotificacionNuevoProducto = async (producto) => {
  const usuarios = await usuarioRepo.findActivos();
  if (!usuarios.length) return;

  const url = `${process.env.FRONTEND_URL}/productos/${producto._id}`;

  const resultados = await Promise.allSettled(
    usuarios.map((usuario) =>
      enviar({
        to: usuario.correo,
        subject: `Nuevo producto disponible — ${producto.nombreProducto}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
            <h2 style="color:#1d1d1f;margin-bottom:8px;">Hola, ${usuario.nombreUsuario}</h2>
            <p style="color:#3a3a3c;line-height:1.6;">
              Hay un nuevo producto disponible en el catálogo que podría interesarte.
            </p>
            <div style="margin:24px 0;padding:16px;background:#fff;border-radius:8px;border:1px solid #e5e5ea;">
              <h3 style="margin:0 0 8px;color:#1d1d1f;text-transform:capitalize;">${producto.nombreProducto}</h3>
              <p style="margin:0 0 4px;color:#3a3a3c;font-size:14px;">${producto.descripcion}</p>
              <p style="margin:8px 0 0;color:#0071e3;font-weight:700;font-size:18px;">
                $${producto.precio.toLocaleString("es-AR")}
              </p>
            </div>
            <a href="${url}"
               style="display:inline-block;padding:12px 28px;background:#0071e3;color:#fff;
                      text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
              Ver producto
            </a>
          </div>
        `,
      })
    )
  );

  const fallidos = resultados.filter((r) => r.status === "rejected");
  if (fallidos.length) {
    logger.warn(`Notificación de nuevo producto: ${fallidos.length} emails fallaron de ${usuarios.length}`);
  }
};

module.exports = { enviarVerificacion, enviarResetPassword, enviarNotificacionNuevoProducto };
