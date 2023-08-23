const { NotionToMarkdown } = require("notion-to-md");

let n2m;

//노션 텍스트를 md로 변환하는 라이브러리의 인스턴스를 생성하는 함수
function initiallizeNotionToMarkdownInstance(notionClient) {
    if (!n2m) {
        n2m = new NotionToMarkdown({ notionClient });
    }
    return n2m;
}

//
async function convertToMarkdown(pageId, mainWindow) {
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"github", result:"노션 텍스트를 markdown으로 변환중입니다.", code:201});
    const mdblocks = await n2m.pageToMarkdown(pageId);
    return await n2m.toMarkdownString(mdblocks);
}

module.exports = {
    initiallizeNotionToMarkdownInstance,
    convertToMarkdown
};