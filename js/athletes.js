// Load the data
let data = d3.csv('./data/olympics_data.csv', function(d) {
    return {
        Name: d.Name,
        Sex: d.Sex,
        Age: d.Age,
        Height: d.Height,
        Weight: d.Weight,
        Year: d.Year,
        Country: d.region,
        Medal: d.Medal,
        Sport: d.Sport,
        Event: d.Event
    };
});

// References to the drop-down selects
let country_selector = document.querySelector('#country-selector');
let athlete_selector = document.querySelector('#athlete-selector');
let sport_selector = document.querySelector('#sport-selector');

data.then(generate_options);
data.then(medals);
data.then(update_athlete);
data.then(update_sport);
data.then(update_results);

/** Creates options for the country selection drop-down. */
function generate_options(data) {
    d3.select('#country-selector').selectAll('option')
        .data(d3.map(data, function (d) {return d.Country;}).keys().sort()).enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d});
}

/** Updates the medal counts based on selected athlete. */
function medals(data) {
    function update(event) {
        let gold = d3.sum(data, function (d) {if(d.Name == athlete_selector.value) return d.Medal == "Gold";});
        let silver = d3.sum(data, function (d) {if(d.Name == athlete_selector.value) return d.Medal == "Silver";});
        let bronze = d3.sum(data, function (d) {if(d.Name == athlete_selector.value) return d.Medal == "Bronze";});
        
        let gold_caption = d3.select('#gold-medal').select('figcaption');
        gold_caption.text(gold);

        let silver_caption = d3.select('#silver-medal').select('figcaption');
        silver_caption.text(silver);

        let bronze_caption = d3.select('#bronze-medal').select('figcaption');
        bronze_caption.text(bronze);
    }
    athlete_selector.addEventListener('change', update);
}

/** Updates athlete selection options based on selected country and/or sport. */
function update_athlete(data) {
    function update(event) {
        let sel = d3.select('#athlete-selector').selectAll('option')
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
    country_selector.addEventListener('change', update);
    sport_selector.addEventListener('change', update);
}

/** Updates sport selection options based on selected country. */
function update_sport(data) {
    function update(event) {
        let sel = d3.select('#sport-selector').selectAll('option')
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
    country_selector.addEventListener('change', update);
}

/** Updates the results table based on selected athlete. */
function update_results(data) {
    function update(event) {
        let result = d3.select('#results');
        let filtered_data = data.filter(
            function (d) {return d.Name == athlete_selector.value;}
        );

        // Select unique sports
        let sports = d3.map(
            filtered_data,
            function (d) {
                return d.Sport;
            }
        ).keys().sort();

        // Select unique events
        let events = d3.map(
            filtered_data,
            function (d) {
                return d.Event;
            }
        ).keys().sort();

        // Select unique years
        let years = d3.map(
            filtered_data,
            function (d) {
                return d.Year;
            }
        ).keys().sort();

        // Make strings
        let sport_string = '', event_string = '', year_string = '';
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

        // Athlete's latest age
        let age = d3.max(
            filtered_data,
            function (d) {return d.Age;}
        );
        // Athlete's sex
        let sex = d3.map(
            filtered_data,
            function (d) {return d.Sex;}
        ).keys()[0];
        // Athlete's latest height
        let height = d3.max(
            filtered_data,
            function (d) {return d.Height;}
        );
        // Athlete's mean weight
        let weight = d3.mean(
            filtered_data,
            function (d) {return d.Weight;}
        );
        // Render
        result.select('#age').text(age);
        result.select('#sex').text(sex);
        result.select('#height').text(height);
        result.select('#weight').text(weight);
        result.select('#sports').text(sport_string);
        result.select('#events').text(event_string);
        result.select('#years').text(year_string);
    }
    athlete_selector.addEventListener('change', update);
}
