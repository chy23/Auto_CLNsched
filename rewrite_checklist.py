import re

with open('src/components/ChecklistView.jsx', 'r') as f:
    content = f.read()

# Add import for Lucide icons
content = re.sub(r"import React from 'react';\n", "import React from 'react';\nimport { Printer, ClipboardList } from 'lucide-react';\n", content)

content = content.replace("🖨️ 列印所有檢核表", "<Printer size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 列印所有檢核表")
content = content.replace("📋 檢核表", "<ClipboardList size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 檢核表")


with open('src/components/ChecklistView.jsx', 'w') as f:
    f.write(content)

