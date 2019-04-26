d3.csv('./data/athlete_events.csv', function(d) {
    return {
        Medal: d.Medal
    };
}).then(function(data) {
    var gold = d3.sum(data, (d) => (d.Medal == "Gold"));
    var silver = d3.sum(data, (d) => (d.Medal == "Silver"));
    var bronze = d3.sum(data, (d) => (d.Medal == "Bronze"));
    
    var gold_caption = d3.select('#gold-medal').select('figcaption');
    gold_caption.text(gold);

    var silver_caption = d3.select('#silver-medal').select('figcaption');
    silver_caption.text(silver);

    var bronze_caption = d3.select('#bronze-medal').select('figcaption');
    bronze_caption.text(bronze);
});
