# Document Summarization and Key Point Extraction

**Recipe #4: From Lengthy Documents to Actionable Insights**

---

| Setup Time | Time Saved | Difficulty | Best For |
|------------|------------|------------|----------|
| 2 minutes (first time) / 1 minute (repeat) | 15-45 minutes per document | Beginner | All professionals drowning in reading |

---

## The Problem

Your inbox and shared drives are filled with documents you should read but don't have time for: industry reports, policy documents, research papers, lengthy proposals, regulatory updates, and competitor analyses. You either skip them entirely (and miss important information) or skim so quickly you miss key points.

**Pain Points:**
- 50-page reports when you need the key points in 5 minutes
- Important details buried in dense prose
- No time to read everything that's relevant to your role
- Fear of missing critical information
- Same document needs different summaries for different purposes

---

## The Outcome

Any document transformed into a structured summary with key findings, implications, and action items—in the format and length you need. A 60-page industry report becomes a 2-page brief. A dense policy document becomes a checklist of what applies to you.

**What You'll Have When Done:**
- A structured summary at your chosen length
- Key findings and conclusions highlighted
- Implications for your role/organization extracted
- Recommended actions clearly stated
- Ability to discuss the document intelligently without reading every word

---

## When to Use This Recipe

**Good Fit:**
- Industry reports and market research
- Policy and procedure documents
- Research papers and white papers
- Lengthy proposals or business plans
- Regulatory or legal documents
- Competitor materials
- Meeting pre-reads you won't have time to fully digest

**Not a Good Fit:**
- Documents you need to understand deeply for decision-making (read them)
- Highly technical documents requiring specialized interpretation
- Creative content where nuance matters
- Short documents (under 5 pages—just read them)

---

## Before You Start: Quick Checklist

- [ ] Claude Code is installed and working
- [ ] You have the document in a readable format (PDF, Word, TXT, MD)
- [ ] You know your purpose for reading this document
- [ ] You know how much detail you need (quick gist vs. detailed analysis)
- [ ] You have 5-10 minutes for summary and review

---

## How Claude Code Helps

**What Claude Code Does Well:**
- Processes lengthy documents quickly
- Identifies key themes and conclusions across many pages
- Extracts relevant information based on your stated purpose
- Structures output in scannable, actionable format
- Adjusts summary depth based on your needs

**Where Human Judgment Is Essential:**
- Determining what's relevant to YOUR specific situation
- Interpreting implications that require organizational context
- Deciding which recommendations actually apply
- Verifying critical facts that drive important decisions
- Adding context the document doesn't provide

---

## Input Examples

**Ideal Source Materials:**

| Input Type | Example | What Claude Uses It For |
|------------|---------|------------------------|
| PDF report | `industry-report-2024.pdf` | Primary source for summarization |
| Word document | `policy-update.docx` | Extracts key changes and implications |
| Research paper | `market-research.pdf` | Identifies findings and methodology |
| Multiple docs | Several related files | Synthesizes across documents |
| Your context | "I'm evaluating this for our Q2 planning" | Focuses extraction on relevant aspects |

**Folder Structure (for related documents):**
```
reading-queue/
├── industry-report-Q4.pdf
├── competitor-analysis.pdf
└── regulatory-update.pdf
```

---

## Step-by-Step Implementation

### Step 1: Place Document in Working Directory
**Time: 1 minute**

Save or move the document to an accessible location:

```bash
# Copy document to your working folder
cp ~/Downloads/industry-report.pdf ~/Documents/reading-queue/
```

Or simply work from wherever the document lives.

---

### Step 2: Launch Claude Code
**Time: 30 seconds**

```bash
cd ~/Documents/reading-queue
claude
```

---

### Step 3: Run the Summarization Prompt
**Time: 2-5 minutes depending on document length**

---

**PRIMARY PROMPT: Document Summarization**

```
Please read and summarize the document: [FILENAME.pdf]

MY CONTEXT:
- My role: [e.g., Product Manager, CFO, Marketing Director]
- Why I'm reading this: [e.g., evaluating market opportunity, compliance review, competitive intelligence]
- What I'll do with this: [e.g., present to leadership, make a decision, share with team]

SUMMARY FORMAT:
Please provide:

1. EXECUTIVE SUMMARY (3-5 sentences)
   - What is this document about?
   - What are the main conclusions?
   - Why should I care?

2. KEY FINDINGS (5-7 bullets)
   - Most important facts, data points, or conclusions
   - Include specific numbers or metrics where relevant
   - Focus on findings relevant to my stated context

3. IMPLICATIONS FOR ME/MY ORGANIZATION
   - What does this mean for someone in my role?
   - What opportunities or risks does this present?
   - How does this affect our strategy or operations?

4. RECOMMENDED ACTIONS
   - What should I consider doing based on this document?
   - Any immediate actions vs. longer-term considerations?
   - Who else should see this information?

5. NOTABLE QUOTES / DATA POINTS
   - 2-3 specific quotes or statistics worth remembering
   - Include page references for easy retrieval

6. GAPS OR LIMITATIONS
   - What questions does this document NOT answer?
   - Any obvious biases or limitations in the analysis?

Target length: [1 page / 2 pages / brief 500 words]
```

---

### Step 4: Review the Summary
**Time: 3-5 minutes**

Read through Claude's summary and verify:

**Accuracy:**
- Do the key findings align with your quick skim of the document?
- Are any numbers or statistics that you can verify correct?

**Relevance:**
- Does the summary focus on what matters to YOU?
- Are the implications actually relevant to your context?

**Completeness:**
- Is anything obviously important missing?
- Did Claude miss something you noticed in a quick skim?

---

### Step 5: Refine as Needed
**Time: 2-3 minutes**

**To focus on specific aspects:**
```
I'm most interested in the competitive analysis section. Please expand the summary of that section and reduce focus on market sizing.
```

**To add detail:**
```
Expand the key findings section with more specific data points and statistics.
```

**To simplify:**
```
This is still too detailed. Give me a 3-bullet summary I can share verbally in 30 seconds.
```

**To extract actionable items:**
```
Based on this document, create a checklist of specific actions my team should consider taking.
```

**To compare with another document:**
```
Now read [other-document.pdf] and tell me how the conclusions compare or conflict with the first document.
```

---

### Step 6: Export and Use
**Time: 1 minute**

```
Save this summary as "Industry-Report-Q4-Summary.md"
```

Or for sharing:
```
Format this as a one-page memo I can share with my team, including the source document reference.
```

---

## Example Output

Below is an example summary of a hypothetical industry report:

---

> **EXECUTIVE SUMMARY**
>
> This Gartner report analyzes the enterprise SaaS market for 2024, projecting 18% growth driven primarily by AI integration and platform consolidation. The main conclusion is that standalone point solutions are losing to integrated platforms, with 67% of enterprises planning to reduce vendor count. Organizations investing in AI-native platforms will see significant competitive advantages in the next 18 months.
>
> **KEY FINDINGS**
>
> - Enterprise SaaS spending projected to reach $232B in 2024 (18% YoY growth)
> - **67% of enterprises** plan to reduce SaaS vendor count by 2025 (consolidation trend)
> - AI features now "table stakes"—78% of buyers rank AI capabilities as top-3 selection criteria
> - Security and compliance requirements driving 23% of new SaaS purchases
> - Mid-market segment growing fastest (24% YoY) vs. enterprise (15%) and SMB (12%)
> - Average enterprise uses 110 SaaS applications (down from 130 in 2023—consolidation happening)
> - Total cost of ownership becoming more important than per-seat pricing
>
> **IMPLICATIONS FOR [PRODUCT MANAGER ROLE]**
>
> - **Platform strategy critical**: Point solutions will struggle; integration and ecosystem play are essential
> - **AI investment non-negotiable**: Must accelerate AI feature roadmap to remain competitive
> - **Mid-market opportunity**: Consider packaging/pricing optimized for this fastest-growing segment
> - **Consolidation messaging**: Position as platform that replaces multiple tools, not just another tool
> - **TCO narrative**: Develop total cost of ownership calculator to support enterprise sales
>
> **RECOMMENDED ACTIONS**
>
> Immediate:
> - Review our AI feature roadmap against competitor capabilities cited in report
> - Assess current integration story—can we position as consolidation target?
>
> Near-term:
> - Develop mid-market specific packaging based on growth opportunity
> - Create TCO calculator for sales enablement
>
> Share with: VP Product, Sales Leadership, Marketing (for messaging update)
>
> **NOTABLE QUOTES / DATA POINTS**
>
> - "By 2026, 80% of enterprises will have explicit vendor consolidation targets as part of IT strategy" (p. 23)
> - "AI-native platforms show 3x higher NPS scores vs. AI-retrofitted solutions" (p. 47)
> - Figure 12 (p. 34): Detailed breakdown of selection criteria by buyer segment—useful for positioning
>
> **GAPS / LIMITATIONS**
>
> - Report focuses on North American market; global trends may differ
> - Heavy enterprise focus; SMB dynamics not deeply explored
> - Sponsored in part by major platform vendors (potential bias toward consolidation narrative)
> - Doesn't address implementation/switching costs of consolidation

---

## Troubleshooting Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Summary too generic | Context wasn't specific enough | Re-run with more specific role and purpose: "I'm evaluating this for whether to enter this market" |
| Missing key section | Large document, section overlooked | Direct attention: "Please specifically summarize Chapter 4 on competitive dynamics" |
| Too much detail | Didn't specify length | Add constraint: "Maximum 300 words total" |
| Not actionable enough | Focus was on summary not actions | Ask separately: "Based on this, what are the 5 most important actions I should take?" |
| Document not readable | File format issue | Convert to PDF or text format; ensure file isn't password protected |
| Important nuance lost | Summarization oversimplified | For critical decisions: "This is for a major decision. Please flag any areas where I should read the original for full context" |

---

## Tips from Experience

1. **State your purpose upfront.** "Summarize this" produces generic output. "Summarize this to decide if we should enter this market" produces focused insight.

2. **Include your role.** A CFO summary differs from a Marketing Director summary of the same document. Your role shapes what's relevant.

3. **Ask for page numbers.** For important documents, asking Claude to cite pages lets you quickly verify or dig deeper on critical points.

4. **Process multiple documents together.** "Read all three analyst reports in this folder and synthesize the common themes and contradictions" is powerful.

5. **Create tiered summaries.** Ask for a 30-second verbal summary, a 1-page written summary, and a detailed 3-page analysis. Use each for different contexts.

6. **Don't skip review on important decisions.** Summaries are for efficiency, not replacement. For high-stakes decisions, verify key facts in the original.

---

## Measuring Success

**You've succeeded with this recipe when:**
- [ ] You're actually consuming documents that used to pile up unread
- [ ] You can contribute intelligently to discussions about documents you've summarized
- [ ] Key information is no longer missed due to time constraints
- [ ] You feel less anxiety about your reading backlog
- [ ] Others find your document summaries useful

**Track over time:**
- Number of documents processed vs. unread backlog
- Quality of your contributions to discussions about summarized documents
- Time spent on reading vs. value extracted

---

## Variations

### Meeting Pre-read Summary
For documents shared before meetings:
```
This is a pre-read for tomorrow's meeting. Please summarize with focus on:
- What decisions will this document inform?
- What questions should I ask in the meeting?
- What might be controversial or require discussion?
- What background do I need to contribute effectively?

Keep it brief—I have 10 minutes.
```

### Regulatory/Compliance Review
For policy, legal, or compliance documents:
```
This is a regulatory update. Please summarize with focus on:
- What has changed from previous regulation?
- What specifically applies to our type of organization?
- What are the compliance deadlines?
- What actions must we take to comply?
- What are the penalties for non-compliance?

Format as a compliance checklist I can share with legal.
```

### Competitive Analysis
For competitor materials:
```
This is a competitor's [annual report / product documentation / press release]. Please analyze:
- What are their stated priorities and strategy?
- What capabilities are they highlighting?
- What markets or customers are they targeting?
- What can we infer about their weaknesses?
- How does this compare to our positioning?

Focus on actionable competitive intelligence.
```

### Research Paper Digest
For academic or research papers:
```
This is a research paper. Please provide:
- Research question and hypothesis
- Methodology (brief)
- Key findings and statistical significance
- Limitations acknowledged by authors
- Practical implications for industry application
- How this relates to other research I might know

Use plain language—minimize jargon.
```

---

## Building Your Repeatable System

After using this recipe regularly, establish your system:

1. **Create a "reading queue" folder** where documents go before processing
2. **Save prompt variations** for your common document types
3. **Build a summary archive** organized by topic or date
4. **Set a weekly "document processing" time** to clear your queue
5. **Create summary templates** for sharing with your team

**Sample Setup:**
```
document-summaries/
├── reading-queue/               # Documents waiting to be processed
├── prompts/
│   ├── industry-report.txt
│   ├── regulatory-review.txt
│   └── competitive-intel.txt
├── summaries/
│   ├── 2024-Q1/
│   ├── 2024-Q2/
│   └── ...
└── archive/                     # Original documents with completed summaries
```

---

## How This Pattern Applies Elsewhere

This recipe's core pattern—**large unstructured content → purpose-focused extraction → structured actionable output**—applies broadly:

| Role | Application |
|------|-------------|
| **Executives** | Board materials, strategic plans, analyst reports |
| **Legal** | Contracts, regulations, case summaries |
| **Product** | User research reports, competitor docs, specifications |
| **Finance** | Audit reports, financial filings, market research |
| **HR** | Policy documents, benefits guides, employment law updates |
| **Marketing** | Market research, campaign reports, brand studies |

---

## Next Steps

1. **Today:** Pick one document from your "should read" pile and summarize it
2. **This week:** Process 3-5 documents using different prompt variations
3. **Establish a routine:** Set aside time weekly to clear your reading queue
4. **Share:** When a summary is particularly useful, share it with colleagues

---

*Recipe #4 of 100 in the Claude Code Knowledge Worker Recipe Collection*
