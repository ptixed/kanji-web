let fs = require("fs");
let request = require("request-promise");

var token = process.env.WANIKANITOKEN;
if (!token) {
    console.error('Set WANIKANITOKEN environmental variable to run this script');
    process.exit(1);
}

console.error('Starting download with token ' + token.substr(0,1) + '***' + token.substr(-1));

var data = {
    timestamp: Date.now(),
    words: {},
    kanjis: {}
};

getpage(process.env.WANIKANIURL || "https://api.wanikani.com/v2/subjects");

function getpage(url) {
    if (!url) {
        fs.writeFileSync('content/db.json', JSON.stringify(data, null, 4));
        console.error('Download complete, data written to db.json');
        return;
    }
    
    console.error(url);
    
    request.get({
        url: url,
        headers: { 
            "Wanikani-Revision": "20170710",
            "Authorization": "Bearer " + token
        }
    })
    .then(response => {
        response = JSON.parse(response);        
        for (var item of response.data) {
            switch (item.object) {
                case 'radical':
                    break;
                case 'kanji':
                    data.kanjis[item.id] = {
                        value: item.data.characters,
                        onyomi: item.data.readings
                            .filter(x => x.type == 'onyomi')
                            .map(x => x.reading),
                        kunyomi: item.data.readings
                            .filter(x => x.type == 'kunyomi')
                            .map(x => x.reading),
                        words: item.data.amalgamation_subject_ids
                    };
                    break;
                case 'vocabulary':
                    data.words[item.id] = {
                        value: item.data.characters,
                        meanings: item.data.meanings
                            .sort((x, y) => {
                                if (x.primary) return 1;
                                if (y.primary) return -1;
                                return 0;
                            })
                            .map(x => x.meaning),
                        readings: item.data.readings
                            .sort((x, y) => {
                                if (x.primary) return 1;
                                if (y.primary) return -1;
                                return 0;
                            })
                            .map(x => x.reading),
                        kanjis: item.data.component_subject_ids,
                        audio: item.data.pronunciation_audios.map(x => x.url)[0],
                        level: item.data.level
                    };
                    break;
            }
        }
        
        getpage(response.pages.next_url);
    });
}
