const sanitizarTexto = require("../../../src/helpers/sanitizarTexto");

describe("Helper: sanitizarTexto", () => {
  test("Debe eliminar etiquetas HTML", () => {
    expect(sanitizarTexto("<b>Hola</b>")).toBe("Hola");
  });

  test("Debe eliminar etiquetas script (el contenido entre tags queda sin tags)", () => {
    expect(sanitizarTexto('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  test("Debe eliminar atributos de evento (ej: onerror) junto con la etiqueta", () => {
    expect(sanitizarTexto('<img onerror="alert(1)">Texto')).toBe("Texto");
  });

  test("Debe hacer trim del resultado", () => {
    expect(sanitizarTexto("  texto  ")).toBe("texto");
  });

  test("Debe preservar texto sin etiquetas", () => {
    expect(sanitizarTexto("Texto normal")).toBe("Texto normal");
  });

  test("Debe manejar string vacío", () => {
    expect(sanitizarTexto("")).toBe("");
  });

  test("Debe eliminar múltiples etiquetas anidadas", () => {
    expect(sanitizarTexto("<div><p>Contenido</p></div>")).toBe("Contenido");
  });

  test("Debe preservar caracteres especiales no HTML", () => {
    expect(sanitizarTexto("Precio: $999 & disponible")).toBe("Precio: $999 & disponible");
  });
});
