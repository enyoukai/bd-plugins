/**
 * @name YoutubeDL
 * @description Easily download and upload videos in discord by typing y-dl {url}
 * @author Enyoukai
 * @authorLink https://github.com/enyoukai/
 * @version 0.0.1
 * 
 */
const fs = require('fs');
const childProcess = require('child_process');

class YoutubeDL {

    load() { 
        // https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js

        this.tmp_dir = __dirname + '\\ydl_tmp';
        this.file_pattern = /(?<=ffmpeg] Merging formats into ").+(?=")/;
        this.cache_pattern = /(?<=\[download\] ).+(?= has already been downloaded and merged)/ // TODO: get last occurrence of lookbehind

        if (!fs.existsSync(this.tmp_dir))
        {
            fs.mkdirSync(this.tmp_dir);
        }


    }

    unload() { }
    
    start() {
        this.upload = BdApi.findModuleByProps("instantBatchUpload").upload;
        this.sendMessagePatch = BdApi.monkeyPatch(BdApi.findModuleByProps("sendMessage"), 'sendMessage', {before: this.sendMessage.bind(this) });
    }

    sendMessage(data) {
        const channelId = data.methodArguments[0];
        const content = data.methodArguments[1].content;
        const args = content.split(' ');
        
        if (args.length !== 2)
            return
        if (args[0] !== 'y-dl')
            return

        var url = args[1];
        
        childProcess.exec('youtube-dl -o ' + this.tmp_dir + '\\%(title)s-%(id)s.%(ext)s ' + url, (err, stdout, stderr) => {          
            let output = stdout;
            console.log(output); // uhhh debug stuff

            let matches = output.match(this.file_pattern);
            
            if (matches === null) matches = output.match(this.cache_pattern);

            let file_path = matches[0];
            let file_split = file_path.split('\\');
            let filename = file_split[file_split.length - 1];
                        
            
            fs.readFile(file_path, (err, buffer) => {
                if (err) return console.error(err);
                this.upload(channelId, new Blob([buffer]), 0, "", false, filename);

            })


            
        });
        

    }

    stop() {
        this.sendMessagePatch();
    };
}