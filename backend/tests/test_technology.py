import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.technology_service import (
    resolve_canonical_domain,
    get_technology_filter,
    get_technology_overview,
    get_emerging_technologies_payload,
    get_technology_details,
    get_technology_maturity,
    get_technology_adoption,
    get_technology_opportunities,
    get_technology_competitors
)

client = TestClient(app)


# ============================================================
# CANONICAL DOMAIN RESOLUTION & FILTERING
# ============================================================

def test_resolve_canonical_domain_exact_match():
    canonical = resolve_canonical_domain("Digital communication")
    assert canonical == "Digital communication"


def test_resolve_canonical_domain_case_insensitive():
    canonical = resolve_canonical_domain("digital communication")
    assert canonical == "Digital communication"

    canonical2 = resolve_canonical_domain("cOmPuTeR tEcHnOlOgY")
    assert canonical2.lower() == "computer technology"

    canonical3 = resolve_canonical_domain("medical technology")
    assert canonical3 == "Medical technology"


def test_resolve_canonical_domain_unknown_and_empty():
    assert resolve_canonical_domain("") == ""
    assert resolve_canonical_domain("   ") == ""
    unknown = resolve_canonical_domain("UnknownTechnicalFieldXYZ123")
    assert unknown == "UnknownTechnicalFieldXYZ123"


def test_get_technology_filter():
    filt = get_technology_filter("Digital communication")
    assert "$or" in filt
    assert len(filt["$or"]) == 2
    assert "technology_field" in filt["$or"][0]
    assert "wipo_field" in filt["$or"][1]


# ============================================================
# SERVICE LOGIC & DATA CONSISTENCY
# ============================================================

def test_get_technology_overview():
    overview = get_technology_overview()
    assert "total_patents" in overview
    assert "classified_patents" in overview
    assert "total_organizations" in overview
    assert "technology_fields" in overview
    assert "organizations" in overview
    assert "top_organizations" in overview
    assert "source_provenance" in overview

    # Verify counts and scope semantics
    assert overview["total_patents"] >= 325820
    assert overview["classified_patents"] <= overview["total_patents"]
    assert overview["total_organizations"] > 40000  # Unique non-empty assignees
    assert len(overview["top_organizations"]) > 0
    assert overview["source_provenance"] == "PatentsView Cached Dataset"


def test_get_emerging_technologies_payload():
    emerging = get_emerging_technologies_payload()
    assert "technologies" in emerging
    assert "total_monitored_patents" in emerging
    assert "total_unique_organizations" in emerging
    assert "domain_organization_associations" in emerging
    assert "source_provenance" in emerging

    techs = emerging["technologies"]
    assert len(techs) == 20

    summed_patents = sum(t["patent_count"] for t in techs)
    assert emerging["total_monitored_patents"] == summed_patents

    # Unique assignees across the top 20 domains should be <= total associations
    assert emerging["total_unique_organizations"] <= emerging["domain_organization_associations"]
    assert emerging["total_unique_organizations"] > 35000
    assert emerging["source_provenance"] == "PatentsView Cached Dataset"


def test_get_technology_details_valid():
    details = get_technology_details("Digital communication")
    assert details is not None
    assert details["canonical_name"] == "Digital communication"
    assert details["patent_count"] > 30000
    assert details["unique_organizations_count"] > 0
    assert "organizations" in details
    assert "cpc_areas" in details
    assert "source_provenance" in details
    assert details["source_provenance"] == "PatentsView Cached Dataset"


def test_get_technology_details_unknown():
    details = get_technology_details("NonExistentSpecialDomain999")
    assert details is None


def test_get_technology_maturity():
    mat = get_technology_maturity("Computer technology")
    assert mat is not None
    assert mat["canonical_name"].lower() == "computer technology"
    assert mat["maturity_stage"] in ["Established", "Developing", "Growing", "Early"]
    assert mat["patent_activity"] > 50000
    assert mat["organization_activity"] > 0
    assert "methodology" in mat


def test_get_technology_adoption():
    adopt = get_technology_adoption("Medical technology")
    assert adopt is not None
    assert adopt["canonical_name"] == "Medical technology"
    assert isinstance(adopt["adoption_proxy"], list)
    assert len(adopt["adoption_proxy"]) > 0
    first_year = adopt["adoption_proxy"][0]
    assert "year" in first_year
    assert "patent_count" in first_year
    assert "organization_count" in first_year


def test_get_technology_opportunities():
    opps = get_technology_opportunities("Digital communication")
    assert opps is not None
    assert "opportunities" in opps
    assert len(opps["opportunities"]) > 0
    assert "signals" in opps["opportunities"][0]


def test_get_technology_competitors():
    comps = get_technology_competitors("Digital communication")
    assert comps is not None
    assert "competitors" in comps
    assert len(comps["competitors"]) > 0
    first_comp = comps["competitors"][0]
    assert "organization" in first_comp
    assert "patent_count" in first_comp


# ============================================================
# API ENDPOINT ROUTE TESTS
# ============================================================

def test_api_dashboard_endpoint():
    response = client.get("/api/technology/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total_patents"] >= 325820
    assert data["total_organizations"] > 40000
    assert len(data["technology_fields"]) > 0


def test_api_emerging_endpoint():
    response = client.get("/api/technology/emerging")
    assert response.status_code == 200
    data = response.json()
    assert "technologies" in data
    assert len(data["technologies"]) == 20
    assert "total_monitored_patents" in data
    assert "total_unique_organizations" in data


def test_api_domain_details_url_encoded():
    # URL encoded space
    response = client.get("/api/technology/Digital%20communication")
    assert response.status_code == 200
    data = response.json()
    assert data["technology"] == "Digital communication"
    assert data["patent_count"] > 30000


def test_api_domain_details_case_insensitive():
    response = client.get("/api/technology/digital%20communication")
    assert response.status_code == 200
    data = response.json()
    assert data["technology"] == "Digital communication"


def test_api_domain_details_computer_and_medical():
    resp_comp = client.get("/api/technology/Computer%20technology")
    assert resp_comp.status_code == 200
    assert resp_comp.json()["patent_count"] > 50000

    resp_med = client.get("/api/technology/Medical%20technology")
    assert resp_med.status_code == 200
    assert resp_med.json()["patent_count"] > 20000


def test_api_domain_sub_routes():
    # /maturity
    r_mat = client.get("/api/technology/Digital%20communication/maturity")
    assert r_mat.status_code == 200
    assert "maturity_stage" in r_mat.json()

    # /adoption
    r_adp = client.get("/api/technology/Digital%20communication/adoption")
    assert r_adp.status_code == 200
    assert "adoption_proxy" in r_adp.json()

    # /opportunities
    r_opp = client.get("/api/technology/Digital%20communication/opportunities")
    assert r_opp.status_code == 200
    assert "opportunities" in r_opp.json()

    # /competitors
    r_cmp = client.get("/api/technology/Digital%20communication/competitors")
    assert r_cmp.status_code == 200
    assert "competitors" in r_cmp.json()


def test_api_unknown_domain_returns_404():
    response = client.get("/api/technology/NonExistentDomain12345")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

    # Sub-routes also 404
    resp_sub = client.get("/api/technology/NonExistentDomain12345/maturity")
    assert resp_sub.status_code == 404
