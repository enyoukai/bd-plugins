/**
 * @name OwOfy
 * @description Convert text to make it OwO
 * @author Enyoukai
 * @authorLink https://github.com/enyoukai/
 * @version 0.0.1
 * 
 */

class OwOfy {
    start() {
        this.sendMessagePatch = BdApi.monkeyPatch(BdApi.findModuleByProps("sendMessage"), 'sendMessage', {before: this.sendMessage.bind(this) });
    }

    sendMessage(data) {
        var content = data.methodArguments[1].content;
        data.methodArguments[1].content = this.owoConvert(content);

    }

    owoConvert(content) {       
        content = content.replace(/r|l/gi, 'w');

        content += ' owo';
        

        return content;
    }

    stop() {
        this.sendMessagePatch();
    };
}
