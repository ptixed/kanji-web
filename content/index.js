var data = {};
var vue = new Vue({
    el: '#app',
    data: {
        left: {
            search: null,
            filtered: []
        },
        right: {
            search: null,
            filtered: []
        },
        active: null,
        word: null,
        flags: {}
    },    
    mounted () {
        this.$cookies.config('10000d');
        this.flags = this.$cookies.get('flags') || {};
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
            
            vue.left.search = '4';
            vue.right.search = '';
            vue.active = vue.left;
        };
        xhr.open("GET", "db.json");
        xhr.send();
    },    
    watch: {
        'left.search' (value) { this.left.filtered = this.filter(value); },
        'right.search' (value) { this.right.filtered = this.filter(value); }
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
                    if (this.flags[i.id])
                        ret.push(i);
                }
                else {
                    if (i.level == value || i.readings[0].indexOf(value) >= 0 || i.value.indexOf(value) >= 0)
                        ret.push(i);
                }
                    
            ret = ret.sort((x, y) => x.level - y.level);            
            if (ret.length > 0)
                this.word = ret[0];
                
            return ret;
        },
        save () {
            var word = this.word;
            this.left.filtered = this.filter(this.left.search);
            this.right.filtered = this.filter(this.right.search);
            this.word = word;
            this.$cookies.set('flags', this.flags);
        },
        keydown () {
            var f = this.active.filtered;
            switch (event.keyCode)
            {
                case 13:
                    this.play();
                    break;
                case 38:
                    this.word = this.word ? f[(f.indexOf(this.word) - 1 + f.length) % f.length] : f[f.length - 1]; 
                    break;
                case 40:
                    this.word = this.word ? f[(f.indexOf(this.word) + 1) % f.length] : f[0];     
                    break;
                default:
                    return;
            }
            event.preventDefault();
        }
    }    
});
