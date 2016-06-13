/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function(){

    var searchResultOpenWeather = null;
    var searchResultWieWarm = null;

    //note for later coding: openweathermap access via string, but wiewarm.ch works better with IDS, eg. '192' for bodensee..
    var chosenLake = "Bodensee";
    var NUM_OF_HOURLY_FORECASTS = 4;

    var config1;
    var scoreNow= $('#scoreNow');
    var scoreNowGauge;
    var hourlyForecastData = [NUM_OF_HOURLY_FORECASTS];
    var hourlyScores = [NUM_OF_HOURLY_FORECASTS];

    var hourlyForecastTable = $('#hourlyForecastTable');

    var nav = $('nav').children();
    var weatherButton = nav.first();
    var adButton = nav.first().next();
    var profileButton = nav.last();

    var sections = $('section');
    var weather = sections.first();
    var ad = sections.first().next();
    var profile = sections.last();
    
    var insertAddMenuButton = $('#btn_add_insert');
    var searchAddMenuButton = $('#btn_add_search'); //Fällt weg
    var backAddButton01 = $('#btn_add_back01');
    var backAddButton02 = $('#btn_add_back02'); //Fällt weg
    var insertAddButton = $('#btn_add_insert_insert');
    var searchAddButton = $('#btn_add_search_search');
    
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
    
    $(".date").datepicker({minDate: 0});
    
    hideArticles();
    prepareLakeList()
    showSection(weather);
    setActive(weatherButton);
    initScoreConfig();
    initWeather(chosenLake, NUM_OF_HOURLY_FORECASTS);

    
    weatherButton.on('click', function(){
        showSection(weather);
        setActive(this);
        hideArticles();
        deleteResults();
    });

    adButton.on('click', function(){
        hideArticles();
        showSection(ad);
        setActive(this);
        setTodaysDate();
        $('article').last().show();
    });

    profileButton.on('click', function(){
        showSection(profile);
        setActive(this);
        hideArticles();
        deleteResults();
    });

    scoreNow.on('click', function(){
        scoreNowGauge.update(NewValue())
    });
    
    
    insertAddMenuButton.on('click', function(){ 
        $('article').last().hide();
        $('article').first().show();
        $('#addContent').val("");
        $('#title_insert').val("");
    });
    
    backAddButton01.on('click', function(){
        $('article').first().hide();
        $('article').next().show();
    });
    
    insertAddButton.on('click', function(){
        var lake = $('#select_insert :selected').text();
        var title = $('#title_insert').val();
        var message = $('#addContent').val();
        var inputDate = $('#datepicker_insert').val().replace(/\//g,",");
        
        //Logs
        console.log(lake);
        console.log(inputDate);
        console.log(title);
        console.log(message);
        
        //if (isLoggedIn) {
            insertAd(lake, inputDate, title, message, '8b69439022efff82');
        //}
        
    });
    
    function setTodaysDate(){
        var defaultDate = getCurrentDate();
        $('#datepicker_insert').val(defaultDate);
        $('#datepicker_from').val(defaultDate);
        $('#datepicker_until').val(defaultDate);
    }
    
    function getCurrentDate(){
        var currentDate = new Date();
        var twoDigitMonth=((currentDate.getMonth()+1)>=10)? (currentDate.getMonth()+1) : '0' + (currentDate.getMonth()+1);  
        var twoDigitDate=((currentDate.getDate())>=10)? (currentDate.getDate()) : '0' + (currentDate.getDate());
        return createdDateTo = twoDigitMonth + "/" + twoDigitDate +  "/"+currentDate.getFullYear(); 
    }
    
    searchAddButton.on('click', function(){
        var lake = $('#select_search :selected').text();
        var fromDate =  $('#datepicker_from').val().replace(/\//g, ",");
        var untilDate = $('#datepicker_until').val().replace(/\//g, ",");
        
        //Logs
        console.log(lake);
        console.log(fromDate);
        console.log(untilDate);
        
        searchAd(lake, fromDate, untilDate);
    
    });

    $("#hourlyForecastTitle").on('click', function(e) {
        // Prevent a page reload when a link is pressed
        console.log("LOL");
        e.preventDefault();
        // Call the scroll function
        goToByScroll(this.id);
    });

    //TODO: Check for better more directly solution..
   hourlyForecastTable.on('click', 'tr',function(){
        if($(this).attr('class') == 'hourlyForecastOverview'){
            $(this).nextAll(':lt(2)').toggle();
        }

    });


    function hideArticles(){
        $('article').hide();
    }
    
    function prepareLakeList(){
        for(var key in lakeIDs){
            var val = lakeIDs[key];
            $('#select_search').append('<option>'+key +'</option>');
            $('#select_insert').append('<option>'+key +'</option>');
        }
    }
    
    function setActive(button){
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }
    
    function showSection(section){
        $('section').hide();
        section.show();
    }

    function initWeather(lake, numOfHourlyForecasts){
        var openWeatherForecastURL = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q='.concat(lake);
        var openWeatherNowURL = 'http://api.openweathermap.org/data/2.5/weather?units=metric&APPID=f775032d25536c0a7f515e7dc480a702&q='.concat(lake);
        var wieWarmQuery = 'http://www.wiewarm.ch/api/v1/bad.json/'.concat('192').concat('?api_key=9cdfa96c-d851-4b99-aff4-c778cd6da679');
        $.when(getOpenWeatherData(openWeatherNowURL),getOpenWeatherData(openWeatherForecastURL),getWieWarmData(wieWarmQuery)).then(function(openWeatherNowData, openWeatherHourlyForecastData, wieWarmData) {
            var weatherNowTable = $('section').first().find('div').first().find('table');
            var withSunset = true;
            updateWeatherTable(weatherNowTable,openWeatherNowData[0], wieWarmData[0], withSunset);

            updateHourlyForecastTable(openWeatherHourlyForecastData, wieWarmData, numOfHourlyForecasts);

            //TODO Refactoring calculation and creation of scores.. not yet stateless..
            calculateHourlyScores();
            createScoreGauges(hourlyScores);

            loadLiquidFillGauge('scoreNow', 5, config1);
        });
    }

    function initScoreConfig(){
        config1 = liquidFillGaugeDefaultSettings();
        config1.circleColor= "#00bfff";
        config1.circleFillGap = 0.05;
        config1.textSize = 3;
        config1.textVertPosition = 0.5;
        config1.maxValue = 12;
        config1.minValue = 0;
        config1.displayPercent = false;
        config1.circleThickness = 0.1;
        config1.waveAnimateTime = 7000;
        config1.waveCount = 2;
        config1.waveHeight = 0.02;
    }

    function createScoreGauges(hourlyScores){
        hourlyScores.map(function(score, index) {
            loadLiquidFillGauge("score".concat(index), score, config1);
        });
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
    function getWieWarmData(searchQueryAPI){
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
            amountOfRain = openWeatherData.rain["3h"] == undefined ? "0" : openWeatherData.rain["3h"].toFixed(1);
        }
        var sunrise = new Date(openWeatherData.sys.sunrise*1000);
        var sunset = new Date(openWeatherData.sys.sunset*1000);

        var table = '<tr>'+
            '<td><i class="wi wi-owm-'+openWeatherData.weather[0].id+'"></i></td><td><span>'+openWeatherData.main.temp.toFixed(1)+'</span> <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-strong-wind"></i></td><td><span>'+openWeatherData.wind.speed.toFixed(1)+' km/h</span></td></tr>'+
            '<tr><td><i class="wi wi-fs wi-thermometer"></i></td> <td><span>'+wieWarmData.becken.Bodensee.temp+'</span> <i class="wi wi-fs wi-celsius"></i></td>'+
            '<td><i class="wi wi-fs wi-raindrops"></i></td><td><span>'+amountOfRain+' mm</span></td></tr>';

        if(withSunrise){
            table = table.concat('<tr><td><i class="wi wi-fs wi-sunrise"></i></td><td><span>'+sunrise.getHours()+':'+('0' + sunrise.getMinutes()).slice(-2)+'</span> </td>'+
                '<td><i class="wi wi-fs wi-sunset"></i></td><td><span>'+sunset.getHours()+':'+sunset.getMinutes()+'</span></td></tr>');
        }
        return table;
    }

    function getHourlyForecastOverview(openWeatherData,wieWarmData,numOfHours){
        var hourlyForecastOverviewTable = "";
        var hoursOfForecast;

        for(var i=0;i<numOfHours;i++)
        {
            //TODO: Data is being stored to array for later calculations.. ok?
            hourlyForecastData[i] = openWeatherData.list[i];

            hoursOfForecast = (new Date(openWeatherData.list[i].dt*1000)).getHours();
            hourlyForecastOverviewTable = hourlyForecastOverviewTable.concat('<tr class="hourlyForecastOverview">' +
                '<td><i class="wi wi-fs wi-time-'+(hoursOfForecast>12 ? hoursOfForecast-12 : hoursOfForecast)+'"></i></td><td><span>' + hoursOfForecast + ' Uhr</span></td>' +
                '<td><i class="wi wi-owm-'+openWeatherData.list[i].weather[0].id +'"></i></td><td><svg id="score'+i+'" width="40" height="40"></svg></td></tr>');
            console.log(i);

            hourlyForecastOverviewTable+=(createWeatherDetailTable(openWeatherData.list[i],wieWarmData,false));

        }
    return hourlyForecastOverviewTable;
    }

    function updateHourlyForecastTable(openWeatherHourlyForecastData, wieWarmData, numOfHourlyForecasts){
        hourlyForecastTable.empty();
        hourlyForecastTable.append(getHourlyForecastOverview(openWeatherHourlyForecastData[0],wieWarmData[0], numOfHourlyForecasts));
        hideHourlyForecastDetails();
    }

    function hideHourlyForecastDetails(){
        var hourlyForecast = $('.todayForecast').find('table').find('tr');
        hourlyForecast.hide();
        hourlyForecast.closest('table').find('tr.hourlyForecastOverview').show();
    }

    function calculateHourlyScores(){
       hourlyForecastData.map(function(element,index){
           //TODO Calculation of Scores
           hourlyScores[index]= Math.floor(Math.random()*10);
       });
    }

    // This is a functions that scrolls to #{blah}link
    function goToByScroll(id){
        // Remove "link" from the ID
        id = id.replace("link", "");
        // Scroll
        $('html,body').animate({
                scrollTop: $("#"+id).offset().top},
            'slow');
    }
    
    /*
    * Sends a POST-Request with input to insert an ad
    */
    function insertAd(lake, inputDate, title, message, tokenString){
        var url = 'api/ads/insert';
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                "lake": lake,
                "date": inputDate,
                "title": title,
                "message": message,
                "token": tokenString
            }),
            statusCode: {
                200: function () {
                    hideArticles();
                    showSection(ad);
                    setActive(this);
                    $('article').last().show();
                },
                401: function () {
                    //TODO
                }
            }
        });
    }
    
    /*
    * Sends a GET-Request with search filter inputs
    */
    function searchAd(lake, from, until){
        var url = 'api/ads/search/' + lake + '/' + from + '/' + until;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            statusCode: {
            200: function (data) {  
                showResults(data, lake);
            },
            401: function () {
                //TODO
            }
        }
        });
        
    }

    function isLoggedIn(){
        var tokenString = localStorage.getItem('wakingUp_token');
        return (tokenString != null && tokenString != 'undefined' && tokenString != 'null');
    }
    
    /*
    * Displays the ads according the search filter
    */
    function showResults(data, lake){      
        deleteResults();
        
        //Puts the name of the lake in the title
        var titleResults = '<h4 id=\"searchResults\">Resultate für ' + lake +'</h4';
        $('#results').append(titleResults);
        
        //Iterates through the data and displays in the dropdownmenue
        var dateAd;
        for(i = 0; i<data.length; i++){
            var title = data[i].title;
            var message = data[i].message;
            var email= '';
            //ersetzen durch if (isLoggedIn)
            if (true){email = data[i].user_email;}
            if (dateAd != data[i].date){
               dateAd = data[i].date;
                $('#results').append('<br><h5>' + dateAd+ '</h5>'); 
            }
            var header = '<header class=\"messageStart\"><h5><div class="glyphicon glyphicon-triangle-right"></div> ' + title + '</h5></header>';
            $('#results').append(header + '<div class=\"content\">'+ message + '<br> ' + email+'</div>');
        }
        //Hides content and shows it on click on the title
        $('.content').toggle();
        
        $('.messageStart').on('click', function(){
            $(this).next().toggle();
            if ($(this).next().is(":visible")){
                $(this).find('div').removeClass('glyphicon glyphicon-triangle-right').addClass('glyphicon glyphicon-triangle-bottom');
            } else {
                $(this).find('div').removeClass('glyphicon glyphicon-triangle-bottom').addClass('glyphicon glyphicon-triangle-right');
            }
        })
    }
    
    /*
    * Removes the results of the search 
    */
    function deleteResults(){
        $('#results').empty();
    }
});
