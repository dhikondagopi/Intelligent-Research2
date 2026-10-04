from app.database.connection import db


def create_index_if_missing(
    collection,
    field,
    unique=False
):
    existing_indexes = list(
        collection.list_indexes()
    )

    for index in existing_indexes:

        key = index.get("key", {})

        if (
            len(key) == 1
            and key.get(field) == 1
        ):
            print(
                f"Index already exists for: {field}"
            )
            return

    collection.create_index(
        [(field, 1)],
        unique=unique
    )

    print(
        f"Created index for: {field}"
    )


def create_indexes():

    patents = db["patents"]

    print()
    print("=" * 50)
    print("CREATING MONGODB INDEXES")
    print("=" * 50)

    create_index_if_missing(
        patents,
        "patent_number",
        unique=True
    )

    create_index_if_missing(
        patents,
        "technology_field"
    )

    create_index_if_missing(
        patents,
        "technology_sector"
    )

    create_index_if_missing(
        patents,
        "assignee"
    )

    create_index_if_missing(
        patents,
        "grant_year"
    )

    print("=" * 50)
    print("INDEX CHECK COMPLETE")
    print("=" * 50)
    print()


if __name__ == "__main__":
    create_indexes()