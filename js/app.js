/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function(){

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

    showSection(weather);
    initWeather();
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


    function initWeather(){
        gauge1 = loadLiquidFillGauge("fillgauge1", 35);
        var config1 = liquidFillGaugeDefaultSettings();
    }

    function NewValue() {
        if (Math.random() > .5) {
            return Math.round(Math.random() * 100);
        } else {
            return (Math.random() * 100).toFixed(1);
        }
    }

});




