const sanitizarTexto = (texto) =>
  (texto ?? "").replace(/<[^>]*>/g, "").trim();

module.exports = sanitizarTexto;
