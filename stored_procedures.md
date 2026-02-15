# Stored Procedures Implementation in SAP CAP

## Overview

Stored procedures in SAP CAP encapsulate SQL logic for complex calculations, data aggregation, or business rules. They are defined as HANA `.hdbprocedure` files and called from the service layer using `db.run` with `CALL`.

## Files Involved

- **Definition Files**: `pro2/db/src/GET_ORDER_TOTAL.hdbprocedure`, `pro2/db/src/GET_ALL_ORDER_TOTAL.hdbprocedure`
- **Usage in Service**: `pro2/srv/cat-service.js`

## Steps to Implement or Modify a Stored Procedure

### Step 1: Define the Procedure in .hdbprocedure File

1. Navigate to the `db/src/` directory of your CAP project (e.g., `pro2/db/src/`).
2. Create or edit a `.hdbprocedure` file (e.g., `GET_ORDER_TOTAL.hdbprocedure`).
3. Use the SQLScript syntax:
   ```
   PROCEDURE "<procedure_name>" (
      IN <input_param> <type>,
      OUT <output_param> <type>
   )
   LANGUAGE SQLSCRIPT
   SQL SECURITY INVOKER
   [READS SQL DATA]
   AS
   BEGIN
      <SQL logic here>
   END
   ```

   - `<procedure_name>`: Unique name in quotes (e.g., `"GET_ORDER_TOTAL"`).
   - Parameters: Define `IN` for inputs, `OUT` for outputs, or `INOUT` for both. Use HANA types like `NVARCHAR(36)`, `DECIMAL(15,2)`, or `TABLE(...)` for result sets.
   - `LANGUAGE SQLSCRIPT`: Specifies the scripting language.
   - `SQL SECURITY INVOKER`: Runs with caller's privileges.
   - `READS SQL DATA`: Optional, indicates read-only operations.
   - Inside `BEGIN...END`: Write SQL logic, e.g., SELECT with aggregation, JOINs, or calculations.
4. For table outputs, define the structure: `OUT ET_RESULTS TABLE (COL1 TYPE, COL2 TYPE)`.
5. Save the file. It will be deployed as a HANA procedure.

### Step 2: Call the Procedure from Service Layer

1. In your service file (e.g., `cat-service.js`), add an `on` handler for the custom action (e.g., `this.on('getOrderTotal', async (req) => { ... })`).
2. Connect to DB: `const db = await cds.connect.to('db');`.
3. Call the procedure: `const result = await db.run(`CALL "<procedure_name>"(?, ?)`, [inputValue]);`.
   - Use `?` placeholders for parameters.
   - For output parameters, bind them appropriately (CAP handles output tables as arrays).
4. Return the result: `return result;` (procedures return arrays or scalars).
5. Handle errors: Wrap in try-catch.

### Step 3: Integrate with CDS Entities

1. Optionally, expose procedures via CDS actions in `.cds` files: `action getOrderTotal(orderId: String) returns Decimal;`.
2. In the service, implement the action to call the procedure.
3. Ensure entity names in SQL match the deployed HANA table names (e.g., `MY_ORDERSHOP_SALESORDERS`).

### Step 4: Deploy and Test

1. Build: `cds build`.
2. Deploy: `cf deploy`.
3. Test: Call the service action via REST API (e.g., POST to `/catalog/getOrderTotal`).
4. Verify output: Check if calculations are correct (e.g., sums, joins).
5. Debug: Use HANA Studio to test procedures directly.

### Small Details to Capture

- **Parameter Binding**: Use positional `?` in CALL; ensure order matches procedure definition.
- **Table Types**: For `OUT TABLE`, define columns with exact types and lengths.
- **SQL Logic**: Use `COALESCE` for null handling, `LEFT JOIN` for optional relations.
- **Security**: `SQL SECURITY INVOKER` uses caller's permissions; avoid `DEFINER` for security.
- **Performance**: Procedures reduce network round-trips; use for complex logic.
- **Error Handling**: Procedures can raise exceptions; catch in service layer.
- **HANA Specifics**: Only works with HANA; for other DBs, implement logic in JS.
- **Naming**: Use uppercase for procedure names; match CDS action names.
- **Deployment**: Ensure `.hdiconfig` includes procedure plugins.</content>
  <parameter name="filePath">/home/shrik/Work/SAP/stored_procedures.md
