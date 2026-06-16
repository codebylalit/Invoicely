import os
import re

backup_path = r"d:\Software Engineering\Invoicely\db_cluster-11-08-2025@19-53-34.backup\db_cluster-11-08-2025@19-53-34.backup"
output_path = r"d:\Software Engineering\Invoicely\clean_restore.sql"

print(f"Reading backup from: {backup_path}")

with open(backup_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Read {len(lines)} lines.")

# We need to extract:
# 1. Custom functions / types in the public schema
# 2. CREATE TABLE statements for public schema tables
# 3. RLS configurations, policies, triggers, indexes, and keys for public schema tables
# 4. COPY blocks for auth.users, auth.identities, public.*, storage.buckets, storage.objects, and convert them to INSERT statements

ddl_statements = []
data_statements = []

# To keep track of states
in_copy_block = False
current_copy_table = None
current_copy_cols = []
copy_rows = []

# Buffer for DDL blocks
in_public_ddl = False
current_ddl_block = []

# Find all tables in public schema that are created
public_tables = [
    "business_details",
    "clients",
    "customers",
    "invoices",
    "paypal_orders",
    "profiles",
    "razorpay_orders",
    "subscribers"
]

def clean_value(val, col_name=None):
    if val == r'\N':
        return "NULL"
    
    # Escape single quotes
    val_escaped = val.replace("'", "''")
    
    # Check if boolean
    if val == 't':
        return "TRUE"
    elif val == 'f':
        return "FALSE"
        
    # Standard text/uuid/date/json columns need quotes
    return f"'{val_escaped}'"

line_idx = 0
while line_idx < len(lines):
    line = lines[line_idx]
    
    if in_copy_block:
        if line.strip() == r'\.':
            # End of COPY block, write INSERTs
            print(f"Finished copy block for {current_copy_table} with {len(copy_rows)} rows.")
            
            # Disable triggers on public/auth tables before inserting to avoid trigger recursion/override errors
            # (especially for handling handle_new_user profile creation trigger, which might conflict)
            if current_copy_table in ["auth.users", "public.profiles", "public.invoices", "public.clients"]:
                # We can wrap the inserts or write them out
                pass
                
            for row in copy_rows:
                vals = row.split('\t')
                # Ensure values match columns count
                if len(vals) == len(current_copy_cols):
                    cleaned_vals = [clean_value(v.strip('\n')) for v in vals]
                    insert_stmt = f"INSERT INTO {current_copy_table} ({', '.join(current_copy_cols)}) VALUES ({', '.join(cleaned_vals)});\n"
                    data_statements.append(insert_stmt)
                else:
                    print(f"Warning: row values count ({len(vals)}) doesn't match columns ({len(current_copy_cols)}) for {current_copy_table}")
            
            in_copy_block = False
            current_copy_table = None
            current_copy_cols = []
            copy_rows = []
        else:
            copy_rows.append(line)
        line_idx += 1
        continue

    # Detect COPY statement
    # e.g., COPY public.business_details (id, user_id, ...) FROM stdin;
    copy_match = re.match(r'^COPY\s+([\w\.]+)\s+\((.*?)\)\s+FROM\s+stdin;', line, re.IGNORECASE)
    if copy_match:
        table_name = copy_match.group(1)
        cols_str = copy_match.group(2)
        
        # Only copy data for tables we care about
        if table_name.startswith("public.") or table_name in ["auth.users", "auth.identities", "storage.buckets", "storage.objects"]:
            in_copy_block = True
            current_copy_table = table_name
            current_copy_cols = [c.strip() for c in cols_str.split(',')]
            copy_rows = []
            print(f"Started copy block for {table_name}...")
        line_idx += 1
        continue

    # Detect DDL blocks for public schema
    # We want to capture:
    # - CREATE TABLE public.xxx
    # - CREATE FUNCTION public.xxx
    # - ALTER TABLE ONLY public.xxx
    # - CREATE INDEX xxx ON public.xxx
    # - CREATE TRIGGER xxx ON public.xxx
    # - CREATE POLICY xxx ON public.xxx
    # - ALTER TABLE public.xxx ENABLE ROW LEVEL SECURITY
    
    # We do NOT want auth table creations, extensions, custom roles, etc., since they exist in the new DB.
    
    is_public_ddl_start = (
        ("public." in line or "ON public." in line or "invoicely" in line) and 
        ("CREATE TABLE" in line or "CREATE FOREIGN TABLE" in line or "CREATE FUNCTION" in line or 
         "ALTER TABLE" in line or "CREATE INDEX" in line or "CREATE TRIGGER" in line or 
         "CREATE POLICY" in line or "ALTER TABLE ONLY" in line or "FOREIGN DATA WRAPPER" in line or
         "CREATE SERVER" in line or "ALTER SERVER" in line or "ALTER FOREIGN DATA WRAPPER" in line)
    )
    
    if is_public_ddl_start and not in_public_ddl:
        # Check if the single-line statement ends with a semicolon and can close immediately
        if line.strip().endswith(';') and (line_idx + 1 >= len(lines) or lines[line_idx+1].strip() == "" or lines[line_idx+1].startswith("--")):
            ddl_statements.append(line)
        else:
            in_public_ddl = True
            current_ddl_block = [line]
    elif in_public_ddl:
        current_ddl_block.append(line)
        # DDL blocks in pg_dump are usually separated by empty lines or double dash comments
        # We can stop capturing when we see the end of statement (semicolon and empty line)
        if line.strip().endswith(';') and (line_idx + 1 >= len(lines) or lines[line_idx+1].strip() == "" or lines[line_idx+1].startswith("--")):
            in_public_ddl = False
            ddl_statements.append("".join(current_ddl_block))
            current_ddl_block = []
            
    line_idx += 1

# Write to clean_restore.sql
print(f"Writing output to: {output_path}")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("-- Clean restore script for Invoicely\n")
    f.write("-- Generated from database cluster dump\n\n")
    
    # Recreate public schema tables
    f.write("-- -----------------------------------------------------\n")
    f.write("-- Recreating Public Schema Tables & Functions\n")
    f.write("-- -----------------------------------------------------\n\n")
    f.write("CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;\n\n")
    
    # Group and write DDL first
    for stmt in ddl_statements:
        # Filter out ALTER ... OWNER statements entirely to prevent permission errors
        if "OWNER TO" in stmt:
            continue
            
        # Only keep FDW/Server configurations OR statements referencing the public schema
        is_wrapper = "FOREIGN DATA WRAPPER" in stmt or "SERVER" in stmt
        has_public = "public." in stmt or "ON public." in stmt
        if not is_wrapper and not has_public:
            continue
            
        # Avoid creating tables that we want to replace cleanly
        # To make it safe to run multiple times, we can insert DROP statements
        table_match = re.search(r'CREATE\s+TABLE\s+public\.(\w+)', stmt)
        if table_match:
            tname = table_match.group(1)
            f.write(f"DROP TABLE IF EXISTS public.{tname} CASCADE;\n")
        f.write(stmt)
        f.write("\n")

print("Cleanup script generation complete!")
