import re

with open("src/pages/CreatePostPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Paid / Protected", "Paid")

with open("src/pages/CreatePostPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
