import pandas as pd
import json

# Load CSV
df = pd.read_csv("Coffee.csv")

# Drop unnamed columns (like 'Unnamed: 5', 'Unnamed: 6', etc.)
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

# Optional: Strip spaces from column names
df.columns = df.columns.str.strip()

# Convert to dictionary (list of coffee records)
data = df.to_dict(orient='records')

# Save to JSON
with open("Coffee.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Coffee.json created successfully without unwanted columns.")