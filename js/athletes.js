function openHome() {
    window.location.href = 'index.html';
}

function openCountries() {
    window.location.href = 'countries.html';
}

function searchfunc(e) {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('athlete-selector');
    filter = input.value.toUpperCase();
    ul = document.getElementById('athlete-list');
    li = ul.getElementsByTagName('li');
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

const home_button = document.querySelector('button[id="home"]');
const countries_button = document.querySelector('button[id="countries"]');

home_button.addEventListener('click', openHome);
countries_button.addEventListener('click', openCountries);

const athlete_selector = document.querySelector('#athlete-selector');
athlete_selector.addEventListener('keyup', searchfunc);

d3.csv('./data/athlete_events.csv', function(d) {
    return {
        ID: d.ID,
        Name: d.Name
    };
}).then(function(data) {
    // var flags = [], nd = [], i;
    // for(i = 0; i < data.length/1000; i++) {
    //     if(flags[data[i].ID]) {
    //         continue;
    //     }
    //     flags[data[i].ID] = true;
    //     nd.push({'ID': data[i].ID, 'Name': data[i].Name});
    // }
    // console.log(nd);
    d3.select('#athlete-list').selectAll('li')
        .data(d3.map(data, function (d) {return d.Name;}).keys()).enter()
        .append('li')
        .text(function (d) {return d});
});
