var vue;
var xhr = new XMLHttpRequest();
xhr.onload  = function () {
    var data = JSON.parse(this.response);
    
    // make this an array
    
    for (var id in data.kanjis) {
        data.kanjis[id].id       = id;
        data.kanjis[id].radicals = data.kanjis[id].radicals.map(x => data.radicals[x]);
        data.kanjis[id].words    = data.kanjis[id].words   .map(x => data.words   [x]);
    }
    for (var id in data.words) {
        data.words[id].id        = id;
        data.words[id].kanjis    = data.words[id].kanjis   .map(x => data.kanjis  [x]);
    }
    
    vue = new Vue({
        el: '#app',
        data: {
            data: data,
            word: null,
            filter: '2',
            prev: '2'
        },
        methods: {        
            play (arg) {
                if (typeof arg == 'string') {
                    var ut = new SpeechSynthesisUtterance(arg)
                    ut.lang = "ja-JP";
                    window.speechSynthesis.speak(ut);
                }
                else if (this.word) {
                    var audio = new Audio(this.word.audios[0]);
                    audio.play();
                }
            },
            select (item) {
                this.word = item;
                this.play();
            },
            keydown () {
                switch (event.keyCode)
                {
                    case 13:
                        this.play();
                        return;
                    case 38:
                    case 40:
                        event.preventDefault();
                        
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
                        return;
                }
            }
        },
        computed: {
            filtered () {                    
                var ret = {};                
                
                if (!isNaN(parseInt(this.filter))) {
                    for (var i in this.data.words)
                        if (this.data.words[i].level == this.filter)
                            ret[i] = this.data.words[i];
                }
                else if (this.filter[0] >= 0x3040 && this.filter[0] < 0x309f) {
                    for (var i in this.data.words)
                        if (this.data.words[i].readings[0].indexOf(this.filter) >= 0)
                            ret[i] = this.data.words[i];
                }
                else {
                    for (var i in this.data.words)
                        if (this.data.words[i].value.indexOf(this.filter) >= 0)
                            ret[i] = this.data.words[i];
                }
                    
                if (this.filter != this.prev)
                    this.word = ret[Object.keys(ret)[0]];
                
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
