let courseware = 0;
let homework = 0;
let answer = 0;

const openid = document.querySelector("._3NIpzn-wbILHGt3nB3h-Cf").href.split("=")[1];

function query(url) {
    return fetch(url, {
        method: 'get',
        headers: { "Openid": openid }
    }).then(function (response) { return response.json() })
}

// 课件
query("https://v18.teachermate.cn/wechat-api/v1/courses/openCoursewares").then(
    function (data) {
        data.forEach(dict => {
            courseware += dict["unreadCount"];
        });
    })
// 答题
query("https://v18.teachermate.cn/wechat-api/v3/students/courses").then(
    function (data) {
        data.forEach(dict => {
            answer += dict["openNum"];
        });
    })
// 作业
query("https://v18.teachermate.cn/wechat-api/v1/homework/courses").then(
    function (data) {
        data["courses"].forEach(dict => {
            homework += dict["homeworkCount"];
        });
    })










function AddHtml() {
    var assistant = document.createElement('div');
    assistant.className = "assistant";
    assistant.innerHTML = `<ul><li>未读课件：${courseware}</li><li>开启的答题：${answer}</li><li>未完成作业：${homework}</li><li class="begin">开始刷课件</li></ul><style>.assistant{background:#33CCFF;position: fixed;bottom: 20px;right: 125px;padding: 10px;line-height: 45px;text-align: center;border-radius: 15px;} li{list-style:none;user-select: none;}</style>`;

    document.querySelector("body").append(assistant);
    document.querySelector(".begin").addEventListener("click", () => { window.alert("不！这个功能还没开发好……") });
}
setTimeout(AddHtml, 1500)