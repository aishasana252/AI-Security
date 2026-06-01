import os
import psycopg2
import sys

def get_db_url():
    env_file = r"d:\Ai Security\.env.txt"
    if not os.path.exists(env_file):
        print(f"Error: Connection configuration file not found at {env_file}")
        sys.exit(1)
        
    with open(env_file, "r") as f:
        url = f.read().strip()
    
    # Filter out line numbers or markdown formatting if any
    # Usually it's just the URL string
    if url.startswith("1:"):
        url = url[2:].strip()
    
    return url

def deploy_schema():
    db_url = get_db_url()
    schema_file = r"d:\Ai Security\schema.sql"
    
    if not os.path.exists(schema_file):
        print(f"Error: Schema script not found at {schema_file}")
        sys.exit(1)
        
    with open(schema_file, "r", encoding="utf-8") as f:
        schema_sql = f.read()
        
    print("Connecting to Supabase PostgreSQL database...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = False # Run in transaction
        cursor = conn.cursor()
        
        print("Executing schema.sql transactionally...")
        cursor.execute(schema_sql)
        
        # Commit transaction
        conn.commit()
        print("Schema deployed successfully! Transaction committed.")
        
        # Verify tables count
        cursor.execute("""
            SELECT count(*) 
            FROM pg_tables 
            WHERE schemaname = 'public';
        """)
        table_count = cursor.fetchone()[0]
        print(f"Verification successful: {table_count} tables found in 'public' schema.")
        
        # Fetch some table names to display
        cursor.execute("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        print("\nTables list:")
        for idx, table in enumerate(tables):
            print(f"  {idx+1}. {table}")
            
        cursor.close()
        conn.close()
        print("\nDatabase connection closed cleanly.")
        
    except Exception as e:
        print(f"Exception during deployment: {e}")
        sys.exit(1)

if __name__ == "__main__":
    deploy_schema()
