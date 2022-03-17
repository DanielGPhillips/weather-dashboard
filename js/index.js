let citySearchEl = $("form");
const searchBar = $("input");
const historySection = $("search-history");
const errorMessage = $("error-message");
const currentWeatherSection = $("current-weather");
const forecastSection = $("forecast");
const forecastDay = $("forecast-day");
const forecastTitle = $("#forecast-title")  

const searchHistory = [];
    
const APIKey = "127bf0cad72cf425e225148de2f91f52";

function initializePage() {
    const storedSearchHistory = JSON.parse(localStorage.getItem("weatherSearchHistory"));

    if (storedSearchHistory !== null){
        searchHistory = storedSearchHistory;
        for (var i = 0; i < searchHistory.length; i++){
            const newButton = $("<button>");
            newButton.text(searchHistory[i]);
            newButton.addClass("btn blue lighten-4 waves-effect waves-dark");
            historySection.append(newButton);
        }
    }
}

function getWeather(cityName){
    const currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid="+ APIKey;
    const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=" + APIKey;    
    let validCity = false;

    fetch(currentWeatherUrl)
    .then(function(res){
        if (res.ok){
            validCity = true;
            addtoHistory(cityName);
        }
        return res.json();
    })
    .then(function(data){
        if (validCity) {
            currentWeatherSection.children("#city-name").text(city + ", " + moment.unix(data.dt).format("MMM Do, YYYY") + " (date at user's location)");
            currentWeatherSection.children(".weather-icon").attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
            currentWeatherSection.children(".temp").text("Temp: " + data.main.temp + " °F");
            currentWeatherSection.children(".wind-speed").text("Wind: " + data.wind.speed + " MPH" );
            currentWeatherSection.children(".humidity").text("Humidity: " + data.main.humidity + "%");

            const oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&appid="+ APIKey;

            fetch(oneCallUrl)
            .then(function(res){
                return res.json();
            })
            .then(function(data){
                const uviEl = currentWeather.children("#uv-index");
                const uvi = data.current.uvi
                uviEl.text("UV index: " + uvi);
                if (uvi < 3){
                    uviEl.css("background-color", "green");
                    uviEl.css("color", "white");
                } else if (uvi < 6){
                    uviEl.css("background-color", "yellow");
                    uviEl.css("color", "black");
                } else {
                    uviEl.css("background-color", "red");
                    uviEl.css("color", "white");
                }
                currentEl.css("display", "block");
            })
        } else {
            errorEl.css("display", "block");
        }
    });
    fetch(forecastUrl)
    .then(function(res){
        return res.json();
    })
    .then(function(data){
        if (validCity){
            var dataList = data.list;
            var dayIndex = 0;
            
            for (var i = 7; i < dataList.length; i += 8){
                var dayWeather = dataList[i];
                var day = $(forecastSection[dayIndex]);
                dayIndex++;
    
                day.children("h5").text(moment.unix(dayWeather.dt).format("MMM Do, YYYY"));
                day.children(".weather-icon").attr("src", "http://openweathermap.org/img/wn/" + dayWeather.weather[0].icon + "@2x.png");
                day.children(".temp").text("Temp: " + dayWeather.main.temp + " °F");
                day.children(".wind-speed").text("Wind: " + dayWeather.wind.speed + " MPH");
                day.children(".humidity").text("Humidity: " + dayWeather.main.humidity + "%");
            }

            forecastTitle.css("display", "block");
            forecastDay.css("display", "block");
        }

    });
}

function addSearchToHistory(search){
    for (var i = 0; i < searchHistory.length; i++){
        if (search === searchHistory[i]){
            return;
        }
    }
    searchHistory.splice(0, 0, search);
    
    var newButton = $("<button>");
    newButton.text(search);
    newButton.addClass("btn blue lighten-4 waves-effect waves-dark");
    historySection.prepend(newButton);

    if (searchHistory.length > 8){
        searchHistory.pop();
        historySection.children().eq(8).remove()
    }

    localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    searchBar.val("");
}

historySection.on("click", "button", function(event){
    var buttonText = $(event.target).text()
    getWeather(buttonText);
});

citySearchEl.on("submit", function(event){
    event.preventDefault();

    var cityInput = searchBar.val().trim();

    if (cityInput === ""){
        return;
    }

    getWeather(cityInput);
});

initializePage();
