# Bulk Resource Import - CSV Format Guide

This page allows you to create and import multiple resources (notes, sources, quizzes) into a course using a CSV file.

## Overview

Instead of manually creating resources one-by-one, you can:
1. Select a course from the dropdown
2. Upload a CSV file with all resource details
3. Resources are automatically created and added to the course

## General Rules

- **Headers Required**: The first row must contain column names
- **Resource Type**: The `resourceType` column determines which columns are required
- **All rows must be the same type** (all notes, all sources, or all quizzes)
- **Pipe Separator**: Use `|` to separate multiple values (tags, authors, answers, hints)
- **UTF-8 Encoding**: Save your CSV as UTF-8 for special characters

## Resource Types

### 📝 Note

Create study notes and documentation.

**Columns:**
- `resourceType` - Must be: **note**
- `title` - Title of the note (required)
- `text` - Content/body of the note (required)
- `tags` - Pipe-separated tags (optional, e.g., `python|basics|important`)

**Example:**
```
resourceType,title,text,tags
note,Python Variables,Variables are containers for storing data values,python|basics
note,Data Types,Python has different data types including strings and integers,python|types
```

---

### 📚 Source

Import learning sources like articles, videos, books, etc.

**Columns:**
- `resourceType` - Must be: **source**
- `title` - Title of the source (required)
- `medium` - Type of source (required, see valid values below)
- `url` - Link to the source (required)
- `authors` - Pipe-separated author names (optional, e.g., `John Doe|Jane Smith`)
- `tags` - Pipe-separated tags (optional)

**Valid Mediums:**
- `article` - Web articles and blog posts
- `book` - Books and textbooks
- `video` - Video content (YouTube, etc.)
- `podcast` - Podcast episodes
- `website` - General websites and resources
- `audio` - Audio recordings and lectures

**Example:**
```
resourceType,title,medium,url,authors,tags
source,Real Python Decorators,article,https://realpython.com/decorators-in-python,Dan Bader,python|advanced
source,Python for Everyone,book,https://www.py4e.com,Charles Severance,python|fundamentals
source,Tech Talk: Python Tips,video,https://youtube.com/watch?v=xyz,Anonymous,python|tips
```

---

### 🎯 Quiz

Create practice quizzes with different question types.

**Columns:**
- `resourceType` - Must be: **quiz**
- `type` - Quiz type (required, see valid types below)
- `prompt` - The question text (required)
- `answers` - Pipe-separated answers. **For multiple-choice, the first answer is always correct** (required)
- `hints` - Pipe-separated hints (optional)
- `tags` - Pipe-separated tags (optional)

**Valid Quiz Types:**

| Type | Description | Answer Format |
|------|-------------|----------------|
| `prompt-response` | Short answer question | Correct answer only |
| `multiple-choice` | Multiple choice question | All options (first is correct) |
| `fill-in-the-blank` | Fill in the blank | All possible answers |
| `ordered-list-answer` | Put items in correct order | Items in order |
| `unordered-list-answer` | Select items (order doesn't matter) | All items |
| `verbatim` | Exact answer required | Exact text |

**Examples:**

```
resourceType,type,prompt,answers,hints,tags
quiz,prompt-response,What is a variable?,A container for storing data,Think of it as a box,python|basics
quiz,multiple-choice,Python is a compiled language?,False|True,No - Python is interpreted,python|facts
quiz,fill-in-the-blank,The keyword to define a function is _____,def,It's short for define,python|syntax
quiz,verbatim,Type the exact syntax to print Hello World,print('Hello World'),Use print function,python|output
```

---

## Generate CSV with AI

You can use ChatGPT, Claude, or similar AI to generate bulk CSV data. Here are example prompts:

### For Notes:
```
Generate a CSV with 10 study notes about [TOPIC].
Format (EXACTLY as shown, no extra text):
resourceType,title,text,tags
note,Title 1,Detailed explanation about topic 1,tag1|tag2
note,Title 2,Another explanation,tag1|tag3

Generate realistic, educational content.
```

### For Sources:
```
Generate a CSV with 10 learning sources about [TOPIC].
Format (EXACTLY as shown, no extra text):
resourceType,title,medium,url,authors,tags
source,Real Title,article,https://example.com,Author Name,tag1|tag2

Mediums: article, book, video, podcast, website, audio
Use realistic but varied sources.
```

### For Quizzes:
```
Generate a CSV with 10 quiz questions about [TOPIC].
Format (EXACTLY as shown, no extra text):
resourceType,type,prompt,answers,hints,tags
quiz,multiple-choice,Question?,Correct|Wrong1|Wrong2|Wrong3,Hint,tags
quiz,prompt-response,Question?,Correct answer,Hint,tags

Types: prompt-response, multiple-choice, fill-in-the-blank, ordered-list-answer, unordered-list-answer, verbatim
For multiple-choice, put the correct answer first.
Generate realistic questions.
```

---

## Common Mistakes ❌

- **Wrong resourceType**: Must be `note`, `source`, or `quiz`
- **Missing required columns**: Check that all required columns are present
- **Invalid medium**: Source medium must be one of: article, book, video, podcast, website, audio
- **Invalid quiz type**: Must be one of the 6 quiz types listed above
- **Wrong quote format**: Don't use curly quotes (`""`), use straight quotes (`""`)
- **Mixing resource types**: All rows must use the same resourceType
- **Empty cells in required columns**: Can't skip required columns like title or prompt

---

## Tips ✅

- Test with a small CSV file (2-3 rows) first
- Use a spreadsheet app (Excel, Google Sheets) to create and validate your CSV
- Add descriptive tags to help students find resources later
- For multiple-choice, put the correct answer FIRST
- Keep titles concise and descriptive
- Use pipe separator `|` without spaces around it: `tag1|tag2|tag3`
- Save as CSV (comma-separated values), not XLSX

---

## File Upload

1. Select your course from the dropdown
2. Drag and drop your CSV file or click to select
3. Review any validation errors
4. Click "Upload & Create Resources"
5. Resources will be created and automatically added to the course


### Column Details

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| courseId | Number | ID of the course to add resources to | `123` |
| resourceType | Text | Type of resource: `source`, `note`, or `quiz` | `source` |
| resourceId | Number | ID of the existing resource | `1` |

## Valid Resource Types

- **source** - Articles, books, videos, podcasts, websites, audio files
- **note** - Custom notes and study materials
- **quiz** - Practice quizzes and assessments

## Example CSV

```csv
courseId,resourceType,resourceId
123,source,1
123,source,2
123,source,3
123,note,10
123,note,11
123,quiz,20
123,quiz,21
124,source,5
124,note,15
```

This example:
- Adds 6 resources to course 123 (3 sources, 2 notes, 1 quiz)
- Adds 2 resources to course 124 (1 source, 1 note)

## Common Errors

### ❌ Error: "Missing required columns"
**Cause**: Your CSV doesn't have all 3 required columns
**Fix**: Use exactly: `courseId,resourceType,resourceId`

### ❌ Error: "Invalid resourceType"
**Cause**: resourceType isn't one of: source, note, quiz
**Fix**: Use only `source`, `note`, or `quiz` (lowercase)

### ❌ Error: "Invalid courseId" or "Invalid resourceId"
**Cause**: These must be numbers (IDs)
**Fix**: Remove quotes, spaces, or special characters. Use: `123` not `"123"` or `123 `

### ❌ Error: "Expected 3 columns"
**Cause**: Your CSV row has too many or too few columns
**Fix**: Each row must have exactly 3 values separated by commas

## Using AI to Generate Resources

Use this prompt with ChatGPT, Claude, or your favorite AI:

```
Generate a CSV file with 20 learning resources for a course about Data Science.
Use this exact format with NO explanation or text before/after:

courseId,resourceType,resourceId
123,source,1
123,note,5

Where:
- courseId: Always 123 (the course ID)
- resourceType: Randomly choose from [source, note, quiz] but make it realistic
- resourceId: Use IDs from 1-100, making sure different rows have different IDs

Generate realistic combinations like:
- Multiple source IDs (articles/videos/podcasts about data science)
- Multiple note IDs (study guides, summaries)
- Multiple quiz IDs (practice problems)

Output ONLY the CSV data, nothing else.
```

## Example Output from AI

When you run the above prompt, you should get:

```csv
courseId,resourceType,resourceId
123,source,1
123,source,2
123,source,3
123,source,4
123,source,5
123,note,10
123,note,11
123,note,12
123,quiz,20
123,quiz,21
123,quiz,22
123,source,6
123,source,7
123,note,13
123,note,14
123,quiz,23
123,source,8
123,source,9
123,note,15
123,quiz,24
```

## Step-by-Step: Generate Resources with AI

1. **Copy the AI prompt** above (from "Generate a CSV file...")
2. **Paste it** into ChatGPT or your AI tool
3. **Copy the output** (the CSV lines)
4. **Create a CSV file**:
   - Open a text editor (Notepad, VS Code, etc.)
   - Paste the CSV content
   - Save as `resources.csv`
5. **Upload the file** using the import page

## Validating Your CSV

Before uploading, make sure:

✅ File is saved as `.csv` (not `.txt` or `.xlsx`)
✅ First row is exactly: `courseId,resourceType,resourceId`
✅ Each data row has exactly 3 values
✅ courseId and resourceId are numbers
✅ resourceType is one of: source, note, quiz
✅ No extra spaces or special characters
✅ No header rows after the first line
✅ IDs are valid (they must exist in your database)

## Testing Your CSV

You can validate your CSV before uploading:

1. Open it in a text editor to check formatting
2. Count commas - each row should have exactly 2 commas
3. Check the first row header
4. Spot-check a few data rows for correct format

## Troubleshooting

**Q: "Some courses failed to import resources"**
- Check that the courseIds exist in your database
- Verify that the resourceIds are valid and associated with real resources

**Q: "The CSV uploads but nothing happens"**
- Check browser console for errors (F12)
- Verify you're logged in as a course creator
- Confirm you have permission to edit the courses

**Q: "Can I import resources from multiple courses at once?"**
- Yes! Just include different courseIds in the CSV
- The system groups resources by courseId automatically

## Creating CSV Files

### Using Excel/Google Sheets
1. Create columns: courseId, resourceType, resourceId
2. Fill in your data
3. **Export as CSV** (not XLSX)
4. Upload to the import page

### Using a Text Editor
1. Open Notepad or VS Code
2. Type/paste your CSV data
3. Save as `filename.csv` (not `.txt`)
4. Upload to the import page

### Using Command Line
```bash
cat > resources.csv << 'EOF'
courseId,resourceType,resourceId
123,source,1
123,note,5
123,quiz,10
EOF
```

## FAQs

**Q: How many resources can I add at once?**
A: No limit! Upload as many as you want in one CSV.

**Q: Can I add the same resource multiple times?**
A: No, the database has a UNIQUE constraint to prevent duplicates.

**Q: What happens if a row is invalid?**
A: That row is skipped and listed in the error report. Other valid rows are still imported.

**Q: Do I need to know the resource IDs?**
A: Yes, they must be IDs of existing resources in your database. You'll need to find these first.

**Q: Can I edit resources after importing?**
A: Yes, you can manage them through the course page.

**Q: Can I remove imported resources?**
A: Yes, use the course page to remove individual resources, or re-upload a corrected CSV.
