export async function apiGet(path) {
  const response = await fetch(`http://${window.location.hostname}:3001${path}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function apiPost(path, body = {}) {
  const response = await fetch(`http://${window.location.hostname}:3001${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
