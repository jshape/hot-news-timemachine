var ALCHEMY_API_KEY = "7a28e8d3c8c8e7baad81df241fcc3431cf086385";
var ALCHEMY_API_URL = "http://access.alchemyapi.com/calls/url/URLGetRankedConcepts";
var TROVE_API_KEY = "eoudhjlngldfnmcm";
var TROVE_API_URL = "http://api.trove.nla.gov.au/result";
var NUMBEROFKEYWORDS = 4;
var NEWSLIMITED = ["www.news.com.au", "www.theaustralian.com.au", "www.heraldsun.com.au", "www.couriermail.com.au", "www.dailytelegraph.com.au", "www.themercury.com.au", "www.ntnews.com.au"]



function getArticleKeywords(website, callback) {
    $.getJSON(ALCHEMY_API_URL, {
        apikey: ALCHEMY_API_KEY,
        url: website,
        outputMode: "json",
    }, function(data) {
        var keywords = data.concepts.map(function(keywordObject) {
            return "("+keywordObject.text.replace(/ /g, " AND ")+")";
        });
        console.log("ALCHEMY KEYWORDS", keywords);
        
        if (keywords.length === 0) {
            getArticleKeywords(website, callback);
        } else {
            callback(keywords);
        }
    });
};

function getOldArticle(keywords, callback) {
    var keywordString = keywords.slice(0, NUMBEROFKEYWORDS).join(" OR ");
    $.getJSON(TROVE_API_URL, {
        key: TROVE_API_KEY,
        zone: "newspaper",
        encoding: "json",
        n: 1,
        include: "articletext",
        q: keywordString,
    }, function(data) {
        var troveArticle = data.response.zone[0].records.article[0];
        console.log("TROVE ARTICLE", troveArticle);
        var article = {
            title: troveArticle.heading,
            body: troveArticle.articleText,
            date: troveArticle.date,
            url: troveArticle.troveUrl,
            publication: troveArticle.title.value,
        };
        callback(article);   
    });
};

function replaceArticle(oldArticle, website) {
    var title, body, date, page;
    if (NEWSLIMITED.indexOf(website) !== -1) {
        title = ".story-headline h1.heading";
        body = ".story-body";
        date = ".date-and-time";
        page = "#page";
    }

    $(title).html(oldArticle.title).addClass("title");
    $(body).html(oldArticle.body).addClass("body");
    $(date).html("Trove Article Publication Date: " + oldArticle.date);
    $(page).addClass("page old");
    
    var banner = "<span>This article was originally published in "+oldArticle.publication;
    banner += ", "+oldArticle.date+"</span>";
    banner += "<span><a href='"+oldArticle.url+"'>View it on the Trove Newspaper Archive website</a></span>";
    $("<div>"+banner+"</div>").prependTo("body").addClass("trove-banner");
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
