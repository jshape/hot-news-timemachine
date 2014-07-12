var ALCHEMY_API_KEY = "7a28e8d3c8c8e7baad81df241fcc3431cf086385";
var ALCHEMY_API_URL = "http://access.alchemyapi.com/calls/url/URLGetRankedKeywords?";



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
        callback(keywords);
    });
};

function getOldArticle(keywords) {
    var article = {
        title: "It's the 1900s!",
        body: "An example article from the 1900s",
    };
    alert(keywords);

    return article;
};

function replaceArticle(oldArticle, website) {
    var title, body;
    if (website === "http://news.com.au") {
        title = ".story-headline h1.heading";
        body = ".story-body";
    }

    $(title).html(oldArticle.title);
    $(body).html(oldArticle.body);
}

function timemachine() {
    var website = "http://news.com.au";
    var keywords = getArticleKeywords(website, getOldArticle);
//    replaceArticle(oldArticle, website);
};

timemachine();
