const { app, BrowserWindow, ipcMain, shell } = require('electron');
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
    deleteTistoryParameter,
    saveTistoryAccessToken,
    getTistoryAccessToken
} = require('./store.js');

const { Client } = require("@notionhq/client");
const {initiallizeNotionToMarkdownInstance, convertToMarkdown} = require('./notionToMarkdown.js'); 
const convertNotionDataToHtml = require('./notionToHtml');
const {getFormattedDate, saveMarkdownFile, saveHtmlFile, encodingToBase64} = require("./utils.js")

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
            const { githubApiToken, githubUsername, repositoryName } = githubParams
            mainWindow.webContents.executeJavaScript(`
                document.querySelector('#githubToken').value = "${githubApiToken}";
                document.querySelector('#username').value = "${githubUsername}";
                document.querySelector('#repositoryName').value = "${repositoryName}";
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

ipcMain.on('open-link', (event, url) => {
    shell.openExternal(url);
});

ipcMain.on('git-api-validation', async (event, data) => {
    const { githubToken, username, repositoryName } = data;
    console.log('Received message from renderer:', data);

    if (!githubToken || !username || !repositoryName) {
        return mainWindow.webContents.send('git-api-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }

    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repositoryName}`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        console.log(response.data)
        if(response.data){
            mainWindow.webContents.send('git-api-validation-response', {status:"success", result : response.data, code:200});
            saveGithubParameter(githubToken, username, repositoryName)
        }
        //mainWindow.webContents.send('git-api-validation-response', {status:"success", result : lastCommitSha, code:200});
        // saveGithubParameter(githubToken, username, repositoryName)
        // mainWindow.webContents.send('git-api-validation-response', {status:"success", result : "zz", code:200});
    } catch (error) {
        if(error.response.status == 401){
            mainWindow.webContents.send('git-api-validation-response', {status:"failed",  result:"토큰값을 확인해주세요", code:401});    
        }else if(error.response.status == 404){
            mainWindow.webContents.send('git-api-validation-response', {status:"failed",  result:"사용자 이름 또는 레파지토리 이름을 확인해주세요", code:404});   
        }else{
            mainWindow.webContents.send('git-api-validation-response', {status:"failed",  result:error.message, code:error.status});
        }
        console.error('Error fetching data from GitHub:', error);        
        //deleteGithubParameter()
    }
});

ipcMain.on('notion-api-validation', async (event, data) => {
    const { notionApiKey, databaseId } = data;
    console.log('Received message from renderer:', data);

    if (!notionApiKey || !databaseId) {
        return mainWindow.webContents.send('notion-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }
    
    const notion =  new Client({
        auth: notionApiKey
    });

    try {
        const data = await fetchDataFromNotion(notion, databaseId);
        //await updatePageStatusToPublished(notion, data.results[0].id)
        mainWindow.webContents.send('notion-validation-response', {status:"success", result : data, code:200});
        saveNotionParameter(notionApiKey, databaseId)
    } catch (error) {
        console.error("error : ", error)
        if(error.status == 401){
            mainWindow.webContents.send('notion-validation-response', {status:"failed",  result:"노션 API키 값을 확인해주세요", code:401});
        }else if(error.status == 400){
            mainWindow.webContents.send('notion-validation-response', {status:"failed",  result:"데이터베이스 아이디를 확인해주세요", code:400});
        }else{
            mainWindow.webContents.send('notion-validation-response', {status:"failed",  result:`알 수 없는 에러 ${error.message}`, code:400});
        }
        //deleteNotionParameter()
    }
});

ipcMain.on('tistory-api-validation', async (event, data) => {
    const { tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName} = data;
    console.log('Received message from renderer:', data);

    if (!tistoryAppIDInput || !tistorySecretKeyInput || !tistoryBlogName) {
        return mainWindow.webContents.send('tistory-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }
    
    try {
        const authUrl = `https://www.tistory.com/oauth/authorize?client_id=${tistoryAppIDInput}&redirect_uri=${tistoryBlogName}&response_type=code`;

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
                try {
                    const response = await getAccessToken(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, authCode);
                    console.log(response)
                    //mainWindow.webContents.send('tistory-validation-response',  {status:"success", result : accessToken, code:200});
                    const match = currentPageUrl.match(/https:\/\/(.*?)\.tistory\.com\//);
                    const blogName = match ? match[1] : null;
                    if(response){
                        const tistoryWriteResponse = await readBlogCategory(response.access_token, blogName)
                        saveTistoryParameter(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName)
                        saveTistoryAccessToken(response.access_token)
                        mainWindow.webContents.send('tistory-validation-response', {status:"success", result : tistoryWriteResponse, code:200});
                    }
                    authWindow.close();
                } catch (error) {
                    console.error("Error while fetching access token:", error);
                    mainWindow.webContents.send('tistory-validation-response', {status:"failed",  result:"앱아이디 혹은 시크릿키, 블로그 주소를 확인해주세요", code:400});
                    authWindow.close();
                }
            }
        });
        
        authWindow.on('closed', async () => {
            await mainWindow.webContents.executeJavaScript(`
                document.getElementById('overlay').style.display = 'none';
            `);
        });
        
    } catch (error) {
        console.error('Error fetching data from tistory:', error.message);
        mainWindow.webContents.send('tistory-validation-response', {status:"failed",  result:error.message, code:error.status});
    }
});

ipcMain.on('notion-api-renderer', async (event, data) => {
    const { notionApiKey, databaseId } = data;
    console.log('Received message from renderer:', data);

    if (!notionApiKey || !databaseId) {
        return res.status(400).json({ error: "required parameters." });
    }

    
    const notion =  new Client({
        auth: notionApiKey
    });

    initiallizeNotionToMarkdownInstance(notion);

    try {
        const data = await fetchDataFromNotion(notion, databaseId);
        
        const returnData = await handleNotionDataConversion(data.results[0].id, notionApiKey)
        mainWindow.webContents.send('notion-response', returnData);
        saveNotionParameter(notionApiKey, databaseId)
    } catch (error) {
        console.error('Error fetching data from GitHub:', error.message);
        //deleteNotionParameter()
    }
});

ipcMain.on('tistory-api-renderer', async (event, data) => {
    const { tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName} = data;
    console.log('Received message from renderer:', data);

    if (!tistoryAppIDInput || !tistorySecretKeyInput || !tistoryBlogName) {
        return res.status(400).json({ error: "githubToken and username are required parameters." });
    }
    
    try {
        const authUrl = `https://www.tistory.com/oauth/authorize?client_id=${tistoryAppIDInput}&redirect_uri=${tistoryBlogName}&response_type=code`;

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
                    const match = currentPageUrl.match(/https:\/\/(.*?)\.tistory\.com\//);
                    const blogName = match ? match[1] : null;
                    //console.log(blogName); 
                    const testContent = `<h1>제목</h1>
                    <p>이것은 본문의 첫 번째 문단입니다.</p>
                    <p>이것은 본문의 두 번째 문단입니다.</p>`
                    if(accessToken){
                        const tistoryWriteResponse = await writeBlogContent(accessToken, blogName, "테스트 게시물", testContent, "java")
                        saveTistoryParameter(tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName)
                        mainWindow.webContents.send('tistory-response', tistoryWriteResponse);
                    }
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

ipcMain.on('publish-tistory', async (event, data) => {
    const { notionApiKey, databaseId, tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, categoryId } = data
    if (!notionApiKey || !databaseId) {
        return mainWindow.webContents.send('notion-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }
    if (!tistoryAppIDInput || !tistorySecretKeyInput || !tistoryBlogName) {
        return mainWindow.webContents.send('tistory-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }

    console.log('publish-tistory', notionApiKey, databaseId, tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, categoryId);

    const notion =  new Client({
        auth: notionApiKey
    });

    initiallizeNotionToMarkdownInstance(notion);

    try {
        const data = await fetchDataFromNotion(notion, databaseId);
        if(data.results.length <= 0){
            return mainWindow.webContents.send('publish-response', {status:"success", witch:"notion", result:"발행 할 게시글이 없습니다.", code:403});
        }
        const htmlData = await convertNotionDataToHtml(data.results[0].id, notionApiKey, mainWindow);
        const tags = data.results[0].properties.태그.multi_select.map(item => item.name).join(', ')
        const accessToken = getTistoryAccessToken()
        if(accessToken){
            mainWindow.webContents.send('publish-response', {status:"success", witch:"tistory", result:"토큰이 존재하여 검증 없이 진행합니다.", code:201});
            const match = getTistoryParameter().tistoryBlogName.match(/https:\/\/(.*?)\.tistory\.com\//);
            const blogName = match ? match[1] : null;
            const tistoryWriteResponse = await writeBlogContent(accessToken, blogName, htmlData.title, htmlData.html, tags, categoryId)
            await updatePageStatusToPublished(notion, data.results[0].id, "발행 완료", null, tistoryWriteResponse.tistory.url)
            return mainWindow.webContents.send('publish-response', {status:"success", witch:"tistory", result:"프로세스가 정상적으로 완료되었습니다.", code:200, tistoryLink:tistoryWriteResponse.tistory.url});
        }else{
            return mainWindow.webContents.send('publish-response', {status:"failed", witch:"tistory",  result:"티스토리 액세스 키 재발급이 필요합니다.", code:400});
        }
    } catch (error) {
        return mainWindow.webContents.send('publish-response', error);
    }
})

ipcMain.on('publish-github', async (event, data) => {
    const { notionApiKey, databaseId, githubToken, username, repositoryName } = data
    if (!notionApiKey || !databaseId) {
        return mainWindow.webContents.send('notion-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }
    if (!githubToken || !username || !repositoryName) {
        return mainWindow.webContents.send('git-api-validation-response', {status:"failed",  result:"필수 파라미터가 없습니다.", code:404});
    }

    console.log('publish-github', notionApiKey, databaseId, githubToken, username, repositoryName);

    const notion =  new Client({
        auth: notionApiKey
    });

    initiallizeNotionToMarkdownInstance(notion);

    try {
        const data = await fetchDataFromNotion(notion, databaseId);
        mainWindow.webContents.send('publish-response', {status:"doing", witch:"test", result:data, code:201});
        if(data.results.length <= 0){
            return mainWindow.webContents.send('publish-response', {status:"success", witch:"notion", result:"발행 할 게시글이 없습니다.", code:403});
        }
        const mdString = await convertToMarkdown(data.results[0].id, mainWindow);
        const prUrl = await processGithubActions(username, repositoryName, `${getFormattedDate()}.md`, mdString.parent, `${getFormattedDate()}.md created`, githubToken)
        if(prUrl){
            mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"Pull Request생성이 완료되었습니다.", code:201});
            await updatePageStatusToPublished(notion, data.results[0].id, "발행 완료", prUrl)
            return mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"프로세스가 정상적으로 완료되었습니다.", code:200, gitLink:prUrl});
        }
    } catch (error) {
        return mainWindow.webContents.send('publish-response', error);
    }
})

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

//티스토리 블로그 글 작성 함수
const writeBlogContent = async(token, blogName, title, content, tag, categoryId = 0) =>{
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"tistory", result:"게시글 작성 진행중입니다.", code:201});
    try {
        const response = await axios.post("https://www.tistory.com/apis/post/write", {
            access_token : token,
            output : "json",
            blogName : blogName,
            visibility : 3,
            title : title,
            content : content,
            category : categoryId,
            tag : tag
        });
        return response.data;
    } catch (error) {
        throw { status: "failed", witch:"tistory", result: `티스토리 게시글 작성 과정에서 실패하였습니다. ${error.message}`, code: 400 };
    }
}

//티스토리 블로그 카테고리 조회 함수
const readBlogCategory = async(token, blogName) =>{
    try {
        const response = await axios.get("https://www.tistory.com/apis/category/list", { 
            params: {
                access_token : token,
                output : "json",
                blogName : blogName
            } 
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

//tistory access 키 API 요청 함수
const getAccessToken = async(clientId, clientSecret, redirectUri, code) =>{
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
        return response.data
    } catch (error) {
        throw error;
    }
}

//노션 API 요청 함수
const fetchDataFromNotion = async (notion, databaseId) => {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"notion", result:"노션 게시글을 수신중입니다.", code:201});
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                or: [
                    {
                        property: "상태",
                        select: {
                            equals: "발행 요청"
                        }
                    },
                    {
                        property: "상태",
                        select: {
                            equals: "에러"
                        }
                    }
                ]
            }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

//게시글 발행이 끝난 후 상태를 업데이트 하는 함수
const updatePageStatusToPublished = async (notion, pageId, status, gitPrUrl=null, tistoryPostingUrl=null) => {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"notion", result:"프로세스가 정상적으로 완료되어 노션 게시글 업데이트 중 입니다.", code:201});
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            properties: {
                "상태": {
                    select: {
                        name: status
                    }
                },
                "깃허브 PR 링크":{
                    url : gitPrUrl
                },
                "티스토리 포스팅 링크" :{
                    url : tistoryPostingUrl
                }
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
};

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

//노션 데이터를 markdown 파일로 변환하고, html파일로 변환 및 저장하는 함수
const handleNotionDataConversion = async(pageId, notionApiKey) =>{
    const mdString = await convertToMarkdown(pageId, mainWindow);
    await saveMarkdownFile(mdString);
    const htmlData = await convertNotionDataToHtml(pageId, notionApiKey, mainWindow);
    await saveHtmlFile(htmlData);

    return htmlData.html
}

//만약 커밋 해시가 존재하지 않는다면 첫 커밋을 발생시키고 해당 값을 리턴시킴
async function createInitialCommit(username, repositoryName, githubToken) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"커밋 해시코드가 존재하지 않아 새로운 커밋을 생성중입니다.", code:201});
    try {
        const response = await axios.put(`https://api.github.com/repos/${username}/${repositoryName}/contents/README.md`, {
            message: 'Initial commit',
            content: Buffer.from('#create commit').toString('base64') // 예시로 README.md에 # Welcome to the repository 를 적는 것입니다.
        }, {
            headers: {
                'Authorization': `Bearer ${githubToken}`
            }
        });

        return response.data.commit.sha;
    } catch (error) {
        
        if (error.response && error.response.status === 404) {
            throw { status: "failed", witch:"github", result: `첫번째 커밋 생성중 실패하였습니다. 레파지토리 이름을 확인해주세요. ${error.message}`, code: error.response.status };
        }else{
            throw { status: "failed", witch:"github", result: `첫번째 커밋 생성중 실패하였습니다. ${error.message}`, code: error.response.status };
        }
    }
}

//깃허브의 브랜치를 새로 생성하기위해 최신 커밋의 SHA를 가져오기 위한 함수
async function getLastCommitSHA(username, repositoryName, githubToken) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"커밋 해시코드를 수신중입니다.", code:201});
    try {
        const response = await axios.get(`https://api.github.com/repos/${username}/${repositoryName}/branches/main`, {
            headers: {
                'Authorization': `Bearer ${githubToken}`
            }
        });
        return response.data.commit.sha;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return await createInitialCommit(username, repositoryName, githubToken);
        }
        throw { status: "failed", witch:"github", result: `커밋의 sha 코드를 가져오는데 실패하였습니다. ${error.message}`, code: error.response.status };
    }
}

//브런치를 생성하는 함수.
async function createBranch(username, repositoryName, branchName, lastCommitSHA, githubToken) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"새로운 브런치를 생성중입니다.", code:201});
    try {
        await axios.post(`https://api.github.com/repos/${username}/${repositoryName}/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: lastCommitSHA
        }, {
            headers: {
                'Authorization': `Bearer ${githubToken}`
            }
        });
    } catch (error) {
        throw { status: "failed", witch:"github", result: `브런치 생성중 실패하였습니다. ${error.message}`, code: error.response.status };
    }
}

//md파일을 이용해 커밋을 발생시키는 함수
async function commitFile(username, repositoryName, fileName, fileContent, branchName, githubToken) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"TIL md파일을 커밋중입니다.", code:201});
    try {
        await axios.put(`https://api.github.com/repos/${username}/${repositoryName}/contents/${fileName}`, {
            message: `${getFormattedDate()}_TIL`,
            content: Buffer.from(fileContent).toString('base64'),
            branch: branchName
        }, {
            headers: {
                'Authorization': `Bearer ${githubToken}`
            }
        });
    } catch (error) {
        throw { status: "failed", witch:"github", result: `커밋에 실패하였습니다. ${error.message}`, code: error.response.status };
    }
}

//PR을 생성하는 함수
async function createPullRequest(username, repositoryName, prTitle, sourceBranch, targetBranch, githubToken) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"Pull Request를 생성중입니다.", code:201});
    try {
        const response = await axios.post(`https://api.github.com/repos/${username}/${repositoryName}/pulls`, {
            title: prTitle,
            head: sourceBranch,
            base: targetBranch
        }, {
            headers: {
                'Authorization': `Bearer ${githubToken}`
            }
        });
        return response.data.html_url;
    } catch (error) {
        throw { status: "failed", witch:"github", result: `풀 리퀘스트를 생성하는데 실패하였습니다. ${error.message}`, code: error.response.status };
    }
}

// 모든 프로세스를 순서대로 실행하는 함수
async function processGithubActions(username, repositoryName, filePath, fileContent, prTitle, githubToken) {
    try {
        const lastCommitSHA = await getLastCommitSHA(username, repositoryName, githubToken);
        const newBranchName = `${getFormattedDate()}_TIL`; 
        await createBranch(username, repositoryName, newBranchName, lastCommitSHA, githubToken);
        
        await commitFile(username, repositoryName, filePath, fileContent, newBranchName, githubToken);
        
        const targetBranch = 'main';
        const prURL = await createPullRequest(username, repositoryName, prTitle, newBranchName, targetBranch, githubToken);
        
        return prURL;  // PR의 URL을 반환합니다.
        
    } catch (error) {
        throw error;
    }
}