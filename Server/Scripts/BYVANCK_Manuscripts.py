import requests
import xml.etree.ElementTree as ET
from sqlalchemy import create_engine, Column, String, Table, MetaData
from sqlalchemy.orm import sessionmaker
import os

# ============================
# DATABASE SETUP
# ============================
db_path = r'C:\Users\danny\Documents\Uni_kb_Proj\Server\Medieval_Manuscripts.db'
engine = create_engine(f"sqlite:///{db_path}")
metadata = MetaData()
metadata = MetaData()
manuscripts_table = Table("Manuscripts", metadata, autoload_with=engine)

Session = sessionmaker(bind=engine)
session = Session()

# ============================
# XML OAI-PMH FETCHER
# ============================

BASE_URL = "http://services.kb.nl/mdo/oai"
SET_NAME = "BYVANCK"

NAMESPACES = {
    "oai": "http://www.openarchives.org/OAI/2.0/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "dcx": "http://krait.kb.nl/coop/tel/handbook/telterms.html"
}

def extract_texts(record, tag, namespace="dc"):
    return [e.text.strip() for e in record.findall(f"{namespace}:{tag}", NAMESPACES) if e.text]

def extract_single(record, tag, namespace="dc"):
    elems = extract_texts(record, tag, namespace)
    return elems[0] if elems else None

def extract_description_edge(record):
    for desc in record.findall("dc:description", NAMESPACES):
        if desc.attrib.get(f"{{{NAMESPACES['dcx']}}}label") == "edge":
            return desc.text.strip()
    return None

def parse_record(xml_elem):
    parsed = {
        "RecordIdentifier": extract_single(xml_elem, "recordIdentifier", "dcx"),
        "Identifier": extract_single(xml_elem, "identifier"),
        "BibliographicCitation": "; ".join(extract_texts(xml_elem, "bibliographicCitation", "dcterms")),
        "Title": extract_single(xml_elem, "title"),
        "Creator": "; ".join(extract_texts(xml_elem, "creator")),
        "Contributors": "; ".join(extract_texts(xml_elem, "contributor")),
        "Provenance": "; ".join(extract_texts(xml_elem, "provenance")),
        "Description": extract_single(xml_elem, "description"),
        "Annotation": extract_single(xml_elem, "annotation", "dcx"),
        "Spatial": extract_single(xml_elem, "spatial", "dcterms"),
        "Date": "; ".join(extract_texts(xml_elem, "date")),
        "Language": extract_single(xml_elem, "language") or "",  # Default to empty string if None
        "Medium": extract_single(xml_elem, "medium", "dcterms") or "",
        "Format": extract_single(xml_elem, "format") or "",
        "Extent": extract_single(xml_elem, "extent", "dcterms") or "",
        "Columns": None,  # Default to None if not set
        "Lines": None,  # Default to None if not set
        "BindingDescription": extract_description_edge(xml_elem) or ""
    }

    # Ensure 'Annotation' is not None
    if parsed.get("Annotation") is None:
        parsed["Annotation"] = ""  # Set it to an empty string if None

    # Ensure 'Columns' and 'Lines' are not None
    if parsed["Columns"] is None:
        parsed["Columns"] = ""  # Set to an empty string or some default value if None
    if parsed["Lines"] is None:
        parsed["Lines"] = ""  # Same for Lines

    return parsed



def fetch_and_store():
    params = {
        "verb": "ListRecords",
        "metadataPrefix": "dcx",
        "set": SET_NAME
    }

    count = 0
    while True:
        print("Fetching...")
        r = requests.get(BASE_URL, params=params)
        r.raise_for_status()
        root = ET.fromstring(r.content)

        records = root.findall(".//oai:record", NAMESPACES)
        for rec in records:
            metadata_elem = rec.find("oai:metadata", NAMESPACES)
            if metadata_elem is not None and list(metadata_elem):
                dcx_elem = list(metadata_elem)[0]
                parsed = parse_record(dcx_elem)
                
                # Extract columns + lines
                for ext in dcx_elem.findall("dcterms:extent", NAMESPACES):
                    if ext.attrib.get("{http://www.w3.org/2001/XMLSchema-instance}type") == "columns":
                        parsed["Columns"] = ext.text.strip()
                    elif ext.attrib.get("{http://www.w3.org/2001/XMLSchema-instance}type") == "lines":
                        parsed["Lines"] = ext.text.strip()
                
                session.execute(manuscripts_table.insert().values(**parsed))
                count += 1

        # Handle resumption token
        token = root.find(".//oai:resumptionToken", NAMESPACES)
        if token is not None and token.text:
            params = {
                "verb": "ListRecords",
                "resumptionToken": token.text
            }
        else:
            break

    session.commit()
    print(f"✅ {count} records succesvol opgeslagen in database.")

if __name__ == "__main__":
    fetch_and_store()
