#!/usr/bin/env python3
"""Create the two-page public briefing from the reviewed, aggregate-only release."""
from html import escape
import json
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[1]
d=json.loads((ROOT/'data/public_patterns_sample.json').read_text())
if d['release_id']!='2026-11-10-v1':
    raise SystemExit('Review the dated briefing narrative before a different release.')
dest=ROOT/'assets/reports/wrs-statistics-2026-11-10.pdf'
dest.parent.mkdir(parents=True,exist_ok=True)
fontroot=Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('WRS',str(fontroot/'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('WRS-Bold',str(fontroot/'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('WRS',normal='WRS',bold='WRS-Bold')
plum=colors.HexColor('#29182d'); gold=colors.HexColor('#f4b84f'); pale=colors.HexColor('#fff3df'); grey=colors.HexColor('#55505a')
styles={
 'brand':ParagraphStyle('brand',fontName='WRS-Bold',fontSize=9,leading=12,textColor=plum,spaceAfter=12),
 'title':ParagraphStyle('title',fontName='WRS-Bold',fontSize=24,leading=28,textColor=plum,spaceAfter=10),
 'h2':ParagraphStyle('h2',fontName='WRS-Bold',fontSize=14,leading=18,textColor=plum,spaceBefore=10,spaceAfter=8),
 'body':ParagraphStyle('body',fontName='WRS',fontSize=9.3,leading=13.5,textColor=plum,spaceAfter=8),
 'small':ParagraphStyle('small',fontName='WRS',fontSize=8,leading=11.5,textColor=grey,spaceAfter=7),
 'cell':ParagraphStyle('cell',fontName='WRS',fontSize=8.1,leading=11.2,textColor=plum),
 'num':ParagraphStyle('num',fontName='WRS-Bold',fontSize=9,leading=12,textColor=plum,alignment=2),
 'big':ParagraphStyle('big',fontName='WRS-Bold',fontSize=22,leading=27,textColor=plum,spaceAfter=3,alignment=TA_CENTER),
 'center':ParagraphStyle('center',fontName='WRS',fontSize=8.5,leading=12,textColor=plum,alignment=TA_CENTER),
}
def p(text,style='body'): return Paragraph(text,styles[style])
def row_table(chart):
    rows=[]
    for item in chart['items']:
        rows.append([p(escape(item['label']),'cell'),p(f'{item["count"]}<br/><font size="7.6">{item["percentage"]:.1f}%</font>','num')])
    t=Table(rows,colWidths=[67*mm,17*mm],hAlign='LEFT')
    t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,-1),.35,colors.HexColor('#ded8df'))]))
    return t
def footer(canvas,doc):
    canvas.saveState();canvas.setFont('WRS',7.4);canvas.setFillColor(grey)
    canvas.drawString(18*mm,13*mm,'Waiting Room Stories | 10 November 2026 | Release 2026-11-10-v1')
    canvas.drawRightString(A4[0]-18*mm,13*mm,str(doc.page));canvas.restoreState()
doc=SimpleDocTemplate(str(dest),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=21*mm,title='Waiting Room Stories: owner statistics, 10 November 2026',author='Ollie Cutts / Waiting Room Stories')
story=[p('THE WAITING ROOM STORIES PROJECT','brand'),p('What owners have told us.','title'),p('<b>235 submissions with permission for anonymous campaign use.</b><br/>Included responses: 24 May-7 July 2026. Source reviewed: 10 November 2026.'),p('A self-selected collection of experiences, not a representative survey or independently verified clinical evidence. Most included responses are from the United States. These figures are not UK rates.','small')]
cards=[]
for chart,key,label in [('cost_influence','yes_or_partly','said cost was part of the decision (Yes or Partly)'),('barriers','upfront','selected upfront payment as a barrier'),('help','safe_payment_plan','selected a safe payment plan as something that might have helped')]:
    item=next(row for row in d['charts'][chart]['items'] if row['id']==key)
    cards.append([p(f'{item["count"]} / {d["counts"]["eligible_public_submissions"]}','big'),p(f'<b>{item["percentage"]:.1f}%</b> {label}','center')])
t=Table([cards],colWidths=[58*mm]*3)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),pale),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8)]))
story += [t,Spacer(1,8),p('<b>Geography:</b> United States 195 (83.0%); United Kingdom 24 (10.2%); Canada 7 (3.0%); other locations or not stated 9 (3.8%).','small'),p('Barriers and possible help','h2'),p('Each question has a denominator of 235, with no missing answers in this cohort. Multiple answers were possible, so percentages do not add to 100%. Smaller options are grouped as explained on page 2.','small')]
left=[p('<b>Barriers selected</b>','body'),row_table(d['charts']['barriers'])]
right=[p('<b>What might have helped</b>','body'),row_table(d['charts']['help']),Spacer(1,10),p('A preference for credit or a grant is not evidence of eligibility, availability or financial suitability.','small')]
two=Table([[left,right]],colWidths=[87*mm,87*mm])
two.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),7)]))
story += [two,PageBreak(),p('THE WAITING ROOM STORIES PROJECT','brand'),p('UK evidence and next action.','title'),p('<b>24 UK submissions</b> are included. In this small, self-selected subset, 17 selected Yes or Partly when asked whether cost was part of the decision; 6 selected a safe payment plan as helpful and 5 selected insurance paying the vet directly. These support counts can overlap. No UK prevalence estimate is claimed.'),p('A practical proposal','h2'),p('At one willing UK hospital, test a short payment explanation within existing paperwork: the amount needed now, the separate hospital and insurer decisions, what remains uncertain, and who will give the next answer. A possible 20-30-encounter trial would measure owner understanding, unresolved payment barriers and staff time. The provider would retain clinical decisions and patient records. No pilot or partner is agreed.'),p('A clearer explanation cannot by itself make an unaffordable bill affordable. The purpose is to remove avoidable administrative barriers and identify the remaining financial decisions that require change.','small'),p('How to interpret this release','h2')]
method=[
 '<b>Source:</b> a snapshot of the connected current-form response Sheet. It contains 295 rows and 294 distinct platform submission IDs; one repeated ID has matching structured answers and permission. The latest timestamp was retained. These are submissions, not verified unique owners, animals or emergencies.',
 '<b>Permission:</b> only 235 records answering Yes, anonymously to the campaign-use question are included. The other 59 record contact-first or private-research-only choices. Follow-up contact permission is separate. The complete historical form notice has not been reconstructed.',
 '<b>Dates:</b> source records extend to 3 September 2026; the included public-use subset ends on 7 July. November is the review date, not a new-response date. Completeness against the live Fillout account is not yet independently reconciled.',
 '<b>Counting:</b> use direct fixed-option answers only, with one count per submission per category. No narrative keyword coding is included. Barriers and support have 29 and 47 multi-option submissions respectively. Percentages are rounded to one decimal.',
 '<b>Small groups:</b> published cells are at least five. Unclear policy cover and reimbursement waiting are combined; each submission is counted once in that group. Smaller location groups are combined. The website explains the additional care, cost and insurance grouping; UK figures are selected counts only.',
 '<b>Correction:</b> the old 402 combined 361 processed rows with 41 legacy entries; the processed rows contained repeated generated IDs. This release uses a different, documented source and permission rule. Legacy entries and Professional Insight are excluded, not discarded.',
 '<b>Limits:</b> self-selection, recall and audience geography limit interpretation. Accounts are self-reported, not checked against clinical records or invoices. These data cannot establish overcharging, national prevalence, comparative provider quality or a financial cause of a medical outcome.',
]
for text in method: story.append(p(text,'small'))
story += [p('Sources, tables and contact','h2'),p('Full tables, methods and aggregate CSV/JSON: <link href="https://waitingroom.kingchillithepug.com/patterns.html" color="#542459">waitingroom.kingchillithepug.com/patterns.html</link><br/>Independent UK context: <link href="https://www.gov.uk/cma-cases/veterinary-services-market-for-pets-review" color="#542459">CMA veterinary market investigation</link>; <link href="https://www.rcvs.org.uk/veterinary-professionals/conduct-and-guidance/supporting-guidance/11-communication-and-consent" color="#542459">RCVS communication and consent guidance</link>.<br/>Project enquiries/corrections: <link href="mailto:info@kingchillithepug.com" color="#542459">info@kingchillithepug.com</link>. No emergency funding or treatment service.','small')]
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(dest)
