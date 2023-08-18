const Store = require('electron-store');
const store = new Store();

//깃허브 API 사용 파라미터를 저장하는 함수
const saveGithubParameter = (githubApiToken, githubUsername) =>{
    store.set('githubParameter', {
        "githubApiToken" : githubApiToken, 
        "githubUsername" : githubUsername
    });
}

//깃허브 API 사용 파라미터를 가져오는 함수
const getGithubParameter = () =>{
    return store.get("githubParameter")
}

//깃허브 API 사용 파라미터를 삭제하는 함수
const deleteGithubParameter = () => {
    store.delete("githubParameter");
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

module.exports = {
    saveGithubParameter,
    getGithubParameter,
    saveNotionParameter,
    getNotionParameter,
    saveTistoryParameter,
    getTistoryParameter,
    deleteGithubParameter,
    deleteNotionParameter,
    deleteTistoryParameter
};