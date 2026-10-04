from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId

from app.database.connection import db, users_collection
from app.services.technology_service import get_technology_overview
from app.services.innovation_service import get_innovation_score
from app.services.commercialization_service import get_commercialization_analysis

funding_collection = db["funding_projects"]
patents_collection = db["patents"]
research_collection = db["research_works"]


def _get_user_display_name(user_id: str) -> str:
    if ObjectId.is_valid(user_id):
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return user.get("name") or user.get("email") or "Authorized User"
    return "Authorized User"


# --------------------------------------------------------------------------
# 1. FUNDING REPORT GENERATOR
# --------------------------------------------------------------------------

def generate_funding_report(user_id: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    query_str = (filters.get("query") or "").strip()
    domain = (filters.get("domain") or "").strip()
    org = (filters.get("organization") or "").strip()
    funding_type = (filters.get("funding_type") or "").strip()
    start_year = filters.get("start_year")
    end_year = filters.get("end_year")
    limit = int(filters.get("limit") or 50)

    mongo_query = {}

    if query_str:
        mongo_query["$or"] = [
            {"title": {"$regex": query_str, "$options": "i"}},
            {"project_title": {"$regex": query_str, "$options": "i"}},
            {"abstract": {"$regex": query_str, "$options": "i"}},
            {"agency": {"$regex": query_str, "$options": "i"}}
        ]

    if domain:
        mongo_query["$or"] = [
            {"agency": {"$regex": domain, "$options": "i"}},
            {"project_terms": {"$regex": domain, "$options": "i"}}
        ]

    if org:
        mongo_query["organization"] = {"$regex": org, "$options": "i"}

    if funding_type:
        mongo_query["funding_mechanism"] = {"$regex": funding_type, "$options": "i"}

    if start_year or end_year:
        year_filter = {}
        if start_year:
            year_filter["$gte"] = int(start_year)
        if end_year:
            year_filter["$lte"] = int(end_year)
        mongo_query["fiscal_year"] = year_filter

    cursor = funding_collection.find(mongo_query).sort("award_amount", -1).limit(limit)
    raw_docs = list(cursor)

    total_matched = funding_collection.count_documents(mongo_query)
    total_funding = sum(d.get("award_amount", 0) for d in raw_docs if d.get("award_amount"))
    avg_funding = (total_funding / len(raw_docs)) if raw_docs else 0

    records = []
    for d in raw_docs:
        amt = d.get("award_amount", 0)
        formatted_amt = f"${amt:,.2f}" if amt else "Grant Available"
        records.append({
            "project_id": d.get("application_id") or d.get("project_number") or str(d.get("_id")),
            "title": d.get("title") or d.get("project_title") or "Untitled Grant Project",
            "organization": d.get("organization") or d.get("agency") or "Federal Agency / Institute",
            "agency": d.get("agency") or d.get("funding_mechanism") or "NIH / Federal",
            "funding_type": d.get("funding_mechanism") or "Grant / Cooperative Agreement",
            "award_amount": amt,
            "award_amount_formatted": formatted_amt,
            "fiscal_year": d.get("fiscal_year") or "N/A",
            "contact_pi": d.get("contact_pi_name") or "Principal Investigator",
            "source": "NIH RePORTER / Federal Funding Database"
        })

    agency_counts = {}
    for r in records:
        ag = r["agency"]
        agency_counts[ag] = agency_counts.get(ag, 0) + 1

    chart_data = {
        "categories": list(agency_counts.keys())[:8],
        "values": [agency_counts[k] for k in list(agency_counts.keys())[:8]]
    }

    return {
        "report_type": "funding",
        "title": "Funding Intelligence & Grant Opportunities Report",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user_name": _get_user_display_name(user_id),
        "filters_applied": {
            "query": query_str,
            "domain": domain,
            "organization": org,
            "funding_type": funding_type,
            "start_year": start_year,
            "end_year": end_year
        },
        "summary": f"Identified {total_matched} matching funding projects representing ${total_funding:,.2f} in total award volume.",
        "metrics": [
            {"label": "Total Projects Found", "value": f"{total_matched:,}", "subtext": "Active grant projects"},
            {"label": "Total Award Volume", "value": f"${total_funding:,.0f}", "subtext": "Cumulative grant funding"},
            {"label": "Average Project Award", "value": f"${avg_funding:,.0f}", "subtext": "Per project mean"},
            {"label": "Top Funding Mechanism", "value": list(agency_counts.keys())[0] if agency_counts else "Grant", "subtext": "Dominant pathway"}
        ],
        "records": records,
        "chart_data": chart_data,
        "methodology": "Funding report synthesizes live database records from NIH RePORTER and federal research project datasets. Financial values reflect recorded award amounts."
    }


# --------------------------------------------------------------------------
# 2. PATENT REPORT GENERATOR
# --------------------------------------------------------------------------

def generate_patent_report(user_id: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    query_str = (filters.get("query") or "").strip()
    domain = (filters.get("domain") or "").strip()
    assignee = (filters.get("organization") or "").strip()
    start_year = filters.get("start_year")
    end_year = filters.get("end_year")
    limit = int(filters.get("limit") or 50)

    mongo_query = {}

    if query_str:
        mongo_query["$or"] = [
            {"patent_title": {"$regex": query_str, "$options": "i"}},
            {"title": {"$regex": query_str, "$options": "i"}},
            {"patent_number": {"$regex": query_str, "$options": "i"}},
            {"technology_field": {"$regex": query_str, "$options": "i"}}
        ]

    if domain:
        mongo_query["$or"] = [
            {"technology_field": {"$regex": domain, "$options": "i"}},
            {"technology_sector": {"$regex": domain, "$options": "i"}},
            {"wipo_field": {"$regex": domain, "$options": "i"}}
        ]

    if assignee:
        mongo_query["$or"] = [
            {"assignee": {"$regex": assignee, "$options": "i"}},
            {"organization": {"$regex": assignee, "$options": "i"}}
        ]

    if start_year or end_year:
        year_filter = {}
        if start_year:
            year_filter["$gte"] = int(start_year)
        if end_year:
            year_filter["$lte"] = int(end_year)
        mongo_query["filing_year"] = year_filter

    cursor = patents_collection.find(mongo_query).sort("_id", -1).limit(limit)
    raw_docs = list(cursor)

    total_matched = patents_collection.count_documents(mongo_query)

    records = []
    assignee_dist = {}
    field_dist = {}

    for d in raw_docs:
        p_title = d.get("patent_title") or d.get("title") or "Patent Publication"
        p_num = d.get("patent_number") or d.get("patent_id") or str(d.get("_id"))
        p_assignee = d.get("assignee") or d.get("organization") or (d.get("assignees")[0] if d.get("assignees") else "Independent Assignee")
        p_field = d.get("technology_field") or d.get("wipo_field") or "General Innovation"
        p_date = d.get("filing_date") or d.get("grant_date") or "N/A"
        p_cites = d.get("citation_count") or d.get("citations_count", 0)

        assignee_dist[p_assignee] = assignee_dist.get(p_assignee, 0) + 1
        field_dist[p_field] = field_dist.get(p_field, 0) + 1

        records.append({
            "patent_number": p_num,
            "title": p_title,
            "assignee": p_assignee,
            "technology_field": p_field,
            "filing_date": p_date,
            "citations": p_cites,
            "inventor_count": d.get("inventor_count", 1),
            "source": "USPTO / WIPO Patent Dataset"
        })

    top_assignees = sorted(assignee_dist.items(), key=lambda x: x[1], reverse=True)[:5]
    top_competitor = top_assignees[0][0] if top_assignees else "N/A"

    chart_data = {
        "categories": list(field_dist.keys())[:8],
        "values": [field_dist[k] for k in list(field_dist.keys())[:8]]
    }

    return {
        "report_type": "patents",
        "title": "Patent Intelligence & IP Landscape Report",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user_name": _get_user_display_name(user_id),
        "filters_applied": {
            "query": query_str,
            "domain": domain,
            "organization": assignee,
            "start_year": start_year,
            "end_year": end_year
        },
        "summary": f"Evaluated {total_matched} patent publications across relevant IPC/WIPO technological classifications.",
        "metrics": [
            {"label": "Total Patents Analyzed", "value": f"{total_matched:,}", "subtext": "Active IP records"},
            {"label": "Leading Assignee", "value": top_competitor[:30], "subtext": "Top patent holder"},
            {"label": "Key Tech Domain", "value": list(field_dist.keys())[0][:30] if field_dist else "General", "subtext": "Most frequent WIPO sector"},
            {"label": "Avg Inventors / Patent", "value": f"{sum(r['inventor_count'] for r in records)/len(records):.1f}" if records else "1.0", "subtext": "Collaboration index"}
        ],
        "records": records,
        "chart_data": chart_data,
        "methodology": "Patent report extracts data from USPTO and WIPO patent repositories, performing assignee clustering and field classification analysis."
    }


# --------------------------------------------------------------------------
# 3. RESEARCH TREND REPORT GENERATOR
# --------------------------------------------------------------------------

def generate_research_trend_report(user_id: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    query_str = (filters.get("query") or "").strip()
    domain = (filters.get("domain") or "").strip()
    start_year = filters.get("start_year")
    end_year = filters.get("end_year")
    limit = int(filters.get("limit") or 50)

    mongo_query = {}

    if query_str:
        mongo_query["$or"] = [
            {"title": {"$regex": query_str, "$options": "i"}},
            {"display_name": {"$regex": query_str, "$options": "i"}},
            {"concepts": {"$elemMatch": {"display_name": {"$regex": query_str, "$options": "i"}}}}
        ]

    if domain:
        mongo_query["$or"] = [
            {"concepts": {"$elemMatch": {"display_name": {"$regex": domain, "$options": "i"}}}},
            {"type": {"$regex": domain, "$options": "i"}}
        ]

    if start_year or end_year:
        year_filter = {}
        if start_year:
            year_filter["$gte"] = int(start_year)
        if end_year:
            year_filter["$lte"] = int(end_year)
        mongo_query["publication_year"] = year_filter

    cursor = research_collection.find(mongo_query).sort("cited_by_count", -1).limit(limit)
    raw_docs = list(cursor)

    total_matched = research_collection.count_documents(mongo_query)
    total_citations = sum(d.get("cited_by_count", 0) for d in raw_docs)
    avg_citations = (total_citations / len(raw_docs)) if raw_docs else 0

    records = []
    concept_dist = {}
    year_dist = {}

    for d in raw_docs:
        r_title = d.get("title") or d.get("display_name") or "Research Publication"
        r_id = str(d.get("id") or d.get("_id"))
        r_cites = d.get("cited_by_count", 0)
        r_year = d.get("publication_year") or "N/A"

        concepts = d.get("concepts", [])
        c_names = [c.get("display_name") for c in concepts if isinstance(c, dict) and c.get("display_name")]
        for cn in c_names[:3]:
            concept_dist[cn] = concept_dist.get(cn, 0) + 1

        if r_year != "N/A":
            year_dist[str(r_year)] = year_dist.get(str(r_year), 0) + 1

        records.append({
            "research_id": r_id,
            "title": r_title,
            "publication_year": r_year,
            "citations": r_cites,
            "primary_topic": c_names[0] if c_names else "Scientific Research",
            "source": "OpenAlex Scientific Knowledge Graph"
        })

    sorted_years = sorted(year_dist.items(), key=lambda x: x[0])
    chart_data = {
        "categories": [y[0] for y in sorted_years[-8:]],
        "values": [y[1] for y in sorted_years[-8:]]
    }

    return {
        "report_type": "research-trends",
        "title": "Research Intelligence & Emerging Publication Trends Report",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user_name": _get_user_display_name(user_id),
        "filters_applied": {
            "query": query_str,
            "domain": domain,
            "start_year": start_year,
            "end_year": end_year
        },
        "summary": f"Analyzed {total_matched} scholarly publications generating {total_citations:,} citations in the global literature.",
        "metrics": [
            {"label": "Total Publications Analyzed", "value": f"{total_matched:,}", "subtext": "Peer-reviewed works"},
            {"label": "Total Citation Impact", "value": f"{total_citations:,}", "subtext": "Cumulative citations"},
            {"label": "Average Citations / Paper", "value": f"{avg_citations:.1f}", "subtext": "Impact index"},
            {"label": "Top Emerging Concept", "value": list(concept_dist.keys())[0] if concept_dist else "AI", "subtext": "Hotspot keyword"}
        ],
        "records": records,
        "chart_data": chart_data,
        "methodology": "Research trend report analyzes bibliometric indicators and citation surges indexed from OpenAlex global research literature."
    }


# --------------------------------------------------------------------------
# 4. INNOVATION REPORT GENERATOR (Single Source of Truth)
# --------------------------------------------------------------------------

def generate_innovation_report(user_id: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    query_tech = (filters.get("technology") or filters.get("query") or "").strip()
    
    # If specific technology requested, score that tech; else aggregate top tech fields from patents
    if query_tech:
        tech_list = [query_tech]
    else:
        tech_overview = get_technology_overview()
        tech_list = [tf["technology"] for tf in tech_overview.get("technology_fields", []) if tf.get("technology")][:10]
        if not tech_list:
            tech_list = ["Artificial Intelligence", "Quantum Computing", "CRISPR Gene Editing", "Solid-State Batteries"]

    records = []
    total_score_sum = 0

    for tech in tech_list:
        # Reuses exact single-source-of-truth calculation from innovation_service
        score_data = get_innovation_score(tech)
        records.append({
            "technology": tech,
            "innovation_score": score_data.get("innovation_score", 0),
            "research_novelty": score_data.get("sub_scores", {}).get("research_novelty", 0),
            "patent_strength": score_data.get("sub_scores", {}).get("patent_strength", 0),
            "technology_maturity": score_data.get("sub_scores", {}).get("technology_maturity", {}).get("score", 0),
            "maturity_stage": score_data.get("sub_scores", {}).get("technology_maturity", {}).get("stage", "Unknown"),
            "market_potential": score_data.get("sub_scores", {}).get("market_potential", 0),
            "funding_relevance": score_data.get("sub_scores", {}).get("funding_relevance", 0),
            "evidence": score_data.get("evidence", {})
        })
        total_score_sum += score_data.get("innovation_score", 0)

    avg_score = (total_score_sum / len(records)) if records else 0

    chart_data = {
        "categories": [r["technology"][:20] for r in records[:8]],
        "values": [r["innovation_score"] for r in records[:8]]
    }

    top_record = max(records, key=lambda x: x["innovation_score"]) if records else {}

    return {
        "report_type": "innovation",
        "title": "Cross-Domain Innovation Scoring & Maturity Assessment Report",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user_name": _get_user_display_name(user_id),
        "filters_applied": {
            "technology": query_tech
        },
        "summary": f"Assessed composite innovation velocity connecting Research -> Patent -> Technology -> Market across {len(records)} tech fields.",
        "metrics": [
            {"label": "Technologies Evaluated", "value": str(len(records)), "subtext": "Technology fields"},
            {"label": "Average Innovation Score", "value": f"{avg_score:.1f} / 100", "subtext": "Cross-domain index"},
            {"label": "Highest Scoring Field", "value": top_record.get("technology", "N/A")[:30], "subtext": f"Score: {top_record.get('innovation_score', 0)}"},
            {"label": "Dominant Maturity Stage", "value": top_record.get("maturity_stage", "Established"), "subtext": "Market stage"}
        ],
        "records": records,
        "chart_data": chart_data,
        "methodology": "Innovation score is computed using exact project formulas combining research novelty (30%), patent strength (25%), technology maturity (20%), market potential (15%), and funding relevance (10%)."
    }


# --------------------------------------------------------------------------
# 5. COMMERCIALIZATION REPORT GENERATOR (Single Source of Truth)
# --------------------------------------------------------------------------

def generate_commercialization_report(user_id: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    query_tech = (filters.get("technology") or filters.get("query") or "").strip()

    if query_tech:
        tech_list = [query_tech]
    else:
        tech_overview = get_technology_overview()
        tech_list = [tf["technology"] for tf in tech_overview.get("technology_fields", []) if tf.get("technology")][:8]
        if not tech_list:
            tech_list = ["Artificial Intelligence", "Quantum Computing", "CRISPR Gene Editing", "Solid-State Batteries"]

    records = []

    for tech in tech_list:
        # Reuses exact single-source-of-truth calculation from commercialization_service
        analysis = get_commercialization_analysis(tech)
        pathways = analysis.get("pathways", {})
        evidence = analysis.get("evidence", {})

        records.append({
            "technology": tech,
            "patent_count": evidence.get("patent_count", 0),
            "organization_count": evidence.get("organization_count", 0),
            "inventor_count": evidence.get("inventor_count", 0),
            "productization_readiness": pathways.get("productization", {}).get("readiness", "N/A"),
            "licensing_readiness": pathways.get("licensing", {}).get("readiness", "N/A"),
            "startup_readiness": pathways.get("startup", {}).get("readiness", "N/A"),
            "partnership_readiness": pathways.get("industry_partnership", {}).get("readiness", "N/A")
        })

    chart_data = {
        "categories": [r["technology"][:20] for r in records[:8]],
        "values": [r["patent_count"] for r in records[:8]]
    }

    return {
        "report_type": "commercialization",
        "title": "Technology Commercialization & Transfer Pathways Report",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "user_name": _get_user_display_name(user_id),
        "filters_applied": {
            "technology": query_tech
        },
        "summary": f"Mapped potential commercialization pathways (productization, licensing, spin-out, partnerships) for {len(records)} key technology domains.",
        "metrics": [
            {"label": "Technologies Screened", "value": str(len(records)), "subtext": "Commercial fields"},
            {"label": "Total Supporting Patents", "value": f"{sum(r['patent_count'] for r in records):,}", "subtext": "Patent evidence base"},
            {"label": "Engaged Organizations", "value": f"{sum(r['organization_count'] for r in records):,}", "subtext": "Industry ecosystem"},
            {"label": "Primary Pathway Signal", "value": records[0]["productization_readiness"] if records else "Strong Licensing Signal", "subtext": "Pathway readiness"}
        ],
        "records": records,
        "chart_data": chart_data,
        "methodology": "Commercialization pathways represent derived transfer potential based on organization concentration and patent volume. Pathways are potential opportunities, not guaranteed outcomes."
    }
