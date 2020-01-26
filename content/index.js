var xhr = new XMLHttpRequest();
xhr.onload  = function () {
    var data = JSON.parse(this.response);
    
    for (var id in data.kanjis) {
        data.kanjis[id].id       = id;
        data.kanjis[id].radicals = data.kanjis[id].radicals.map(x => data.radicals[x]);
        data.kanjis[id].words    = data.kanjis[id].words   .map(x => data.words   [x]);
    }
    for (var id in data.words) {
        data.words[id].id        = id;
        data.words[id].kanjis    = data.words[id].kanjis   .map(x => data.kanjis  [x]);
    }
    
    new Vue({
        el: '#app',
        data: {
            data: data,
            word: null,
            filter: '',
            prev: ''
        },
        methods: {        
            play (arg) {
                if (typeof arg == 'string') {
                    var ut = new SpeechSynthesisUtterance(arg)
                    ut.lang = "ja-JP";
                    window.speechSynthesis.speak(ut);
                }
                else {
                    var audio = new Audio(this.word.audios[0]);
                    audio.play();
                }
            },
            select (item) {
                this.word = item;
                this.play();
            },
            keydown () {
                if (event.keyCode != 38 && event.keyCode != 40)
                    return false;
                event.preventDefault()
                
                var keys = Object.keys(this.filtered);                    
                if (keys.length == 0)
                    return;
                    
                if (event.keyCode == 38) {    
                    if (this.word)
                        this.word = this.filtered[keys[(keys.indexOf(this.word.id) - 1 + keys.length) % keys.length]];
                    else
                        this.word = this.filtered[keys[keys.length - 1]]; 
                }
                else {    
                    if (this.word)
                        this.word = this.filtered[keys[(keys.indexOf(this.word.id) + 1              ) % keys.length]];    
                    else
                        this.word = this.filtered[keys[0]];
                }                    
                
                this.play();
            }
        },
        computed: {
            filtered () {                    
                var ret = {};
                
                if (!this.filter)
                    ret = this.data.words;
                else 
                    for (var i in this.data.words)
                        if (this.data.words[i].readings[0].indexOf(this.filter) >= 0)
                            ret[i] = this.data.words[i];
                    
                if (this.filter != this.prev) {
                    this.word = ret[Object.keys(ret)[0]];                            
                    this.play();
                }
                
                this.prev = this.filter;
                return ret;
            }
        },  
        mounted () {
            document.addEventListener("keydown", this.keydown);
        }
    });
};
xhr.open("GET", "load");
xhr.send();
