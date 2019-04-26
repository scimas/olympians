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

const athlete_selector = document.querySelector('#athlete-selector');
athlete_selector.addEventListener('keyup', searchfunc);

d3.csv('./data/olympics_data.csv', function(d) {
    return {
        ID: d.ID,
        Name: d.Name
    };
}).then(function(data) {
    d3.select('#athlete-list').selectAll('li')
        .data(d3.map(data, function (d) {return d.Name;}).keys()).enter()
        .append('li')
        .text(function (d) {return d});
});
