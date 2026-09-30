import re

with open('src/components/ExportImportModal.jsx', 'r') as f:
    content = f.read()

# Add import for Lucide icons
import_stmt = "import { X, Save, Upload, Download, Users, Map, Briefcase, Settings2, FolderOpen, CheckCircle, AlertTriangle } from 'lucide-react';\n"
content = re.sub(r"import React, { useState, useRef } from 'react';\n", "import React, { useState, useRef } from 'react';\n" + import_stmt, content)

# Replacements
replacements = [
    ("✖", "<X size={24} />"),
    ("💾 備份與還原系統", "<Save size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> 備份與還原系統"),
    ("📤 匯出備份", "<Upload size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 匯出備份"),
    ("📥 匯入還原", "<Download size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 匯入還原"),
    ("🧑‍🎓 學生名單", "<Users size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> 學生名單"),
    ("🗺️ 掃區設定", "<Map size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> 掃區設定"),
    ("🧹 工作項目", "<Briefcase size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> 工作項目"),
    ("⚙️ 報表文字設定", "<Settings2 size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> 報表文字設定"),
    ("📥 建立並下載備份檔", "<Download size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 建立並下載備份檔"),
    ("📂 選擇檔案", "<FolderOpen size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 選擇檔案"),
    ("✅ 檔案解析成功！請勾選要還原的資料：", "<CheckCircle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 檔案解析成功！請勾選要還原的資料："),
    ("⚠️ 注意：勾選的項目將會完全覆蓋目前的系統資料。", "<AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 注意：勾選的項目將會完全覆蓋目前的系統資料。"),
    ("📤 確定覆蓋並還原", "<Upload size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> 確定覆蓋並還原")
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix button style
content = content.replace("background: 'transparent', border: 'none', fontSize: '1.5rem',", "background: 'transparent', border: 'none',")

with open('src/components/ExportImportModal.jsx', 'w') as f:
    f.write(content)

