/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function(){

    var searchResultOpenWeather = null;
    var searchResultWieWarm = null;

    var todayForecastSectionClosed = ("calc(100% - 165px)").toString();
    var dailyForecastSectionClosed = ("calc(100% - 100px)").toString();
    var todayForecastSectionOpened = ("70px");
    var dailyForecastSectionOpened = ("140px");

    var hourlyForecastSection = $('#todayForecastSection');
    var dailyForecastSection = $('#dailyForecastSection');



    //note for later coding: openweathermap access via string, but wiewarm.ch works better with IDS, eg. '192' for bodensee..
    var chosenLake = "Bodensee";
    var NUM_OF_HOURLY_FORECASTS = 4;
    var NUM_OF_DAILY_FORECASTS = 4;

    var config1;
    var scoreNowSVG = $('#scoreNowSVG');
    var scoreNowGauge;
    var forecastScoreGauges = [];


    var weatherNowIconTable = $('#weatherNowIconTable');
    var hourlyForecastTable = $('#hourlyForecastTable');
    var dailyForecastTable = $('#dailyForecastTable');

    var nav = $('nav').children();
    var weatherButton = nav.first();
    var adButton = nav.first().next();
    var profileButton = nav.last();

    var sections = $('body').find('section');
    var weather = sections.first();
    var ad = sections.first().next();
    var profile = sections.last();


    showSection(weather);
    setActive(weatherButton);
    initScoreConfig();
    initWeather(chosenLake, NUM_OF_HOURLY_FORECASTS);

    //MANUELL ::: TEMPORÄR ::: NOCH auszulagern in updateDailyForecast
    hideForecastDetails(dailyForecastSection);
    //

    //prevents scrolling on mobile device
    $(document).bind('touchmove', function(e) {
        e.preventDefault();
    });

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

    scoreNowSVG.on('click', function(){
        scoreNowGauge.update(NewValue())
    });

    $('#nowForecastTitle').on("click", function(){
        $('#todayForecastSection').css("top",todayForecastSectionClosed);
        $('#dailyForecastSection').css("top",dailyForecastSectionClosed);
    });

    $("#hourlyForecastTitle").on("click", function() {
        handleHourlyForecastPositions();
    });

    $("#dailyForecastTitle").on("click", function() {
        handleDailyForecastPositions();
    });

    //TODO: Check for better more directly solution..
   hourlyForecastTable.on('click', 'tr:nth-child(3n+1)',function(){
            hideForecastDetails(hourlyForecastSection);
            $(this).nextAll(':lt(2)').toggle();
    });
    dailyForecastTable.on('click', 'tr:nth-child(3n+1)',function(){
        hideForecastDetails(dailyForecastSection);
        $(this).nextAll(':lt(2)').toggle();
    });

    function handleHourlyForecastPositions(){
        if(hourlyForecastSection.css("top") != todayForecastSectionOpened){
            hourlyForecastSection.css("top", todayForecastSectionOpened);
        }else{
            if(dailyForecastSection.css("top") == dailyForecastSectionOpened){
                dailyForecastSection.css("top", dailyForecastSectionClosed);
            }else{
                hourlyForecastSection.css("top", todayForecastSectionClosed);
            }
        }
    }

    function handleDailyForecastPositions(){
     if(dailyForecastSection.css("top") != dailyForecastSectionOpened){
            hourlyForecastSection.css("top", todayForecastSectionOpened);
            dailyForecastSection.css("top", dailyForecastSectionOpened);
        }else{
            hourlyForecastSection.css("top", todayForecastSectionClosed);
            dailyForecastSection.css("top", dailyForecastSectionClosed);
        }
    }

    function setActive(button){
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }

    function showSection(section){
        sections.hide();
        section.show();
        section.children().show();

    }

    function initWeather(lake, numOfHourlyForecasts){
        var openWeatherForecastURL = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q='.concat(lake);
        var openWeatherNowURL = 'http://api.openweathermap.org/data/2.5/weather?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q='.concat(lake);
        var wieWarmQuery = 'http://www.wiewarm.ch/api/v1/bad.json/'.concat('192').concat('?api_key=9cdfa96c-d851-4b99-aff4-c778cd6da679');
        $.when(getWeatherData(openWeatherNowURL),getWeatherData(openWeatherForecastURL),getWeatherData(wieWarmQuery)).then(function(openWeatherNowData, openWeatherHourlyForecastData, wieWarmData) {
            var weatherNowTable = $('#weatherNowTable');
            var withSunset = true;
            updateWeatherTable(weatherNowTable,openWeatherNowData[0], wieWarmData[0], withSunset);
            updateForecastTables(openWeatherHourlyForecastData, wieWarmData, numOfHourlyForecasts);
            scoreNowGauge = loadLiquidFillGauge('scoreNowSVG', 5, config1);
        });
    }

    function initScoreConfig(){
        config1 = liquidFillGaugeDefaultSettings();
        config1.circleColor= "#4D4F4F";
        config1.circleFillGap = 0.05;
        config1.textSize = 3;
        config1.textColor= "#4D4F4F";
        config1.textVertPosition = 0.5;
        config1.maxValue = 12;
        config1.minValue = 0;
        config1.displayPercent = false;
        config1.circleThickness = 0.1;
        config1.waveAnimateTime = 7000;
        config1.waveCount = 2;
        config1.waveHeight = 0.02;
    }

    function createForecastScoreGauge(forecastGaugeMap){
        forecastGaugeMap.map(function(element){
            loadLiquidFillGauge(element.id, calculateScore(element.data), config1);
        });
    }


    function NewValue() {
        if (Math.random() > .5) {
            return Math.round(Math.random() * 10)+1;
        } else {
            return Math.round((Math.random() * 10).toFixed(1))+1;
        }
    }


function getWeatherData(searchQueryAPI){
    return $.ajax({
        url: searchQueryAPI,
        dataType: 'json',
        type: 'GET',
        error: function(jqXHR, textStatus, errorThrown){
            console.log(errorThrown, textStatus);
        },
        success: function(data){
           return data;
        }
    });
}



    function updateWeatherTable(weatherTable,openWeatherData,wieWarmData,withSunrise){
        weatherTable.empty();
        weatherTable.append(createWeatherDetailTable(openWeatherData,wieWarmData,withSunrise));
        return true;
    }

    function createWeatherDetailTable(openWeatherData, wieWarmData, withSunrise){
        var amountOfRain = "0";
        if(openWeatherData.rain != undefined) {
            console.log(openWeatherData.rain);
            for(el in openWeatherData.rain){
                amountOfRain = openWeatherData.rain[el];
            }
        }

        var table = '<tr>'+
            '<td><i class="wi wi-thermometer"></i></td><td>'+openWeatherData.main.temp.toFixed(1)+' <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-strong-wind"></i></td><td>'+openWeatherData.wind.speed.toFixed(1)+' km/h</td></tr>'+
            '<tr><td><i class="wi wi-fs wi-flood"></i></td> <td>'+wieWarmData.becken.Bodensee.temp+' <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-raindrops"></i></td><td>'+amountOfRain+' mm</td></tr>';

        if(withSunrise){
            var actualDate = new Date();
            var sunrise = new Date(openWeatherData.sys.sunrise*1000);
            var sunset = new Date(openWeatherData.sys.sunset*1000);
            var isDaytime = actualDate>sunrise && actualDate<sunset;
            console.log(openWeatherData);
            updateThreeCurrentWeatherIcons(openWeatherData.weather[0].id, isDaytime);
            table = table.concat('<tr><td><i class="wi wi-fs wi-sunrise"></i></td><td>'+sunrise.getHours()+':'+('0' + sunrise.getMinutes()).slice(-2)+'</td>'+
                '<td><i class="wi wi-fs wi-sunset"></i></td><td>'+sunset.getHours()+':'+sunset.getMinutes()+'</td></tr>');
        }
        return table;
    }

    function updateThreeCurrentWeatherIcons(openWeatherDataIconID, isDaytime){
        weatherNowIconTable.empty();
        var weatherIconPrefix = isDaytime ? "wi-owm-day-" : "wi-owm-night-";
        weatherNowIconTable.append('<tr><td><i class="wi wi-fs '+weatherIconPrefix+openWeatherDataIconID+'"></i></td>'+
            '<td><i class="wi wi-fs '+weatherIconPrefix+openWeatherDataIconID+'"></i></td>'+
            '<td><i class="wi wi-fs '+weatherIconPrefix+openWeatherDataIconID+'"></i></td></tr>');
    }

    function getHourlyForecastOverview(openWeatherData,wieWarmData,numOfHourlyForecasts){
        var hourlyForecastTable = "";
        var hoursOfForecast;


        for(var i=0;i<numOfHourlyForecasts;i++)
        {
            var ScoreGaugeID = ("hourlyScore"+i);
            hoursOfForecast = (new Date(openWeatherData.list[i].dt*1000)).getHours();
            var weatherIconPrefix = hoursOfForecast<22 && hoursOfForecast> 6 ? "wi-owm-day-" : "wi-owm-night-";
            hourlyForecastTable = hourlyForecastTable.concat('<tr>' +
                '<td><i class="wi wi-fs wi-time-'+(hoursOfForecast>12 ? hoursOfForecast-12 : hoursOfForecast)+'"></i></td><td>' + hoursOfForecast + ' Uhr</td>' +
                '<td><i class="wi '+weatherIconPrefix+openWeatherData.list[i].weather[0].id +'"></i></td><td><svg id="'+ScoreGaugeID+'" width="40" height="40"></svg></td></tr>');
            console.log(i);

            hourlyForecastTable+=(createWeatherDetailTable(openWeatherData.list[i],wieWarmData,false));
            forecastScoreGauges.push({id:ScoreGaugeID,data:openWeatherData.list[i]});
        }
    return hourlyForecastTable;
    }

    function getDailyForecastOverview(openWeatherData,wieWarmData,numOfDailyForecasts){
        var dailyForecastTable = "";
        var foreCastCounter = 0;
        var i = 0;
        var currentDay = new Date().getDay();
        var dateOfForecast;
        var dayOfForecast;

        var daysOfWeek= ["So","Mo","Di","Mi","Do","Fr","Sa","So"];

        while(foreCastCounter < numOfDailyForecasts && i != openWeatherData.list.length) {

            dateOfForecast = (new Date(openWeatherData.list[i].dt * 1000));
            dayOfForecast  = dateOfForecast.getDay();

            if(currentDay!=dayOfForecast && dateOfForecast.getHours()==14) {
                //TODO: Data is being stored to array for later calculations.. ok?
                var scoreGaugeID = ("dailyScore"+foreCastCounter);

                var formattedDate = daysOfWeek[dayOfForecast]+". "+dateOfForecast.getDate()+"."+(dateOfForecast.getMonth()+1)+".";

                dailyForecastTable = dailyForecastTable.concat('<tr>' +
                    '<td><i class="wi wi-fs wi-time-2"></i></td><td>' + formattedDate + '</td>' +
                    '<td><i class="wi wi-owm-day-'+openWeatherData.list[i].weather[0].id +'"></i></td><td><svg id="'+scoreGaugeID+'" width="40" height="40"></svg></td></tr>');


                dailyForecastTable += (createWeatherDetailTable(openWeatherData.list[i], wieWarmData, false));

                forecastScoreGauges.push({id:scoreGaugeID,data:openWeatherData.list[i]});

                ++foreCastCounter;
                ++i;
                currentDay = dayOfForecast;
            }else ++i;
        }
        return dailyForecastTable;
    }

    function updateForecastTables(openWeatherHourlyForecastData, wieWarmData, numOfHourlyForecasts){
        hourlyForecastTable.empty();
        hourlyForecastTable.append(getHourlyForecastOverview(openWeatherHourlyForecastData[0],wieWarmData[0], numOfHourlyForecasts));
        hideForecastDetails(hourlyForecastSection);
        dailyForecastTable.empty();
        dailyForecastTable.append(getDailyForecastOverview(openWeatherHourlyForecastData[0],wieWarmData[0], 4));
        hideForecastDetails(dailyForecastSection);
        createForecastScoreGauge(forecastScoreGauges);
    }

    function hideForecastDetails(forecastSection){
        var forecastTableRows = forecastSection.find('table').find('tr');
        forecastTableRows.hide();
        forecastTableRows.closest('table').find('tr:nth-child(3n+1)').show();
    }

    function calculateScore(forecastData){
        //TODO Calculation of Scores
          return Math.floor(Math.random()*10);
    }

});





