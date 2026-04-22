const AppError = require("../helpers/AppError");
const authService = require("../services/auth.service");
const emailService = require("../services/email.service");
const logger = require("../config/logger");
const { REFRESH_COOKIE_OPTIONS } = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const { usuario, tokenVerificacion } = await authService.registrar(req.body);

    try {
      await emailService.enviarVerificacion(usuario, tokenVerificacion);
    } catch (emailErr) {
      logger.error("Error enviando email de verificación", { error: emailErr.message });
    }

    res.status(201).json({
      usuario,
      message: "Cuenta creada. Revisá tu correo para verificar tu cuenta.",
    });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { correo, contraseña } = req.body;
    const { usuario, accessToken, refreshToken } = await authService.login(correo, contraseña);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ usuario, accessToken });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return next(new AppError("Refresh token no proporcionado", 401));

    const { usuario, accessToken, refreshToken: newToken } = await authService.refresh(refreshToken);

    res.cookie("refreshToken", newToken, REFRESH_COOKIE_OPTIONS);
    res.json({ usuario, accessToken });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const logout = (_req, res) => {
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.json({ message: "Sesión cerrada correctamente" });
};

const confirmarEmail = async (req, res, next) => {
  try {
    await authService.confirmarEmail(req.params.token);
    res.json({ message: "Correo verificado correctamente. Ya podés iniciar sesión." });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const resultado = await authService.solicitarResetPassword(req.body.correo);

    if (resultado) {
      try {
        await emailService.enviarResetPassword(resultado.usuario, resultado.resetToken);
      } catch (emailErr) {
        logger.error("Error enviando email de reset", { error: emailErr.message });
      }
    }

    res.json({ message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña." });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.contraseña);
    res.json({ message: "Contraseña restablecida correctamente. Ya podés iniciar sesión." });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

const reenviarVerificacion = async (req, res, next) => {
  try {
    const resultado = await authService.reenviarVerificacion(req.body.correo);

    if (resultado) {
      try {
        await emailService.enviarVerificacion(resultado.usuario, resultado.tokenVerificacion);
      } catch (emailErr) {
        logger.error("Error reenviando email de verificación", { error: emailErr.message });
      }
    }

    res.json({ message: "Si el correo existe y no está verificado, recibirás un nuevo enlace." });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};

module.exports = { register, login, refresh, logout, confirmarEmail, reenviarVerificacion, forgotPassword, resetPassword };
