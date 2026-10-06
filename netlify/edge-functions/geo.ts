// Tells the home page's gage card roughly where the visitor is, so it can show a USGS gage nearby. Netlify works this out
// from the visitor's IP address at the edge. Only the country and a position rounded to a tenth of a degree (about 10 km) are
// returned; this function keeps nothing (Netlify itself meters and logs edge function calls). If Netlify has no answer, the fields
// are null, and the page falls back to the visitor's time zone, then to a default gage.
export default async (_request: Request, context: { geo?: { country?: { code?: string }; latitude?: number; longitude?: number } }) => {
  const g = context.geo ?? {}
  const round = (n?: number) => (typeof n === 'number' ? Math.round(n * 10) / 10 : null)
  return new Response(
    JSON.stringify({ country: g.country?.code ?? null, latitude: round(g.latitude), longitude: round(g.longitude) }),
    { headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } }
  )
}
export const config = { path: '/api/geo' }
