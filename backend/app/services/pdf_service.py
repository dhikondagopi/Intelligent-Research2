import io
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count on footers.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Intelligent Research Platform — Executive Report")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (all pages)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — INTELLIGENT RESEARCH PLATFORM")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()


def generate_pdf_report(report_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=15
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#475569')
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    story = []

    # 1. Header & Title Block
    story.append(Paragraph(report_data.get("title", "Platform Intelligence Report"), title_style))
    story.append(Paragraph(f"REPORT TYPE: {report_data.get('report_type', '').upper()} INTELLIGENCE", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2563EB"), spaceAfter=12))

    # 2. Metadata Box
    user_name = report_data.get("user_name", "Authorized User")
    gen_time = report_data.get("generated_at", datetime.now().isoformat())[:19].replace("T", " ")
    filters_text = ", ".join([f"{k}: {v}" for k, v in report_data.get("filters_applied", {}).items() if v]) or "None"

    meta_table_data = [
        [
            Paragraph(f"<b>Generated For:</b> {user_name}", meta_style),
            Paragraph(f"<b>Generated At:</b> {gen_time} UTC", meta_style)
        ],
        [
            Paragraph(f"<b>Active Filters:</b> {filters_text}", meta_style),
            Paragraph("<b>Classification:</b> Intelligence Synthesis", meta_style)
        ]
    ]

    meta_table = Table(meta_table_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 3. Executive Summary
    story.append(Paragraph("Executive Summary", h2_style))
    story.append(Paragraph(report_data.get("summary", "Synthesis of platform intelligence metrics."), body_style))
    story.append(Spacer(1, 12))

    # 4. Key Metrics KPI Table
    metrics = report_data.get("metrics", [])
    if metrics:
        story.append(Paragraph("Key Performance Analytics", h2_style))
        kpi_cells = []
        for m in metrics[:4]:
            text_p = Paragraph(
                f"<font size=8 color='#64748B'>{m.get('label')}</font><br/>"
                f"<font size=13 color='#0F172A'><b>{m.get('value')}</b></font><br/>"
                f"<font size=7 color='#2563EB'>{m.get('subtext', '')}</font>",
                body_style
            )
            kpi_cells.append(text_p)

        # Pad to 4 cells if needed
        while len(kpi_cells) < 4:
            kpi_cells.append(Paragraph("", body_style))

        kpi_table = Table([kpi_cells], colWidths=[126, 126, 126, 126])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 14))

    # 5. Detailed Records Table
    records = report_data.get("records", [])
    report_type = report_data.get("report_type", "")

    story.append(Paragraph("Detailed Intelligence Records", h2_style))

    if not records:
        story.append(Paragraph("No records found matching the applied filter criteria.", body_style))
    else:
        table_headers = []
        col_widths = []
        row_keys = []

        if report_type == "funding":
            table_headers = ["Project Title", "Organization / Agency", "Mechanism", "Award Amount", "Fiscal Year"]
            col_widths = [180, 124, 80, 70, 50]
            row_keys = ["title", "organization", "funding_type", "award_amount_formatted", "fiscal_year"]
        elif report_type == "patents":
            table_headers = ["Patent Title", "Assignee / Holder", "Technology Field", "Filing Date", "Citations"]
            col_widths = [174, 130, 110, 50, 40]
            row_keys = ["title", "assignee", "technology_field", "filing_date", "citations"]
        elif report_type == "research-trends":
            table_headers = ["Publication Title", "Primary Topic", "Publication Year", "Citations"]
            col_widths = [224, 150, 60, 70]
            row_keys = ["title", "primary_topic", "publication_year", "citations"]
        elif report_type == "innovation":
            table_headers = ["Technology Field", "Novelty", "IP Strength", "Maturity", "Score"]
            col_widths = [184, 80, 80, 80, 80]
            row_keys = ["technology", "research_novelty", "patent_strength", "maturity_stage", "innovation_score"]
        else: # commercialization
            table_headers = ["Technology Field", "Patents", "Organizations", "Productization", "Licensing"]
            col_widths = [154, 50, 80, 110, 110]
            row_keys = ["technology", "patent_count", "organization_count", "productization_readiness", "licensing_readiness"]

        table_rows = [[Paragraph(h, table_header_style) for h in table_headers]]

        for r in records[:35]: # top 35 in PDF
            row_cells = []
            for k in row_keys:
                val = str(r.get(k, ""))
                row_cells.append(Paragraph(val, table_body_style))
            table_rows.append(row_cells)

        rec_table = Table(table_rows, colWidths=col_widths, repeatRows=1)
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(rec_table)

    story.append(Spacer(1, 14))

    # 6. Methodology & Disclaimer
    story.append(KeepTogether([
        Paragraph("Methodology & Analytical Framework", h2_style),
        Paragraph(report_data.get("methodology", "Data synthesized from active platform datasets."), body_style),
        Spacer(1, 6),
        Paragraph("<font color='#64748B' size=8>This report is generated automatically by the Intelligent Research Platform for analytical decision support. Information should be verified against official primary sources.</font>", body_style)
    ]))

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()
