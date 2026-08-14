import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateChangelog() {
  try {
    // 抓取近 50 次的 commit 紀錄 (未來如果要全部呈現，只要把 -n 50 拿掉即可)
    const logOutput = execSync(
      'git log -n 50 --pretty=format:"%H|||%ad|||%s|||%b|||---COMMIT_END---" --date=short',
      { encoding: 'utf-8' }
    );

    const commits = logOutput.split('|||---COMMIT_END---')
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);

    const totalCommits = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10);

    const changelog = commits.map((commit, index) => {
      const parts = commit.split('|||');
      if (parts.length < 4) return null;

      const hash = parts[0].trim();
      const date = parts[1].trim();
      const subject = parts[2].trim();
      const body = parts[3].trim();

      // 版號邏輯：使用「總提交次數 - index」作為版號，例如最新的可能是 v1.0.45
      const version = `v1.0.${totalCommits - index}`;

      return {
        version,
        date,
        title: subject,
        details: body || '無詳細說明'
      };
    }).filter(Boolean);

    const outputPath = path.join(__dirname, '..', 'src', 'changelog.json');
    fs.writeFileSync(outputPath, JSON.stringify(changelog, null, 2), 'utf-8');
    
    console.log(`✅ 成功產生更新紀錄！共寫入 ${changelog.length} 筆資料至 src/changelog.json`);

  } catch (err) {
    console.error('❌ 產生更新紀錄失敗：', err.message);
    // 確保發生錯誤時也產生一個空陣列，避免編譯失敗
    const outputPath = path.join(__dirname, '..', 'src', 'changelog.json');
    if (!fs.existsSync(outputPath)) {
      fs.writeFileSync(outputPath, '[]', 'utf-8');
    }
  }
}

generateChangelog();
