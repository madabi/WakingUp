/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function(){

    var openWeatherURL = 'http://api.openweathermap.org/data/2.5/weather?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q=';
    var wieWarmURL = 'http://www.wiewarm.ch/api/v1/bad.json/';
    var wieWarmAPIKey = '?api_key=9cdfa96c-d851-4b99-aff4-c778cd6da679';
    var searchResultOpenWeather = null;
    var searchResultWieWarm = null;




    var score = $('#fillgauge1');
    var gauge1;

    var nav = $('nav').children();
    var weatherButton = nav.first();
    var adButton = nav.first().next();
    var profileButton = nav.last();

    var sections = $('section');
    var weather = sections.first();
    var ad = sections.first().next();
    var profile = sections.last();

    getWieWarmData(wieWarmURL);
    showSection(weather);
    initScore();
    setActive(weatherButton);



    weatherButton.on('click', function(){
        showSection(weather);
        setActive(this);
    });

    adButton.on('click', function(){
        showSection(ad);
        setActive(this);
    });

    profileButton.on('click', function(){
        showSection(profile);
        setActive(this);
    });

    score.on('click', function(){
        gauge1.update(NewValue())
    });


    function setActive(button){
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }

    function showSection(section){
        $('section').hide();
        section.show();
    }


    function initScore(){
        var config1 = liquidFillGaugeDefaultSettings();
        config1.circleColor= "#00bfff";
        config1.circleFillGap = 0.05;
        config1.textSize = 3;
        config1.textVertPosition = 0.5;
        config1.maxValue = 12;
        config1.minValue = 0;
        config1.displayPercent = false;
        config1.circleThickness = 0.1;
        config1.waveAnimateTime = 700;
        config1.waveCount = 1;
        config1.waveHeight = 0.02;
        gauge1 = loadLiquidFillGauge("fillgauge1", 5, config1);

    }

    function NewValue() {
        if (Math.random() > .5) {
            return Math.round(Math.random() * 10)+1;
        } else {
            return Math.round((Math.random() * 10).toFixed(1))+1;
        }
    }


// OpenWeather
function getOpenWeatherData(searchQueryAPI){
    $.ajax({
        url: searchQueryAPI.concat("Bodensee"),
        dataType: 'json',
        type: 'GET',
        error: function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown, textStatus);
        },
        success: function(data){
            searchResultOpenWeather = data;
            var foreCastTable = $('section').first().find('div').first().find('table');

            foreCastTable.empty();
            foreCastTable.append(createTableFromSearchResult(searchResultOpenWeather, searchResultWieWarm));
        }
    });
    return true;
}
    function getWieWarmData(searchQueryAPI){
        $.ajax({
            url: searchQueryAPI.concat("192").concat(wieWarmAPIKey),
            dataType: 'json',
            type: 'GET',
            error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown, textStatus);
            },
            success: function(data){
                searchResultWieWarm = data;
                getOpenWeatherData(openWeatherURL);
            }
        });
        return true;
    }
    function createTableFromSearchResult(data, data2){
        var amountOfRain = data.rain["3h"] == undefined ? "0":data.rain["3h"];
        var sunrise = new Date(data.sys.sunrise*1000);
        var sunset = new Date(data.sys.sunset*1000);
        var table = '<tr>'+
        '<td><i class="wi wi-owm-'+data.weather[0].id+'"></i></td><td><span>'+data.main.temp+'</span> <i class="wi wi-fs wi-celsius"></i></td>'+
           '<td><i class="wi wi-fs wi-strong-wind"></i></td><td><span>'+data.wind.speed+' km/h</span></td></tr>'+
        '<tr><td><i class="wi wi-fs wi-thermometer"></i></td> <td><span>'+data2.becken.Bodensee.temp+'</span> <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-raindrops"></i></td><td><span>'+amountOfRain+' mm</span> </td></tr><tr>'+
        '<td><i class="wi wi-fs wi-sunrise"></i></td><td><span>'+sunrise.getHours()+':'+sunrise.getMinutes()+'</span> </td>'+
            '<td><i class="wi wi-fs wi-sunset"></i></td><td><span>'+sunset.getHours()+':'+sunset.getMinutes()+'</span></td></tr>';
        return table;
    }



});
