/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function(){

    var currentWeatherSectionOpened = ("45px");
    var currentWeatherSectionClosed = ("140px");//("calc(100% - 230px)").toString();
    var todayForecastSectionClosed = ("calc(100% - 140px)").toString();
    var dailyForecastSectionClosed = ("calc(100% - 90px)").toString();
    var todayForecastSectionOpened = ("95px");
    var dailyForecastSectionOpened = ("145px");

    var changeLakeSection = $('#changeLakeSection');
    var currentWeatherSection = $('#nowForecastSection');
    var hourlyForecastSection = $('#todayForecastSection');
    var dailyForecastSection = $('#dailyForecastSection');

    var changeLakeDropdownList = $('#changeLakeDropdown');


    //note for later coding: openweathermap access via string, but wiewarm.ch works better with IDS, eg. '192' for bodensee..
    var currentLake = "Bielersee";
    var currentLakeID = 70;
    var NUM_OF_HOURLY_FORECASTS = 4;
    var NUM_OF_DAILY_FORECASTS = 4;


    var scoreNowSVG = $('#scoreNowSVG');
    var scoreNowGauge;



    var weatherNowIconTable = $('#weatherNowIconTable');
    var hourlyForecastTable = $('#hourlyForecastTable');
    var dailyForecastTable = $('#dailyForecastTable');

    var lakeIDs = {"Bielersee":70,
        "Bodensee":192,
        "Brienzersee": 153,
        "Greifensee":196,
        "Pfäffikersee":198,
        "Sempachersee":103,
        "Thunersee":7,
        "Vierwaldstättersee":148,
        "Walensee":121,
        "Zugersee":177,
        "Zürichsee":14};

    var lakePoolIDs = {"Bielersee":184,
        "Bodensee":397,
        "Brienzersee": 331,
        "Greifensee":401,
        "Pfäffikersee":406,
        "Sempachersee":240,
        "Thunersee":23,
        "Vierwaldstättersee":326,
        "Walensee":280,
        "Zugersee":369,
        "Zürichsee":44};


    var nav = $('nav').children();
    var weatherButton = nav.first();
    var adButton = nav.first().next();
    var profileButton = nav.last();

    var sections = $('body').find('section');
    var weather = $('#weather');
    var ad = $('#ad');
    var profile = $('#profile');


    showSection(weather);
    setActive(weatherButton);
    createLakeSelection(lakeIDs);
    updateCurrentlySelectedLake();
    initWeather(currentLake,currentLakeID, NUM_OF_HOURLY_FORECASTS);

    //MANUELL ::: TEMPORÄR ::: NOCH auszulagern in updateDailyForecast
    //hideForecastDetails(dailyForecastSection);
    //

/*
    //prevents scrolling on mobile device
    $(document).bind('touchmove', function(e) {
        e.preventDefault();
    });
    */

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
        scoreNowGauge.v
        scoreNowGauge.update(NewValue())

    });


    changeLakeDropdownList.on("change", function() {
        updateCurrentlySelectedLake();
        initWeather(currentLake, currentLakeID.toString(), NUM_OF_HOURLY_FORECASTS);
        currentWeatherSection.css("top", currentWeatherSectionOpened);
    });

    $('#changeLakeTitle').on("click", handleChangeLake);
    $('#nowForecastTitle').on("click", handleCurrentWeatherPositions);
    $("#hourlyForecastTitle").on("click", handleHourlyForecastPositions);
    $("#dailyForecastTitle").on("click", handleDailyForecastPositions);

    //TODO: Check for better more directly solution..
   hourlyForecastTable.on('click', 'tr:nth-child(3n+1)',function(){
            hideForecastDetails(hourlyForecastSection);
            $(this).nextAll(':lt(2)').toggle();
    });
    dailyForecastTable.on('click', 'tr:nth-child(3n+1)',function(){
        hideForecastDetails(dailyForecastSection);
        $(this).nextAll(':lt(2)').toggle();
    });

    function createLakeSelection(lakeIDs){
        var dropDownSelection= "";
        $.each(lakeIDs, function(key,value){
            dropDownSelection = dropDownSelection.concat('<option value="'+value+'">'+key+'</option>');
        });
        changeLakeSection.find('select').empty().append(dropDownSelection);
    }

    function handleChangeLake(){
        if(currentWeatherSection.css("top") == currentWeatherSectionOpened){
            currentWeatherSection.css("top", currentWeatherSectionClosed);
            hourlyForecastSection.css("top", todayForecastSectionClosed);
            dailyForecastSection.css("top", dailyForecastSectionClosed);
        }else{
            currentWeatherSection.css("top", currentWeatherSectionOpened);
            hourlyForecastSection.css("top", todayForecastSectionClosed);
            dailyForecastSection.css("top", dailyForecastSectionClosed);
        }
    }

    function handleCurrentWeatherPositions(){
        if(currentWeatherSection.css("top") != currentWeatherSectionOpened){
            currentWeatherSection.css("top", currentWeatherSectionOpened);
            hourlyForecastSection.css("top", todayForecastSectionClosed);
            dailyForecastSection.css("top", dailyForecastSectionClosed);
        }else{
            if(hourlyForecastSection.css("top") != todayForecastSectionOpened
                && dailyForecastSection.css("top") != dailyForecastSectionOpened){
                currentWeatherSection.css("top", currentWeatherSectionClosed);
            }else{
                currentWeatherSection.css("top", currentWeatherSectionOpened);
                hourlyForecastSection.css("top", todayForecastSectionClosed);
                dailyForecastSection.css("top", dailyForecastSectionClosed);
            }
        }
    }

    function handleHourlyForecastPositions(){
        if(hourlyForecastSection.css("top") != todayForecastSectionOpened){
            hourlyForecastSection.css("top", todayForecastSectionOpened);
            currentWeatherSection.css("top", currentWeatherSectionOpened);
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
            currentWeatherSection.css("top", currentWeatherSectionOpened);
            hourlyForecastSection.css("top", todayForecastSectionOpened);
            dailyForecastSection.css("top", dailyForecastSectionOpened);
        }else{
            hourlyForecastSection.css("top", todayForecastSectionClosed);
            dailyForecastSection.css("top", dailyForecastSectionClosed);
        }
    }
    function updateCurrentlySelectedLake(){
        currentLakeID = changeLakeDropdownList.find(':selected').val();
        currentLake = changeLakeDropdownList.find(':selected').text();
    }

    function setActive(button){
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }

    function showSection(section){
        weather.hide();
        ad.hide();
        profile.hide();
        section.show();
        section.children().show();

    }

    function initWeather(lakeName, lakeID, numOfHourlyForecasts){
        //openWeatherMap doesn't find these two lakes.. therefore we chose two cities manually.
        if(lakeName=="Bielersee")lakeName="Biel";
        else if(lakeName=="Vierwaldstättersee")lakeName="Luzern";

        var openWeatherForecastURL = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q='.concat(lakeName.toString());
        var openWeatherNowURL = 'http://api.openweathermap.org/data/2.5/weather?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q='.concat(lakeName.toString());
        console.log(openWeatherForecastURL);
        console.log(openWeatherNowURL);
        var wieWarmQuery = 'http://www.wiewarm.ch/api/v1/temperature.json/'.concat(lakeID).concat('?api_key=9cdfa96c-d851-4b99-aff4-c778cd6da679');
        $.when(getWeatherData(openWeatherNowURL),getWeatherData(openWeatherForecastURL),getWeatherData(wieWarmQuery)).then(function(openWeatherNowData, openWeatherHourlyForecastData, wieWarmData) {
            var weatherNowTable = $('#weatherNowTable');
            var isCurrentWeather = true;
            updateWeatherTable(weatherNowTable,openWeatherNowData[0], wieWarmData[0], isCurrentWeather);
            updateForecastTables(openWeatherHourlyForecastData, wieWarmData, numOfHourlyForecasts);
            //loadLiquidFillGauge('scoreNowSVG', 5, config1);
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


    function getGaugeConfig(windScore){
        var customConfig = liquidFillGaugeDefaultSettings();
        customConfig.circleColor= "#4D4F4F";
        customConfig.circleFillGap = 0.05;
        customConfig.textSize = 3;
        customConfig.textColor= "#4D4F4F";
        customConfig.textVertPosition = 0.5;
        customConfig.maxValue = 12;
        customConfig.minValue = 0;
        customConfig.displayPercent = false;
        customConfig.circleThickness = 0.1;

        //Custom Wave Animation
        customConfig.waveAnimateTime = 500+(windScore*30);
        customConfig.waveCount = Math.floor(10/(windScore+1));
        customConfig.waveHeight = 0.1/(windScore+1);

        return customConfig;
    }

    function updateWeatherTable(weatherTable,openWeatherData,wieWarmData,isCurrentWeather){
        weatherTable.empty();
        weatherTable.append(createWeatherDetailTable(openWeatherData,wieWarmData,isCurrentWeather));
        return true;
    }

    function createWeatherDetailTable(openWeatherData, wieWarmData, isCurrentWeather){
        var amountOfRain = 0;
        if(openWeatherData.rain != undefined) {
            console.log(openWeatherData.rain);
            for(el in openWeatherData.rain){
                amountOfRain = openWeatherData.rain[el];
            }
        }
        var waterTemperature = wieWarmData[lakePoolIDs[currentLake]].temp;
        console.log("Wasser: "+waterTemperature);

        var table = '<tr>'+
            '<td><i class="wi wi-thermometer"></i></td><td>'+openWeatherData.main.temp.toFixed(1)+' <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-strong-wind"></i></td><td>'+Math.floor(openWeatherData.wind.speed*3.6)+' km/h</td></tr>'+
            '<tr><td><i class="wi wi-fs wi-flood"></i></td> <td>'+waterTemperature+' <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-raindrops"></i></td><td>'+Math.floor(amountOfRain)+' mm</td></tr>';

        if(isCurrentWeather){
            $('#nowForecastTitle').text("Momentan am "+currentLake);
            if(scoreNowGauge==null) {
                scoreNowGauge = loadLiquidFillGauge('scoreNowSVG', calculateScore(openWeatherData,waterTemperature,false), getGaugeConfig(calculateWindScore(openWeatherData.wind)));
            }else {
                scoreNowGauge.update(calculateScore(openWeatherData,waterTemperature,false));
            }
            var actualDate = new Date();
            var sunrise = new Date(openWeatherData.sys.sunrise*1000);
            var sunset = new Date(openWeatherData.sys.sunset*1000);
            var isDaytime = actualDate>sunrise && actualDate<sunset;

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

    function updateHourlyForecastOverview(openWeatherData,wieWarmData,numOfHourlyForecasts){
        var tableHead = "";
        var hoursOfForecast;

        hourlyForecastTable.empty();
        for(var i=0;i<numOfHourlyForecasts;i++)
        {
            tableHead="";
            var ScoreGaugeID = ("hourlyScore"+i);
            hoursOfForecast = (new Date(openWeatherData.list[i].dt*1000)).getHours();
            var weatherIconPrefix = hoursOfForecast<22 && hoursOfForecast> 6 ? "wi-owm-day-" : "wi-owm-night-";
            tableHead = tableHead.concat('<tr>' +
                '<td><i class="wi wi-fs wi-time-'+(hoursOfForecast>12 ? hoursOfForecast-12 : hoursOfForecast)+'"></i></td><td>' + hoursOfForecast + ' Uhr</td>' +
                '<td><i class="wi '+weatherIconPrefix+openWeatherData.list[i].weather[0].id +'"></i></td><td><svg id="'+ScoreGaugeID+'" width="40" height="40"></svg></td></tr>');

            var tableBody = createWeatherDetailTable(openWeatherData.list[i],wieWarmData,false);

            hourlyForecastTable.append(tableHead+tableBody);

            //Create Score for this hour's forecast
            loadLiquidFillGauge(ScoreGaugeID, calculateScore(openWeatherData.list[i],wieWarmData[lakePoolIDs[currentLake]].temp, false), getGaugeConfig(calculateWindScore(openWeatherData.list[i].wind)));
        }




    }

    function updateDailyForecastOverview(openWeatherData,wieWarmData,numOfDailyForecasts){
        dailyForecastTable.empty();

        var dailyForecastTableHead = "";
        var foreCastCounter = 0;
        var i = 0;
        var currentDay = new Date().getDay();
        var dateOfForecast;
        var dayOfForecast;

        var daysOfWeek= ["So","Mo","Di","Mi","Do","Fr","Sa","So"];

        while(foreCastCounter < numOfDailyForecasts && i != openWeatherData.list.length) {
            dailyForecastTableHead = "";
            dateOfForecast = (new Date(openWeatherData.list[i].dt * 1000));
            dayOfForecast  = dateOfForecast.getDay();

            if(currentDay!=dayOfForecast && dateOfForecast.getHours()==14) {
                //TODO: Data is being stored to array for later calculations.. ok?
                var scoreGaugeID = ("dailyScore"+foreCastCounter);

                var formattedDate = daysOfWeek[dayOfForecast]+". "+dateOfForecast.getDate()+"."+(dateOfForecast.getMonth()+1)+".";

                dailyForecastTableHead = dailyForecastTableHead.concat('<tr>' +
                    '<td><i class="wi wi-fs wi-time-2"></i></td><td>' + formattedDate + '</td>' +
                    '<td><i class="wi wi-owm-day-'+openWeatherData.list[i].weather[0].id +'"></i></td><td><svg id="'+scoreGaugeID+'" width="40" height="40"></svg></td></tr>');


                var dailyForecastTableBody = (createWeatherDetailTable(openWeatherData.list[i], wieWarmData, false));
                dailyForecastTable.append(dailyForecastTableHead+dailyForecastTableBody);

                loadLiquidFillGauge(scoreGaugeID, calculateScore(openWeatherData.list[i],wieWarmData[lakePoolIDs[currentLake]].temp, true), getGaugeConfig(calculateWindScore(openWeatherData.list[i].wind)));

                ++foreCastCounter;
                ++i;
                currentDay = dayOfForecast;
            }else ++i;
        }
    }

    function updateForecastTables(openWeatherHourlyForecastData, wieWarmData, numOfHourlyForecasts){
        updateHourlyForecastOverview(openWeatherHourlyForecastData[0],wieWarmData[0], numOfHourlyForecasts);
        hideForecastDetails(hourlyForecastSection);

        updateDailyForecastOverview(openWeatherHourlyForecastData[0],wieWarmData[0], 4);
        hideForecastDetails(dailyForecastSection);

    }

    function hideForecastDetails(forecastSection){
        var forecastTableRows = forecastSection.find('table').find('tr');
        forecastTableRows.hide();
        forecastTableRows.closest('table').find('tr:nth-child(3n+1)').show();
    }


    function calculateWindScore(openWeatherWindData){
        var wind = openWeatherWindData.speed.toFixed(1);
        console.log(wind);
        var windScore = 0;
        if(wind<5.5){
            if(wind<0.3)windScore=10; //Windstille -> glatter See
            else if(wind<1.5)windScore=9; // Leiser Zug -> Kleine Kräuselwellen ohne Schaumkämme
            else if(wind<3.3)windScore=8; // Leichte Brise -> Kleine, kurze Wellen, glasige, nicht brechende Kämme.
            else windScore = 7; // Schwache Brise -> Kämme beginnen sich zu brechen. Schaum glasig, vereinzelt Schaumköpfe.
        }else{
            if(wind>10){windScore = 0;}//Starker Wind - Sturm --> Score 0,da zu gefährlich
            else if(wind<8)windScore=2; //Frische Brise 	Lange, mäßige Wellen. überall Schaumkämme.
            else windScore = 5; // Mäßige Brise -> Kleine, längere Wellen. Verbreitet Schaumköpfe.
        }
        return windScore;
    }


    function calculateScore(openWeatherData, waterTemperature,isDailyForecast){
        if(!isDailyForecast) {
            //check if it's nighttime. If yes, don't go wakeboarding..
            var dateOfForecast = (new Date(openWeatherData.dt * 1000));
            if(dateOfForecast!=undefined) {
                if(openWeatherData.sys.sunrise!=undefined){
                var sunrise = new Date(openWeatherData.sys.sunrise * 1000);
                var sunset = new Date(openWeatherData.sys.sunset * 1000);
                console.log("JETZT: " + dateOfForecast + " sunrise " + sunrise + " Sunset " + sunset);

                    if(dateOfForecast < sunrise || dateOfForecast > sunset)return 0;
                }else{
                    //if no information provided, take these numbers to check
                    if(dateOfForecast.getHours()<6 || dateOfForecast.getHours()>22)return 0;
                }
            }
        }

        var windScore = calculateWindScore(openWeatherData.wind);
        //Check for dangerous stormy weather
        if (windScore==0) return 0;


        var temperatureScore = (openWeatherData.main.temp.toFixed(1)-16); //temp>=30 ->score 10, temp<16 -> 0
        if(temperatureScore<0)temperatureScore=0;
        else if(temperatureScore>10)temperatureScore=10;

        //amountOfRain in mm for last hour/3hours..
        var amountOfRain = 0;
        if(openWeatherData.rain != undefined) {
            console.log(openWeatherData.rain);
            for(el in openWeatherData.rain){
                amountOfRain = openWeatherData.rain[el];
            }
        }

        var rainScore = (10 - amountOfRain*2);
        rainScore = (rainScore < 0) ? 0 :rainScore;


        var waterTemperatureScore = (parseInt(waterTemperature) - 12);//temp>=22 ->score 10, temp<=12 -> 0
        if(waterTemperatureScore<0)waterTemperatureScore=0;
        else if(waterTemperatureScore>10)waterTemperatureScore=10;

        //DEBUG
        console.log("Temperatur "+temperatureScore+" Wasser "+waterTemperatureScore+" Wind: "+windScore +" Regen "+rainScore);

        //Gewichtete Summe der einzelnen Scores
        var finalScore = (temperatureScore + waterTemperatureScore + (windScore*4) + (rainScore*3)) / 9;

        if(finalScore<0)finalScore=0;else{
            if(finalScore>10)finalScore=10;
        }

          return Math.floor(finalScore);
    }

});





