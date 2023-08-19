const fs = require('fs');

//오늘 날짜를 yyyy-mm-dd_hhMM 형식으로 변환하는 함수
const getFormattedDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
}

//노션 텍스트를 md 파일로 저장하는 함수
const saveMarkdownFile = async (mdString) =>{
    fs.writeFile(`${getFormattedDate()}.md`, mdString.parent, 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

//노션 텍스트를 md 파일로 저장하는 함수
const saveHtmlFile = async (htmlData) =>{
    fs.writeFile(`${getFormattedDate()}.html`, htmlData.html, 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

module.exports = {
    saveMarkdownFile,
    saveHtmlFile
}