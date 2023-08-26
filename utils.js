const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { Readable } = require('stream');

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

const uploadImage = async(imageSource, token, blogName, mainWindow, displayFlag) =>{
    mainWindow.webContents.send('publish-response', {status:"doing", witch:"tistroy", result:displayFlag? "커버 이미지를 업로드중 입니다." : "컨텐츠 이미지 업로드중 입니다", code:201});
    let buffer;

    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
        const response = await axios.get(imageSource, { responseType: 'arraybuffer' });
        buffer = Buffer.from(response.data, 'binary');
    } else if (imageSource.startsWith('data:image/')) {
        buffer = Buffer.from(imageSource.split(',')[1], 'base64');
    } else {
        throw { status: "failed", witch:"tistory", result: `파일 버퍼 변환 과정에서 실패하였습니다. ${error.response.data}`, code: 400 };
    }

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const formData = new FormData();
    formData.append('uploadedfile', stream, { filename: `${getCurrentTime()}.png` });
    try {
        const response = await axios.post(
            `https://www.tistory.com/apis/post/attach?access_token=${token}&blogName=${blogName}&output=json`,
            formData,
        );
        mainWindow.webContents.send('publish-response', {status:"doing", witch:"tistroy", result:displayFlag? "커버 이미지 업로드가 완료되었습니다." : "컨텐츠 이미지 업로드가 완료되었습니다.", code:201});
        if(displayFlag){
            return response.data.tistory.replacer.replace(/height="[^"]*"/, match => `${match} style="display:none" display="none"`);
        }else{
            return response.data.tistory.replacer
        }
        
    } catch (error) {
        throw { status: "failed", witch:"tistory", result: `티스토리 파일 업로드 과정에서 실패했습니다. ${error.response.data.tistory.error_message}`, code: error.response.data.tistory.status };
    }
}

module.exports = {
    getFormattedDate,
    saveMarkdownFile,
    saveHtmlFile,
    getCurrentTime,
    uploadImage
}