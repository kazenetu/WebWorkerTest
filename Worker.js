self.onmessage = function (e) {
    var data = JSON.parse(e.data);

    switch (data.cmd) {
        case "post":
            var xhr = new XMLHttpRequest();
            // 非同期モードで送信 
            xhr.open('post', data.baseUrl + '/json.aspx', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function () {
                if (this.readyState === 4) {
                    // 受信できたらメッセージを送信
                    var response = this.responseText;
                    self.postMessage(response);
                } else {
                    self.postMessage(JSON.stringify({ fail: '失敗' }));
                }
            };
            xhr.onerror = function () {
                self.postMessage(JSON.stringify({ fail: '失敗' }));
            };

            xhr.send(data.param);

            break;
    }
};
