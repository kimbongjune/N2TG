window.electron.ipcRenderer.on('git-api-validation-response', (data) => {
    hideOverlay("깃허브 검증 완료")
    if(data.status == "failed"){
        console.log(data)
        if(data.code == 401){
            const peedbackElement = document.getElementById('git-apikey-peedback');
            peedbackElement.textContent = data.result;
            const element = document.getElementById('githubToken');
            toggleClass(element, false)
            const btnElement = document.getElementById('btn-validation-github');
            toggleButtonColorClass("깃허브", btnElement, false)
        }
        if(data.code == 404){
            const peedbackElement1 = document.getElementById('git-username-peedback');
            peedbackElement1.textContent = data.result;
            const peedbackElement2 = document.getElementById('git-repository-name-peedback');
            peedbackElement2.textContent = data.result;
            const element1 = document.getElementById('username');
            toggleClass(element1, false)
            const element2 = document.getElementById('repositoryName');
            toggleClass(element2, false)
            const btnElement = document.getElementById('btn-validation-github');
            toggleButtonColorClass("깃허브", btnElement, false)
        }
        const element = document.getElementById('github-validation-group');
        toggleClass(element, false)
        localStorage.setItem("githubValidationFlag", false);
        const btnElement = document.getElementById('btn-validation-github');
        toggleButtonColorClass("깃허브", btnElement, false)
    }else{
        console.log("검증 성공")
        const element = document.getElementById('github-validation-group');
        toggleClass(element, true)
        localStorage.setItem("githubValidationFlag", true);
        const btnElement = document.getElementById('btn-validation-github');
        toggleButtonColorClass("깃허브", btnElement, true)
    }
});

window.electron.ipcRenderer.on('notion-validation-response', (data) => {
    if (data.status == "failed") {
        console.log(data);
        
        if (data.code == 401) {
            const peedbackElement = document.getElementById('notion-apikey-peedback');
            peedbackElement.textContent = data.result;
            const element = document.getElementById('notionApiKeyInput');
            toggleClass(element, false);
            const btnElement = document.getElementById('btn-validation-notion');
            toggleButtonColorClass("노션", btnElement, false);
        }
        
        if (data.code == 400) {
            const peedbackElement = document.getElementById('notion-database-peedback');
            peedbackElement.textContent = data.result;
            const element = document.getElementById('databaseIdInput');
            toggleClass(element, false);
            const btnElement = document.getElementById('btn-validation-notion');
            toggleButtonColorClass("노션", btnElement, false);
        }
        
        const element = document.getElementById('notion-validation-group');
        toggleClass(element, false);
        localStorage.setItem("notionValidationFlag", false);
        const btnElement = document.getElementById('btn-validation-notion');
        toggleButtonColorClass("노션", btnElement, false);
    } else {
        console.log("검증 성공", data.result);
        const element = document.getElementById('notion-validation-group');
        toggleClass(element, true);
        localStorage.setItem("notionValidationFlag", true);
        const btnElement = document.getElementById('btn-validation-notion');
        toggleButtonColorClass("노션", btnElement, true);
    }
});

window.electron.ipcRenderer.on('notion-response', (data) => {
    const container = document.getElementById('results');
    container.innerHTML = JSON.stringify(data, null, 2);
});

window.electron.ipcRenderer.on('tistory-validation-response', (data) => {
    if (data.status == "failed") {
        console.log(data);

        if (data.code == 400) {
            // 앱 ID 에러 처리
            const appIDFeedbackElement = document.getElementById('tistory-appid-peedback');
            appIDFeedbackElement.textContent = data.result;
            const appIDInputElement = document.getElementById('tistoryAppIDInput');
            toggleClass(appIDInputElement, false);

            // 시크릿 키 에러 처리
            const secretKeyFeedbackElement = document.getElementById('tistory-secretkey-peedback');
            secretKeyFeedbackElement.textContent = data.result;
            const secretKeyInputElement = document.getElementById('tistorySecretKeyInput');
            toggleClass(secretKeyInputElement, false);

            // 블로그 이름 에러 처리
            const blogNameFeedbackElement = document.getElementById('tistory-blogname-peedback');
            blogNameFeedbackElement.textContent = data.result;
            const blogNameInputElement = document.getElementById('tistoryBlogName');
            toggleClass(blogNameInputElement, false);
        }

        // 일반적인 실패 처리
        const validationGroupElement = document.getElementById('tistory-validation-group');
        toggleClass(validationGroupElement, false);
        localStorage.setItem("tistoryValidationFlag", false);
        const btnElement = document.getElementById('btn-validation-tistory');
        toggleButtonColorClass("티스토리", btnElement, false);

    } else {
        console.log("검증 성공");
        const validationGroupElement = document.getElementById('tistory-validation-group');
        toggleClass(validationGroupElement, true);
        localStorage.setItem("tistoryValidationFlag", true);
        const btnElement = document.getElementById('btn-validation-tistory');
        console.log(data.result.tistory.item.categories)
        if(data.result.tistory.item.categories.length > 0){
            const extractedData = data.result.tistory.item.categories.map(category => {
                return {
                    id: category.id,
                    label: category.label
                };
            });
            // 로컬 스토리지에 저장
            localStorage.setItem("categories", JSON.stringify(extractedData));
            createRadioButtons(extractedData)
        }
        toggleButtonColorClass("티스토리", btnElement, true);
    }
});

window.electron.ipcRenderer.on('tistory-response', (data) => {
    const container = document.getElementById('results');
    container.innerHTML = JSON.stringify(data, null, 2);
});

function fetchGithubData() {
    showOverlay("깃허브 검증중...")
    const githubToken = document.getElementById('githubToken').value;
    const username = document.getElementById('username').value;
    const repositoryName = document.getElementById('repositoryName').value;
    if (!githubToken) {
        const element = document.getElementById('githubToken');
        const peedbackElement = document.getElementById('git-apikey-peedback');
        peedbackElement.textContent = "깃허브 API키를 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false)
        element.focus()
        return
    }else{
        const element = document.getElementById('githubToken');
        toggleClass(element, true)
    }

    if(!username){
        const element = document.getElementById('username');
        const peedbackElement = document.getElementById('git-username-peedback');
        peedbackElement.textContent = "레파지토리 소유자를 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false)
        element.focus()
        return
    }else{
        const element = document.getElementById('username');
        toggleClass(element, true)
    }
    
    if(!repositoryName){
        const element = document.getElementById('repositoryName');
        toggleClass(element, false)
        const peedbackElement = document.getElementById('git-username-peedback');
        peedbackElement.textContent = "커밋 할 레파지토리를 입력하세요. 공백은 입력할 수 없습니다.";
        element.focus()
        return
    }else{
        const element = document.getElementById('repositoryName');
        toggleClass(element, true)
    }

    window.electron.ipcRenderer.send('git-api-validation', { githubToken, username, repositoryName });
}

function fetchNotionData() {
    const notionApiKey = document.getElementById('notionApiKeyInput').value;
    const databaseId = document.getElementById('databaseIdInput').value;

    // Check for Notion API key
    if (!notionApiKey) {
        const element = document.getElementById('notionApiKeyInput');
        const peedbackElement = document.getElementById('notion-apikey-peedback');
        peedbackElement.textContent = "노션 API키를 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false);
        element.focus();
        return;
    } else {
        const element = document.getElementById('notionApiKeyInput');
        toggleClass(element, true);
    }

    // Check for Notion Database ID
    if (!databaseId) {
        const element = document.getElementById('databaseIdInput');
        const peedbackElement = document.getElementById('notion-database-peedback');
        peedbackElement.textContent = "노션 데이터베이스 ID를 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false);
        element.focus();
        return;
    } else {
        const element = document.getElementById('databaseIdInput');
        toggleClass(element, true);
    }

    window.electron.ipcRenderer.send('notion-api-validation', { notionApiKey, databaseId });
}

function fetchTistoryData() {
    const tistoryAppIDInput = document.getElementById('tistoryAppIDInput').value;
    const tistorySecretKeyInput = document.getElementById('tistorySecretKeyInput').value;
    const tistoryBlogName = document.getElementById('tistoryBlogName').value;

    // Check for Tistory App ID
    if (!tistoryAppIDInput) {
        const element = document.getElementById('tistoryAppIDInput');
        const feedbackElement = document.getElementById('tistory-appid-peedback');
        feedbackElement.textContent = "티스토리 App ID를 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false);
        element.focus();
        return;
    } else {
        const element = document.getElementById('tistoryAppIDInput');
        toggleClass(element, true);
    }

    // Check for Tistory Secret Key
    if (!tistorySecretKeyInput) {
        const element = document.getElementById('tistorySecretKeyInput');
        const feedbackElement = document.getElementById('tistory-secretkey-peedback');
        feedbackElement.textContent = "티스토리 Secret Key를 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false);
        element.focus();
        return;
    } else {
        const element = document.getElementById('tistorySecretKeyInput');
        toggleClass(element, true);
    }

    // Check for Tistory Blog Name
    if (!tistoryBlogName) {
        const element = document.getElementById('tistoryBlogName');
        const feedbackElement = document.getElementById('tistory-blogname-peedback');
        feedbackElement.textContent = "티스토리 Blog Name을 입력하세요. 공백은 입력할 수 없습니다.";
        toggleClass(element, false);
        element.focus();
        return;
    } else {
        const element = document.getElementById('tistoryBlogName');
        toggleClass(element, true);
    }

    window.electron.ipcRenderer.send('tistory-api-validation', { tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName });
}

function toggleClass(element, valid) {
    if (valid) {
        element.classList.add('is-valid');
        element.classList.remove('is-invalid');
    } else {
        element.classList.add('is-invalid');
        element.classList.remove('is-valid');
    }
}

function toggleButtonColorClass(vlidTarget, element, valid) {
    if (valid) {
        element.classList.add('btn-outline-primary');
        element.classList.remove('btn-outline-danger');
        element.textContent = `${vlidTarget} API 재 검증${vlidTarget == "티스토리" ? " 및 카테고리 갱신":""}`
    } else {
        element.classList.add('btn-outline-danger');
        element.classList.remove('btn-outline-primary');
        element.textContent = `${vlidTarget} API 검증${vlidTarget == "티스토리" ? " 및 카테고리 갱신":""}`
    }
}

document.addEventListener("DOMContentLoaded", function(){
    const githubUsedCheckbox = document.getElementById('github-used-flag');
    const githubCollapseElement = document.getElementById('github-collapse');
    const githubUsedFlag = localStorage.getItem("githubUsedFlag");

    githubUsedCheckbox.checked = githubUsedFlag === 'true';

    const collapse = new bootstrap.Collapse(githubCollapseElement, {
        toggle: githubUsedFlag != null == githubUsedFlag
    });

    if (githubUsedCheckbox.checked) {
        collapse.show();
    } else {
        collapse.hide();
    }

    githubUsedCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem("githubUsedFlag", true);
            collapse.show();
        } else {
            localStorage.setItem("githubUsedFlag", false);
            collapse.hide();
        }
    });

    const tistoryUsedCheckbox = document.getElementById('tistory-used-flag');
    const tistoryCollapseElement = document.getElementById('tistory-collapse');
    const tistoryUsedFlag = localStorage.getItem("tistoryUsedFlag");

    tistoryUsedCheckbox.checked = tistoryUsedFlag === 'true';

    const tistoryCollapse = new bootstrap.Collapse(tistoryCollapseElement, {
        toggle: tistoryUsedFlag != null && tistoryUsedFlag === 'true'
    });

    if (tistoryUsedCheckbox.checked) {
        tistoryCollapse.show();
    } else {
        tistoryCollapse.hide();
    }

    tistoryUsedCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem("tistoryUsedFlag", 'true');
            tistoryCollapse.show();
        } else {
            localStorage.setItem("tistoryUsedFlag", 'false');
            tistoryCollapse.hide();
        }
    });

    const githubValidationFlag = localStorage.getItem("githubValidationFlag");
    if(githubValidationFlag != null){
        if(githubValidationFlag == "true"){
            const element = document.getElementById('github-validation-group');
            toggleClass(element, true)
            const btnElement = document.getElementById('btn-validation-github');
            toggleButtonColorClass("깃허브", btnElement, true)
        }else{
            const element = document.getElementById('github-validation-group');
            toggleClass(element, false)
            const btnElement = document.getElementById('btn-validation-github');
            toggleButtonColorClass("깃허브", btnElement, false)
        }
    }

    const notionValidationFlag = localStorage.getItem("notionValidationFlag");
    if(notionValidationFlag != null){
        if(notionValidationFlag == "true"){
            const element = document.getElementById('notion-validation-group');
            toggleClass(element, true);
            const btnElement = document.getElementById('btn-validation-notion');
            toggleButtonColorClass("노션", btnElement, true);
        }else{
            const element = document.getElementById('notion-validation-group');
            toggleClass(element, false);
            const btnElement = document.getElementById('btn-validation-notion');
            toggleButtonColorClass("노션", btnElement, false);
        }
    }

    const tistoryValidationFlag = localStorage.getItem("tistoryValidationFlag");
    if (tistoryValidationFlag != null) {
        const isValid = tistoryValidationFlag === "true";
        const element = document.getElementById('tistory-validation-group');
        toggleClass(element, isValid);
        const btnElement = document.getElementById('btn-validation-tistory');
        toggleButtonColorClass("티스토리", btnElement, isValid);
    }

    const storedData = JSON.parse(localStorage.getItem("categories"));
    if(storedData){
        createRadioButtons(storedData);
    }
});


// 동적으로 라디오 버튼 생성
function createRadioButtons(data) {
    const container = document.getElementById('category-container'); 
    container.innerHTML = '';

    const selectedCategoryId = localStorage.getItem('selectedCategoryId') || '0';

    // 기본값 라디오 버튼 생성
    createRadioButton('0', '카테고리 없음', selectedCategoryId, container);

    // 데이터를 기반으로 라디오 버튼 생성
    data.forEach(item => {
        createRadioButton(item.id, item.label, selectedCategoryId, container);
    });
}

function createRadioButton(value, text, selectedValue, container) {
    const div = document.createElement('div');
    div.className = 'form-check d-inline-block me-4';

    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'radio';
    input.name = 'categoryRadio';
    input.value = value;
    input.id = `category${value}`;
    if (value === selectedValue) {
        input.checked = true;
    }
    input.addEventListener('change', handleRadioChange);

    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = `category${value}`;
    label.textContent = text;

    div.appendChild(input);
    div.appendChild(label);

    container.appendChild(div);
}

// 라디오 버튼 체크 변경 이벤트 핸들러
function handleRadioChange(event) {
    // 선택된 라디오 버튼의 value를 로컬스토리지에 저장
    localStorage.setItem('selectedCategoryId', event.target.value);
}

function postData(){
    alert("zz")
}

function setOverlayText(text = "") {
    const overlayText = document.getElementById('overlay-text');
    overlayText.textContent = text;

    // 텍스트가 없다면 텍스트를 숨기고, 있다면 보이게 함
    if (!text) {
        overlayText.classList.add('visually-hidden');
    } else {
        overlayText.classList.remove('visually-hidden');
    }
}

function addTextToOverlay(newText) {
    const overlayCenter = document.querySelector('#overlay > div');
    
    // 새로운 텍스트 엘리먼트 생성
    const newTextNode = document.createElement('div');
    newTextNode.style.color = 'white';
    newTextNode.style.marginTop = '10px';
    newTextNode.textContent = newText;

    // 센터에 위치한 div에 새로운 텍스트 엘리먼트 추가
    overlayCenter.appendChild(newTextNode);
}

function showOverlay(text = "Loading...") {
    setOverlayText(text);
    document.getElementById('overlay').style.display = 'block';
}

function hideOverlay(text = "") {
    setOverlayText(text);
    document.getElementById('overlay').style.display = 'none';
}