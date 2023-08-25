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
    hideOverlay("노션 검증 완료")
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
    hideOverlay("티스토리 검증 완료")
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

        const container = document.getElementById('category-container'); 
        container.innerHTML = '';
        const validElement = document.getElementById('tistory-category-validation-valid-feedback');
        validElement.style.display = 'none';
        const invalidElement = document.getElementById('tistory-category-validation-invalid-feedback');
        invalidElement.style.display = 'block';
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
        const invalidElement = document.getElementById('tistory-category-validation-invalid-feedback');
        invalidElement.style.display = 'none';
        const validElement = document.getElementById('tistory-category-validation-valid-feedback');
        validElement.style.display = 'block';
        toggleButtonColorClass("티스토리", btnElement, true);
    }
});

window.electron.ipcRenderer.on('tistory-response', (data) => {
    const container = document.getElementById('results');
    container.innerHTML = JSON.stringify(data, null, 2);
});

window.electron.ipcRenderer.on('publish-response', (data) => {
    console.log(data)
    if(data.witch == "github"){
        if(data.code == 200){
            hideOverlay()
            showModal("PR 생성 완료", "PR 생성이 완료되었습니다.",data.gitLink)
        }else if(data.code == 201){
            addTextToOverlay(data.result)
        }else{
            hideOverlay()
            showModal("에러가 발생하였습니다.", data.result)
        }
    }else if(data.witch == "tistory"){
        if(data.code == 200){
            hideOverlay()
            showModal("티스토리 게시글 작성 완료", "티스토리 게시글 작성이 완료되었습니다.", null, data.tistoryLink)
        }else if(data.code == 201){
            addTextToOverlay(data.result)
        }else{
            hideOverlay()
            showModal("에러가 발생하였습니다.", data.result)
        }
    }else if(data.witch == "all"){
        if(data.code == 200){
            hideOverlay()
            showModal("티스토리 게시글 작성 및 깃허브 PR 생성 완료", "티스토리 게시글 작성 및 깃허브 PR 생성이 완료되었습니다.", data.gitLink, data.tistoryLink)
        }else if(data.code == 201){
            addTextToOverlay(data.result)
        }else{
            hideOverlay()
            showModal("에러가 발생하였습니다.", data.result)
        }
    }else{
        if(data.code == 200){
            hideOverlay()
        }else if(data.code == 201){
            addTextToOverlay(data.result)
            console.log(data)
        }else if(data.code == 403){
            hideOverlay()
            showModal("발행 할 게시글이 없습니다.", "노션에 \"발행요청\" 혹은 \"오류\" 상태의 게시글이 없습니다.")
        }
    }
})

function fetchGithubData() {
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

    showOverlay("깃허브 검증중...")
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
    showOverlay("노션 검증중...")
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
    showOverlay("티스토리 검증중...")
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

    githubUsedCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem("githubUsedFlag", true);
            const element = document.getElementById("git-tistory-validator")
            element.style.display = "none"
            collapse.show();
        } else {
            localStorage.setItem("githubUsedFlag", false);
            collapse.hide();
            if (!tistoryUsedCheckbox.checked) {
                const element = document.getElementById("git-tistory-validator");
                element.style.display = "block";
            }
        }
    });

    tistoryUsedCheckbox.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem("tistoryUsedFlag", 'true');
            const element = document.getElementById("git-tistory-validator")
            element.style.display = "none"
            tistoryCollapse.show();
        } else {
            localStorage.setItem("tistoryUsedFlag", 'false');
            tistoryCollapse.hide();
            if (!githubUsedCheckbox.checked) {
                const element = document.getElementById("git-tistory-validator");
                element.style.display = "block";
            }
        }
    });

    if(!tistoryUsedCheckbox.checked && !githubUsedCheckbox.checked){
        const element = document.getElementById("git-tistory-validator");
        element.style.display = "block";
    }

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
    }else{
        const element = document.getElementById('tistory-validation-group');
        toggleClass(element, false);
        const btnElement = document.getElementById('btn-validation-tistory');
        toggleButtonColorClass("티스토리", btnElement, false);
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
    const tistoryUsedFlag = document.getElementById('tistory-used-flag').checked;
    const githubUsedFlag = document.getElementById('github-used-flag').checked;

    const notionApiKey = document.getElementById('notionApiKeyInput').value;
    const databaseId = document.getElementById('databaseIdInput').value;

    const githubToken = document.getElementById('githubToken').value;
    const username = document.getElementById('username').value;
    const repositoryName = document.getElementById('repositoryName').value;

    const tistoryAppIDInput = document.getElementById('tistoryAppIDInput').value;
    const tistorySecretKeyInput = document.getElementById('tistorySecretKeyInput').value;
    const tistoryBlogName = document.getElementById('tistoryBlogName').value;

    let categoryId = 0

    // Check for Notion API key
    validateInputField(notionApiKey, 'notionApiKeyInput', 'notion-apikey-peedback', 'notion-validation-group', 'btn-validation-notion', "노션 API키를 입력하세요. 공백은 입력할 수 없습니다.", "노션", "notionValidationFlag");
    validateInputField(databaseId, 'databaseIdInput', 'notion-database-peedback', 'notion-validation-group', 'btn-validation-notion', "노션 데이터베이스 ID를 입력하세요. 공백은 입력할 수 없습니다.", "노션", "notionValidationFlag");
    
    if (!handleValidation("노션", "notionValidationFlag", 'notion-validation-group', 'btn-validation-notion')) {
        return;
    }

    if (tistoryUsedFlag && !githubUsedFlag) {
        //티스토리만 사용
        validateInputField(tistoryAppIDInput, 'tistoryAppIDInput', 'tistory-appid-peedback', 'tistory-validation-group', 'btn-validation-tistory', "티스토리 App ID를 입력하세요. 공백은 입력할 수 없습니다.", "티스토리", "tistoryValidationFlag");
        validateInputField(tistorySecretKeyInput, 'tistorySecretKeyInput', 'tistory-secretkey-peedback', 'tistory-validation-group', 'btn-validation-tistory', "티스토리 Secret Key를 입력하세요. 공백은 입력할 수 없습니다.", "티스토리", "tistoryValidationFlag");
        validateInputField(tistoryBlogName, 'tistoryBlogName', 'tistory-blogname-peedback', 'tistory-validation-group', 'btn-validation-tistory', "티스토리 Blog Name을 입력하세요. 공백은 입력할 수 없습니다.", "티스토리", "tistoryValidationFlag");
        
        const tistoryValidationFlag = localStorage.getItem("tistoryValidationFlag");
        if (tistoryValidationFlag != null) {
            const isValid = tistoryValidationFlag === "true";
            const element = document.getElementById('tistory-validation-group');
            toggleClass(element, isValid);
            const btnElement = document.getElementById('btn-validation-tistory');
            toggleButtonColorClass("티스토리", btnElement, isValid);
            if(!isValid){
                return;
            }
        }

        if (!handleValidation("티스토리", "tistoryValidationFlag", 'tistory-validation-group', 'btn-validation-tistory')) {
            return;
        }
        categoryId = getCheckedRadioButtonValue()
        showOverlay("티스토리 게시글 포스팅중입니다...")
        console.log("티스토리만 사용",notionApiKey, databaseId, tistoryAppIDInput, tistorySecretKeyInput,tistoryBlogName, categoryId)
        window.electron.ipcRenderer.send('publish-tistory', { notionApiKey, databaseId, tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, categoryId });
        return;
    } else if (!tistoryUsedFlag && githubUsedFlag) {
        //깃허브만 사용
        validateInputField(githubToken, 'githubToken', 'git-apikey-peedback', 'github-validation-group', 'btn-validation-github', "깃허브 API키를 입력하세요. 공백은 입력할 수 없습니다.", "깃허브", "githubValidationFlag");
        validateInputField(username, 'username', 'git-username-peedback', 'github-validation-group', 'btn-validation-github', "레파지토리 소유자를 입력하세요. 공백은 입력할 수 없습니다.", "깃허브", "githubValidationFlag");
        validateInputField(repositoryName, 'repositoryName', 'git-repository-name-peedback', 'github-validation-group', 'btn-validation-github', "커밋 할 레파지토리를 입력하세요. 공백은 입력할 수 없습니다.", "깃허브", "githubValidationFlag");

        if (!handleValidation("깃허브", "githubValidationFlag", 'github-validation-group', 'btn-validation-github')) {
            return;
        }
        
        showOverlay("깃허브 PR 생성중입니다...")
        console.log("깃허브만 사용",notionApiKey, databaseId, githubToken, username, repositoryName)
        window.electron.ipcRenderer.send('publish-github', { notionApiKey, databaseId, githubToken, username, repositoryName });

        return;
    } else if (tistoryUsedFlag && githubUsedFlag) {
        //둘 다 사용
        validateInputField(githubToken, 'githubToken', 'git-apikey-peedback', 'github-validation-group', 'btn-validation-github', "깃허브 API키를 입력하세요. 공백은 입력할 수 없습니다.", "깃허브", "githubValidationFlag");
        validateInputField(username, 'username', 'git-username-peedback', 'github-validation-group', 'btn-validation-github', "레파지토리 소유자를 입력하세요. 공백은 입력할 수 없습니다.", "깃허브", "githubValidationFlag");
        validateInputField(repositoryName, 'repositoryName', 'git-repository-name-peedback', 'github-validation-group', 'btn-validation-github', "커밋 할 레파지토리를 입력하세요. 공백은 입력할 수 없습니다.", "깃허브", "githubValidationFlag");

        if (!handleValidation("깃허브", "githubValidationFlag", 'github-validation-group', 'btn-validation-github')) {
            return;
        }

        validateInputField(tistoryAppIDInput, 'tistoryAppIDInput', 'tistory-appid-peedback', 'tistory-validation-group', 'btn-validation-tistory', "티스토리 App ID를 입력하세요. 공백은 입력할 수 없습니다.", "티스토리", "tistoryValidationFlag");
        validateInputField(tistorySecretKeyInput, 'tistorySecretKeyInput', 'tistory-secretkey-peedback', 'tistory-validation-group', 'btn-validation-tistory', "티스토리 Secret Key를 입력하세요. 공백은 입력할 수 없습니다.", "티스토리", "tistoryValidationFlag");
        validateInputField(tistoryBlogName, 'tistoryBlogName', 'tistory-blogname-peedback', 'tistory-validation-group', 'btn-validation-tistory', "티스토리 Blog Name을 입력하세요. 공백은 입력할 수 없습니다.", "티스토리", "tistoryValidationFlag");
        
        const tistoryValidationFlag = localStorage.getItem("tistoryValidationFlag");
        if (tistoryValidationFlag != null) {
            const isValid = tistoryValidationFlag === "true";
            const element = document.getElementById('tistory-validation-group');
            toggleClass(element, isValid);
            const btnElement = document.getElementById('btn-validation-tistory');
            toggleButtonColorClass("티스토리", btnElement, isValid);
            if(!isValid){
                return;
            }
        }
        categoryId = getCheckedRadioButtonValue()
        if (!handleValidation("티스토리", "tistoryValidationFlag", 'tistory-validation-group', 'btn-validation-tistory')) {
            return;
        }
        showOverlay("티스토리 게시글 포스팅 및 깃허브 PR 생성중입니다...")
        window.electron.ipcRenderer.send('publish-all', {notionApiKey, databaseId, githubToken, username, repositoryName, tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, categoryId });
        //console.log("둘 다 사용",notionApiKey, databaseId, githubToken, username, repositoryName, tistoryAppIDInput, tistorySecretKeyInput, tistoryBlogName, categoryId)
        return;
    } else {
        console.log('티스토리와 깃허브 둘 다 사용하지 않습니다.');
        const element = document.getElementById("git-tistory-validator")
        element.style.display = "block"
        return;
    }
}

function addTextToOverlay(text = "Loading...") {
    const overlayCenter = document.querySelector('#overlay > div');

    // 새로운 텍스트 엘리먼트 생성
    const newTextNode = document.createElement('div');
    newTextNode.className = 'overlay-text';
    newTextNode.style.color = 'white';
    newTextNode.style.marginTop = '10px';
    newTextNode.textContent = text;

    // 센터에 위치한 div에 새로운 텍스트 엘리먼트 추가
    overlayCenter.appendChild(newTextNode);
}

function modifyTextToOverlay(newText, index) {
    const overlayCenter = document.querySelector('#overlay > div');
    const allTextNodes = overlayCenter.querySelectorAll('.overlay-text');

    if (allTextNodes[index]) {
        allTextNodes[index].textContent = newText;
    } else {
        console.error(`No text node found at index ${index}`);
    }
}

function removeTextAtOverlayIndex(index) {
    const overlayCenter = document.querySelector('#overlay > div');
    const allTextNodes = overlayCenter.querySelectorAll('.overlay-text');

    if (index === -1) {
        allTextNodes.forEach(node => {
            if (node.id !== "overlay-text") {
                node.remove();
            }
        });
    } else if (allTextNodes[index]) {
        allTextNodes[index].remove();
    } else {
        console.error(`No text node found at index ${index}`);
    }
}
function showOverlay(text = "Loading...") {
    addTextToOverlay(text);
    document.getElementById('overlay').style.display = 'block';
}

function hideOverlay() {
    removeTextAtOverlayIndex(-1)
    document.getElementById('overlay').style.display = 'none';
}

function getCheckedRadioButtonValue() {
    const container = document.getElementById('category-container');
    const checkedButton = container.querySelector('input[name="categoryRadio"]:checked');
    
    if (checkedButton) {
        return checkedButton.value;
    } else {
        console.error('No radio button is checked.');
        return 0;
    }
}

function validateInputField(inputValue, inputId, feedbackId, validationGroupId, btnId, feedbackMessage, serviceName, localStorageFlagName) {
    const element = document.getElementById(inputId);
    const feedbackElement = document.getElementById(feedbackId);
    const validationGroupElement = document.getElementById(validationGroupId);
    const btnElement = document.getElementById(btnId);
    if (!inputValue) {
        feedbackElement.textContent = feedbackMessage;
        toggleClass(element, false);
        toggleClass(validationGroupElement, false);
        toggleButtonColorClass(serviceName, btnElement, false);
        localStorage.setItem(localStorageFlagName, false);
        element.focus();
        return false; // Returns false to indicate the validation failed
    } else {
        toggleClass(element, true);
        return true; // Returns true to indicate the validation succeeded
    }
}

function handleValidation(platformName, storageKey, groupElementId, btnElementId) {
    const validationFlag = localStorage.getItem(storageKey);
    if (validationFlag != null) {
        const isValid = validationFlag === "true";
        const element = document.getElementById(groupElementId);
        toggleClass(element, isValid);
        const btnElement = document.getElementById(btnElementId);
        toggleButtonColorClass(platformName, btnElement, isValid);
        if (!isValid) {
            return false;
        }
    }
    return true;
}

var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false
})

const showModal = (title, body, link1=null, link2=null) =>{
    const titleElement = document.getElementById('exampleModalLabel')
    titleElement.textContent = title;
    
    const bodyElement = document.getElementById('modal-body')
    bodyElement.textContent = body;

    if(link1 != null){
        const br = document.createElement('br'); // <br> 태그 생성
        bodyElement.appendChild(br);
        const linkElement = document.createElement('a');
        linkElement.href = link1;
        linkElement.textContent = 'PR 링크';
        linkElement.onclick = (e) => {
            e.preventDefault();
            window.electron.ipcRenderer.send('open-link', link1);
        };
        bodyElement.appendChild(linkElement);
    }
    
    if(link2 != null){
        const br = document.createElement('br'); // <br> 태그 생성
        bodyElement.appendChild(br);
        const linkElement = document.createElement('a');
        linkElement.href = link2;
        linkElement.textContent = '티스토리 링크';
        linkElement.onclick = (e) => {
            e.preventDefault();
            window.electron.ipcRenderer.send('open-link', link2);
        };
        bodyElement.appendChild(linkElement);
    }
    myModal.show()
}

const hideModal = () => {
    myModal.hide()
}