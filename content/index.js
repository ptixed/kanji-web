function init () {
    if (!localStorage.wkkey)
        localStorage.wkkey = prompt('Enter your wanikani.com api key: ');
    var client = axios.create({
        headers: { 
            'Authorization': 'Bearer ' + localStorage.wkkey,
            'Wanikani-Revision': '20170710'
        }
    });
    
    if (!localStorage.data) {         
        var data = {
            timestamp: Date.now(),
            words: {},
            kanjis: {}
        };
        
        function getpage (url) {
            if (!url) {
                localStorage.data = JSON.stringify(data);
                return init();
            }                
            client.get(url).then(response => {            
                for (var item of response.data.data.filter(x => !x.data.hidden_at))
                    switch (item.object) { 
                        case 'kanji':
                            data.kanjis[item.id] = {
                                value: item.data.characters,
                                onyomi: item.data.readings.filter(x => x.type == 'onyomi').map(x => x.reading),
                                kunyomi: item.data.readings.filter(x => x.type == 'kunyomi').map(x => x.reading)
                            };
                            break;
                        case 'vocabulary':
                            data.words[item.id] = {
                                id: item.id,
                                fav: false,
                                value: item.data.characters,
                                meanings: item.data.meanings.map(x => x.meaning),
                                readings: item.data.readings.map(x => ({ 
                                    reading: x.reading,
                                    audio: item.data.pronunciation_audios
                                        .filter(y => y.metadata.pronunciation == x.reading)
                                        .map(x => x.url)[0]
                                })),
                                kanjis: item.data.component_subject_ids,
                                level: item.data.level
                            };
                            break;
                    }
                getpage(response.data.pages.next_url);
            });
        }        
        return getpage('https://api.wanikani.com/v2/subjects');
    }

    var data = JSON.parse(localStorage.data);
    var words = [];
    for (var id in data.words) {
        data.words[id].kanjis = data.words[id].kanjis.map(x => data.kanjis[x]);
        words.push(data.words[id]);
    }
            
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
                    'Click on the flower to add/remove it from favorites',
                    'Leave the searchbox empty to show favourites',
                    'Click on wanikani logo to view item on wanikani.com',
                    'Click on the reading to play it'
                ],
                value: 'Start >'
            }
        },    
        mounted () {
            JSON.parse(localStorage.flags || '[]').forEach(x => words.filter(y => y.id == x)[0].fav = true);
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
                if (!word)
                    return;
                if (word.readings)
                    return this.play(word.readings[0].audio);
                if (word.startsWith('http')) 
                    return new Audio(word).play();                    
                var ut = new SpeechSynthesisUtterance(word)
                ut.lang = "ja-JP";
                window.speechSynthesis.speak(ut);
            },
            filter (value) {
                var f = i => i.fav;
                
                if (/^\d+$/.test(value))
                    f = i => i.level == value;
                else if (/^[\u3040-\u30ff]+$/.test(value))
                    f = i => i.readings[0].reading.indexOf(value) >= 0;
                else if (/^[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]+$/.test(value))
                    var f = i => i.value.indexOf(value) >= 0;
                else if (value)
                    f = i => i.meanings.filter(x => x.toLowerCase().indexOf(value) >= 0).length > 0;
                
                var ret = words.filter(f).sort((x, y) => x.level - y.level);
                
                if (ret.length > 0 && !ret.includes(this.word) && !(this.word == this.help && !value))
                    this.word = ret[0];            
                if (ret.length > 500)
                    ret = [];
                    
                return ret;
            },
            init () {
                if (this.word == this.help)
                    this.left.search = 'すごい';
            },
            fav (word) {
                word.fav = !word.fav;
                if (word.fav) {
                    if (!this.left.search)
                        this.left.filtered = this.filter();
                    if (!this.right.search)
                        this.right.filtered = this.filter();
                }
                localStorage.flags = JSON.stringify(words.filter(x => x.fav).map(x => x.id));
            },
            keydown () {
                switch (event.keyCode) {
                    case 13: this.play(this.word.readings[0]); break;
                    case 39: this.active = this.right; break;
                    case 37: this.active = this.left; break;
                    case 38:
                    var f = this.active.filtered;
                        this.word = this.word ? f[(f.indexOf(this.word) - 1 + f.length) % f.length] : f[f.length - 1]; 
                        break;
                    case 40:
                        var f = this.active.filtered;
                        this.word = this.word ? f[(f.indexOf(this.word) + 1) % f.length] : f[0];     
                        break;
                    default: return;
                }
                event.preventDefault();
            }
        }    
    });

}
init();