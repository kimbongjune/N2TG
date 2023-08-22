const Store = require('electron-store');
const store = new Store();

//깃허브 API 사용 파라미터를 저장하는 함수
const saveGithubParameter = (githubApiToken, githubUsername, repositoryName) =>{
    store.set('githubParameter', {
        "githubApiToken" : githubApiToken, 
        "githubUsername" : githubUsername,
        "repositoryName" : repositoryName,
    });
}

//깃허브 API 사용 파라미터를 가져오는 함수
const getGithubParameter = () =>{
    return store.get("githubParameter")
}

//깃허브 API 사용 파라미터를 삭제하는 함수
const deleteGithubParameter = () => {
    if(store.get("githubParameter")){
        store.delete("githubParameter");
    }
}

//노션 API 사용 파라미터를 저장하는 함수
const saveNotionParameter = (notionApiKey, notionDatabaseId) =>{
    store.set('notionParameter', {
        "notionApiKey" :notionApiKey, 
        "notionDatabaseId" : notionDatabaseId
    });
}

//노션 API 사용 파라미터를 가져오는 함수
const getNotionParameter = () =>{
    return store.get("notionParameter")
}

//노션 API 사용 파라미터를 삭제하는 함수
const deleteNotionParameter = () => {
    store.delete("notionParameter");
}

//티스토리 API 사용 파라미터를 저장하는 함수
const saveTistoryParameter = (tistoryAppId, tistorySecretKey, tistoryBlogName) =>{
    store.set('tistoryParameter', {
        "tistoryAppId" :tistoryAppId, 
        "tistorySecretKey" : tistorySecretKey, 
        "tistoryBlogName" : tistoryBlogName
    });
}

//티스토리 API 사용 파라미터를 가져오는 함수
const getTistoryParameter = () =>{
    return store.get("tistoryParameter")
}

//노션 API 사용 파라미터를 삭제하는 함수
const deleteTistoryParameter = () => {
    store.delete("tistoryParameter");
}

//티스토리 액세스토큰을 저장하는 함수
const saveTistoryAccessToken = (accessToken) =>{
    store.set('accessToken',accessToken)
}

//티스토리 API 사용 파라미터를 가져오는 함수
const getTistoryAccessToken = () =>{
    return store.get("accessToken")
}

module.exports = {
    saveGithubParameter,
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
};