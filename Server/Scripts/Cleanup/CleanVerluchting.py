import sqlite3
import re

def clean_is_part_of(value):
    if value:
        parts = value.split(',')
        if len(parts) > 2:
            after_second_comma = ','.join(parts[2:]).strip()
            return after_second_comma.split(';')[0].strip()
    return value


def clean_spatial(value):
    if value and len(value) > 2:
        return value[2:].strip()
    return value

def clean_date(date_str):
    if not date_str:
        return date_str
    cleaned = re.sub(r'\(?.?\b(c\.?|ca\.?|circa)\b\.?\)?\s*', '', date_str, flags=re.IGNORECASE)
    matches = re.findall(r'\d{3,4}(?:\s*-\s*\d{3,4})?', cleaned)
    return '; '.join([match.strip() for match in matches])

db_path = r'C:\Users\danny\Documents\Uni_kb_Proj\Server\Medieval_Manuscripts.db' 

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT RecordIdentifier, IsPartOf, Spatial, Date FROM Verluchtingen")
rows = cursor.fetchall()

for row in rows:
    RecordIdentifier, is_part_of, spatial, date = row

    new_is_part_of = clean_is_part_of(is_part_of)
    new_spatial = clean_spatial(spatial)
    new_date = clean_date(date)

    cursor.execute("""
        UPDATE Verluchtingen
        SET IsPartOf = ?, Spatial = ?, Date = ?
        WHERE RecordIdentifier = ?
    """, (new_is_part_of, new_spatial, new_date, RecordIdentifier))

conn.commit()
conn.close()

print("Verluchtingen-tabel is succesvol opgeschoond.")
