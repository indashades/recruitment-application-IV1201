const { exec } = require("./db");

/**
 * Creates a one-time account recovery token row.
 *
 * @param {import("pg").PoolClient} client
 * @param {{
 *   userId:number,
 *   tokenHash:string,
 *   purpose:"set_password"|"reset_password",
 *   expiresAt:Date,
 *   requestIp?:string|null,
 *   requestUserAgent?:string|null
 * }} input
 * @returns {Promise<{id:number, user_id:number, purpose:string, expires_at:string, used_at:string|null, created_at:string}>}
 */
async function create(client, { userId, tokenHash, purpose, expiresAt, requestIp = null, requestUserAgent = null }) {
  const r = await exec(
    client,
    `
      INSERT INTO auth_recovery_token (
        user_id,
        token_hash,
        purpose,
        expires_at,
        request_ip,
        request_user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, purpose, expires_at, used_at, created_at
    `,
    [userId, tokenHash, purpose, expiresAt, requestIp, requestUserAgent]
  );
  return r.rows[0];
}

/**
 * Consumes a token hash if it is valid (unused + unexpired) and returns token metadata.
 *
 * @param {import("pg").PoolClient} client
 * @param {string} tokenHash
 * @returns {Promise<null|{id:number, user_id:number, purpose:string, expires_at:string, created_at:string}>}
 */
async function consumeActiveByTokenHash(client, tokenHash) {
  const r = await exec(
    client,
    `
      UPDATE auth_recovery_token
      SET used_at = NOW()
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > NOW()
      RETURNING id, user_id, purpose, expires_at, created_at
    `,
    [tokenHash]
  );
  return r.rows[0] || null;
}

/**
 * Invalidates all other active tokens for a user.
 *
 * @param {import("pg").PoolClient} client
 * @param {number} userId
 * @param {{excludeId?:number|null}} [opts]
 * @returns {Promise<void>}
 */
async function invalidateActiveTokensForUser(client, userId, opts = {}) {
  const excludeId = opts.excludeId || null;
  if (excludeId) {
    await exec(
      client,
      `
        UPDATE auth_recovery_token
        SET used_at = NOW()
        WHERE user_id = $1
          AND used_at IS NULL
          AND expires_at > NOW()
          AND id <> $2
      `,
      [userId, excludeId]
    );
    return;
  }

  await exec(
    client,
    `
      UPDATE auth_recovery_token
      SET used_at = NOW()
      WHERE user_id = $1
        AND used_at IS NULL
        AND expires_at > NOW()
    `,
    [userId]
  );
}

module.exports = { recoveryTokenRepository: { create, consumeActiveByTokenHash, invalidateActiveTokensForUser } };