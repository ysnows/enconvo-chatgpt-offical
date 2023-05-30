function main(text, contextText, completion, streamHandler) {

    (async () => {

        try {
            try {
                var completeContent = ""
                const resp = await $http.stream(
                    $option.customRequest,
                    {
                        method: "POST",
                        header: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + $option.apiKey,
                        },
                        body: {
                            "model": $option.model,
                            "temperature": parseInt($option.temperature) || 1,
                            "stream": true,
                            "messages": contextText.value,
                        }
                    },
                    handler = (resp) => {
                        if (!resp.startsWith("data:")) {
                            return
                        }
                        resp = resp.replace("data:", "")
                        try {
                            let item = JSON.parse(resp)
                            let delta = item.choices[0].delta

                            if (delta.content !== undefined) {
                                streamHandler({
                                    result: {
                                        "type": "text",
                                        "value": delta.content
                                    },
                                });
                                completeContent += delta.content
                                console.log("resp: " + delta.content)
                            } else if (delta.role !== undefined) {
                                streamHandler({
                                    result: {
                                        "type": "start",
                                        "value": "",
                                    },
                                });
                                console.log("resp: " + "start")
                            }
                        } catch (e) {

                        }
                    }
                );


                completion({
                    result: {
                        "type": resp === "done" ? "text" : "error",
                        "value": resp === "done" ? completeContent : resp,
                    },
                });

            } catch (e) {
                throw e;
            }

        } catch (e) {
            throw e;
        }
    })().catch((err) => {
        completion({
            result: {
                type: "error",
                value: JSON.parse(err).error.message || '未知错误',
            },
        });
    });
}


