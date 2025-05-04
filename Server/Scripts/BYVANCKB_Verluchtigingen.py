import json
import sqlite3
import os

# Pad naar JSON-bestand
json_path = r'C:\Users\danny\Documents\Uni_kb_Proj\Server\Data\complete_dataset.json'
# Pad naar SQLite database
db_path = r'C:\Users\danny\Documents\Uni_kb_Proj\Server\Medieval_Manuscripts.db'

def load_json_data(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def prepare_value(val):
    if isinstance(val, list):
        return '; '.join(str(v) for v in val)
    return str(val) if val is not None else None

def insert_into_db(data, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    insert_query = '''
    INSERT OR IGNORE INTO Verluchtingen (
        RecordIdentifier, RecordPosition, Creator, HasPart, Thumbnail,
        Subject, Folio, Dimension, Title, IsPartOf, Relation, Spatial,
        Identifier, Date, Type, Illustration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''

    for item in data:
        record_identifier = prepare_value(item.get('recordIdentifier'))
        record_position = int(item.get('recordPosition')) if item.get('recordPosition') else None
        creator = prepare_value(item.get('creator'))
        has_part = prepare_value(item.get('hasPart'))
        thumbnail = prepare_value(item.get('thumbnail'))
        subject = prepare_value(item.get('subject'))

        extent = item.get('extent', [])
        folio = None
        dimension = None

        for val in extent:
            val_str = str(val)
            if any(x in val_str for x in ['x', '×']) or val_str.replace(' ', '').isdigit():
                dimension = prepare_value(val_str)
            else:
                folio = prepare_value(val_str)


        title = prepare_value(item.get('title'))
        is_part_of = prepare_value(item.get('isPartOf'))
        relation = prepare_value(item.get('relation'))
        spatial = prepare_value(item.get('spatial'))
        identifier = prepare_value(item.get('identifier'))
        date = prepare_value(item.get('date'))
        type_ = prepare_value(item.get('type'))
        illustration = prepare_value(item.get('illustration'))

        cursor.execute(insert_query, (
            record_identifier, record_position, creator, has_part, thumbnail,
            subject, folio, dimension, title, is_part_of, relation, spatial,
            identifier, date, type_, illustration
        ))

    conn.commit()
    conn.close()
    print(f"{len(data)} records inserted into the database.")

def main():
    if not os.path.exists(json_path):
        print(f"❌ JSON file not found at {json_path}")
        return
    if not os.path.exists(db_path):
        print(f"❌ Database file not found at {db_path}")
        return

    data = load_json_data(json_path)
    insert_into_db(data, db_path)

if __name__ == '__main__':
    main()
