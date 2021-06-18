/**
 * @name YoutubeDL
 * @description Easily download and upload videos in discord using youtube-dl
 * @author Enyoukai
 * @authorLink https://github.com/enyoukai/
 * @version 0.0.1
 * @source https://raw.githubusercontent.com/enyoukai/bd-plugins/main/YoutubeDL.plugin.js
 * 
 */
const fs = require('fs');
const childProcess = require('child_process');

class YoutubeDL {

    load() { 
        this.file_pattern = /(?<=ffmpeg] Merging formats into ").+(?=")/;
        this.cache_pattern = /(?<=\[download\] ).+(?= has already been downloaded and merged)/ // TODO: get last occurrence of lookbehind
    }

    unload() { }
    
    start() {
        // https://stackoverflow.com/questions/21194934/how-to-create-a-directory-if-it-doesnt-exist-using-node-js
        this.tmp_dir = __dirname + '\\ydl_tmp';
        if (!fs.existsSync(this.tmp_dir))
        {
            fs.mkdirSync(this.tmp_dir);
        }
        
        childProcess.exec('youtube-dl -h', (err, stdout, stderr) => {
            if (err) BdApi.alert("youtube-dl not found in path", "This plugin cannot be used if youtube-dl is not installed or not in your path");
        });

        // Qwerasd's word notifications
        this.prefix = BdApi.loadData("YoutubeDL", "prefix") ? BdApi.loadData("YoutubeDL", "prefix") : "/ydl";
        this.upload = BdApi.findModuleByProps("instantBatchUpload").upload;
        this.sendMessagePatch = BdApi.monkeyPatch(BdApi.findModuleByProps("sendMessage"), 'sendMessage', {instead: this.sendMessage.bind(this)});
    }

    sendMessage(data) {
        const channelId = data.methodArguments[0];
        const content = data.methodArguments[1].content;
        const args = content.split(' ');
        
        if (args.length !== 2 || args[0] !== this.prefix) return data.callOriginalMethod();

        var url = args[1];
        
        childProcess.exec('youtube-dl --restrict-filenames -o ' + this.tmp_dir + '\\%(title)s-%(id)s.%(ext)s ' + url, (err, stdout, stderr) => {
            if (err) return BdApi.showToast(err, {type:"error"});
   
            let output = stdout;
            let matches = output.match(this.file_pattern);
            
            if (matches === null) matches = output.match(this.cache_pattern);

            let file_path = matches[0];
            let file_split = file_path.split('\\');
            let filename = file_split[file_split.length - 1];
            
            // https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
            filename.replace(/[^\x00-\x7F]/g, "");

            fs.readFile(file_path, (err, buffer) => {
                if (err) return BdApi.showToast(err, {type:"error"});
                this.upload(channelId, new Blob([buffer]), 0, "", false, filename);
                
                BdApi.showToast("Sending Video", {type:"info"});
            }) 
        });
    }

    stop() {
        this.sendMessagePatch();
    };

getSettingsPanel() {
        // Qwerasd's word notifications
        const div = document.createElement('div');
        const prefixT = document.createElement('h6');
        const prefix = document.createElement('textarea');

        prefixT.textContent = "Prefix"
        prefix.placeholder = "/ydl";
        prefix.value = this.prefix;
        prefix.style.width = "100%";
        prefix.addEventListener("change", e => {
            this.prefix = prefix.value;
            BdApi.saveData("YoutubeDL", "prefix", this.prefix);
        });

        div.appendChild(prefixT);
        div.appendChild(prefix);
        
        return div;
    }
}
