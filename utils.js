const fs = require('fs');

//오늘 날짜를 yyyy-mm-dd_hhMM 형식으로 변환하는 함수
const getFormattedDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
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

//문자열을 base64로 인코딩 하는 함수
const encodingToBase64 = async(content) =>{
    return Buffer.from(content).toString('base64');
}

//띄어쓰기 문자열을 언더바로 변환하는 함수
const replaceSpacesWithUnderscores = (str) =>{
    return str.replace(/\s/g, '_');
}

//현재시간을 연월일_시분초 로 반환하는 함수
const getCurrentTime = () =>{
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

module.exports = {
    getFormattedDate,
    saveMarkdownFile,
    saveHtmlFile,
    getCurrentTime
}