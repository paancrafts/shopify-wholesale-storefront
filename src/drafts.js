import 'isomorphic-fetch'

export async function createDraftCart(data = {}) {

  const response = await fetch('/api/draftcart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  return await response.json();

}
