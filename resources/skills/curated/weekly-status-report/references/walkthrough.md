# Weekly Status Report Generation

**Recipe #2: From Scattered Updates to Consistent Reporting**

---

| Setup Time | Time Saved | Difficulty | Best For |
|------------|------------|------------|----------|
| 10 minutes (first time) / 5 minutes (repeat) | 2-3 hours per week | Beginner | All professionals with reporting requirements |

---

## The Problem

Every week, you need to produce a status report synthesizing information from multiple sources: emails, Slack messages, project tools, meetings, and your own memory. The information is scattered, the format requirements are specific, and the task eats into time you'd rather spend on actual work. You either rush through it (and miss things) or spend hours gathering and formatting.

**Pain Points:**
- Information lives in 5+ different places (email, Slack, Jira, docs, memory)
- Same work gets reformatted for different audiences
- Highlighting wins while being honest about challenges requires careful wording
- Recurring weekly task creates deadline pressure every single week
- Quality varies based on available time and energy

---

## The Outcome

A polished, consistent status report generated in minutes from your raw inputs. The report highlights achievements, flags risks appropriately, maintains your voice and format, and can be customized for different audiences (your manager, your team, stakeholders) from the same source material.

**What You'll Have When Done:**
- A formatted status report matching your organization's expectations
- Clear articulation of wins, progress, and blockers
- Risk flags with appropriate severity ratings
- Consistent format you can reuse every week
- Optional multiple versions for different audiences

---

## When to Use This Recipe

**Good Fit:**
- Weekly team or individual status reports
- Project status updates to stakeholders
- Manager reports rolling up team activity
- Client status updates on retainer work
- Any recurring report synthesizing activity over a period

**Not a Good Fit:**
- Real-time dashboards (use actual dashboard tools)
- Formal project reports requiring specific PMO templates (start there, then use this)
- One-time reports on unique situations
- Reports requiring extensive data analysis (see Recipe #53)

---

## Before You Start: Quick Checklist

- [ ] Claude Code is installed and working
- [ ] You've gathered or can access your update sources (emails, notes, tool exports)
- [ ] You know your report's required format (or are free to define one)
- [ ] You know who will read this report and what they care about
- [ ] You have 15-20 minutes for first-time setup

---

## How Claude Code Helps

**What Claude Code Does Well:**
- Synthesizes information from multiple unstructured sources
- Identifies patterns (what's a win vs. routine progress)
- Maintains consistent formatting week over week
- Adjusts tone for different audiences from same raw material
- Flags items that should be highlighted as risks or blockers

**Where Human Judgment Is Essential:**
- Deciding what to emphasize vs. downplay (political awareness)
- Adding context that isn't in written sources
- Calibrating risk severity (you know what's actually scary)
- Final review of tone and messaging
- Confirming accuracy of synthesized information

---

## Input Examples

**Ideal Source Materials:**

| Input Type | Example | What Claude Uses It For |
|------------|---------|------------------------|
| Email summary | Forwarded/copied key emails | Extracts updates, decisions, blockers |
| Slack exports | Key channel summaries | Captures team activity and discussions |
| Task tool export | Jira/Asana completed items | Lists concrete accomplishments |
| Meeting notes | Your weekly meeting notes | Captures decisions and commitments |
| Previous report | Last week's status | Maintains consistency, tracks carryover |
| Personal notes | Your running notes file | Captures context only you know |

**Sample Raw Input (What You Might Gather):**
```
This week - Jan 15-19

COMPLETED:
- Shipped the new dashboard feature (finally!)
- Fixed the login bug that was affecting 5% of users
- Interviewed 3 candidates for senior eng role
- Got approval for AWS budget increase

IN PROGRESS:
- API migration - 60% done, should finish next week
- New hire onboarding docs - started, need review
- Q1 planning deck - draft done, presenting Monday

BLOCKERS:
- Waiting on legal for vendor contract review (2 weeks now)
- Design team bandwidth - they're slammed with other project

MEETINGS:
- Met with Product to align on Q2 roadmap
- Customer escalation call - resolved, they're happy now
- Team retro - good feedback on sprint process

NEXT WEEK:
- Finish API migration
- Q1 planning presentation
- Start performance reviews
```

---

## Step-by-Step Implementation

### Step 1: Gather Your Raw Inputs
**Time: 5-10 minutes**

Spend a few minutes collecting information from your various sources. You don't need to organize it—just dump it into a single text file or note:

- Scroll through sent emails and note key items
- Check Slack for major threads or decisions
- Export or screenshot completed tasks from your project tool
- Review your calendar for meetings that produced outcomes
- Add anything from memory

Save this as `week-raw-updates.txt` or paste directly into Claude.

**Pro Tip:** Keep a running note throughout the week. Add items as they happen. Friday becomes assembly, not archaeology.

---

### Step 2: Launch Claude Code
**Time: 30 seconds**

```bash
claude
```

---

### Step 3: Run the Status Report Prompt
**Time: 2-3 minutes for Claude to process**

---

**PRIMARY PROMPT: Weekly Status Report Generator**

```
Please help me create my weekly status report from these raw inputs.

RAW UPDATES (from this week):
"""
[PASTE YOUR RAW NOTES, EMAILS, TASK LISTS HERE]
"""

REPORT REQUIREMENTS:
- Report period: [Week of January 15-19, 2024]
- My role: [Senior Software Engineer / Project Manager / etc.]
- Audience: [My manager / Leadership team / Stakeholders]
- Tone: [Professional but not stiff / Formal / Casual]

REPORT FORMAT:
Please structure the report as follows:

1. HIGHLIGHTS (Top 3-5)
   - Most significant accomplishments this week
   - Frame as value delivered, not just tasks done
   - Include metrics or impact where available

2. PROGRESS UPDATE
   - Organized by project or workstream
   - Current status, what moved forward, % complete if relevant
   - Brief, scannable bullets

3. BLOCKERS & RISKS
   - Items that are stuck or may slip
   - Include severity (High/Medium/Low)
   - Note what's needed to unblock

4. UPCOMING (Next Week)
   - Key priorities and focus areas
   - Any important deadlines or milestones
   - Dependencies or support needed

5. NOTES / FYI (Optional)
   - Items that don't fit above but are worth mentioning
   - Early warnings or heads-up items

Keep the total report under 1 page. Use bullet points for scannability. Bold key items.
```

---

### Step 4: Review and Verify
**Time: 5-10 minutes**

Review Claude's output for:

**Accuracy:**
- Are all key items from your raw input included?
- Are any items mischaracterized (routine work called a "highlight")?
- Are dates, percentages, and specifics correct?

**Tone:**
- Does it match how you actually communicate?
- Is the risk framing appropriate (not too alarming, not too casual)?
- Would you be comfortable if this went to executives?

**Completeness:**
- Did anything important get dropped?
- Are blockers accurately represented?

---

### Step 5: Refine as Needed
**Time: 2-5 minutes**

**To adjust highlights:**
```
Move the dashboard feature to the top of highlights - that was our biggest delivery this quarter. The bug fix can be in Progress.
```

**To add context:**
```
Add this context to the legal blocker: "This is blocking a $200K vendor contract. Escalation may be needed if not resolved by Jan 25."
```

**To adjust tone:**
```
The blockers section sounds too alarmist. Soften the language but keep the urgency clear.
```

**To create versions for different audiences:**
```
Create a shorter version (3 bullets max) I can send to my skip-level manager who just wants top-level updates.
```

**To match a specific format:**
```
Our team uses this template. Please reformat to match:
[paste template]
```

---

### Step 6: Export and Send
**Time: 1 minute**

```
Save this as "Status-Report-Week-Jan-15.md"
```

Or copy directly into your email/Slack/reporting system.

---

## Example Output

Below is an abbreviated example of a well-formatted status report:

---

> **WEEKLY STATUS REPORT**
> **Week of January 15-19, 2024 | Sarah Chen, Senior Software Engineer**
>
> ---
>
> **HIGHLIGHTS**
> - **Shipped Dashboard 2.0** - Major feature launch, now live for all customers. Initial feedback positive; tracking 40% improvement in user task completion.
> - **Resolved Critical Login Bug** - Fixed authentication issue affecting 5% of users. Customer complaints dropped to zero.
> - **AWS Budget Approved** - Secured $15K/month increase for scaling infrastructure ahead of Q2 growth.
>
> **PROGRESS UPDATE**
>
> *API Migration*
> - 60% complete (on track for Jan 26 finish)
> - Completed: user endpoints, auth flows
> - Next: payment endpoints, testing
>
> *Hiring - Senior Engineer*
> - 3 candidates interviewed this week
> - 1 strong candidate advancing to final round
> - Target decision by Jan 25
>
> *Q1 Planning*
> - Draft deck complete, presenting to leadership Monday
> - Incorporated feedback from product alignment meeting
>
> **BLOCKERS & RISKS**
>
> | Item | Severity | Status | Needed |
> |------|----------|--------|--------|
> | Legal review of vendor contract | **High** | Waiting 2 weeks | Escalation if not resolved by Jan 25 |
> | Design team bandwidth | Medium | Acknowledged | May delay onboarding docs by 1 week |
>
> **NEXT WEEK**
> - Complete API migration
> - Q1 planning presentation (Monday)
> - Begin performance reviews
> - Final interview for senior engineer role
>
> ---

---

## Troubleshooting Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Report is too long | Too much detail captured | Ask: "Condense to under 300 words, keeping only the most important items" |
| Missing context | Raw input didn't include it | Add verbally: "Also mention that the dashboard launch had been delayed twice before" |
| Highlights feel weak | Routine work elevated | Specify: "Only include items that would impress my manager in highlights" |
| Risk tone is wrong | Default severity misjudged | Calibrate: "The legal blocker is critical—treat it as our biggest risk this week" |
| Doesn't match team format | Team has specific template | Provide template: "Here's our team's format. Please restructure to match exactly" |
| Wrong audience tone | Audience wasn't specified | Re-run with context: "This goes to the CEO—make it more executive-level" |

---

## Tips from Experience

1. **Keep a running note all week.** The best status reports come from real-time capture, not Friday scrambling. Add items as they happen—even just keywords.

2. **Include previous week's report.** Claude can note what carried over, what got done, and what's new. This creates continuity leadership appreciates.

3. **Define "highlight" for your context.** What impresses your manager? Shipped features? Revenue impact? Risk mitigation? Tell Claude your criteria.

4. **Create different versions strategically.** A detailed version for your manager, a 3-bullet version for skip-level, a team-facing version with more detail. Same raw input, different outputs.

5. **Save your best format as a template.** Once you've refined your report structure, save the prompt. Future weeks become trivial.

6. **Don't over-polish.** Status reports should be clear and complete, not literary. Spend 80% of your time on accuracy, 20% on wordsmithing.

---

## Measuring Success

**You've succeeded with this recipe when:**
- [ ] Status reports take under 20 minutes instead of 2+ hours
- [ ] Format is consistent week over week
- [ ] Manager feedback indicates reports are clear and complete
- [ ] No "wait, you did that?" surprises when reports are reviewed
- [ ] You actually send reports on time (not delayed to Monday)

**Track over time:**
- Time spent on weekly status reports
- Feedback from report readers
- Items that got missed or miscommunicated

---

## Variations

### Manager Roll-up Report
For managers consolidating team status:
```
I'm a manager with 6 direct reports. Here are their individual updates:

[Paste team updates]

Please create a consolidated team status report that:
- Aggregates into team-level themes (not individual lists)
- Highlights the top 3-5 team wins
- Consolidates risks and blockers
- Notes any patterns or trends across the team
- Keeps it under 1 page
```

### Client Status Update
For agency/consulting client reports:
```
This is for a client status update. Please:
- Use professional, client-appropriate tone
- Emphasize value delivered and progress toward their goals
- Frame any challenges as "items needing discussion" not complaints
- Include a clear "Next Steps" section with any client dependencies
- Add a brief "Upcoming" section so they know what's coming
```

### Project Milestone Update
For significant project checkpoints:
```
This is a monthly milestone update for a major project. Please create a more substantial report including:
- Executive summary (2-3 sentences)
- Progress against original plan
- Key accomplishments this period
- Risks and issues with mitigation plans
- Budget/resource status if relevant
- Upcoming milestones
- Decisions needed
```

### Personal Brag Doc / Work Log
For your own career tracking:
```
Format this as a personal accomplishment log, not a status report. Focus on:
- Concrete achievements with metrics
- Skills demonstrated
- Visibility and recognition
- Challenges overcome
- Growth and learning

I'll use this for performance reviews and promotion discussions.
```

---

## Building Your Repeatable System

After using this recipe 2-3 times, establish your system:

1. **Create a weekly capture note** that you add to throughout the week
2. **Save your refined prompt** with your specific format requirements
3. **Set a Friday calendar reminder** at the same time each week
4. **Keep a "standing context" note** with your role, audience, and formatting preferences
5. **Archive sent reports** for future reference and consistency checking

**Sample Setup:**
```
status-reports/
├── templates/
│   ├── status-report-prompt.txt       # Your refined prompt
│   └── format-requirements.txt        # Audience-specific formats
├── 2024/
│   ├── week-01-jan-08.md
│   ├── week-02-jan-15.md
│   └── ...
└── running-capture.md                 # Add to this throughout the week
```

---

## How This Pattern Applies Elsewhere

This recipe's core pattern—**aggregate scattered updates → synthesize into structured format → customize for audience**—applies broadly:

| Role | Application |
|------|-------------|
| **Executives** | Board update preparation, investor updates |
| **Project Managers** | Steering committee reports, PMO roll-ups |
| **Consultants** | Client engagement status, partner updates |
| **Sales** | Pipeline updates, forecast submissions |
| **Product Managers** | Sprint summaries, stakeholder updates |
| **Customer Success** | Account reviews, renewal status reports |

---

## Next Steps

1. **This Friday:** Use this recipe for your next status report
2. **Save your prompt:** Once refined, keep it for next week
3. **Start a running note:** Create a place to capture items throughout the week
4. **Share the format:** If your team likes your reports, share the recipe

---

*Recipe #2 of 100 in the Claude Code Knowledge Worker Recipe Collection*
