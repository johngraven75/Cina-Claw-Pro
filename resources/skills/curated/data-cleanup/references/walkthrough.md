# Data Cleanup and Formatting

**Recipe #9: From Messy Data to Analysis-Ready Datasets**

---

| Setup Time | Time Saved | Difficulty | Best For |
|------------|------------|------------|----------|
| 5 minutes (first time) / 2 minutes (repeat) | 1-4 hours per dataset | Beginner | Analysts, operations staff, anyone working with data |

---

## The Problem

You receive data from various sources—exports from systems, spreadsheets from partners, CSVs from customers, copy-pasted tables—and it's never clean. Inconsistent formatting, missing values, duplicate rows, mixed data types, and cryptic column names. Before any analysis can happen, you spend hours on tedious data cleanup.

**Pain Points:**
- Inconsistent date formats (01/15/24 vs. 2024-01-15 vs. Jan 15)
- Names formatted differently (JOHN DOE vs. John Doe vs. doe, john)
- Missing or null values scattered throughout
- Duplicate entries that need identification
- Columns with mixed data types
- Data from multiple sources needing merger
- Manual cleanup is error-prone and tedious

---

## The Outcome

Clean, standardized, analysis-ready data with consistent formatting, handled missing values, identified duplicates, and proper data types. What took hours of manual work now takes minutes, with better consistency and fewer errors.

**What You'll Have When Done:**
- Standardized formatting across all columns
- Missing values handled appropriately
- Duplicates identified or removed
- Consistent data types
- Validation report of changes made
- Ready-to-analyze dataset

---

## When to Use This Recipe

**Good Fit:**
- Cleaning exports from business systems
- Standardizing partner or customer-provided data
- Preparing data for analysis or reporting
- Merging data from multiple sources
- Transforming data between formats
- Validating data quality

**Not a Good Fit:**
- Large datasets (100K+ rows)—use proper ETL tools
- Complex transformations requiring programming
- Data requiring domain-specific business logic
- Sensitive/regulated data cleanup (may need audit trails)

---

## Before You Start: Quick Checklist

- [ ] Claude Code is installed and working
- [ ] Your data is in a readable format (CSV, Excel, or text)
- [ ] You know what "clean" looks like for this data
- [ ] Dataset is reasonably sized (under 50K rows works well)
- [ ] You have 10-30 minutes depending on data complexity

---

## How Claude Code Helps

**What Claude Code Does Well:**
- Identifies inconsistencies in formatting
- Standardizes date, name, and text formats
- Detects and handles missing values
- Finds duplicate rows or entries
- Converts between data formats
- Validates data against patterns
- Documents all changes made

**Where Human Judgment Is Essential:**
- Deciding how to handle ambiguous cases
- Defining what "correct" format means for your context
- Resolving true duplicates vs. similar entries
- Business logic for missing value handling
- Validating the cleaned output makes sense

---

## Input Examples

**Ideal Source Materials:**

| Input Type | Example | What Claude Uses It For |
|------------|---------|------------------------|
| CSV file | `customer-export.csv` | Primary data source |
| Excel file | `sales-data.xlsx` | Data with multiple sheets |
| Pasted table | Table copied from web or email | Quick cleanup |
| Sample of clean data | "Here's what correct format looks like" | Format template |
| Rules | "Dates should be YYYY-MM-DD" | Standardization rules |

**Sample Messy Data:**
```csv
Name,Email,Phone,Date Joined,Revenue
JOHN DOE,john@email.com,555.123.4567,1/15/24,$10,500
jane smith,JANE@EMAIL.COM,(555) 987-6543,2024-01-20,"$8,200"
DOE, JOHN,john@email.com,5551234567,Jan 15 2024,$10,500.00
Bob Williams,bob@email,555-222-3333,1-20-2024,7500
,sarah@email.com,5554445555,,6200
```

---

## Step-by-Step Implementation

### Step 1: Gather Your Data
**Time: 1-2 minutes**

Save your data to a file Claude can read:

```bash
# Place your data file in your working directory
cp ~/Downloads/messy-data.csv ~/Documents/data-cleanup/
```

Or prepare to paste the data directly into Claude.

---

### Step 2: Launch Claude Code
**Time: 30 seconds**

```bash
cd ~/Documents/data-cleanup
claude
```

---

### Step 3: Run the Data Cleanup Prompt
**Time: 2-5 minutes depending on data size**

---

**PRIMARY PROMPT: Data Cleanup and Standardization**

```
Please clean and standardize the data in [FILENAME.csv] (or the data below).

DATA TO CLEAN:
"""
[PASTE DATA HERE IF NOT USING A FILE]
"""

CLEANUP REQUIREMENTS:

1. COLUMN STANDARDIZATION
   - Standardize column names (lowercase, underscores, descriptive)
   - Current columns: [list if known]
   - Desired columns: [list if different from current]

2. DATE FORMATTING
   - Target format: [YYYY-MM-DD / MM/DD/YYYY / other]
   - Handle various input formats: MM/DD/YY, Month DD YYYY, YYYY-MM-DD, etc.
   - Flag any unparseable dates

3. TEXT STANDARDIZATION
   - Names: [Title Case / UPPERCASE / lowercase]
   - Emails: [lowercase]
   - Phone numbers: [XXX-XXX-XXXX / (XXX) XXX-XXXX / just digits]
   - Addresses: [if applicable, desired format]

4. MISSING VALUES
   - How to handle blanks: [leave as empty / replace with N/A / flag for review]
   - Required fields that MUST have values: [list critical columns]

5. DUPLICATES
   - Key columns to identify duplicates: [e.g., email, or name+email]
   - How to handle: [flag / remove, keeping first / remove, keeping last]

6. DATA VALIDATION
   - Email format validation
   - Phone number validation
   - Numeric columns: [list which should be numbers]
   - Valid value ranges or lists: [if any constraints exist]

PLEASE PROVIDE:

1. CLEANED DATA
   - Full cleaned dataset in same format (CSV)
   - Ready for use

2. CHANGE LOG
   - Summary of all changes made
   - Count of rows affected by each type of change
   - List of rows with issues that need human review

3. DATA QUALITY REPORT
   - Missing value count per column
   - Duplicate rows found
   - Validation failures
   - Any anomalies noticed

Save the cleaned data as "cleaned-[original-filename].csv"
```

---

### Step 4: Review the Changes
**Time: 5-10 minutes**

Review Claude's change log and output:

**Spot-check samples:**
- Check a few rows before/after to verify changes are correct
- Look at any flagged items needing human review

**Validate critical fields:**
- Ensure required fields have values
- Verify formatting is consistent
- Check duplicate handling was correct

**Review anomalies:**
- Were any valid entries incorrectly flagged as problems?
- Any issues missed?

---

### Step 5: Refine and Fix
**Time: 2-10 minutes**

**To fix specific issues:**
```
Row 15 has a valid phone number that was flagged as invalid. The format "555.123.4567" is acceptable for us. Please update to accept dot separators.
```

**To handle edge cases:**
```
For the two "John Doe" entries, the first one (row 1) is the correct record. Please remove the duplicate on row 3.
```

**To add validation:**
```
Also validate that the Revenue column contains reasonable values (should be between $0 and $1,000,000).
```

**To merge with another dataset:**
```
Now merge this cleaned data with the data in "additional-records.csv" using email as the key. Handle conflicts by keeping the first file's values.
```

---

### Step 6: Export Final Dataset
**Time: 1 minute**

```
Save the final cleaned dataset as "customer-data-cleaned-2024-01-15.csv"
```

For documentation:
```
Also save the change log and data quality report as "customer-data-cleanup-report.md" for our records.
```

---

## Example Output

Below is example cleaned data and change log:

---

> **CLEANED DATA**
>
> ```csv
> name,email,phone,date_joined,revenue
> John Doe,john@email.com,555-123-4567,2024-01-15,10500.00
> Jane Smith,jane@email.com,555-987-6543,2024-01-20,8200.00
> Bob Williams,bob@email,555-222-3333,2024-01-20,7500.00
> [Unknown],sarah@email.com,555-444-5555,[NEEDS REVIEW],6200.00
> ```
>
> **CHANGE LOG**
>
> | Change Type | Count | Details |
> |-------------|-------|---------|
> | Duplicate rows removed | 1 | Row 3 (duplicate of row 1 based on email) |
> | Names standardized | 4 | Converted to Title Case |
> | Emails standardized | 4 | Converted to lowercase |
> | Phone numbers reformatted | 4 | Standardized to XXX-XXX-XXXX |
> | Dates standardized | 4 | Converted to YYYY-MM-DD |
> | Revenue cleaned | 5 | Removed $ and commas, converted to decimal |
> | Missing values flagged | 2 | Name (row 4), Date (row 4) |
>
> **ITEMS NEEDING REVIEW**
>
> | Row | Issue | Original Value | Suggested Action |
> |-----|-------|----------------|------------------|
> | 4 | Missing name | (blank) | Review source data or mark as unknown |
> | 4 | Invalid date | (blank) | Find join date or use default |
> | 2 | Possible invalid email | bob@email | Missing domain extension - verify |
>
> **DATA QUALITY REPORT**
>
> - Total rows processed: 5
> - Valid rows: 3
> - Rows with issues: 2
> - Duplicates found and removed: 1
> - Missing required fields: 2 (1 name, 1 date)
> - Validation failures: 1 (email format)

---

## Troubleshooting Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Wrong date interpretation | Ambiguous dates (is 01/02/24 Jan 2 or Feb 1?) | Specify: "These dates are in MM/DD/YY format" |
| Good data marked as invalid | Validation rules too strict | Add exceptions: "Phone numbers can also be in XXX.XXX.XXXX format" |
| True duplicates kept | Dedup key too narrow | Broaden: "Consider rows duplicates if email OR (name AND phone) match" |
| False duplicates removed | Dedup key too broad | Narrow: "Only exact email matches are duplicates; similar names are different people" |
| Data too large | File exceeds reasonable processing size | Split into batches or use the cleanup rules on a sample, then apply programmatically |
| Complex logic needed | Business rules Claude can't infer | Document the rules explicitly or handle edge cases manually |

---

## Tips from Experience

1. **Document your standards.** Create a "data standards" file for your organization. Include date formats, phone formats, acceptable values, etc. Reuse across all cleanup tasks.

2. **Start with a sample.** For large datasets, run cleanup on 100 rows first. Verify the rules work before processing the full file.

3. **Keep the original.** Never overwrite source data. Always create a new "cleaned" file.

4. **Save the change log.** When data issues arise later, the change log is invaluable for debugging. "Why is this value different from the source?"

5. **Create reusable prompts.** If you clean similar data regularly (e.g., monthly customer exports), save your prompt with all the rules as a template.

6. **Validate downstream.** After cleanup, do a quick sanity check: row counts, sum of revenue columns, date ranges. Make sure totals match expectations.

---

## Measuring Success

**You've succeeded with this recipe when:**
- [ ] Cleaned data passes validation in your target system
- [ ] No manual intervention needed for standard cases
- [ ] Cleanup time reduced by 80%+
- [ ] Errors from bad data in analysis have decreased
- [ ] You have documented, repeatable cleanup processes

**Track over time:**
- Time spent on data cleanup tasks
- Data quality issues found in downstream analysis
- Reuse of cleanup templates

---

## Variations

### Merge Multiple Data Sources
For combining data from different systems:
```
Please merge these data files:
- customers-crm.csv (primary)
- customers-billing.csv (supplementary)
- customers-support.csv (supplementary)

Merge rules:
- Use email as the primary key
- For conflicts, prefer CRM data
- Include all columns from all sources (prefix if duplicate names)
- Flag records that exist in one source but not others

Create a unified customer record dataset.
```

### Format Conversion
For changing data structure:
```
Convert this data from [current format] to [target format].

Current: Wide format with months as columns (Jan, Feb, Mar...)
Target: Long format with columns: Date, Metric, Value

Also:
- Standardize date format to YYYY-MM-DD
- Convert all numbers to decimals (no currency symbols)
- Add a row ID column
```

### Data Validation Only
When you just need to check data quality:
```
Please validate this data without modifying it.

Check for:
1. Missing required values in: [column list]
2. Invalid formats in: email, phone, date columns
3. Duplicates based on: [key columns]
4. Values outside expected ranges: [list constraints]
5. Referential integrity: [e.g., all order IDs should exist in orders table]

Provide a validation report only—do not change the data.
```

### Template-Based Standardization
When you have a specific target format:
```
Here is our standard data template: [paste or reference template]

Please transform this incoming data to match the template exactly:
- Map columns: [source column → target column mappings]
- Apply these transformations: [specific rules]
- Add these default values for missing columns: [defaults]
- Reorder columns to match template

Output should be ready to append to our master dataset.
```

---

## Building Your Repeatable System

After cleaning data a few times, establish your system:

1. **Create a data standards document** defining formats for your org
2. **Build prompt templates** for each data source you regularly clean
3. **Save cleanup scripts** that can be reapplied
4. **Document known issues** with each data source
5. **Maintain a validation checklist** for post-cleanup verification

**Sample Setup:**
```
data-cleanup/
├── standards/
│   └── data-format-standards.md     # Org-wide format definitions
├── templates/
│   ├── crm-export-cleanup.txt       # Prompt for CRM data
│   ├── billing-data-cleanup.txt     # Prompt for billing data
│   └── partner-data-cleanup.txt     # Prompt for partner files
├── scripts/
│   └── common-transformations.md    # Reusable transformation rules
└── processed/
    ├── 2024-01/
    └── 2024-02/
```

---

## How This Pattern Applies Elsewhere

This recipe's core pattern—**messy input → standardization rules → clean output**—applies broadly:

| Role | Application |
|------|-------------|
| **Analysts** | Preparing data for dashboards and reports |
| **Operations** | Cleaning data for system imports |
| **Sales** | Standardizing CRM data |
| **Finance** | Cleaning transaction data for reconciliation |
| **Marketing** | Deduplicating and cleaning contact lists |
| **HR** | Standardizing employee data across systems |

---

## Next Steps

1. **This week:** Use this recipe on your next data cleanup task
2. **Document your standards:** Create a data format standards doc for your team
3. **Save your prompts:** Build a template for each common data source
4. **Share:** Teach a colleague how to clean data in minutes instead of hours

---

*Recipe #9 of 100 in the Claude Code Knowledge Worker Recipe Collection*
