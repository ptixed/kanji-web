var data = {};
var vue = new Vue({
    el: '#app',
    data: {
        search1: null,
        filtered1: [], 
        search2: null,
        filtered2: [],
        word: null
    },    
    mounted () {
        document.addEventListener("keydown", this.keydown);
        
        var xhr = new XMLHttpRequest();
        xhr.onload  = function () {
            data = JSON.parse(this.response); 
            
            for (var id in data.kanjis) {
                data.kanjis[id].id       = id;
            }
            
            var words = [];
            for (var id in data.words) {
                data.words[id].id        = id;
                data.words[id].kanjis    = data.words[id].kanjis.map(x => data.kanjis[x]);
                words.push(data.words[id]);
            }
            data.words = words;
            
            vue.search1 = '4';
            vue.search2 = '';
        };
        xhr.open("GET", "db.json");
        xhr.send();
    },    
    watch: {
        search1 (value) { this.filtered1 = this.filter(value); },
        search2 (value) { this.filtered2 = this.filter(value); }
    },    
    methods: {        
        play (arg) {
            if (typeof arg == 'string') {
                var ut = new SpeechSynthesisUtterance(arg)
                ut.lang = "ja-JP";
                window.speechSynthesis.speak(ut);
            }
            else if (this.word)
                new Audio(this.word.audio).play();
        },
        filter (value) { 
            var ret = [];
            for (var i of data.words)
                if (!value) {
                    if (i.flag)
                        ret.push(i);
                }
                else if (i.level == value || i.readings[0].indexOf(value) >= 0 || i.value.indexOf(value) >= 0)
                    ret.push(i);
                    
            console.log(value);
            ret = ret.sort((x, y) => x.level - y.level);            
            if (ret.length > 0)
                this.word = ret[0];
                
            return ret;
        },
        save () {
            var word = this.word;
            this.filtered1 = this.filter(this.search1);
            this.filtered2 = this.filter(this.search2);
            this.word = word;
        },
        keydown () {
            var filtered = this.filtered2.indexOf(this.word) >= 0 ? this.filtered2 : this.filtered1;
            switch (event.keyCode)
            {
                case 13:
                    this.play();
                    break;
                case 38:
                    this.word = this.word ? filtered[(filtered.indexOf(this.word) - 1 + filtered.length) % filtered.length] : filtered[filtered.length - 1]; 
                    break;
                case 40:
                    this.word = this.word ? filtered[(filtered.indexOf(this.word) + 1) % filtered.length] : filtered[0];     
                    break;
                default:
                    return;
            }
            event.preventDefault();
        }
    }    
});
