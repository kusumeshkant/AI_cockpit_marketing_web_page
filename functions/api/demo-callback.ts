/**
 * POST /api/demo-callback — a do-nothing agent callback for the Play review.
 *
 * The Play reviewer's demo agent in AI Cockpit needs a public https callback
 * URL, because approving an action sends the decision there. This endpoint
 * accepts that delivery and throws it away so the app shows it as delivered.
 *
 * It stores nothing, logs nothing (not even an event code), never reads the
 * request body and returns no content. Any other method gets 405.
 */

const NO_STORE = { 'Cache-Control': 'no-store' };

export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { ...NO_STORE, Allow: 'POST' } });
  }
  // Discard the decision unread.
  await request.body?.cancel();
  return new Response(null, { status: 204, headers: NO_STORE });
};
