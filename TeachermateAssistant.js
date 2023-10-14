let courseware = 0;
let homework = 0;
let answer = 0;
let learn = 0;

// URL解析
function queryURLparamsRegEs5(url = window.location.href) {
    // 转自https://blog.csdn.net/qq_38845858/article/details/104116684
    let obj = {}
    let reg = /([^?=&]+)=([^?=&]+)/g
    url.replace(reg, function () {
        obj[arguments[1]] = arguments[2]
    })
    return obj
}

// 获取openid
const openid = queryURLparamsRegEs5()["openid"];

// 包装fetch函数及固定参数
function query(url) {
    return fetch(url, {
        method: 'get',
        headers: { "Openid": openid }
    }).then(function (response) { return response.json() })
}

// 课件查询
query("https://v18.teachermate.cn/wechat-api/v1/courses/openCoursewares").then(
    function (data) {
        data.forEach(dict => {
            courseware += dict["unreadCount"];
        });
    })
// 答题查询
query("https://v18.teachermate.cn/wechat-api/v3/students/courses").then(
    function (data) {
        data.forEach(dict => {
            answer += dict["openNum"];
        });
    })
// 作业查询
query("https://v18.teachermate.cn/wechat-api/v1/homework/courses").then(
    function (data) {
        data["courses"].forEach(dict => {
            homework += dict["homeworkCount"];
        });
    })
// 天天学习查询
query("https://v18.teachermate.cn/wechat-api/v3/students/selfStudy/courses/list").then(
    function (data) {
        data.forEach(dict => {
            learn += dict["num"];
        })
    }
)

// 实现刷课件功能
function readCount() {
    let courseid = queryURLparamsRegEs5()["courseid"];
    if (courseid == undefined) {
        window.alert("请打开待刷课件列表！");
        return false;
    }
    let begining = document.querySelector(".begin");
    // begining.removeEventListener("click", readCount);
    query(`https://v18.teachermate.cn/wechat-api/v1/coursewares/${courseid}/student`).then(
        function (data) {
            data["coursewares"].forEach(dict => {
                if (dict["readStatus"] === false) {
                    console.log("正在阅读：" + dict["name"])
                    query(dict["previewUrl"]).then(
                        previewUrl => {
                            setInterval(() => {
                                fetch("https://v18.teachermate.cn/wechat-api/v1/coursewares/access/" + previewUrl["accessId"], {
                                    method: 'put',
                                    headers: {
                                        "Openid": openid, 'Content-Type': 'application/json'
                                    },
                                    body: '{"process":1}'
                                })
                            }, 30 * 1000);
                        }
                    )
                }
            })
        }
    )
    begining.textContent = "课件阅读中……";
    setTimeout(() => {
        begining.textContent = "开始刷课件";        
    }, 3000);
}




function AddHtml() {
    var assistant = document.createElement('div');
    assistant.className = "assistant";
    assistant.innerHTML = `<ul><li>未读课件：${courseware}</li><li>开启的天天学习：${learn}</li><li>开启的答题：${answer}</li><li>未完成作业：${homework}</li><li class="begin">开始刷课件</li></ul><style>.assistant{z-index: 10;background:#33CCFF;position: fixed;bottom: 20px;right: 265px;padding: 10px;line-height: 45px;text-align: center;border-radius: 15px;} li{list-style:none;user-select: none;}</style>`;

    document.querySelector("body").append(assistant);
    document.querySelector(".begin").addEventListener("click", readCount);
}
setTimeout(AddHtml, 1000)