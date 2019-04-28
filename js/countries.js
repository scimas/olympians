var data = d3.csv('./data/olympics_data.csv', function(d) {
    return {
        ID: d.ID,
        Year: d.Year,
        Country: d.region,
        Medal: d.Medal,
        Sport: d.Sport
    };
});

var country_selector = document.querySelector('#country-selector');
var sport_selector = document.querySelector('#sport-selector');
country_selector.addEventListener('change', medals);
sport_selector.addEventListener('change', medals);

const margin = {
    top: 40,
    bottom: 40,
    left: 60,
    right: 20
};

data.then(medals);
data.then(generate_options);
data.then(plot_participation);
data.then(plot_performance);

function medals(event) {
    var gold = 0, silver = 0, bronze = 0;

    if (sport_selector.value == 'None') {
        gold = d3.sum(data, function (d) {if(d.Country == country_selector.value) return d.Medal == "Gold";});
        silver = d3.sum(data, function (d) {if(d.Country == country_selector.value) return d.Medal == "Silver";});
        bronze = d3.sum(data, function (d) {if(d.Country == country_selector.value) return d.Medal == "Bronze";});
    }
    else if (country_selector.value == 'None') {
        gold = d3.sum(data, function (d) {if(d.Sport == sport_selector.value) return d.Medal == "Gold";});
        silver = d3.sum(data, function (d) {if(d.Sport == sport_selector.value) return d.Medal == "Silver";});
        bronze = d3.sum(data, function (d) {if(d.Sport == sport_selector.value) return d.Medal == "Bronze";});
    }
    else {
        gold = d3.sum(data, function (d) {if(d.Country == country_selector.value && d.Sport == sport_selector.value) return d.Medal == "Gold";});
        silver = d3.sum(data, function (d) {if(d.Country == country_selector.value && d.Sport == sport_selector.value) return d.Medal == "Silver";});
        bronze = d3.sum(data, function (d) {if(d.Country == country_selector.value && d.Sport == sport_selector.value) return d.Medal == "Bronze";});
    }
    var gold_caption = d3.select('#gold-medal').select('figcaption');
    gold_caption.text(gold);

    var silver_caption = d3.select('#silver-medal').select('figcaption');
    silver_caption.text(silver);

    var bronze_caption = d3.select('#bronze-medal').select('figcaption');
    bronze_caption.text(bronze);
}

function generate_options(data) {
    d3.select('#country-selector').selectAll('option')
        .data(d3.map(data, function (d) {return d.Country;}).keys().sort()).enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d});
    
    d3.select('#sport-selector').selectAll('option')
        .data(d3.map(data, function (d) {return d.Sport;}).keys().sort()).enter()
        .append('option')
        .attr('value', function (d) {return d;})
        .text(function (d) {return d;});
}

function plot_participation(data) {
    var average_participation = d3.nest()
        .key(function (d) {return d.Year;})
        .rollup(function (g) {
            var participants = d3.set(g, function (g) {return g.ID;}).values().length;
            var countries = d3.set(g, function (g) {return g.Country;}).values().length;
            return participants/countries;
        })
        .sortKeys(d3.ascending);
    if (sport_selector.value == 'None'){
        average_participation = average_participation.entries(data);
    }
    else {
        average_participation = average_participation.entries(data.filter(function (d) {
            return d.Sport == sport_selector.value;
        }));
    }

    var svg = d3.select('#participation');
    const width = svg.attr('width') - margin.left - margin.right;
    const height = svg.attr('height') - margin.top - margin.bottom;
    
    var x = d3.scaleTime()
        .domain(d3.extent(average_participation, function (d) {return new Date(d.key);})).nice()
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([0, d3.max(average_participation, function (d) {return d.value;})]).nice()
        .range([height, 0]);
    var x_axis = svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
        .call(d3.axisBottom(x));
    var y_axis = svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        .call(d3.axisLeft(y));
    var avg_line = d3.line()
        .x(function (d) {return x(new Date(d.key));})
        .y(function (d) {return y(d.value);});
    var path_group = svg.append('g')
        .attr('class', 'time_series')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    path_group.append('path')
        .attr('id', 'avg-path')
        .data([average_participation])
        .attr('d', avg_line)
        .attr('stroke', 'white');
    path_group.append('path')
        .attr('id', 'country-path');
    var avg_circle = svg.append('g')
        .attr('class', 'time_scatter')
        .attr('id', 'average')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    avg_circle.selectAll('circle')
        .data(average_participation).enter()
        .append('circle')
        .attr('cx', function (d) {return x(new Date(d.key));})
        .attr('cy', function (d) {return y(d.value);})
        .attr('r', 3)
        .on('mouseover', function (d) {
            tooltip.style('opacity', 1)
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY + 10) + 'px');
            tooltip.html(
                'Participants: ' + Math.round(d.value) +
                '</br>' +
                'Year: ' + d.key
                );
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });
    var country_circle = svg.append('g')
        .attr('class', 'time_scatter')
        .attr('id', 'country')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    var legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', 'translate(' + x(new Date('1940')) + ', ' + 0 + ')');
    legend.append('rect')
        .attr('x', 10)
        .attr('y', 10)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', 'white');
    legend.append('rect')
        .attr('x', 10)
        .attr('y', 35)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', 'green');
    legend.append('text')
        .attr('x', 35)
        .attr('y', 23)
        .attr('width', 15)
        .attr('height', 15)
        .text('Average Participation');
    legend.append('text')
        .attr('x', 35)
        .attr('y', 48)
        .attr('width', 15)
        .attr('height', 15)
        .text('Country\'s Participation');
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height + margin.top + margin.bottom - 5)
        .text('Year');
    
    svg.append('text')
        .attr('x', margin.left + 5)
        .attr('y', margin.top - 15)
        .text('Number of Participants');
    
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    function update(event) {
        var country_participation = d3.nest()
            .key(function (d) {return d.Year;})
            .rollup(function (g) {
                return d3.set(g, function (g) {return g.ID;}).values().length;
            })
            .sortKeys(d3.ascending);
        if (sport_selector.value == 'None') {
            country_participation = country_participation.entries(data.filter(function (d) {return d.Country == country_selector.value;}));
        }
        else {
            country_participation = country_participation.entries(data.filter(function (d) {return d.Country == country_selector.value && d.Sport == sport_selector.value;}));
        }
        average_participation = d3.nest()
            .key(function (d) {return d.Year;})
            .rollup(function (g) {
                var participants = d3.set(g, function (g) {return g.ID;}).values().length;
                var countries = d3.set(g, function (g) {return g.Country;}).values().length;
                return participants/countries;
            })
            .sortKeys(d3.ascending);
        if (sport_selector.value == 'None'){
            average_participation = average_participation.entries(data);
        }
        else {
            average_participation = average_participation.entries(data.filter(function (d) {
                return d.Sport == sport_selector.value;
            }));
        }
        var country_max = d3.max(country_participation, function (d) {return d.value;});
        var average_max = d3.max(average_participation, function (d) {return d.value;});
        var y = d3.scaleLinear()
            .domain([0, d3.max([country_max, average_max])]).nice()
            .range([height, 0]);
        d3.select('#participation').select('.yaxis')
            .call(d3.axisLeft(y));
        var country_line = d3.line()
            .x(function (d) {return x(new Date(d.key));})
            .y(function (d) {return y(d.value);});
        var avg_line = d3.line()
            .x(function (d) {return x(new Date(d.key));})
            .y(function (d) {return y(d.value);});
        path_group.select('#country-path')
            .data([country_participation])
            .transition()
            .duration(1000)
            .attr('d', country_line)
            .attr('stroke', 'green');
        path_group.select('#avg-path')
            .data([average_participation])
            .transition()
            .duration(1000)
            .attr('d', avg_line);
        country_circle.selectAll('circle')
            .data(country_participation).exit()
            .remove();
        country_circle.selectAll('circle')
            .data(country_participation)
            .transition()
            .duration(1000)
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);});
        country_circle.selectAll('circle')
            .data(country_participation).enter()
            .append('circle')
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);})
            .attr('r', 3)
            .on('mouseover', function (d) {
                tooltip.style('opacity', 1)
                    .style('left', (d3.event.pageX + 5) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');
                tooltip.html(
                    'Participants: ' + Math.round(d.value) +
                    '</br>' +
                    'Year: ' + d.key
                    );
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
        avg_circle.selectAll('circle')
            .data(average_participation).exit()
            .remove();
        avg_circle.selectAll('circle')
            .data(average_participation)
            .transition()
            .duration(1000)
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);});
        avg_circle.selectAll('circle')
            .data(average_participation).enter()
            .append('circle')
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);})
            .attr('r', 3)
            .on('mouseover', function (d) {
                tooltip.style('opacity', 1)
                    .style('left', (d3.event.pageX + 5) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');
                tooltip.html(
                    'Participants: ' + Math.round(d.value) +
                    '</br>' +
                    'Year: ' + d.key
                    );
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
    }
    country_selector.addEventListener('change', update);
    sport_selector.addEventListener('change', update);
}

function plot_performance(data) {
    var average_performance = d3.nest()
        .key(function (d) {return d.Year;})
        .rollup(function (g) {
            var medals = d3.sum(g, function (g) {return g.Medal != '';});
            var countries = d3.set(g, function (g) {return g.Country;}).values().length;
            return medals/countries;
        })
        .sortKeys(d3.ascending);
    if (sport_selector.value == 'None'){
        average_performance = average_performance.entries(data);
    }
    else {
        average_performance = average_performance.entries(data.filter(function (d) {
            return d.Sport == sport_selector.value;
        }));
    }
    
    var svg = d3.select('#performance');
    const width = svg.attr('width') - margin.left - margin.right;
    const height = svg.attr('height') - margin.top - margin.bottom;
    
    var x = d3.scaleTime()
        .domain(d3.extent(average_performance, function (d) {return new Date(d.key);})).nice()
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([0, d3.max(average_performance, function (d) {return d.value;})]).nice()
        .range([height, 0]);
    var x_axis = svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
        .call(d3.axisBottom(x));
    var y_axis = svg.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        .call(d3.axisLeft(y));
    var avg_line = d3.line()
        .x(function (d) {return x(new Date(d.key));})
        .y(function (d) {return y(d.value);});
    var path_group = svg.append('g')
        .attr('class', 'time_series')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    path_group.append('path')
        .attr('id', 'avg-path')
        .data([average_performance])
        .attr('d', avg_line)
        .attr('stroke', 'white');
    path_group.append('path')
        .attr('id', 'country-path');
    var avg_circle = svg.append('g')
        .attr('class', 'time_scatter')
        .attr('id', 'average')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    avg_circle.selectAll('circle')
        .data(average_performance).enter()
        .append('circle')
        .attr('cx', function (d) {return x(new Date(d.key));})
        .attr('cy', function (d) {return y(d.value);})
        .attr('r', 3)
        .on('mouseover', function (d) {
            tooltip.style('opacity', 1)
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY + 10) + 'px');
            tooltip.html(
                'Medals: ' + Math.round(d.value) +
                '</br>' +
                'Year: ' + d.key
                );
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });
    var country_circle = svg.append('g')
        .attr('class', 'time_scatter')
        .attr('id', 'country')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    var legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', 'translate(' + x(new Date('1940')) + ', ' + 0 + ')');
    legend.append('rect')
        .attr('x', 10)
        .attr('y', 10)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', 'white');
    legend.append('rect')
        .attr('x', 10)
        .attr('y', 35)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', 'green');
    legend.append('text')
        .attr('x', 35)
        .attr('y', 23)
        .attr('width', 15)
        .attr('height', 15)
        .text('Average Performance');
    legend.append('text')
        .attr('x', 35)
        .attr('y', 48)
        .attr('width', 15)
        .attr('height', 15)
        .text('Country\'s Performance');
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height + margin.top + margin.bottom - 5)
        .text('Year');
    
    svg.append('text')
        .attr('x', margin.left + 5)
        .attr('y', margin.top - 15)
        .text('Number of Medals');
    
    var tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    function update(event) {
        var country_performance = d3.nest()
            .key(function (d) {return d.Year;})
            .rollup(function (g) {
                return d3.sum(g, function (g) {return g.Medal != '';});
            })
            .sortKeys(d3.ascending);
        if (sport_selector.value == 'None') {
            country_performance = country_performance.entries(data.filter(function (d) {return d.Country == country_selector.value;}));
        }
        else {
            country_performance = country_performance.entries(data.filter(function (d) {return d.Country == country_selector.value && d.Sport == sport_selector.value;}));
        }
        average_performance = d3.nest()
            .key(function (d) {return d.Year;})
            .rollup(function (g) {
                var medals = d3.sum(g, function (g) {return g.Medal != '';});
                var countries = d3.set(g, function (g) {return g.Country;}).values().length;
                return medals/countries;
            })
            .sortKeys(d3.ascending);
        if (sport_selector.value == 'None'){
            average_performance = average_performance.entries(data);
        }
        else {
            average_performance = average_performance.entries(data.filter(function (d) {
                return d.Sport == sport_selector.value;
            }));
        }
        var country_max = d3.max(country_performance, function (d) {return d.value;});
        var average_max = d3.max(average_performance, function (d) {return d.value;});
        var y = d3.scaleLinear()
            .domain([0, d3.max([country_max, average_max])]).nice()
            .range([height, 0]);
        d3.select('#performance').select('.yaxis')
            .call(d3.axisLeft(y));
        var country_line = d3.line()
            .x(function (d) {return x(new Date(d.key));})
            .y(function (d) {return y(d.value);});
        var avg_line = d3.line()
            .x(function (d) {return x(new Date(d.key));})
            .y(function (d) {return y(d.value);});
        path_group.select('#country-path')
            .data([country_performance])
            .transition()
            .duration(1000)
            .attr('d', country_line)
            .attr('stroke', 'green');
        path_group.select('#avg-path')
            .data([average_performance])
            .transition()
            .duration(1000)
            .attr('d', avg_line);
        country_circle.selectAll('circle')
            .data(country_performance).exit()
            .remove();
        country_circle.selectAll('circle')
            .data(country_performance)
            .transition()
            .duration(1000)
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);});
        country_circle.selectAll('circle')
            .data(country_performance).enter()
            .append('circle')
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);})
            .attr('r', 3)
            .on('mouseover', function (d) {
                tooltip.style('opacity', 1)
                    .style('left', (d3.event.pageX + 5) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');
                tooltip.html(
                    'Medals: ' + Math.round(d.value) +
                    '</br>' +
                    'Year: ' + d.key
                    );
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
        avg_circle.selectAll('circle')
            .data(average_performance).exit()
            .remove();
        avg_circle.selectAll('circle')
            .data(average_performance)
            .transition()
            .duration(1000)
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);});
        avg_circle.selectAll('circle')
            .data(average_performance).enter()
            .append('circle')
            .attr('cx', function (d) {return x(new Date(d.key));})
            .attr('cy', function (d) {return y(d.value);})
            .attr('r', 3)
            .on('mouseover', function (d) {
                tooltip.style('opacity', 1)
                    .style('left', (d3.event.pageX + 5) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');
                tooltip.html(
                    'Medals: ' + Math.round(d.value) +
                    '</br>' +
                    'Year: ' + d.key
                    );
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });
    }
    country_selector.addEventListener('change', update);
    sport_selector.addEventListener('change', update);
}
