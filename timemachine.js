var ALCHEMY_API_KEY = "7a28e8d3c8c8e7baad81df241fcc3431cf086385";
var ALCHEMY_API_URL = "http://access.alchemyapi.com/calls/url/URLGetRankedConcepts";
var TROVE_API_KEY = "eoudhjlngldfnmcm";
var TROVE_API_URL = "http://api.trove.nla.gov.au/result";
var NUMBEROFKEYWORDS = 4;
var NEWSLIMITED = ["www.news.com.au", "www.theaustralian.com.au", "www.heraldsun.com.au", "www.couriermail.com.au", "www.dailytelegraph.com.au", "www.themercury.com.au", "www.ntnews.com.au"]
var FAIRFAX = ["www.brisbanetimes.com.au", "www.smh.com.au", "www.theage.com.au"];
var ABC = "www.abc.net.au"; 
var GUARDIAN = "www.theguardian.com.au"; 
var CRIKEY = "www.crikey.com.au";


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
            publicationID: troveArticle.title.id,
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
    } else if (FAIRFAX.indexOf(website) !== -1) {
        title = ".cN-headingPage";
        body = ".articleBody";
        date = ".dtstamp";
        page = ".outerWrap";
    } else if (CRIKEY === website) {
        title = ".entry-title";
        body = ".post";
        date = ".date";
        page = "#wrapper";
    } else if (ABC === website) {
        title = ".article h1";
        body = ".article .body";
        date = ".published";
        page = "body";

        $(".article p").remove();
        $(title).after("<div class='body'></div>");
    } else if (GUARDIAN === website) {
        title = ".news-article-title h1";
        body = ".news-article-body";
        date = ".news-article-title time";
        page = "#main";
    }

    $(title).html(oldArticle.title).addClass("title");
    $(body).html(oldArticle.body).addClass("body");
    $(date).html("Trove Article Publication Date: " + oldArticle.date);
    $(page).addClass("page old");
};

function addBanner(oldArticle, keywords) {
    var banner = "";

    banner += "<div>";
    banner += "<span style='float:left'>"+image("HNTM-logo.gif")+"</span>";
    banner += "</div>";

    banner += "<div>";
    banner += span(image("trove-logo-del.gif"));
    banner += span("<a href='"+oldArticle.url+"'>"+oldArticle.title+"</a></span>");
    banner += span("Published "+oldArticle.date);
    banner += span("<a href='http://trove.nla.gov.au/ndp/del/title/"+oldArticle.publicationID+"'>"+oldArticle.publication+"</a>");
    banner += "</div>";
    
    banner += "<div>";
    banner += span(image("huni-logo-nav.png"));
    banner += keywords.map(function(keyword) {
        return "<a href='http://staging.huni.net.au/#/results?q="+keyword+"'>"+keyword+"</a>";
    }).join(", ");
    banner += "</div>";

    $("<header><div>"+banner+"</div></header>").prependTo("body").addClass("trove-banner");
}

function span(content) {
    return "<span>"+content+"</span>";
};

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
