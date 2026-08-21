import re

with open("src/pages/CreatePostPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Sparkles
content = re.sub(r'<Sparkles size=\{18\} style=\{\{\s*color:\s*\'#f59e0b\'\s*\}\}\s*\/>\s*', '', content)

# 2. Extract Description block
desc_regex = r'<div className=\{styles\.fieldGroup\}>\s*<label>Description <span className=\{styles\.optionalText\}>\(optional\)</span></label>\s*<TipTapEditor\s*content=\{description\}\s*onChange=\{setDescription\}\s*/>\s*\{getCharLimitWarning\(description\.replace\(\/\(<\(\[\^>\]\+\)>\)\/gi,\s*""\)\.length,\s*1000\)\}\s*</div>'

desc_match = re.search(desc_regex, content)
if desc_match:
    desc_block = desc_match.group(0)
    
    # Remove from right column
    content = content.replace(desc_block, '')
    
    # Insert at end of leftColumn
    insert_point = r'(</div>\s*<div className=\{styles\.rightColumn\})'
    
    replacement = r'\n            <div style={{ marginTop: "1.5rem" }}>\n              ' + desc_block.replace('<div className={styles.fieldGroup}>', '<div className={styles.fieldGroup} style={{ margin: 0 }}>') + r'\n            </div>\n\n        \1'
    
    content = re.sub(insert_point, replacement, content)
    
    with open("src/pages/CreatePostPage.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Could not find description block")
