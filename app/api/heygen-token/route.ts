// Intentionally disabled until a separately approved avatar stage.
export async function POST() {
  return Response.json({ error: 'provider_disabled' }, {
    status: 503, headers: { 'Cache-Control': 'private, no-store' },
  })
}
