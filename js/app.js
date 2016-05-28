/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function(){



    var nav = $('nav').children();
    var weatherButton = nav.first();
    var adButton = nav.first().next();
    var profileButton = nav.last();

    var sections = $('section');
    var weather = sections.first();
    var ad = sections.first().next();
    var profile = sections.last();


    showSection(weather);
    setActive(weatherButton);


//profile
    var loginView = $('#login');
    var myAds = $('#myAds');
    var loginButton = loginView.find('button');
    var signUpView = profile.find('#signUp');
    //var path;

    weatherButton.on('click', function(){
        showSection(weather);
        setActive(this);
    });

    adButton.on('click', function(){
        showSection(ad);
        setActive(this);
    });

    profileButton.on('click', function(event){
        event.preventDefault();
        showSection(profile);
        showView(profile, loginView);
        setActive(this);
        /*path = '/webec/wakingUp/profil';
        history.pushState(null, '', path);*/
    });


    //profile
    loginButton.on('click', function(event){
        event.preventDefault();
        tryLogin();
    })


    $('#login').find('#noAccountYet').on('click', function(event){
        event.preventDefault();
        showView(profile, signUpView);
    })

    $('#login').find('#forgottenPassword').on('click', function(event){
        event.preventDefault();
        showView(profile, profile.find('#lostPasswordInformation'));
    })

    $('#signUp').find('button').on('click', function(event){
        event.preventDefault();
        trySignUp();
    })





});

function setActive(button){
    $('nav').find('button').removeClass("activeButton");
    $(button).addClass("activeButton");

}

function showSection(section){
    $('section').hide();
    section.show();
}

function showView(section, view){
    showSection(section);
    var allViews = section.children();
    allViews.hide();
    view.show();
}

function tryLogin(){
    //checken ob gültige Anmeldedaten
    //todo
    //wenn nicht:
    //todo
    //sonst:
    showView($('section').last(), $('#myAds'));
}

function trySignUp(){
    //neuen Account in die Datenbank schreiben
    showView($('section').last(), $('section').last().find('#newAccountConfirmation'));
}


