import postgres from "postgres";

/**
 * Single shared postgres client.
 * DATABASE_URL must be set in the environment — never hardcoded.
 * Example: postgres://user:pass@localhost:5432/bookworm
 */
const sql = postgres(process.env.DATABASE_URL, {
  // Reuse connections across requests in long-running server processes
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export default sql;
