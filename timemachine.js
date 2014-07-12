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
            return keywordObject.text;
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
            keywords: keywords,
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
};

function addBanner(oldArticle, keywords) {
    var banner = "";

    banner += image("HNTM-logo.gif");

    banner += "<span>This article was originally published in "+oldArticle.publication+", "+oldArticle.date+"</span>";

    banner += "<span>";
    banner += image("trove-logo-del.gif");
    banner += "<a href='"+oldArticle.url+"'>View it on the Trove Newspaper Archive website</a>";
    banner += "</span>";
    
    banner += "<span>";
    banner += image("huni-logo-nav.png");
    banner += keywords.map(function(keyword) {
        return "<a href='http://staging.huni.net.au/#/results?q="+keyword+"'>"+keyword+"</a>";
    }).join(", ");
    banner += "</span>";

    $("<div>"+banner+"</div>").prependTo("body").addClass("trove-banner");
}

function image(imageName) {
    return "<img src='"+chrome.extension.getURL("/images/"+imageName)+"'/>";
};

function timemachine() {
    var website = window.location.href;
    var keywords = getArticleKeywords(website, function(keywords) {
        keywordQueries = keywords.map(function(keyword) {
            return "("+keyword.replace(/ /g, " AND ")+")";
        });

        getOldArticle(keywordQueries, function(oldArticle) {
            replaceArticle(oldArticle, window.location.hostname);
            addBanner(oldArticle, keywords);
        });
    });
};

timemachine();
