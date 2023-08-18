const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const path = require('path');
const { saveGithubParameter, 
    getGithubParameter, 
    saveNotionParameter, 
    getNotionParameter, 
    saveTistoryParameter, 
    getTistoryParameter, 
    deleteGithubParameter,
    deleteNotionParameter,
    deleteTistoryParameter 
} = require('./store.js');

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

    mainWindow.webContents.on('did-finish-load', () => {
        const githubParams = getGithubParameter();
        if (githubParams) {
            const { githubApiToken, githubUsername } = githubParams
            mainWindow.webContents.executeJavaScript(`
                document.querySelector('#githubToken').value = "${githubApiToken}";
                document.querySelector('#username').value = "${githubUsername}";
            `);
        } else {
            console.log("Token or username is missing");
        }

        const notionParams = getNotionParameter();
        if (notionParams) {
            const { notionApiKey, notionDatabaseId } = notionParams
            mainWindow.webContents.executeJavaScript(`
                document.querySelector('#notionApiKeyInput').value = "${notionApiKey}";
                document.querySelector('#databaseIdInput').value = "${notionDatabaseId}";
            `);
        } else {
            console.log("Token or username is missing");
        }

        const tistoryParams = getTistoryParameter();
        if (tistoryParams) {
            const { tistoryAppId, tistorySecretKey, tistoryBlogName } = tistoryParams
            mainWindow.webContents.executeJavaScript(`
                document.querySelector('#tistoryAppIDInput').value = "${tistoryAppId}";
                document.querySelector('#tistorySecretKeyInput').value = "${tistorySecretKey}";
                document.querySelector('#tistoryBlogName').value = "${tistoryBlogName}";
            `);
        } else {
            console.log("Token or username is missing");
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.on('git-api-renderer', async (event, data) => {
    const { githubToken, username } = data;
    console.log('Received message from renderer:', data);

    if (!githubToken || !username) {
        return res.status(400).json({ error: "required parameters." });
    }

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
        saveGithubParameter(githubToken, username)
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.message);
        deleteGithubParameter()
    }
});

ipcMain.on('notion-api-renderer', async (event, data) => {
    const { notionApiKey, databaseId } = data;
    console.log('Received message from renderer:', data);

    if (!notionApiKey || !databaseId) {
        return res.status(400).json({ error: "required parameters." });
    }
    
    try {
        const data = await fetchDataFromNotion(notionApiKey, databaseId);
        const result = await getBlockChildren(notionApiKey, data.results[0].id)
        mainWindow.webContents.send('notion-response', result);
        saveNotionParameter(notionApiKey, databaseId)
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.message);
        deleteNotionParameter()
    }
});

ipcMain.on('tistory-api-renderer', async (event, data) => {
    const { tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName} = data;
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
            if(currentPageUrl.includes("auth/login")){
                await clickTisotoryLoginByKakaoButton(authWindow.webContents);
            }

            if(currentPageUrl.includes("oauth/authorize")){
                await clickAcceptButton(authWindow.webContents);
            }
            
            const matched = currentPageUrl.match(/code=([^&]*)/);
            if(matched){
                const authCode = matched[1];
                authWindow.close();
                try {
                    const accessToken = await getAccessToken(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, authCode);
                    mainWindow.webContents.send('tistory-response', accessToken);
                    saveTistoryParameter(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName)
                } catch (error) {
                    console.error("Error while fetching access token:", error);
                    mainWindow.webContents.send('tistory-response', error);
                }
            }
        });
        
        authWindow.on('closed', () => {
            authWindow = null;
        });
        
    } catch (error) {
        console.error('Error fetching data from tistory:', error.message);
        deleteTistoryParameter()
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
        const response = await axios.post(`https://api.notion.com/v1/databases/${databaseId}/query`, {
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

//노션 데이터베이스의 하위 페이지를 가져오는 함수
const getBlockChildren = async (notionApiKey, blockId) => {
    try {
        const response = await axios.get(`https://api.notion.com/v1/blocks/${blockId}/children`, {
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2021-05-13'
            }
        });

        return response.data.results;
    } catch (error) {
        console.error('Error fetching block children from Notion:', error.message);
    }
}

//카카오 로그인 버튼이 있을 때 클릭하는 함수
const clickTisotoryLoginByKakaoButton = async (webContents) => {
    await webContents.executeJavaScript(`
        const btnElement = document.querySelector(".link_kakao_id");
        if (btnElement) {
            btnElement.click();
        }
    `);
};

//허가하기 버튼이 있을 때 클릭하는 함수
const clickAcceptButton = async (webContents) => {
    await webContents.executeJavaScript(`
        const confirmBtnElement = document.querySelector(".confirm");
        if (confirmBtnElement) {
            confirmBtnElement.click();
        }
    `);
};