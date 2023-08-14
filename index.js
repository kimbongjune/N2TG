const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

//노션 API URL을 생성하는 함수
function getNotionApiEndpoint(databaseId) {
    return `https://api.notion.com/v1/databases/${databaseId}/query`;
}

// 정적 파일 제공 (예: HTML, CSS, JS 파일들)
app.use(express.static(path.join(__dirname, '.')));

// /test 경로에서 HTML 파일 제공
app.get('/notiontest', (req, res) => {
    res.sendFile(path.join(__dirname, 'notionindex.html'));
});

// /test 경로에서 HTML 파일 제공
app.get('/gittest', (req, res) => {
    res.sendFile(path.join(__dirname, 'gitindex.html'));
});

// /notion/data 경로에서 Notion 데이터 요청 후 응답
app.get('/notion/data', async (req, res) => {
    const { notionApiKey, databaseId } = req.query;
    try {
        const data = await fetchDataFromNotion(notionApiKey, databaseId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//노션 API 요청 함수
const fetchDataFromNotion = async (notionApiKey, databaseId) => {
    try {
        const response = await axios.post(getNotionApiEndpoint(databaseId), {
            filter: {
                property: "상태",
                select: {
                    equals: "발행 요청"
                }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        throw new Error("Error fetching data from Notion");
    }
};

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});