/**
 * Helper para hacer peticiones fetch con autenticación incluida
 * Asegura que las cookies se envíen correctamente
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: "include", // Incluir cookies en la petición
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
}




