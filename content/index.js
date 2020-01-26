var xhr = new XMLHttpRequest();
xhr.onload  = function () {
    var data = JSON.parse(this.response);
    
    for (var id in data.kanjis) {
        data.kanjis[id].radicals = data.kanjis[id].radicals.map(x => data.radicals[x]);
        data.kanjis[id].words    = data.kanjis[id].words   .map(x => data.words   [x]);
    }
    for (var id in data.words) {
        data.words[id].kanjis    = data.words[id].kanjis   .map(x => data.kanjis  [x]);
    }
    
    new Vue({
        el: '#app',
        data: {
            data: data,
            word: data.words[3402]
        },
        methods: {        
            play: function() {
                var ut = new SpeechSynthesisUtterance(this.word.readings[0])
                ut.lang = "ja-JP";
                window.speechSynthesis.speak(ut);
            },
            select: function(item) {
                this.word = item;
            }
        }
    });
};
xhr.open("GET", "load");
xhr.send();

// sizes in percentages