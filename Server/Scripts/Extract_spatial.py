import sqlite3
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

# Setup geocoder
geolocator = Nominatim(user_agent="medieval-manuscripts-mapper")

def geocode_location(location):
    try:
        return geolocator.geocode(location)
    except GeocoderTimedOut:
        time.sleep(1)
        return geocode_location(location)

# Connect to DB
db_path = r"C:\Users\danny\OneDrive\Desktop\Uni_kb_Proj\Server\Medieval_Manuscripts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all entries with non-null Spatial
cursor.execute("SELECT rowid, Spatial FROM manuscripts WHERE Spatial IS NOT NULL")
rows = cursor.fetchall()

# Go over each entry
for rowid, spatial in rows:
    cleaned = spatial.split(",")[0].split("(")[0].strip()

    # Try geocoding
    geo = geocode_location(cleaned)
    time.sleep(1)

    if geo:
        lat = geo.latitude
        lon = geo.longitude
        print(f"✔ Found: {cleaned} → ({lat}, {lon})")
    else:
        print(f"✖ Could not find location for: {cleaned}")
        try:
            lat = float(input("Enter latitude manually: "))
            lon = float(input("Enter longitude manually: "))
        except ValueError:
            print("Invalid input. Skipping...")
            continue

    # Update the database
    cursor.execute("""
        UPDATE manuscripts
        SET Latitude = ?, Longitude = ?
        WHERE rowid = ?
    """, (lat, lon, rowid))
    conn.commit()

# Cleanup
conn.close()
print("✅ Done updating all coordinates.")
