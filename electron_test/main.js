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

ipcMain.on('tistory-api-renderer', async (event, data) => {
    const { tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName } = data;
    console.log('Received message from renderer:', data);

    if (!tistoryAppIDInput || !tistorySecretKeyInput || !tistoryBlogName) {
        return res.status(400).json({ error: "githubToken and username are required parameters." });
    }
    try {
        const authUrl = `https://www.tistory.com/oauth/authorize?client_id=97b3760fd96e15837242fd490636b7b7&redirect_uri=https://nocdu112.tistory.com/&response_type=code`;

        let authWindow = new BrowserWindow({
            show: true, // 이 설정을 통해 창을 숨깁니다.
            webPreferences: {
                nodeIntegration: false
            }
        });
        authWindow.loadURL(authUrl);
        authWindow.webContents.on('did-finish-load', async () => {
            const currentPageUrl = await authWindow.webContents.executeJavaScript('window.location.href');
            console.log('Current page URL:', currentPageUrl);

            const matched = currentPageUrl.match(/code=([^&]*)/);
            if(matched){
                const authCode = matched[1];
                authWindow.close();
                try {
                    const accessToken = await getAccessToken(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, authCode);
                    mainWindow.webContents.send('tistory-response', accessToken);
                    //authWindow.close();
                } catch (error) {
                    console.error("Error while fetching access token:", error);
                    mainWindow.webContents.send('tistory-response', error);
                }
            }
            //console.log("url : ", authWindow.webContents.getURL());
            // if (matched) {
            //     const authCode = matched[1];
            //     authWindow.close();
            //     try {
            //         const accessToken = await getAccessToken(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, authCode);
            //         mainWindow.webContents.send('tistory-response', accessToken);
            //     } catch (error) {
            //         console.error("Error while fetching access token:", error);
            //         mainWindow.webContents.send('tistory-response', error);
            //     }
            // }
        });
        
        authWindow.on('closed', () => {
            authWindow = null;
        });
        
    } catch (error) {
        console.error('Error fetching data from tistory:', error.message);
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

//tistory access 키 API 요청 함수
const getAccessToken = async(clientId, clientSecret, redirectUri, code) =>{
    console.log("@@@@@@@@@", clientId, clientSecret, redirectUri, code)
    try {
        const response = await axios.get("https://www.tistory.com/oauth/access_token", { 
            params: {
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: code,
                grant_type: 'authorization_code'
            }
         });
        return response.data.access_token
    } catch (error) {
        throw new Error(error);
    }
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