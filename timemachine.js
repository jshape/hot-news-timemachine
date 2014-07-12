function getArticleKeywords(website) {
    var keywords = ["example", "story"];
    return keywords;
};

function getOldArticle(keywords) {
    var article = {
        title: "It's the 1900s!",
        body: "An example article from the 1900s",
    };

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
    var keywords = getArticleKeywords(website);
    var oldArticle = getOldArticle(keywords);
    replaceArticle(oldArticle, website);
};

timemachine();
