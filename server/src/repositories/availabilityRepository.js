const { exec } = require("./db");

async function bulkInsert(client, applicationId, availability) {
  if (!Array.isArray(availability) || availability.length === 0) return;

  const values = [];
  const params = [];
  let i = 1;

  for (const a of availability) {
    values.push(`($${i++}, $${i++}, $${i++})`);
    params.push(applicationId, a.fromDate, a.toDate);
  }

  await exec(
    client,
    `INSERT INTO availability (application_id, from_date, to_date)
     VALUES ${values.join(", ")}`,
    params
  );
}

module.exports = {
  availabilityRepository: {
    bulkInsert,
  },
};
