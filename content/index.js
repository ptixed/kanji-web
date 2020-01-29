var data = {};
var vue = new Vue({
    el: '#app',
    data: {
        filtered: [], 
        filter: null,
        word: null
    },
    
    mounted () {
        document.addEventListener("keydown", this.keydown);
        
        var xhr = new XMLHttpRequest();
        xhr.onload  = function () {
            data = JSON.parse(this.response); 
            
            for (var id in data.kanjis) {
                data.kanjis[id].id       = id;
                data.kanjis[id].words    = data.kanjis[id].words   .map(x => data.words   [x]);
            }
            
            var words = [];
            for (var id in data.words) {
                data.words[id].id        = id;
                data.words[id].kanjis    = data.words[id].kanjis   .map(x => data.kanjis  [x]);
                words.push(data.words[id]);
            }
            data.words = words;
            
            vue.filter = '1';
        };            
        xhr.open("GET", "load");
        xhr.send();
    },
    
    watch: {
        filter (filter) {
            var ret = [];
            for (var i of data.words)
                if (i.level == filter || i.readings[0].indexOf(filter) >= 0 || i.value.indexOf(filter) >= 0)
                    ret.push(i);
            this.filtered = ret.sort((x, y) => {
                if (x.level > y.level) return 1;
                if (x.level < y.level) return -1;
                if (x.value > y.value) return 1;
                if (x.value < y.value) return -1;
                return 0;
            });
            if (this.filtered.length > 0)
                this.word = ret[0];
        }
    },
    
    methods: {        
        play (arg) {
            if (typeof arg == 'string') {
                var ut = new SpeechSynthesisUtterance(arg)
                ut.lang = "ja-JP";
                window.speechSynthesis.speak(ut);
            }
            else if (this.word)
                new Audio(this.word.audios[0]).play();
        },
        keydown () {
            switch (event.keyCode)
            {
                case 13:
                    this.play();
                    break;
                case 38:
                    if (this.filtered.length > 0)
                        this.word = this.word 
                            ? this.filtered[(this.filtered.indexOf(this.word) - 1 + this.filtered.length) % this.filtered.length]
                            : this.filtered[this.filtered.length - 1]; 
                    break;
                case 40:
                    if (this.filtered.length > 0)
                        this.word = this.word 
                            ? this.filtered[(this.filtered.indexOf(this.word) + 1) % this.filtered.length]
                            : this.filtered[0];     
                    break;
                default:
                    return;
            }
            event.preventDefault();
        }
    }
    
});
