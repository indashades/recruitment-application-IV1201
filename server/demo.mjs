const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000/api/v1";

async function http(path, { method = "GET", token, body } = {}) {
  const headers = { "Accept": "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  console.log("==> GET /health");
  console.log(await http("/health"));

  const uniq = `${Date.now()}`;
  const username = `demo_${uniq}`;
  const password = "SuperSecret123!";
  const registerBody = {
    username,
    password,
    firstName: "Demo",
    lastName: "Applicant",
    email: `${username}@example.com`,
    personnummer: "19900101-1234",
  };

  console.log("\n==> POST /auth/register");
  console.log(await http("/auth/register", { method: "POST", body: registerBody }));

  console.log("\n==> POST /auth/login");
  const loginRes = await http("/auth/login", {
    method: "POST",
    body: { username, password },
  });
  console.log(loginRes);

  const token = loginRes?.data?.token;
  if (!token) throw new Error("No token returned from /auth/login (expected data.token)");

  console.log("\n==> GET /auth/me");
  console.log(await http("/auth/me", { token }));

  console.log("\n==> GET /competences");
  const compRes = await http("/competences");
  console.log(compRes);

  const firstCompetenceId = compRes?.data?.[0]?.id;
  if (!firstCompetenceId) {
    throw new Error("No competences returned from /competences (need at least 1)");
  }

  const submitBody = {
    competences: [{ competenceId: firstCompetenceId, yearsOfExperience: 2.5 }],
    availability: [
      { fromDate: "2026-03-01T00:00:00.000Z", toDate: "2026-03-15T00:00:00.000Z" },
    ],
  };

  console.log("\n==> POST /applications (submit application)");
  const submitRes = await http("/applications", { method: "POST", token, body: submitBody });
  console.log(submitRes);

  console.log("\nDone");
})().catch((e) => {
  console.error("\nDemo failed");
  console.error("Status:", e.status);
  console.error("Body:", e.body);
  console.error(e);
  process.exit(1);
});