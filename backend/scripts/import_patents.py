import os
import pandas as pd
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

CSV_FILE = os.path.join(
    BASE_DIR,
    "data",
    "2025_patents.csv"
)

MONGO_URI = os.getenv("MONGO_URI")

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "intelligent_research"
)

COLLECTION_NAME = "patents"


# ============================================================
# HELPERS
# ============================================================

def clean_value(value):
    """
    Convert pandas NaN / empty values into None.
    """

    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    value = str(value).strip()

    if not value:
        return None

    return value


def get_inventors(row):
    """
    Collect inventor names from:
    inventor_name1 ... inventor_name10
    """

    inventors = []

    for i in range(1, 11):

        column = f"inventor_name{i}"

        if column not in row.index:
            continue

        name = clean_value(row[column])

        if name and name not in inventors:
            inventors.append(name)

    return inventors


def get_cpc_sections(row):
    """
    Convert CPC section data such as:

        G
        A E
        A B
        A G Y

    into:

        ["G"]
        ["A", "E"]
        ["A", "B"]
        ["A", "G", "Y"]
    """

    value = clean_value(
        row.get("cpc_sections")
    )

    if not value:
        return []

    sections = value.split()

    # Remove duplicates while preserving order
    return list(dict.fromkeys(sections))


def get_patent_document(row):
    """
    Convert one CSV row into a MongoDB patent document.
    """

    patent_number = clean_value(
        row.get("patent_number")
    )

    application_number = clean_value(
        row.get("application_number")
    )

    grant_year = clean_value(
        row.get("grant_year")
    )

    application_year = clean_value(
        row.get("application_year")
    )

    assignee = clean_value(
        row.get("assignee")
    )

    country = clean_value(
        row.get("country")
    )

    city = clean_value(
        row.get("city")
    )

    state = clean_value(
        row.get("state")
    )

    # --------------------------------------------------------
    # WIPO TECHNOLOGY INFORMATION
    # --------------------------------------------------------

    technology_field = clean_value(
        row.get("first_wipo_field_title")
    )

    technology_sector = clean_value(
        row.get("first_wipo_sector_title")
    )

    # --------------------------------------------------------
    # INVENTORS
    # --------------------------------------------------------

    inventors = get_inventors(row)

    # --------------------------------------------------------
    # CPC
    # --------------------------------------------------------

    cpc_sections = get_cpc_sections(row)

    # --------------------------------------------------------
    # DOCUMENT
    # --------------------------------------------------------

    document = {
        # Basic patent identity
        "patent_id": patent_number,
        "patent_number": patent_number,
        "application_number": application_number,

        # Dates
        "grant_year": grant_year,
        "application_year": application_year,
        "patent_date": grant_year,

        # Patent classification
        "patent_type": "Granted Patent",

        # These fields are NOT available in this CSV
        "patent_title": None,
        "patent_abstract": None,

        # Inventors
        "inventors": inventors,
        "inventor_count": len(inventors),

        # Assignee
        "assignees": (
            [assignee]
            if assignee
            else []
        ),
        "assignee": assignee,

        # Location
        "country": country,
        "city": city,
        "state": state,

        # CPC technology classification
        "cpc_sections": cpc_sections,
        "cpc_count": len(cpc_sections),

        # WIPO technology classification
        "technology_field": technology_field,
        "technology_sector": technology_sector,

        # Source
        "source": (
            "USPTO Open Data Portal - "
            "PatentsView Annualized Data"
        ),
    }

    return document


# ============================================================
# INDEX MANAGEMENT
# ============================================================

def ensure_patent_number_index(collection):
    """
    Check whether an index already exists on patent_number.

    The database already contains patent_number_1, so we
    reuse it instead of trying to create a conflicting index.
    """

    print()
    print("Checking patent number index...")

    existing_indexes = list(
        collection.list_indexes()
    )

    for index in existing_indexes:

        key = index.get("key", {})

        # Existing index on patent_number
        if (
            len(key) == 1
            and key.get("patent_number") == 1
        ):
            print(
                "Patent number index already exists."
            )

            print(
                f"Using existing index: "
                f"{index.get('name')}"
            )

            return

    # --------------------------------------------------------
    # No existing index found
    # --------------------------------------------------------

    print(
        "Patent number index not found."
    )

    collection.create_index(
        [("patent_number", 1)],
        unique=True
    )

    print(
        "Patent number index created."
    )


# ============================================================
# MAIN IMPORT
# ============================================================

def main():

    print("=" * 60)
    print("USPTO PATENT DATA IMPORTER")
    print("=" * 60)

    print(
        f"CSV file: {CSV_FILE}"
    )

    print(
        f"Database: {DATABASE_NAME}"
    )

    print(
        f"Collection: {COLLECTION_NAME}"
    )

    # ========================================================
    # CHECK CSV
    # ========================================================

    if not os.path.exists(CSV_FILE):

        print()
        print(
            "ERROR: CSV file not found:"
        )

        print(CSV_FILE)

        print()
        print(
            "Expected location:"
        )

        print(
            "data/2025_patents.csv"
        )

        return

    # ========================================================
    # CHECK MONGO URI
    # ========================================================

    if not MONGO_URI:

        print()
        print(
            "ERROR: MONGO_URI is missing."
        )

        print(
            "Check backend/.env"
        )

        return

    # ========================================================
    # READ CSV
    # ========================================================

    print()
    print("Reading CSV...")

    df = pd.read_csv(
        CSV_FILE,
        low_memory=False
    )

    print(
        f"CSV loaded successfully: "
        f"{len(df):,} records"
    )

    # ========================================================
    # DISPLAY COLUMNS
    # ========================================================

    print()
    print("Columns detected:")
    print()

    print(
        ", ".join(
            df.columns.tolist()
        )
    )

    # ========================================================
    # VALIDATE REQUIRED COLUMNS
    # ========================================================

    required_columns = [
        "patent_number",
        "grant_year",
        "application_number",
        "assignee",
        "cpc_sections",
        "first_wipo_field_title",
        "first_wipo_sector_title"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:

        print()
        print(
            "ERROR: Required columns are missing:"
        )

        for column in missing_columns:
            print(
                f"  - {column}"
            )

        return

    print()
    print(
        "Required columns verified."
    )

    # ========================================================
    # CONNECT MONGODB
    # ========================================================

    print()
    print("Connecting to MongoDB...")

    client = MongoClient(
        MONGO_URI
    )

    # Test MongoDB connection
    client.admin.command(
        "ping"
    )

    db = client[
        DATABASE_NAME
    ]

    patents_collection = db[
        COLLECTION_NAME
    ]

    print(
        "MongoDB connection successful."
    )

    # ========================================================
    # INDEX
    # ========================================================

    ensure_patent_number_index(
        patents_collection
    )

    # ========================================================
    # IMPORT
    # ========================================================

    print()
    print("=" * 60)
    print("STARTING PATENT IMPORT")
    print("=" * 60)

    operations = []

    imported = 0
    skipped = 0

    batch_size = 1000

    total_rows = len(df)

    # ========================================================
    # PROCESS CSV
    # ========================================================

    for _, row in df.iterrows():

        document = get_patent_document(
            row
        )

        patent_number = document.get(
            "patent_number"
        )

        # ----------------------------------------------------
        # Skip rows without patent number
        # ----------------------------------------------------

        if not patent_number:

            skipped += 1

            continue

        # ----------------------------------------------------
        # Upsert operation
        # ----------------------------------------------------

        operations.append(
            UpdateOne(
                {
                    "patent_number": patent_number
                },
                {
                    "$set": document
                },
                upsert=True
            )
        )

        # ----------------------------------------------------
        # Execute batch
        # ----------------------------------------------------

        if len(operations) >= batch_size:

            result = patents_collection.bulk_write(
                operations,
                ordered=False
            )

            imported += len(
                operations
            )

            print(
                f"Processed: "
                f"{imported:,} / "
                f"{total_rows:,} | "
                f"Inserted: "
                f"{result.upserted_count:,} | "
                f"Updated: "
                f"{result.modified_count:,}"
            )

            operations = []

    # ========================================================
    # FINAL BATCH
    # ========================================================

    if operations:

        result = patents_collection.bulk_write(
            operations,
            ordered=False
        )

        imported += len(
            operations
        )

        print(
            f"Processed: "
            f"{imported:,} / "
            f"{total_rows:,} | "
            f"Inserted: "
            f"{result.upserted_count:,} | "
            f"Updated: "
            f"{result.modified_count:,}"
        )

    # ========================================================
    # SUMMARY
    # ========================================================

    total = patents_collection.count_documents(
        {}
    )

    # --------------------------------------------------------
    # CPC
    # --------------------------------------------------------

    patents_with_cpc = patents_collection.count_documents(
        {
            "cpc_sections": {
                "$exists": True,
                "$ne": []
            }
        }
    )

    # --------------------------------------------------------
    # Inventors
    # --------------------------------------------------------

    patents_with_inventors = patents_collection.count_documents(
        {
            "inventors": {
                "$exists": True,
                "$ne": []
            }
        }
    )

    # --------------------------------------------------------
    # Assignee
    # --------------------------------------------------------

    patents_with_assignee = patents_collection.count_documents(
        {
            "assignee": {
                "$exists": True,
                "$nin": [
                    None,
                    ""
                ]
            }
        }
    )

    # --------------------------------------------------------
    # Technology fields
    # --------------------------------------------------------

    patents_with_technology_field = patents_collection.count_documents(
        {
            "technology_field": {
                "$exists": True,
                "$nin": [
                    None,
                    ""
                ]
            }
        }
    )

    # --------------------------------------------------------
    # Technology sectors
    # --------------------------------------------------------

    patents_with_technology_sector = patents_collection.count_documents(
        {
            "technology_sector": {
                "$exists": True,
                "$nin": [
                    None,
                    ""
                ]
            }
        }
    )

    # ========================================================
    # FINAL OUTPUT
    # ========================================================

    print()
    print("=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)

    print(
        f"CSV records processed: "
        f"{imported:,}"
    )

    print(
        f"Rows skipped: "
        f"{skipped:,}"
    )

    print(
        f"MongoDB patent records: "
        f"{total:,}"
    )

    print(
        f"Records with CPC data: "
        f"{patents_with_cpc:,}"
    )

    print(
        f"Records with inventor data: "
        f"{patents_with_inventors:,}"
    )

    print(
        f"Records with assignee data: "
        f"{patents_with_assignee:,}"
    )

    print(
        f"Records with technology field: "
        f"{patents_with_technology_field:,}"
    )

    print(
        f"Records with technology sector: "
        f"{patents_with_technology_sector:,}"
    )

    print()
    print(
        "Patent data is ready for "
        "Patent Intelligence and "
        "Technology Intelligence."
    )

    print("=" * 60)

    # ========================================================
    # CLOSE CONNECTION
    # ========================================================

    client.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()