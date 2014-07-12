var ALCHEMY_API_KEY = "7a28e8d3c8c8e7baad81df241fcc3431cf086385";
var ALCHEMY_API_URL = "http://access.alchemyapi.com/calls/url/URLGetRankedKeywords?";
var TROVE_API_KEY = "eoudhjlngldfnmcm";
var TROVE_API_URL = "http://api.trove.nla.gov.au/result";
var NUMBEROFKEYWORDS = 3;



function getArticleKeywords(website, callback) {
    console.log("Getting Keywords");
    $.getJSON(ALCHEMY_API_URL, {
        apikey: ALCHEMY_API_KEY,
        url: website,
        outputMode: "json",
    }, function(data) {
        console.log("Successful!", data);
        var keywords = data.keywords.map(function(keywordObject) {
            return keywordObject.text;
        });
        
        if (keywords.length === 0) {
            getArticleKeywords(website, callback);
        } else {
            callback(keywords);
        }
    });
};

function getOldArticle(keywords, callback) {
    var keywordString = keywords.slice(0, NUMBEROFKEYWORDS).join(" ");
    $.getJSON(TROVE_API_URL, {
        key: TROVE_API_KEY,
        zone: "newspaper",
        encoding: "json",
        n: 1,
        include: "articletext",
        q: keywordString,
    }, function(data) {
        console.log(data);
        var troveArticle = data.response.zone[0].records.article[0];
        var article = {
            title: troveArticle.heading,
            body: troveArticle.articleText,
        };
        callback(article);   
    });
};

function replaceArticle(oldArticle, website) {
    var title, body;
    if (website === "www.news.com.au") {
        title = ".story-headline h1.heading";
        body = ".story-body";
    }

    $(title).html(oldArticle.title);
    $(body).html(oldArticle.body);
}

function timemachine() {
    var website = window.location.href;
    var keywords = getArticleKeywords(website, function(keywords) {
        getOldArticle(keywords, function(oldArticle) {
            replaceArticle(oldArticle, window.location.hostname);
        });
    });
};

timemachine();
