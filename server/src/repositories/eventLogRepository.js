const { exec } = require("./db");

/**
 * Inserts one event log row.
 *
 * @param {import("pg").PoolClient|null} client
 * @param {{
 *   ts?: string|Date,
 *   level?: "debug"|"info"|"warn"|"error",
 *   event: string,
 *   requestId?: string,
 *   actorUserId?: number|null,
 *   actorPersonId?: number|null,
 *   method?: string|null,
 *   path?: string|null,
 *   status?: number|null,
 *   ip?: string|null,
 *   userAgent?: string|null,
 *   payload?: any
 * }} input
 * @returns {Promise<void>}
 */
async function insert(client, input) {
  const {
    ts,
    level = "info",
    event,
    requestId,
    actorUserId = null,
    actorPersonId = null,
    method = null,
    path = null,
    status = null,
    ip = null,
    userAgent = null,
    payload = null,
  } = input;

  await exec(
    client,
    `
    INSERT INTO public.event_log (
      ts, level, event, request_id,
      actor_user_id, actor_person_id,
      method, path, status, ip, user_agent, payload
    )
    VALUES (
      COALESCE($1::timestamptz, NOW()),
      $2, $3, $4,
      $5, $6,
      $7, $8, $9, $10, $11,
      $12::jsonb
    )
    `,
    [
      ts ? new Date(ts).toISOString() : null,
      level,
      event,
      requestId || null,
      actorUserId,
      actorPersonId,
      method,
      path,
      status,
      ip,
      userAgent,
      payload === undefined ? null : JSON.stringify(payload),
    ]
  );
}

/**
 * Queries logs with optional filters + pagination.
 *
 * @param {{
 *   from?: string,
 *   to?: string,
 *   level?: string,
 *   event?: string,
 *   requestId?: string,
 *   actorUserId?: number,
 *   limit?: number,
 *   offset?: number
 * }} q
 * @returns {Promise<Array<{
 *   id:number,
 *   ts:string|Date,
 *   level:string,
 *   event:string,
 *   request_id:string|null,
 *   actor_user_id:number|null,
 *   actor_person_id:number|null,
 *   method:string|null,
 *   path:string|null,
 *   status:number|null,
 *   ip:string|null,
 *   user_agent:string|null,
 *   payload:any
 * }>>}
 */
async function list(q = {}) {
  const {
    from,
    to,
    level,
    event,
    requestId,
    actorUserId,
    limit = 100,
    offset = 0,
  } = q;

  const where = [];
  const params = [];
  let i = 1;

  if (from) { where.push(`ts >= $${i++}::timestamptz`); params.push(from); }
  if (to)   { where.push(`ts <= $${i++}::timestamptz`); params.push(to); }
  if (level){ where.push(`level = $${i++}`); params.push(level); }
  if (event){ where.push(`event = $${i++}`); params.push(event); }
  if (requestId){ where.push(`request_id = $${i++}`); params.push(requestId); }
  if (actorUserId){ where.push(`actor_user_id = $${i++}`); params.push(actorUserId); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const r = await exec(
    null,
    `
      SELECT
        id, ts, level, event, request_id,
        actor_user_id, actor_person_id,
        method, path, status, ip, user_agent,
        payload
      FROM public.event_log
      ${whereSql}
      ORDER BY ts DESC, id DESC
      LIMIT $${i++} OFFSET $${i++}
    `,
    [...params, limit, offset]
  );

  return r.rows;
}

module.exports = {
  eventLogRepository: {
    insert,
    list,
  },
};