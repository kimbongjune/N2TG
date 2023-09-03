const axios = require('axios');
const fs = require('fs');
const { getOctokit } = require('@actions/github');

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const [owner, repo] = repository.split('/');
const octokit = getOctokit(token);

async function fetchGithubRepoStructure() {
  const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`, {
    headers: {
      'Authorization': `token ${token}`,
    },
  });

  let dirTree = {};
  let unCategorized = [];

  for (const item of data.tree) {
    if (item.path.startsWith('.github') || item.path === 'README.md' || item.path === 'update_readme.js') continue;
    
    const splitPath = item.path.split('/');
    if (splitPath.length === 1 && item.type === 'blob') {
      const mdName = item.path.match(/(\d{4}-\d{2}-\d{2})_(.*).md$/);
      if (mdName) {
        const date = mdName[1];
        const title = mdName[2];
        unCategorized.push({ path: item.path, date, title });
      }
      continue; // Skip adding to dirTree for root files
    }

    let subDir = dirTree;
    for (let i = 0; i < splitPath.length; i++) {
      const part = splitPath[i];
      if (!subDir[part]) {
        if (i === splitPath.length - 1 && item.type === 'blob') {
          const mdName = part.match(/(\d{4}-\d{2}-\d{2})_(.*).md$/);
          if (mdName) {
            const date = mdName[1];
            const title = mdName[2];
            subDir[part] = { date, title };
          } else {
            subDir[part] = null;
          }
        } else {
          subDir[part] = {};
        }
      }
      subDir = subDir[part];
    }
  }

  function treeToString(tree, depth = 0, prefix = '') {
    let output = '';
    for (const [key, value] of Object.entries(tree)) {
      const indent = '  '.repeat(depth);
      const fullPath = prefix ? `${prefix}/${key}` : key;

      if (value === null) {
        output += `${indent}- ${key}\n`;
      } else if (value.date && value.title) {
        output += `${indent}- 📄[[${value.date}] ${value.title}](https://github.com/${repository}/blob/main/${encodeURIComponent(fullPath)})\n`;
      } else {
        output += `${indent}- 📂${key}\n${treeToString(value, depth + 1, fullPath)}`;
      }
    }
    return output;
  }

  let readmeContent = '';
  if (fs.existsSync('README.md')) {
    readmeContent = fs.readFileSync('README.md', 'utf8');
  } else {
    readmeContent = '# Repository Structure\n';
  }

  const categoryIndex = readmeContent.indexOf("## 카테고리");
  if (categoryIndex >= 0) {
    readmeContent = readmeContent.substring(0, categoryIndex);
  }

  readmeContent += '## 카테고리\n';
  readmeContent += treeToString(dirTree);

  readmeContent += '\n## 미분류\n';
  for (const item of unCategorized) {
    readmeContent += `- 📄[[${item.date}] ${item.title}](https://github.com/${repository}/blob/main/${encodeURIComponent(item.path)})\n`;
  }

  let sha;
  try {
    const { data: readmeData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'README.md',
    });
    sha = readmeData.sha;
  } catch (error) {
    console.log("README.md does not exist, will create one.");
  }

  fs.writeFileSync('README.md', readmeContent);

  if (sha) {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Automatically updated README.md',
      content: Buffer.from(readmeContent).toString('base64'),
      branch: 'main',
      sha: sha,
    });
  } else {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Automatically created README.md',
      content: Buffer.from(readmeContent).toString('base64'),
      branch: 'main',
    });
  }
}

fetchGithubRepoStructure().catch(console.error);