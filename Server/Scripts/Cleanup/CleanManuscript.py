import sqlite3
import re

def clean_identifier(identifier):
    if identifier:
        parts = identifier.split(',')
        if len(parts) > 2:
            return ','.join(parts[2:]).strip()
    return identifier

def clean_binding_description(binding):
    if binding:
        return binding.replace("Binding:", "").strip()
    return binding

def clean_date(date_str):
    if not date_str:
        return date_str

    cleaned = re.sub(r'\(?.?\b(c\.?|ca\.?|circa)\b\.?\)?\s*', '', date_str, flags=re.IGNORECASE)

    matches = re.findall(r'\d{3,4}(?:\s*-\s*\d{3,4})?', cleaned)

    return '; '.join([match.strip() for match in matches])

db_path = r'C:\Users\danny\Documents\Uni_kb_Proj\Server\Medieval_Manuscripts.db'  

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT RecordIdentifier, Identifier, BindingDescription, Date FROM Manuscripts")
rows = cursor.fetchall()

for row in rows:
    RecordIdentifier, identifier, binding, date = row

    new_identifier = clean_identifier(identifier)
    new_binding = clean_binding_description(binding)
    new_date = clean_date(date)

    cursor.execute("""
        UPDATE Manuscripts
        SET Identifier = ?, BindingDescription = ?, Date = ?
        WHERE RecordIdentifier = ?
    """, (new_identifier, new_binding, new_date, RecordIdentifier))

conn.commit()
conn.close()

print("Database is succesvol opgeschoond.")
