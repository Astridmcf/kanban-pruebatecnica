const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, options);

  if (!res.ok) {
    const errorInfo = await res.json();
    throw new Error(errorInfo.message || 'An error occurred while fetching the data.');
  }

  // Para respuestas sin contenido (ej. DELETE)
  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}
