const NotionPageToHtml = require('notion-private-page-to-html');

//노션 텍스트를 html으로 변환하는 함수
async function convertNotionDataToHtml(pageId, notionApiKey) {
    try {
        const { title, icon, cover, html } = await NotionPageToHtml.convert(pageId, notionApiKey);
        return { title, icon, cover, html };
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

module.exports = convertNotionDataToHtml;