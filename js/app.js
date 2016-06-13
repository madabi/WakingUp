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



    var insertAddButton = $('#btn_add_insert_insert');
    var searchAddButton = $('#btn_add_search_search');

    var openedAdFilterPosition =("calc(100% - 155px)").toString();
    var closedAdFilterPosition ="55px";
    var closedCreateAdPosition= ("calc(100% - 95px)").toString();
    var openedCreateAdPosition="0px";
    
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

    var insertAdSection = $('#ad_insert');
    var searchAdSection = $('#ad_search');
    var adFilterTitle = $('#adFilterTitle');
    var createAdTitle = $('#createAdTitle');
    var adsTitle= $('#adsTitle');


    adFilterTitle.on('click', function(){
        if(searchAdSection.css("top")==closedAdFilterPosition) {
            searchAdSection.css("top", openedAdFilterPosition);
        }else{
            searchWithNewFilter();
            searchAdSection.css("top", closedAdFilterPosition);
        }
    });

    createAdTitle.on('click', function(){
        if(insertAdSection.css("top")==openedCreateAdPosition) {
            insertAdSection.css("top", closedCreateAdPosition);
        }else{
            insertAdSection.css("top", openedCreateAdPosition);
        }
    });


    initAdSection();

    
    weatherButton.on('click', function(){
        showSection(weather);
        setActive(this);
        hideArticles();
        deleteResults();
    });

    adButton.on('click', function(){
       initAdSection();
    });

    profileButton.on('click', function(){
        showSection(profile);
        setActive(this);
        hideArticles();
        deleteResults();
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
            insertAd(lake, inputDate, title, message, 'c4e517ee14cd98f5');
        //}
        
    });

    function initAdSection(){
        prepareLakeList();
        insertAdSection.css("top", closedCreateAdPosition);
        showSection(ad);
        setActive(adButton);
        setTodaysDate();
        searchAd('Bielersee', getCurrentDate().replace(/\//g, ","), '06,30,2017');

    }

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
        return twoDigitMonth + "/" + twoDigitDate +  "/"+currentDate.getFullYear();
    }
    
    function getCurrentDatePlus2Month(){
        var date = new Date();
        var result = date.addMonths(2);
        console.log(result);
    }
    
    
    searchAddButton.on('click', function(e){
        e.preventDefault();
        searchWithNewFilter();
    });




    function hideArticles(){
       // $('article').hide();
    }
    
    function prepareLakeList(){
        for(var key in lakeIDs){
            $('#select_search').append('<option>'+key +'</option>');
            $('#select_insert').append('<option>'+key +'</option>');
        }
    }
    
    function setActive(button){
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }
    
    function showSection(section){
        profile.hide();
        weather.hide();
        ad.hide();
        section.show();
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
                    console.log("inserting ok");
                    //$('#ad_insert').show();
                },
                401: function () {
                    //TODO
                    console.log("Error inserting");
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
        hideFilter();
        deleteResults();

        adsTitle.text("Inserate für den "+lake);
        
        for(var i= 0; i<data.length; i++){

            var adDate = data[i].date;
            var adTitle = data[i].title;
            var adMessage = data[i].message;
            var adContact = data[i].user_email;


            var tableHead = '<tr><th>'+adTitle+'</th></tr>';
            var listOfElement = '<tr><td>'+adDate+'</td></tr>';
            var messageData = '<tr><td>'+adMessage+'</td></tr>';
            var contactData = '<tr><td>'+adContact+'</td></tr>';
            
            var table = '<li><table>'+tableHead +listOfElement+messageData + contactData +'</table></li>';

            $('#resultList').append(table);
        }
    }
    
    /*
    * Removes the results of the search 
    */
    function deleteResults(){
        $('#resultList').empty();
    }
    function hideFilter(){
        searchAdSection.css("top", closedAdFilterPosition);
    }
    function searchWithNewFilter(){
        var lake = $('#select_search :selected').text();
        var fromDate =  $('#datepicker_from').val().replace(/\//g, ",");
        var untilDate = $('#datepicker_until').val().replace(/\//g, ",");
        //Logs
        console.log(lake);
        console.log(fromDate);
        console.log(untilDate);
        searchAd(lake, fromDate, untilDate);
    }
});
