# scripts

Utility scripts that are run manually (not part of the server).

| File | How to run | Purpose |
|------|------------|---------|
| `DDL.sql` | `mysql -u root -p < src/scripts/DDL.sql` | Creates the full SQL schema (tables, indexes, views). |
| `mongoValidation.js` | `node src/scripts/mongoValidation.js` | Applies JSON Schema validation and unique index to the MongoDB `audit_logs` collection. |
| `testMysqlConnection.js` | `node src/scripts/testMysqlConnection.js` | Quick check that MySQL credentials are correct. |
| `testMongoConnection.js` | `node src/scripts/testMongoConnection.js` | Quick check that MongoDB URI is correct. |
