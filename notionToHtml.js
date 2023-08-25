const NotionPageToHtml = require('notion-private-page-to-html');

//노션 텍스트를 html으로 변환하는 함수
async function convertNotionDataToHtml(pageId, notionApiKey, mainWindow) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"tistory", result:"노션 텍스트를 html으로 변환중입니다.", code:201});
    try {
        const { title, icon, cover, html } = await NotionPageToHtml.convert(pageId, notionApiKey,{excludeHeaderFromBody:true,excludeTitleFromHead:true});
        return { title, icon, cover, html };
    } catch (error) {
        throw { status: "failed", witch:"tistory", result: `노션 데이터를 html으로 변환 과정에서 실패하였습니다. ${error}`, code: 400 };
    }
}

module.exports = convertNotionDataToHtml;