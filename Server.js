const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errHandle = require('./errorHandle');
const todos = [];

const requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    let body = "";
    req.on('data', chunk => {
        body += chunk;
    })

    if (req.url == "/todos" && req.method == "GET") { // 取得代辦事項
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    } else if (req.url == "/todos" && req.method == "POST") { // 新增代辦
        req.on('end', () => {
            try {
                const title = JSON.parse(body).title;
                if (title !== undefined) {
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    };
                    todos.push(todo);
                    res.writeHead(200, headers),
                        res.write(JSON.stringify({
                            "status": "success",
                            "data": todos,
                        }));
                    res.end();
                } else {
                    errHandle(res)
                }

            } catch (error) {
                errHandle(res)
            }
        })
    } else if (req.url == "/todos" && req.method == "DELETE") { // 刪除代辦
        todos.length = 0;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    } else if (req.url.startsWith("/todos/") && req.method == "DELETE") { // 刪除單筆代辦
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element => element.id == id);
        if (index !== -1) {
            todos.splice(index, 1);
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
            res.end();
        } else {
            errHandle(res);
        }
    } else if(req.url.startsWith("/todos/") && req.method == "PATCH"){ // 編輯單筆代辦
        req.on('end', () => {
            try{
                const todo = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element => element.id == id);
                if(todo !== undefined && index !== -1){
                    todos[index].title = todo;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }else{
                    errHandle(res);
                }
            }catch{
                errHandle(res);
            }
        })
    }else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "falsse",
            "message": "無此網站路由!",
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);