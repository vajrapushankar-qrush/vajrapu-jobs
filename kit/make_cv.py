#!/usr/bin/env python3
"""The one standard CV -> GirijaShankar_Vajrapu_CV.pdf (fonts embedded, renders the
same on every machine). Source of truth for the wording: src/content/notes/plan/standard-cv.md
— change it there AND here (or ask Claude, who keeps both in step).

Run:  python3 kit/make_cv.py   ->  public/GirijaShankar_Vajrapu_CV.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, HRFlowable, KeepTogether, PageBreak)

# ---------- fonts (embedded) ----------
FD = '/usr/share/fonts/truetype/liberation/'
pdfmetrics.registerFont(TTFont('Sans', FD + 'LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SansB', FD + 'LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SansI', FD + 'LiberationSans-Italic.ttf'))
pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='SansB', italic='SansI')

INK = HexColor('#15211f'); MUTED = HexColor('#4a5a57'); TEAL = HexColor('#0d7a70'); LINE = HexColor('#c9d6d3')

def st(name, **kw):
    base = dict(fontName='Sans', fontSize=9.6, leading=13.2, textColor=INK, alignment=TA_LEFT,
                spaceBefore=0, spaceAfter=0)
    base.update(kw); return ParagraphStyle(name, **base)

S = {
    'name':    st('name', fontName='SansB', fontSize=20, leading=23, textColor=INK),
    'title':   st('title', fontName='SansB', fontSize=11, leading=14.5, textColor=TEAL),
    'contact': st('contact', fontSize=9, leading=12.5, textColor=MUTED),
    'summary': st('summary', fontSize=9.8, leading=14),
    'h':       st('h', fontName='SansB', fontSize=10.5, leading=13, textColor=TEAL,
                  spaceBefore=11, spaceAfter=3),
    'role':    st('role', fontName='SansB', fontSize=10.2, leading=13.4, spaceBefore=7),
    'meta':    st('meta', fontSize=9, leading=12, textColor=MUTED, spaceAfter=2),
    'b':       st('b', leftIndent=10, bulletIndent=1, spaceBefore=1.6),
    'skill':   st('skill', spaceBefore=1.6, leading=13.6),
    'edu':     st('edu', spaceBefore=1.6),
}

def B(text):  # bullet
    return Paragraph(text, S['b'], bulletText='–')

doc_items = []
A = doc_items.append

# ---------- header ----------
A(Paragraph('GIRIJA SHANKAR VAJRAPU', S['name']))
A(Spacer(1, 2))
A(Paragraph('AI Architect / Forward Deployed Engineer — Enterprise Finance &amp; SAP', S['title']))
A(Spacer(1, 4))
A(Paragraph('Hyderabad, India — remote (IST; overlaps UK/US hours) · +91 73963 13939 · '
            '<link href="mailto:vajrapushankar@gmail.com">vajrapushankar@gmail.com</link> · '
            '<link href="https://www.linkedin.com/in/vajrapushankar/">linkedin.com/in/vajrapushankar</link>', S['contact']))
A(Spacer(1, 7))
A(HRFlowable(width='100%', thickness=0.8, color=LINE))
A(Spacer(1, 7))
A(Paragraph('15 years at one intersection: ~12 architecting SAP FICO / SAP Analytics Cloud FP&amp;A systems for global '
            'enterprises, and 3 shipping production GenAI end to end as a solo founder. I sit with finance teams, read '
            'their ERP, and deploy AI workflows they actually adopt — discovery to production, alone or leading a pod.',
            S['summary']))

# ---------- selected proof ----------
A(Paragraph('SELECTED PROOF', S['h']))
A(B('<b>AR-collections agent in production</b> — QuickBooks Online + n8n: ledger sync, 4-level reminder '
    'escalation, stop-on-payment reconciliation, owner digest. Designed, built and operated solo (2026).'))
A(B('<b>14-market FP&amp;A transformation</b> — architected SAP Analytics Cloud planning (P&amp;L, balance sheet, '
    'OpEx/CapEx, workforce, cash, commodity forecasting) for Nomad Foods’ European markets, at Wipro.'))
A(B('<b>LLM products shipped end to end</b> — subscription-billing SaaS, automated appointment-reminder '
    'workflows, an LMS: RAG, multi-agent orchestration (LangGraph, LangChain, AutoGen, CrewAI), MCP/tool-use, '
    'human-review guardrails.'))

# ---------- experience ----------
A(Paragraph('EXPERIENCE', S['h']))

def job(role, org, when, bullets):
    rows = [Paragraph(role, S['role']), Paragraph(org + ' · ' + when, S['meta'])]
    rows += [B(x) for x in bullets]
    A(KeepTogether(rows))

job('Founder &amp; Director / Product Architect', 'QuantumRush — self-funded SaaS &amp; AI venture, remote India',
    'Nov 2023 – present', [
    'Shipped LLM-powered products end to end on Python (Django/FastAPI), PostgreSQL, React/Next.js; cloud deployment and operations; sole technical decision-maker.',
    'Applied GenAI in production: LLM API integration, prompt engineering &amp; evaluation, RAG/retrieval workflows, multi-agent orchestration, MCP/function-calling, human-review guardrails.',
    '2026: built and operate an accounts-receivable dunning engine over QuickBooks + n8n (sync → escalation → stop-on-payment → owner digest) and several Cloudflare Workers PWAs (CRM, operations trackers) — customer-environment deployment work, solo.',
])
job('Architect, FP&amp;A Transformation', 'Wipro Ltd — client: Nomad Foods, UK', 'May 2022 – Nov 2023', [
    'Architected a SAP Analytics Cloud FP&amp;A transformation across 14 international markets: P&amp;L, balance sheet, OpEx, CapEx, workforce, cash, working capital and commodity forecasting.',
    'Designed SAC stories, data actions and value-driver trees; led predictive-analytics and forecasting PoCs; guided migration from legacy planning to unified SAC.',
])
job('Senior Analyst / Offshore Lead, FP&amp;A Systems', 'Tyson Foods — via Oaklawn IT Solutions, India/US',
    'Jul 2019 – May 2022', [
    'Led offshore SAP planning support for a global food manufacturer; FP&amp;A reporting and forecasting; demand &amp; commodity forecasting; predictive-planning PoCs.',
])
job('Functional Consultant, Finance Systems', 'Tata Consultancy Services — clients: Astellas Pharma; F. Hoffmann-La Roche',
    '2015 – 2019', [
    'SAP BPC, BW-IP and FICO across budgeting, planning, consolidation and month-end close for global pharma; multinational stakeholder management.',
])
job('Senior Manager / Manager', 'R.K. Agro Engineering · Pioneer Alloy Castings, India', '2010 – 2014', [
    'Translated manufacturing and business processes into ERP requirements; delivered SAP Business One; stakeholder workshops, training, adoption.',
])

# ---------- skills (page 2 opens here, so no section splits mid-page) ----------
A(PageBreak())
A(Paragraph('SKILLS', S['h']))
A(Paragraph('<b>ERP &amp; Planning:</b> SAP S/4HANA, ECC, FICO, BW/4HANA, BW-IP, SAP BPC, SAP Analytics Cloud '
            '(certified: SAC Planning, 2023), SAP Business One', S['skill']))
A(Paragraph('<b>AI / GenAI:</b> LLM APIs, RAG &amp; vector databases, multi-agent orchestration (LangGraph, LangChain, '
            'AutoGen, CrewAI), MCP / tool-use / function-calling, prompt evaluation, ML foundations (regression, '
            'classification, forecasting)', S['skill']))
A(Paragraph('<b>Engineering:</b> Python (Django, FastAPI, Pandas, Scikit-learn), SQL (PostgreSQL, MySQL), '
            'JavaScript (React, Next.js), n8n, Git, REST APIs, Cloudflare Workers', S['skill']))
A(Paragraph('<b>Analytics:</b> Power BI, Tableau, Advanced Excel, dimensional modelling, ETL', S['skill']))

# ---------- education ----------
A(Paragraph('EDUCATION &amp; CERTIFICATIONS', S['h']))
A(Paragraph('<b>Advanced Management Program in Business Analytics</b> — Indian School of Business (ISB), Hyderabad, 2023', S['edu']))
A(Paragraph('<b>SAP Certified Application Associate</b> — SAP Analytics Cloud: Planning, 2023', S['edu']))
A(Paragraph('<b>MBA</b> — University of Greenwich, London, 2010 · <b>B.Sc. Information Technology</b> — KSOU, 2006', S['edu']))
A(Spacer(1, 6))
A(Paragraph('Languages: English, Hindi, Telugu · Domains: global manufacturing, food and pharma; stakeholders '
            'across India, UK, US and 14 EU markets.', S['meta']))

# ---------- build ----------
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'GirijaShankar_Vajrapu_CV.pdf')
M = 16 * mm
pw, ph = A4
doc = BaseDocTemplate(out, pagesize=A4, leftMargin=M, rightMargin=M, topMargin=14 * mm, bottomMargin=13 * mm,
                      title='Girija Shankar Vajrapu — CV', author='Girija Shankar Vajrapu',
                      subject='AI Architect / Forward Deployed Engineer — Enterprise Finance & SAP')
frame = Frame(M, 13 * mm, pw - 2 * M, ph - 27 * mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([PageTemplate(id='p', frames=[frame])])
doc.build(doc_items)
print('wrote', os.path.abspath(out))
