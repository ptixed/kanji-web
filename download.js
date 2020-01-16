let _ = require("lodash");
let request = require("request-promise");
let json = require("json-cyclic");

var token = process.env.WANIKANITOKEN;
if (!token) {
    console.error('Set WANIKANITOKEN environmental variable to run this script');
    process.exit(1);
}

// load file or create new 
var data = {
    timestamp: Date.now(),
    kanjis: [],
    radicals: [],
    words: []
};

function getpage(url) {

    if (!url)
        return;
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
        
        for (var item of response.data) {
            switch (item.object) {
                case 'radical':
                    break;
                case 'kanji':
                    break;
                case 'vocabulary':
                    break;
            }
        }
        
        //getpage(response.pages.next_url);
    });
    
}

console.error('Starting download with token ' + token.substr(0,1) + '***' + token.substr(-1));
getpage(process.env.WANIKANIURL || "https://api.wanikani.com/v2/subjects");
