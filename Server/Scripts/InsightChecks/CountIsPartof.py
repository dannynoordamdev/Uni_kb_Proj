import sqlite3
from collections import defaultdict

# 📍 Path to your database
db_path = r'C:\Users\danny\Documents\Uni_kb_Proj\Server\Medieval_Manuscripts.db'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Haal alle IsPartOf entries op
cursor.execute("SELECT IsPartOf FROM Verluchtingen")
rows = cursor.fetchall()

# Groepeer op IsPartOf
group_counts = defaultdict(int)

for (is_part_of,) in rows:
    key = is_part_of.strip() if is_part_of else "Onbekend"
    group_counts[key] += 1

# Toon resultaten
print(f"\nAantal unieke groepen: {len(group_counts)}\n")

for group, count in sorted(group_counts.items(), key=lambda x: (-x[1], x[0])):
    print(f"{group}: {count} items")

conn.close()
