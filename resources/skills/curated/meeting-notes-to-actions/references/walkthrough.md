# Meeting Notes to Action Items Pipeline

**Recipe #1: From Raw Notes to Structured Accountability**

---

| Setup Time | Time Saved | Difficulty | Best For |
|------------|------------|------------|----------|
| 5 minutes (first time) / 2 minutes (repeat) | 30-60 minutes per meeting | Beginner | All knowledge workers |

---

## The Problem

After every meeting, you're left with messy notes—bullet points, half-sentences, names without context, and vague commitments. Turning these into clear action items with owners and deadlines, then drafting follow-up emails to each person, takes significant time. Often, this work gets delayed or skipped entirely, leading to dropped balls and confusion about who's doing what.

**Pain Points:**
- Raw meeting notes are disorganized and incomplete
- Extracting action items requires re-reading and interpreting notes
- Assigning owners and deadlines means cross-referencing discussions
- Writing individual follow-up emails is tedious and repetitive
- Delayed follow-up reduces meeting effectiveness

---

## The Outcome

Within minutes of your meeting ending, you have a clean summary, a structured action item list with owners and deadlines, and personalized follow-up emails ready to send to each responsible party. Meeting accountability becomes automatic rather than aspirational.

**What You'll Have When Done:**
- A formatted meeting summary suitable for sharing
- An action item table with Owner, Task, Deadline, and Context columns
- Individual follow-up email drafts for each action item owner
- Confidence that nothing from the meeting was lost

---

## When to Use This Recipe

**Good Fit:**
- Any meeting with 3+ action items or decisions
- Cross-functional meetings with multiple owners
- Client or stakeholder meetings requiring follow-up documentation
- Recurring team meetings where you want consistent formatting
- Meetings where you took rough notes and need to formalize them

**Not a Good Fit:**
- Quick 1:1s with a single clear next step (overkill)
- Meetings where you have a dedicated note-taker producing formal minutes
- Brainstorming sessions with no concrete action items
- Informational presentations with no follow-up needed

---

## Before You Start: Quick Checklist

- [ ] Claude Code is installed and working (run `claude` in terminal to verify)
- [ ] You have your meeting notes in any format (typed, handwritten photo, voice memo transcript)
- [ ] You know the meeting attendees and their roles/responsibilities
- [ ] You have 5-10 minutes immediately after the meeting (best when fresh)
- [ ] You know any deadlines or timelines discussed in the meeting

---

## How Claude Code Helps

**What Claude Code Does Well:**
- Parses messy, incomplete notes and extracts meaning
- Identifies action items even when not explicitly stated ("John said he'd look into...")
- Infers owners based on context and discussion flow
- Generates consistent formatting across all your meetings
- Drafts personalized emails that reference specific discussion points

**Where Human Judgment Is Essential:**
- Confirming the right owner when discussion was ambiguous
- Setting realistic deadlines when none were explicitly stated
- Adding context that wasn't captured in notes (tone, priority, politics)
- Deciding which items are truly action items vs. just discussion points
- Reviewing email tone before sending

---

## Input Examples

**Ideal Source Materials:**

| Input Type | Example | What Claude Uses It For |
|------------|---------|------------------------|
| Raw typed notes | `meeting-notes-2024-01-15.txt` | Primary source for extraction |
| Calendar invite | Copy/paste of attendee list | Identifies participants and their roles |
| Agenda (if available) | `agenda.txt` | Provides structure and expected topics |
| Previous action items | `last-meeting-actions.txt` | Tracks what was completed vs. carried over |
| Voice transcript | `zoom-transcript.txt` | Captures discussion missed in notes |

**Sample Raw Notes (What You Might Have):**
```
Q4 Planning Meeting - Jan 15

Attendees: Sarah (PM), Mike (Eng Lead), Lisa (Design), Tom (Marketing)

- discussed timeline for new feature launch
- mike says eng needs 3 more weeks, original target was feb 1
- sarah concerned about marketing materials
- tom will check with agency on timeline flexibility
- design reviews - lisa showing mockups next tuesday
- budget question - need to confirm with finance if contractor budget approved
- sarah to send updated timeline to stakeholders by EOW
- mike mentioned tech debt concerns, might need to address before launch
- next meeting: jan 22 same time
```

---

## Step-by-Step Implementation

### Step 1: Capture Your Notes
**Time: 1-2 minutes**

Immediately after your meeting, get your notes into a text file. You can:

- Copy/paste from your note-taking app
- Save from a collaborative doc
- Type up handwritten notes
- Use a transcript from Zoom/Teams

Save as a simple text file or paste directly into Claude.

**Pro Tip:** Don't clean up your notes first—Claude handles messy input well, and cleaning wastes the time you're trying to save.

---

### Step 2: Launch Claude Code
**Time: 30 seconds**

Open your terminal:

```bash
claude
```

---

### Step 3: Run the Action Items Prompt
**Time: 2-3 minutes for Claude to process**

Paste your notes and the prompt below. Customize the bracketed sections.

---

**PRIMARY PROMPT: Meeting Notes to Action Items Pipeline**

```
Here are my raw notes from a meeting. Please process them into three outputs:

MEETING NOTES:
"""
[PASTE YOUR RAW NOTES HERE]
"""

MEETING CONTEXT:
- Meeting type: [e.g., Q4 Planning, Weekly Team Sync, Client Check-in]
- Date: [meeting date]
- My role: [your role, so Claude knows your perspective]
- Attendees: [names and roles if not in notes]

Please create:

1. MEETING SUMMARY (1 paragraph)
   - What was discussed and decided
   - Key outcomes and conclusions
   - Suitable for sharing with people who weren't there

2. ACTION ITEMS TABLE
   Format as a markdown table with columns:
   | Owner | Action Item | Deadline | Context/Notes |

   Rules for action items:
   - Only include items that require someone to DO something
   - Infer owners from discussion context if not explicit
   - If deadline not stated, mark as "TBD - needs confirmation"
   - Include brief context so the item makes sense standalone

3. FOLLOW-UP EMAILS
   Draft a brief, friendly follow-up email for each person who has action items.
   - Subject line: "Action Items from [Meeting Name] - [Date]"
   - Remind them of their specific items with deadlines
   - Include relevant context from the discussion
   - Keep tone professional but warm
   - End with offer to clarify if needed

Format the emails so I can copy/paste directly into my email client.
```

---

### Step 4: Review the Outputs
**Time: 3-5 minutes**

Claude will generate all three outputs. Review each:

**Check the Summary:**
- Does it accurately capture what happened?
- Would someone who wasn't there understand the key points?

**Check the Action Items:**
- Are these actually action items (not just discussion points)?
- Are the owners correct?
- Do the deadlines match what was discussed?

**Check the Emails:**
- Is the tone appropriate for each recipient?
- Are the action items accurately represented?
- Is anything missing or misattributed?

---

### Step 5: Refine as Needed
**Time: 2-5 minutes**

Use follow-up prompts to adjust:

**To fix an owner:**
```
The database optimization task should be assigned to Mike, not Sarah. Please update the action items table and regenerate Mike's follow-up email.
```

**To add context you forgot to mention:**
```
Add this context: The Feb 1 deadline is hard because of the trade show. Please update the summary and action items to reflect this urgency.
```

**To adjust email tone:**
```
The email to the client (Tom) should be more formal. Please rewrite it with a professional tone suitable for external communication.
```

**To add an item you remembered:**
```
I forgot to note: Lisa also agreed to share the design system documentation with the engineering team by Friday. Add this to the action items and her follow-up email.
```

**To create a Slack version:**
```
Create a bullet-point version of just the action items I can paste into Slack.
```

---

### Step 6: Export and Send
**Time: 2 minutes**

Save the outputs:

```
Save the meeting summary and action items as "Q4-Planning-Meeting-2024-01-15-Summary.md"
```

Then copy/paste each email into your email client and send.

---

## Example Output

Below is an abbreviated example of what well-executed outputs look like:

---

> **MEETING SUMMARY**
>
> The Q4 Planning meeting reviewed the timeline for the new feature launch, which Engineering estimates will require 3 additional weeks beyond the original February 1 target. The team discussed implications for marketing materials and agency coordination. Key decisions included: Lisa will present design mockups next Tuesday, Sarah will communicate the updated timeline to stakeholders by end of week, and Tom will confirm agency flexibility. A budget question regarding contractor approval remains open pending Finance confirmation.
>
> **ACTION ITEMS**
>
> | Owner | Action Item | Deadline | Context/Notes |
> |-------|-------------|----------|---------------|
> | Tom | Check with agency on timeline flexibility for marketing materials | Jan 17 | Original launch date shifting; need to know if agency can adjust |
> | Lisa | Present design mockups to team | Jan 22 (Tuesday) | Team design review meeting |
> | Sarah | Send updated timeline to stakeholders | Jan 19 (EOW) | Reflecting the 3-week engineering extension |
> | Sarah | Confirm contractor budget approval with Finance | Jan 17 | Blocking question for resource planning |
> | Mike | Assess tech debt items and prioritize pre-launch fixes | TBD - needs confirmation | Raised as concern; needs scoping |
>
> **FOLLOW-UP EMAIL - Tom**
>
> Subject: Action Items from Q4 Planning Meeting - Jan 15
>
> Hi Tom,
>
> Thanks for joining today's planning discussion. You have one action item from the meeting:
>
> **Check with agency on timeline flexibility** (by Jan 17)
> Since Engineering needs 3 additional weeks, we need to know if the agency can adjust the marketing materials timeline accordingly. Please let us know what flexibility exists.
>
> Let me know if you have any questions about the context or need anything from my end.
>
> Best,
> [Your name]
>
> [Additional emails for Lisa, Sarah, and Mike follow same format...]

---

## Troubleshooting Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Action items are too vague | Notes lacked specificity | Add context in a follow-up: "The 'check with agency' item specifically means confirming if they can shift the deliverable date from Jan 30 to Feb 20" |
| Wrong person assigned | Ambiguous discussion in notes | Correct it: "Actually, the budget confirmation should be Sarah's item since she owns the project budget" |
| Missing action items | Implicit commitments not captured | Add them: "I forgot to include: Mike will also update the sprint board to reflect the new timeline" |
| Too many "action items" | Claude included discussion points | Clarify: "Items 4 and 6 are just discussion points, not action items. Please remove them." |
| Deadlines seem wrong | Notes were unclear | Specify: "All deadlines should be relative to our Feb 20 launch date, not the original Feb 1" |
| Email tone is off | Default professional may not fit | Provide example: "We have a casual team culture. Here's how I usually write: [example]" |

---

## Tips from Experience

1. **Do this immediately after the meeting.** Even 30 minutes later, you'll forget context that helps Claude interpret ambiguous notes. The 5 minutes right after is worth more than 15 minutes the next day.

2. **Include attendee roles, not just names.** "Mike (Eng Lead)" gives Claude context to correctly attribute technical items vs. process items.

3. **Don't over-edit your notes first.** Your raw notes with half-sentences and shorthand are fine. Claude's good at interpretation; your time is better spent reviewing output than cleaning input.

4. **Keep a "standing context" note.** For recurring meetings, maintain a file with team members, their roles, ongoing projects, and standard deadlines. Include it each time for better results.

5. **Use this for meetings you didn't run.** Even as an attendee, processing your own notes this way helps you stay on top of your commitments.

6. **Build an action item archive.** Save each meeting's action items with dates. Over time, this becomes a searchable record of commitments made.

---

## Measuring Success

**You've succeeded with this recipe when:**
- [ ] Follow-up emails go out within 1 hour of meeting end
- [ ] Action items have clear owners (no "we should..." items)
- [ ] You stop hearing "I didn't know I was supposed to do that"
- [ ] Meeting follow-through improves visibly
- [ ] You spend less than 10 minutes on post-meeting processing

**Track over time:**
- Time from meeting end to follow-up sent
- Percentage of action items completed by deadline
- Reduction in "dropped ball" incidents

---

## Variations

### Quick Slack Summary
For internal team meetings where email is overkill:
```
Instead of follow-up emails, create a single Slack message I can post to our team channel. Format: Brief summary, then bulleted action items with @mentions for owners. Keep it under 200 words.
```

### Client Meeting Follow-up
For external meetings requiring formal documentation:
```
This was a client meeting. Please create:
1. A formal meeting minutes document suitable for client distribution
2. Internal action items for our team (not shared with client)
3. A professional follow-up email to the client summarizing next steps

Use formal business tone throughout.
```

### Recurring Team Sync
For weekly standups or regular check-ins:
```
This is our weekly team sync. Please compare these action items against last week's list [paste previous items]. Note: items completed, items carried over, and new items added. Format as a progress update.
```

### Large Meeting Extraction
For all-hands or large meetings where you only need your items:
```
This was a large team meeting. I'm [YOUR NAME/ROLE]. Please extract only:
1. Action items assigned to me or my team
2. Key decisions that affect my work
3. Deadlines I need to be aware of

Ignore action items for other teams unless they depend on my work.
```

---

## Building Your Repeatable System

After using this recipe 2-3 times, establish your system:

1. **Create a meeting notes template** with attendee list section and your standard prompt
2. **Set up a folder structure** for meeting outputs organized by project or team
3. **Build a prompt snippet** in your text expander for the full action items prompt
4. **Establish a "5-minute rule"** - process notes within 5 minutes of meeting end
5. **Create an action item tracker** linking to all meeting action items

**Sample Setup:**
```
meetings/
├── templates/
│   └── action-items-prompt.txt     # Your refined prompt
├── 2024-Q1/
│   ├── 2024-01-15-q4-planning.md
│   ├── 2024-01-16-client-sync.md
│   └── ...
└── action-item-tracker.md          # Running list with status
```

---

## How This Pattern Applies Elsewhere

This recipe's core pattern—**capture messy input → extract structured information → generate multiple formatted outputs**—applies broadly:

| Role | Application |
|------|-------------|
| **Executives** | Board meeting minutes and follow-up assignments |
| **Project Managers** | Sprint retrospectives, stakeholder meetings |
| **Sales** | Client call notes to CRM updates and follow-up emails |
| **Consultants** | Client workshop notes to deliverable outlines |
| **Researchers** | Interview notes to findings summaries |
| **HR** | Interview debrief notes to candidate assessments |

---

## Next Steps

1. **Today:** Use this on your very next meeting—don't wait for a "big" meeting
2. **This week:** Refine your prompt based on what works for your meeting types
3. **Ongoing:** Build your action item archive and watch follow-through improve
4. **Share:** Send a colleague one of your clean meeting summaries

---

*Recipe #1 of 100 in the Claude Code Knowledge Worker Recipe Collection*
