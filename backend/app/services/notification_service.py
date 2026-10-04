from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from app.database.connection import db, research_profiles_collection, users_collection
from app.services.technology_service import get_technology_overview
from app.services.commercialization_service import get_commercialization_analysis


notifications_collection = db["notifications"]

# Ensure MongoDB indexes for performance and deduplication
try:
    notifications_collection.create_index("deduplication_key", unique=True, sparse=True)
    notifications_collection.create_index([("user_id", 1), ("created_at", -1)])
    notifications_collection.create_index([("user_id", 1), ("is_read", 1)])
except Exception as e:
    print(f"Index creation notice: {e}")


def serialize_notification(doc: dict) -> dict:
    if not doc:
        return {}
    
    created_at_val = doc.get("created_at")
    if isinstance(created_at_val, datetime):
        created_at_str = created_at_val.isoformat()
    else:
        created_at_str = str(created_at_val or datetime.now(timezone.utc).isoformat())

    return {
        "id": str(doc["_id"]),
        "user_id": str(doc.get("user_id", "")),
        "notification_type": str(doc.get("notification_type", "PLATFORM")),
        "title": str(doc.get("title", "")),
        "message": str(doc.get("message", "")),
        "related_module": str(doc.get("related_module", "platform")),
        "related_record_id": str(doc.get("related_record_id", "")),
        "created_at": created_at_str,
        "is_read": bool(doc.get("is_read", False)),
        "priority": str(doc.get("priority", "medium")),
        "link": str(doc.get("link", "")),
        "metadata": doc.get("metadata") or {},
        "deduplication_key": str(doc.get("deduplication_key", ""))
    }


def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    related_module: str,
    related_record_id: str = "",
    priority: str = "medium",
    link: str = "",
    metadata: Optional[dict] = None,
    deduplication_key: Optional[str] = None
) -> Optional[dict]:
    if not deduplication_key:
        deduplication_key = f"{user_id}_{notification_type}_{related_record_id or title}"

    existing = notifications_collection.find_one({"deduplication_key": deduplication_key})
    if existing:
        return serialize_notification(existing)

    doc = {
        "user_id": user_id,
        "notification_type": notification_type,
        "title": title,
        "message": message,
        "related_module": related_module,
        "related_record_id": related_record_id,
        "created_at": datetime.now(timezone.utc),
        "is_read": False,
        "priority": priority,
        "link": link,
        "metadata": metadata or {},
        "deduplication_key": deduplication_key
    }

    try:
        res = notifications_collection.insert_one(doc)
        doc["_id"] = res.inserted_id
        return serialize_notification(doc)
    except DuplicateKeyError:
        existing = notifications_collection.find_one({"deduplication_key": deduplication_key})
        return serialize_notification(existing) if existing else None


# --------------------------------------------------------------------------
# Specific Event / Alert Generators
# --------------------------------------------------------------------------

def create_funding_alert(
    user_id: str,
    title: str,
    message: str,
    project_id: str,
    priority: str = "medium",
    metadata: Optional[dict] = None
) -> Optional[dict]:
    return create_notification(
        user_id=user_id,
        notification_type="FUNDING",
        title=title,
        message=message,
        related_module="funding",
        related_record_id=str(project_id),
        priority=priority,
        link="/funding",
        metadata=metadata,
        deduplication_key=f"{user_id}_FUNDING_{project_id}"
    )


def create_patent_alert(
    user_id: str,
    title: str,
    message: str,
    patent_id: str,
    priority: str = "medium",
    metadata: Optional[dict] = None
) -> Optional[dict]:
    return create_notification(
        user_id=user_id,
        notification_type="PATENT",
        title=title,
        message=message,
        related_module="patents",
        related_record_id=str(patent_id),
        priority=priority,
        link="/patents",
        metadata=metadata,
        deduplication_key=f"{user_id}_PATENT_{patent_id}"
    )


def create_technology_alert(
    user_id: str,
    title: str,
    message: str,
    technology_name: str,
    priority: str = "medium",
    metadata: Optional[dict] = None
) -> Optional[dict]:
    clean_tech = technology_name.strip()
    return create_notification(
        user_id=user_id,
        notification_type="TECHNOLOGY",
        title=title,
        message=message,
        related_module="technology",
        related_record_id=clean_tech,
        priority=priority,
        link=f"/technology/{clean_tech}",
        metadata=metadata,
        deduplication_key=f"{user_id}_TECHNOLOGY_{clean_tech}"
    )


def create_research_trend_alert(
    user_id: str,
    title: str,
    message: str,
    research_id: str,
    priority: str = "medium",
    metadata: Optional[dict] = None
) -> Optional[dict]:
    return create_notification(
        user_id=user_id,
        notification_type="RESEARCH_TREND",
        title=title,
        message=message,
        related_module="research",
        related_record_id=str(research_id),
        priority=priority,
        link="/research",
        metadata=metadata,
        deduplication_key=f"{user_id}_RESEARCH_TREND_{research_id}"
    )


def create_commercialization_alert(
    user_id: str,
    title: str,
    message: str,
    technology_name: str,
    priority: str = "medium",
    metadata: Optional[dict] = None
) -> Optional[dict]:
    clean_tech = technology_name.strip()
    return create_notification(
        user_id=user_id,
        notification_type="COMMERCIALIZATION",
        title=title,
        message=message,
        related_module="commercialization",
        related_record_id=clean_tech,
        priority=priority,
        link=f"/commercialization/{clean_tech}",
        metadata=metadata,
        deduplication_key=f"{user_id}_COMMERCIALIZATION_{clean_tech}"
    )


def create_platform_notification(
    user_id: str,
    title: str,
    message: str,
    related_module: str = "profile",
    related_record_id: str = "system",
    priority: str = "low",
    metadata: Optional[dict] = None
) -> Optional[dict]:
    return create_notification(
        user_id=user_id,
        notification_type="PLATFORM",
        title=title,
        message=message,
        related_module=related_module,
        related_record_id=related_record_id,
        priority=priority,
        link="/profile" if related_module == "profile" else "/dashboard/researcher",
        metadata=metadata
    )


# --------------------------------------------------------------------------
# Automatic Relevance Checking & Alert Generation for User
# --------------------------------------------------------------------------

def generate_user_alerts(user_id: str) -> List[dict]:
    """
    Evaluates real platform data against user interests & profile to generate
    relevant, non-duplicate notifications.
    """
    created_alerts = []

    # 1. Fetch user research profile
    profile = research_profiles_collection.find_one({"user_id": user_id}) or {}
    user_doc = users_collection.find_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else None

    user_interests = [i.lower() for i in profile.get("research_interests", []) if i]
    user_skills = [s.lower() for s in profile.get("skills", []) if s]
    
    # Default fallback keywords if user has no explicit profile interests
    keywords = user_interests + user_skills
    if not keywords:
        keywords = ["artificial intelligence", "quantum", "cancer", "energy", "genomics", "technology", "data"]

    # 2. Check Funding Projects
    funding_coll = db["funding_projects"]
    funding_docs = list(funding_coll.find().sort("_id", -1).limit(20))
    for project in funding_docs:
        p_title = project.get("title") or project.get("project_title") or ""
        p_abstract = project.get("abstract") or project.get("abstract_text") or ""
        p_id = project.get("application_id") or project.get("project_number") or str(project.get("_id"))
        p_amount = project.get("award_amount", 0)

        text = f"{p_title} {p_abstract}".lower()
        matched_kw = next((kw for kw in keywords if kw in text), None)
        if matched_kw or not user_interests:
            formatted_amount = f"${p_amount:,.0f}" if p_amount else "Grants available"
            alert = create_funding_alert(
                user_id=user_id,
                title=f"New Funding Opportunity: {p_title[:60]}...",
                message=f"NIH RePORTER award ({formatted_amount}) matching your interest in '{matched_kw or 'research'}'",
                project_id=p_id,
                priority="high" if p_amount > 500000 else "medium",
                metadata={"amount": p_amount, "matched_keyword": matched_kw}
            )
            if alert:
                created_alerts.append(alert)

    # 3. Check Patents
    patents_coll = db["patents"]
    patent_docs = list(patents_coll.find().sort("_id", -1).limit(20))
    for patent in patent_docs:
        p_title = patent.get("patent_title") or patent.get("title") or ""
        p_id = patent.get("patent_id") or patent.get("patent_number") or str(patent.get("_id"))
        p_assignee = patent.get("organization") or (patent.get("assignees")[0] if patent.get("assignees") else "")

        text = f"{p_title} {p_assignee}".lower()
        matched_kw = next((kw for kw in keywords if kw in text), None)
        if matched_kw or not user_interests:
            alert = create_patent_alert(
                user_id=user_id,
                title=f"Patent Activity Monitored: {p_title[:60]}...",
                message=f"New patent activity registered by {p_assignee or 'institution'} for '{matched_kw or 'technology'}'",
                patent_id=p_id,
                priority="medium",
                metadata={"patent_id": p_id, "assignee": p_assignee}
            )
            if alert:
                created_alerts.append(alert)

    # 4. Check Research Trends
    research_coll = db["research_works"]
    research_docs = list(research_coll.find().sort("cited_by_count", -1).limit(15))
    for work in research_docs:
        w_title = work.get("title") or ""
        w_id = str(work.get("id") or work.get("_id"))
        w_cites = work.get("cited_by_count", 0)

        text = f"{w_title}".lower()
        matched_kw = next((kw for kw in keywords if kw in text), None)
        if (matched_kw and w_cites > 10) or (w_cites > 50 and not user_interests):
            alert = create_research_trend_alert(
                user_id=user_id,
                title=f"Trending Research Publication: {w_title[:60]}...",
                message=f"Significant citation surge ({w_cites} citations) in field '{matched_kw or 'research'}'",
                research_id=w_id,
                priority="high" if w_cites > 100 else "medium",
                metadata={"citations": w_cites, "title": w_title}
            )
            if alert:
                created_alerts.append(alert)

    # 5. Check Emerging & Field Technologies from real technology and commercialization services
    tech_overview = get_technology_overview()
    db_tech_fields = [
        tf["technology"] for tf in tech_overview.get("technology_fields", [])
        if tf.get("technology")
    ]
    if not db_tech_fields:
        db_tech_fields = ["Artificial Intelligence", "Quantum Computing", "CRISPR Gene Editing", "Solid-State Batteries"]

    for tech in db_tech_fields:
        t_low = tech.lower()
        if any(kw in t_low or t_low in kw for kw in keywords) or not user_interests:
            t_alert = create_technology_alert(
                user_id=user_id,
                title=f"Emerging Technology Update: {tech}",
                message=f"Active patent activity and technology monitoring detected in field '{tech}'",
                technology_name=tech,
                priority="high",
                metadata={"technology": tech}
            )
            if t_alert:
                created_alerts.append(t_alert)

            comm_analysis = get_commercialization_analysis(tech)
            readiness = comm_analysis.get("pathways", {}).get("productization", {}).get("readiness", "Opportunity")
            c_alert = create_commercialization_alert(
                user_id=user_id,
                title=f"Commercial Opportunity: {tech}",
                message=f"Productization readiness ({readiness}) identified for '{tech}'",
                technology_name=tech,
                priority="medium",
                metadata={"technology": tech, "readiness": readiness}
            )
            if c_alert:
                created_alerts.append(c_alert)

    # 6. Platform notification
    if user_doc:
        create_platform_notification(
            user_id=user_id,
            title="System Alert Monitor Active",
            message=f"Welcome {user_doc.get('name', 'User')}. Your real-time research and funding alerts are active.",
            related_module="profile",
            priority="low"
        )

    return created_alerts


# --------------------------------------------------------------------------
# API Queries & Mutations
# --------------------------------------------------------------------------

def get_user_notifications(
    user_id: str,
    notification_type: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> dict:
    query = {"user_id": user_id}
    
    if notification_type and notification_type.upper() != "ALL":
        query["notification_type"] = notification_type.upper()

    total = notifications_collection.count_documents(query)
    unread_count = notifications_collection.count_documents({"user_id": user_id, "is_read": False})

    skip = (page - 1) * limit
    cursor = notifications_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    
    notifications = [serialize_notification(doc) for doc in cursor]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "unread_count": unread_count,
        "notifications": notifications
    }


def get_unread_notifications(user_id: str) -> dict:
    query = {"user_id": user_id, "is_read": False}
    unread_count = notifications_collection.count_documents(query)
    cursor = notifications_collection.find(query).sort("created_at", -1).limit(50)
    
    notifications = [serialize_notification(doc) for doc in cursor]

    return {
        "unread_count": unread_count,
        "notifications": notifications
    }


def get_notification_by_id(user_id: str, notification_id: str) -> Optional[dict]:
    try:
        obj_id = ObjectId(notification_id)
        doc = notifications_collection.find_one({"_id": obj_id})
    except (InvalidId, TypeError):
        doc = notifications_collection.find_one({"_id": notification_id})

    if not doc:
        return None
    
    # Ownership Check: return None if user does not own it (handled as 404/403 in route)
    if str(doc.get("user_id")) != str(user_id):
        return {"_error": "unauthorized"}

    return serialize_notification(doc)


def mark_as_read(user_id: str, notification_id: str) -> Optional[dict]:
    try:
        obj_id = ObjectId(notification_id)
        query = {"_id": obj_id}
    except (InvalidId, TypeError):
        query = {"_id": notification_id}

    doc = notifications_collection.find_one(query)
    if not doc:
        return None

    if str(doc.get("user_id")) != str(user_id):
        return {"_error": "unauthorized"}

    notifications_collection.update_one(query, {"$set": {"is_read": True}})
    doc["is_read"] = True
    return serialize_notification(doc)


def mark_all_as_read(user_id: str) -> dict:
    result = notifications_collection.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {
        "message": "All notifications marked as read",
        "modified_count": result.modified_count
    }
