function openHome() {
    window.location.href = 'index.html';
}

function openAthletes() {
    window.location.href = 'athletes.html';
}

const home_button = document.querySelector('button[id="home"]');
const athletes_button = document.querySelector('button[id="athletes"]');

home_button.addEventListener('click', openHome);
//athletes_button.addEventListener('click', openAthletes);

var data = d3.csv('./data/athlete_events.csv', function(d) {
    return {
        Country: d.NOC,
        Medal: d.Medal
    };
});

function graph(event) {
    data.then(function (data) {
        var gold = d3.sum(data, function (d) {if(d.Country == event.target.value) return d.Medal == "Gold";});
        var silver = d3.sum(data, function (d) {if(d.Country == event.target.value) return d.Medal == "Silver";});
        var bronze = d3.sum(data, function (d) {if(d.Country == event.target.value) return d.Medal == "Bronze";});
        
        var gold_caption = d3.select('#gold-medal').select('figcaption');
        gold_caption.text(gold);

        var silver_caption = d3.select('#silver-medal').select('figcaption');
        silver_caption.text(silver);

        var bronze_caption = d3.select('#bronze-medal').select('figcaption');
        bronze_caption.text(bronze);
    });
}

data.then(function(data) {
    d3.select('#country-selector').selectAll('option')
        .data(d3.map(data, function (d) {return d.Country;}).keys()).enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d});
});

document.querySelector('#country-selector').addEventListener('change', graph);
