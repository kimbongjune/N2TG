const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

ipcMain.on('git-api-renderer', async (event, data) => {
    const { githubToken, username } = data;
    console.log('Received message from renderer:', data);

    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            params: {
                sort: "created"
            }
        });
        mainWindow.webContents.send('github-response', response.data);
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.message);
    }
});

ipcMain.on('notion-api-renderer', async (event, data) => {
    const { notionApiKey, databaseId } = data;
    console.log('Received message from renderer:', data);

    if (!notionApiKey || !databaseId) {
        return res.status(400).json({ error: "githubToken and username are required parameters." });
    }
    try {
        const data = await fetchDataFromNotion(notionApiKey, databaseId);
        mainWindow.webContents.send('notion-response', data);
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.message);
    }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

//노션 API URL을 생성하는 함수
function getNotionApiEndpoint(databaseId) {
    return `https://api.notion.com/v1/databases/${databaseId}/query`;
}

//노션 API 요청 함수
const fetchDataFromNotion = async (notionApiKey, databaseId) => {
    try {
        const response = await axios.post(getNotionApiEndpoint(databaseId), {
            filter: {
                property: "상태",
                select: {
                    equals: "발행 요청"
                }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        throw new Error("Error fetching data from Notion");
    }
};