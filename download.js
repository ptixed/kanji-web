let fs = require("fs");
let request = require("request-promise");
let json = require("json-cyclic");

var token = process.env.WANIKANITOKEN;
if (!token) {
    console.error('Set WANIKANITOKEN environmental variable to run this script');
    process.exit(1);
}

console.error('Starting download with token ' + token.substr(0,1) + '***' + token.substr(-1));
getpage(process.env.WANIKANIURL || "https://api.wanikani.com/v2/subjects");

var data = {
    timestamp: Date.now(),
    words: {},
    kanjis: {},
    radicals: {}
};

function getpage(url) {
    if (!url) {
        for (var id in data.kanjis) {
            data.kanjis[id].radicals = data.kanjis[id].radicals.map(x => data.radicals[x]);
        }
        fs.writeFile('db.json', JSON.stringify(json.encycle(data)));
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
        console.log(response);
        response = JSON.parse(response);
        
        for (var item of response.data) {
            switch (item.object) {
                case 'radical':
                    data.radicals[item.id] = {
                        name: item.data.slug,
                        value: item.data.characters
                    };
                    break;
                case 'kanji':
                    data.kanjis[item.id] = {
                        value: item.data.characters,
                        meanings: item.data.meanings
                            .sort((x, y) => {
                                if (x.primary) return 1;
                                if (y.primary) return -1;
                                return 0;
                            })
                            .map(x => x.meaing),
                        onyomi: item.data.readings
                            .filter(x => x.type == 'onyomi')
                            .map(x => ({
                                primary: x.primary,
                                reading: x.reading
                            })),
                        kunyomi: item.data.readings
                            .filter(x => x.type == 'kunyomi')
                            .map(x => ({
                                primary: x.primary,
                                reading: x.reading
                            })),
                        radicals: item.data.component_subject_ids,
                        // vocabs = item.data.amalgamation_subject_ids
                    };
                    break;
                case 'vocabulary':
                    console.log(JSON.stringify(item));
                    return;
            }
        }
        
        getpage(response.pages.next_url);
    });
    
}
