from app.database.connection import db


def create_index_if_missing(
    collection,
    field,
    unique=False
):
    try:
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
            unique=unique,
            sparse=unique
        )

        print(
            f"Created index for: {field}"
        )
    except Exception as exc:
        print(f"Could not create index for {field}: {exc}")


def create_indexes():
    patents = db["patents"]
    research = db["research_works"]

    print()
    print("=" * 50)
    print("CREATING MONGODB INDEXES")
    print("=" * 50)

    # Patent indexes
    create_index_if_missing(patents, "patent_number", unique=True)
    create_index_if_missing(patents, "technology_field")
    create_index_if_missing(patents, "technology_sector")
    create_index_if_missing(patents, "assignee")
    create_index_if_missing(patents, "grant_year")

    # Research indexes
    create_index_if_missing(research, "doi")
    create_index_if_missing(research, "title")
    create_index_if_missing(research, "year")
    create_index_if_missing(research, "sources")
    create_index_if_missing(research, "source")
    create_index_if_missing(research, "openalex_id")
    create_index_if_missing(research, "authors")
    create_index_if_missing(research, "topics")
    create_index_if_missing(research, "search_queries")
    create_index_if_missing(research, "retrieved_at")

    print("=" * 50)
    print("INDEX CHECK COMPLETE")
    print("=" * 50)
    print()


if __name__ == "__main__":
    create_indexes()