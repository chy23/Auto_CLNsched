import re

with open('src/components/ScheduleView.jsx', 'r') as f:
    content = f.read()

# Add import for Lucide icons
content = re.sub(r"import React, \{ useState \} from 'react';\n", "import React, { useState } from 'react';\nimport { AlertTriangle, Printer, CalendarDays } from 'lucide-react';\n", content)

content = content.replace("⚠️ 尚未分配工作的學生（備用名單）：", "<AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 尚未分配工作的學生（備用名單）：")
content = content.replace("🖨️ 列印總排班表", "<Printer size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 列印總排班表")
content = content.replace("📅 總排班表", "<CalendarDays size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 總排班表")


with open('src/components/ScheduleView.jsx', 'w') as f:
    f.write(content)

