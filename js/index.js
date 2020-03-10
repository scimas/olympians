// Show the total medal count
d3.csv('./data/olympics_data.csv', function(d) {
    return {
        Medal: d.Medal
    };
}).then(function(data) {
    let gold = d3.sum(data, (d) => (d.Medal == "Gold"));
    let silver = d3.sum(data, (d) => (d.Medal == "Silver"));
    let bronze = d3.sum(data, (d) => (d.Medal == "Bronze"));
    
    let gold_caption = d3.select('#gold-medal').select('figcaption');
    gold_caption.text(gold);

    let silver_caption = d3.select('#silver-medal').select('figcaption');
    silver_caption.text(silver);

    let bronze_caption = d3.select('#bronze-medal').select('figcaption');
    bronze_caption.text(bronze);
});
