# Synonyms Implementation in SAP CAP

## Overview
Synonyms in SAP CAP provide aliases for database objects (tables, views, procedures) to simplify references, enable cross-schema access, or abstract object names. They are defined as `.hdbsynonym` files in HANA.

## Files Involved
- **Definition File**: `pro3/db/src/synonyms/global-app-1.hdbsynonym`

## Steps to Implement or Modify a Synonym

### Step 1: Create the Synonyms Directory and File
1. In `db/src/`, create a `synonyms/` subdirectory if it doesn't exist.
2. Create or edit a `.hdbsynonym` file (e.g., `global-app-1.hdbsynonym`).
3. Use JSON syntax to define synonyms:
   ```
   {
       "<synonym_name>": {
           "target": {
               "object": "<target_object>",
               "schema": "<target_schema>"  // optional
           }
       }
   }
   ```
   - `<synonym_name>`: The alias name (e.g., `"CONSUMER_SYN_JOBHIMANNHAI_ITEMS"`).
   - `<target_object>`: The actual object name (table/view/procedure).
   - `<target_schema>`: Optional schema name for cross-schema access.
4. If no target is specified, it may be configured via HDI config or point to external objects.
5. Save the file.

### Step 2: Configure in .hdiconfig
1. Ensure `.hdiconfig` includes synonym plugins:
   ```
   "hdbsynonym": {
       "plugin_name": "com.sap.hana.di.synonym"
   },
   "hdbsynonymconfig": {
       "plugin_name": "com.sap.hana.di.synonym.config"
   }
   ```
2. This enables synonym deployment.

### Step 3: Use the Synonym in SQL or Procedures
1. In `.hdbprocedure` or service code, reference the synonym instead of the full object name.
2. Example: `SELECT * FROM "<synonym_name>"` instead of `SELECT * FROM "<full_table_name>"`.
3. This abstracts the actual object, useful for multi-tenant or dynamic schemas.

### Step 4: Deploy and Test
1. Build: `cds build`.
2. Deploy: `cf deploy`.
3. Test: Query the synonym via service or HANA tools; verify it resolves to the target object.
4. Check permissions: Ensure access to both synonym and target.

### Small Details to Capture
- **JSON Format**: Synonyms are defined in JSON; no SQL syntax.
- **Scope**: Synonyms are schema-local; use schema attribute for cross-schema.
- **Use Cases**: Simplify code, enable schema abstraction, or alias external objects.
- **HANA Only**: Not applicable to other databases.
- **Naming**: Use descriptive names; avoid conflicts.
- **Deployment**: Requires HDI; synonyms are created at deploy time.
- **Security**: Inherits permissions from target object.
- **Configuration**: If target is empty, it might be set via environment or config files.</content>
<parameter name="filePath">/home/shrik/Work/SAP/synonyms.md