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
    assistant.innerHTML = `<ul><li>未读课件：${courseware}</li><li>开启的天天学习：${learn}</li><li>开启的答题：${answer}</li><li>未完成作业：${homework}</li><li class="begin">开始刷课件</li><li class="answer">自动提交答题</li></ul><style>.assistant{z-index: 100;background:#33CCFF;position: fixed;bottom: 20px;right: 265px;padding: 10px;line-height: 45px;text-align: center;border-radius: 15px;} li{list-style:none;user-select: none;}</style>`;

    document.querySelector("body").append(assistant);
    document.querySelector(".begin").addEventListener("click", readCount);
    document.querySelector(".answer").addEventListener("click", () => {
        if (document.querySelectorAll("._3SfXe4Pk9VIXxFGZ-UN2Pu").length < 1) {
            window.alert("请打开答题页面！");
            return false;
        }
        else if (document.querySelectorAll(".KmUWDwEDkQ4GPJe4bBfdj").length > 0) {
            // 答题界面
            Post_answer(prompt("请输入答案："));
        }
        else {
            // 获取答案，如果还未公布答案可能会报错
            Get_answer();
        }
    });
}
setTimeout(AddHtml, 1000)


function Get_answer() {
    // paperId暂时没有办法获取，只在Get中体现，HTML中无法找到，因此只能手动输入
    let id = prompt("请输入组卷ID：");
    let answer = {};
    // 获取答案
    for (let page = 0; page <= 3; page++) {
        fetch(`https://v18.teachermate.cn/wechat-api/v3/students/papers/${id}/questions?page=${page}`, {
            headers: { "Openid": openid }
        }).then(
            (response) => {
                response.json().then(
                    (answer_json) => {
                        answer_json.forEach((each_answer) => {
                            let answer_id = each_answer["id"];
                            let id_answer_dict = { "questionId": answer_id };
                            let id_answer = [];
                            each_answer["answer"].forEach((rank_answer) => {
                                id_answer.push({ "index": rank_answer["rank"] });
                            })
                            id_answer_dict["answer"] = id_answer;
                            answer[answer_id] = id_answer_dict;
                        })
                    }
                )
            }
        )
    }
    document.querySelector(".answer").textContent = "答案已复制！";
    setTimeout(() => {
        // courseId为课堂ID；paperId为试卷ID
        let post_answer = JSON.stringify({ "courseId": "1280892", "paperId": `${id}`, "answer": answer });
        console.log(post_answer);
        // Post_answer(post_answer)
        navigator.clipboard.writeText(post_answer)
    }, 800);
}


function Post_answer(post_answer) {
    // 提交答案
    fetch("https://v18.teachermate.cn/wechat-api/v3/students/answer/paper", {
        method: "POST",
        headers: {
            "Openid": openid,
            "Content-Type": "application/json"
        },
        body: post_answer
    }).then(response => {
        response.statusText
    })
}