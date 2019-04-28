var data = d3.csv('./data/olympics_data.csv', function(d) {
    return {
        Name: d.Name,
        Year: d.Year,
        Country: d.region,
        Medal: d.Medal,
        Sport: d.Sport,
        Event: d.Event
    };
});

var country_selector = document.querySelector('#country-selector');
var athlete_selector = document.querySelector('#athlete-selector');
var sport_selector = document.querySelector('#sport-selector');

country_selector.addEventListener('change', update_athlete);
country_selector.addEventListener('change', update_sport);
sport_selector.addEventListener('change', update_athlete);
athlete_selector.addEventListener('change', medals);
athlete_selector.addEventListener('change', update_results);

data.then(generate_options);
data.then(medals);
data.then(update_athlete);
data.then(update_sport);
data.then(update_results);

function generate_options(data) {
    d3.select('#country-selector').selectAll('option')
        .data(d3.map(data, function (d) {return d.Country;}).keys().sort()).enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d});
}

function medals(event) {
    var gold = d3.sum(data, function (d) {if(d.Name == athlete_selector.value) return d.Medal == "Gold";});
    var silver = d3.sum(data, function (d) {if(d.Name == athlete_selector.value) return d.Medal == "Silver";});
    var bronze = d3.sum(data, function (d) {if(d.Name == athlete_selector.value) return d.Medal == "Bronze";});
    
    var gold_caption = d3.select('#gold-medal').select('figcaption');
    gold_caption.text(gold);

    var silver_caption = d3.select('#silver-medal').select('figcaption');
    silver_caption.text(silver);

    var bronze_caption = d3.select('#bronze-medal').select('figcaption');
    bronze_caption.text(bronze);
}

function update_athlete(event) {
    var sel = d3.select('#athlete-selector').selectAll('option')
        .data(
            d3.map(
            data.filter(function (d) {
                if(sport_selector.value == 'None'){
                    return d.Country == country_selector.value;
                }
                else {
                    return d.Country == country_selector.value && 
                    d.Sport == sport_selector.value;
                }
            }),
            function (d) {
                return d.Name;
            }
            ).keys().sort()
        );
    sel.exit().remove();
    sel.attr('value', function (d) {return d;})
        .text(function (d) {return d;});
    sel.enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d;});
    d3.select('#athlete-selector').append('option')
        .attr('value', 'None')
        .attr('selected', 'selected')
        .text('None');
}

function update_sport(event) {
    var sel = d3.select('#sport-selector').selectAll('option')
        .data(
            d3.map(
            data.filter(function (d) {
                return d.Country == country_selector.value;
            }),
            function (d) {
                return d.Sport;
            }
            ).keys().sort()
        );
    sel.exit().remove();
    sel.attr('value', function (d) {return d;})
        .text(function (d) {return d;});
    sel.enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d;});
    d3.select('#sport-selector').append('option')
        .attr('value', 'None')
        .attr('selected', 'selected')
        .text('None');
}

function update_results(event) {
    var result = d3.select('#results');
    var sports = d3.map(
        data.filter(
            function (d) {return d.Name == athlete_selector.value;}
        ),
        function (d) {
            return d.Sport;
        }
    ).keys().sort();
    var events = d3.map(
        data.filter(
            function (d) {return d.Name == athlete_selector.value;}
        ),
        function (d) {
            return d.Event;
        }
    ).keys().sort();
    var years = d3.map(
        data.filter(
            function (d) {return d.Name == athlete_selector.value;}
        ),
        function (d) {
            return d.Year;
        }
    ).keys().sort();
    var sport_string = '', event_string = '', year_string = '';
    for (s in sports) {
        sport_string += sports[s] + ', ';
    }
    for (e in events) {
        event_string += events[e] + ', ';
    }
    for (y in years) {
        year_string += years[y] + ', ';
    }
    sport_string = sport_string.slice(0, sport_string.length-2);
    event_string = event_string.slice(0, event_string.length-2)
    year_string = year_string.slice(0, year_string.length-2);
    result.html(
        '<span style="color: green">Sports: </span>' + sport_string +
        '<br>' +
        '<span style="color: green">Events: </span>' + event_string +
        '<br>' +
        '<span style="color: green">Years active: </span>' + year_string
    );
}
