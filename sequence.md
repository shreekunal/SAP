# Sequence Implementation in SAP CAP

## Overview
Sequences in SAP CAP are used to generate unique, incremental numeric values, typically for primary keys or order numbers. They are defined as HANA database artifacts (`.hdbsequence` files) and deployed via HDI (HANA Deployment Infrastructure).

## Files Involved
- **Definition File**: `pro2/db/src/ORDER_ID_SEQUENCE.hdbsequence`
- **Helper Class**: `pro2/srv/sequence-helper.js`
- **Usage in Service**: `pro2/srv/cat-service.js`

OD-10000 +1
OD-10001
OD-10002

## Steps to Implement or Modify a Sequence

### Step 1: Define the Sequence in .hdbsequence File
1. Navigate to the `db/src/` directory of your CAP project (e.g., `pro2/db/src/`).
2. Create or edit a `.hdbsequence` file (e.g., `ORDER_ID_SEQUENCE.hdbsequence`).
3. Add the sequence definition with the following syntax:
   ```
   SEQUENCE <sequence_name>
   START WITH <start_value> INCREMENT BY <increment_value>
   ```
   - Replace `<sequence_name>` with a unique name (e.g., `ORDER_ID_SEQUENCE`).
   - Set `<start_value>` to the initial value (e.g., `1`).
   - Set `<increment_value>` to the step size (e.g., `1` for consecutive numbers).
4. Save the file. This file will be deployed to HANA as a database sequence.

### Step 2: Create a Helper Class for Sequence Access
1. In the `srv/` directory, create or edit a JavaScript file (e.g., `sequence-helper.js`).
2. Implement a class to handle sequence value retrieval:
   - Constructor: Accept `db` (database connection), `sequence` (sequence name), `table` (optional for fallback), and `field` (optional, default 'ID').
   - `getNextNumber()` method: Use a Promise to fetch the next value.
     - For HANA: Run `SELECT "<sequence>".NEXTVAL FROM DUMMY"` and extract the value.
     - For SQLite/SQL Server: Fallback to `SELECT MAX("<field>") FROM "<table>"` and increment by 1.
3. Export the class as a module: `module.exports = class SequenceHelper { ... }`.
4. Handle errors in the Promise (reject on database errors or unsupported DB kinds).

### Step 3: Use the Sequence in Service Logic
1. In your service file (e.g., `cat-service.js`), require the helper: `const SequenceHelper = require('./sequence-helper')`.
2. In a `before` or `on` handler (e.g., `before('CREATE', Entity, async (req) => { ... }`):
   - Connect to the database: `const db = await cds.connect.to('db');`.
   - Fetch next value: `const nextVal = await new SequenceHelper({ db, sequence: 'SEQUENCE_NAME' }).getNextNumber();`.
   - Assign to entity: `req.data.ID = nextVal;`.
   - Optionally generate human-readable IDs: `req.data.orderNo = `SO-${nextVal}`;`.
3. For verification, add an `on` handler like `verifySequence` that returns the next value.

### Step 4: Deploy and Test
1. Build the project: Run `cds build` or `mbt build` (for MTA).
2. Deploy to HANA: Use `cf deploy` or HDI deployer.
3. Test: Create an entity via API and verify the ID is generated correctly.
4. Check logs for errors in sequence access.

### Small Details to Capture
- **File Naming**: Use uppercase with underscores for sequence names (e.g., `ORDER_ID_SEQUENCE`).
- **HANA Specifics**: Sequences are HANA-only; for other DBs, use the helper's fallback logic.
- **Security**: Ensure the user has SELECT privileges on the sequence.
- **Error Handling**: Always wrap DB calls in try-catch or Promise rejection.
- **Performance**: Sequences are efficient for high-concurrency scenarios.
- **CDS Integration**: Sequences are not defined in `.cds` files; use `.hdbsequence` for native HANA support.
- **Environment**: Test in `default-env.json` with correct DB kind (e.g., `"kind": "hana"`).</content>
<parameter name="filePath">/home/shrik/Work/SAP/sequence.md