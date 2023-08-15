window.electron.ipcRenderer.on('github-response', (data) => {
    const container = document.getElementById('results');
    container.innerHTML = JSON.stringify(data, null, 2);
});

window.electron.ipcRenderer.on('notion-response', (data) => {
    const container = document.getElementById('results');
    container.innerHTML = JSON.stringify(data, null, 2);
});

function fetchGithubData() {
    const githubToken = document.getElementById('githubToken').value;
    const username = document.getElementById('username').value;
    if (!githubToken || !username) {
        return alert("빈문자는 안돼");
    }
    window.electron.ipcRenderer.send('git-api-renderer', { githubToken, username });
}

function fetchNotionData() {
    const notionApiKey = document.getElementById('notionApiKeyInput').value;
    const databaseId = document.getElementById('databaseIdInput').value;
    if (!notionApiKey || !databaseId) {
        return alert("빈문자는 안돼");
    }
    window.electron.ipcRenderer.send('notion-api-renderer', { notionApiKey, databaseId });
}
