
for (var id in data.kanjis) {
    data.kanjis[id].id = id;
}

var words = [];
for (var id in data.words) {
    data.words[id].id     = id;
    data.words[id].kanjis = data.words[id].kanjis.map(x => data.kanjis[x]);
    data.words[id].fav    = false;
    words.push(data.words[id]);
}
data.words = words;
        
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
        help: {
            meanings: [ 
                '>> Wanikani vocab browser <<', 
                'Use inputs to search by level/kanji/pronounciation/meaning',
                'Click on the kanji to add/remove it from favorites',
                'Leave the searchbox empty to show favourites',
                'Click on wanikani logo to view item on wanikani.com',
                'Click on the reading to play it'
            ],
            value: 'Start >',
            readings: [ '...' ]
        }
    },    
    mounted () {
        JSON.parse(localStorage.flags || '[]').forEach(x => words[x].fav = true);
        document.addEventListener("keydown", this.keydown);
        this.active = this.left;
        this.left.search = '';
        this.right.search = '';
        this.word = this.help;
    },    
    watch: {
        'left.search' (value)  { this.left.filtered = this.filter(value); },
        'right.search' (value) { this.right.filtered = this.filter(value); }
    },    
    methods: {        
        play (word) {
            if (typeof word == 'string') {
                var ut = new SpeechSynthesisUtterance(word)
                ut.lang = "ja-JP";
                window.speechSynthesis.speak(ut);
            }
            else if (word) {
                if (word.audio)
                    new Audio(word.audio).play();
                else
                    this.play(word.readings[0]);
            }
        },
        filter (value) {
            var f = i => i.fav;
            
            if (/^\d+$/.test(value))
                f = i => i.level == value;
            else if (/^[\u3040-\u30ff]+$/.test(value))
                f = i => i.readings[0].indexOf(value) >= 0;
            else if (/^[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]+$/.test(value))
                var f = i => i.value.indexOf(value) >= 0;
            else if (value)
                f = i => i.meanings.filter(x => x.toLowerCase().indexOf(value) >= 0).length > 0;
            
            var ret = data.words.filter(f).sort((x, y) => x.level - y.level);
            
            if (ret.length > 0 && !ret.includes(this.word) && !(this.word == this.help && !value))
                this.word = ret[0];            
            if (ret.length > 500)
                ret = [];
                
            return ret;
        },
        fav (word) {
            if (word == this.help) {
                this.word = null;
                this.left.search = '今日は';
                return;
            }
            word.fav = !word.fav;
            if (word.fav) {
                if (!this.left.search)
                    this.left.filtered = this.filter();
                if (!this.right.search)
                    this.right.filtered = this.filter();
            }
            localStorage.flags = JSON.stringify(data.words.map((v, i) => [v, i]).filter(x => x[0].fav).map(x => x[1]));
        },
        keydown () {
            var f = this.active.filtered;
            switch (event.keyCode) {
                case 13:
                    this.play(this.word);
                    break;
                case 38:
                    this.word = this.word ? f[(f.indexOf(this.word) - 1 + f.length) % f.length] : f[f.length - 1]; 
                    break;
                case 40:
                    this.word = this.word ? f[(f.indexOf(this.word) + 1) % f.length] : f[0];     
                    break;
                case 39:
                    this.active = this.right;
                    break;
                case 37:
                    this.active = this.left;
                    break;
                default:
                    return;
            }
            event.preventDefault();
        }
    }    
});
