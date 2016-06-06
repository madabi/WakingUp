/**
 * Created by leaboesch on 24.05.16.
 */


jQuery(document).ready(function () {


    var nav = $('nav').children();
    var weatherButton = nav.first();
    var adButton = nav.first().next();
    var profileButton = nav.last();


    var weather = $('#weather');
    var ad = $('#ad');
    var profile = $('#profile');


    showSection(weather);
    setActive(weatherButton);


// Eventhandler

    weatherButton.on('click', function () {
        showSection(weather);
        setActive(this);
    });

    adButton.on('click', function () {
        showSection(ad);
        setActive(this);
    });

    profileButton.on('click', function (event) {
        event.preventDefault();
        showSection(profile);
        showView(profile, $('#login'));
        setActive(this);
        /*path = '/webec/wakingUp/profil';
         history.pushState(null, '', path);*/
    });


    //profile
    profile.find('#login').find('#loginButton').on('click', function (event) {
        event.preventDefault();
        console.log('loginButton clicked');
        tryLogin();

        //todo: werte im formular zurücksetzen
    });

    profile.find('#login').find('#noAccountYetButton').on('click', function (event) {
        event.preventDefault();
        showView($('#profile'), $('#signUp'));
    });

    profile.find('#login').find('#lostPasswordButton').on('click', function (event) {
        event.preventDefault();
        showView(profile, profile.find('#lostPasswordInformation'));
    });

    profile.find('#signUp').find('button').on('click', function (event) {
        event.preventDefault();
        var newEmail = $('#signUp').find('#email-signUp').val();
        var newPassword = $('#signUp').find('#pwd-signUp').val();

        //todo: input validation

        trySignUp();

        //todo: werte im formular zurücksetzen

    });

    profile.find('#newAccountConfirmation').find('button').on('click', function (event) {
        event.preventDefault();
        showSection(profile);
        setActive(profileButton);

    });

    profile.find('#myAds').find('#abmeldeButton').on('click', function (event) {
        event.preventDefault();

        //todo: logout

        showSection(weather);
        setActive(weatherButton);
    });

});


// Hilfsmethoden

function setActive(button) {
    $('nav').find('button').removeClass("activeButton");
    $(button).addClass("activeButton");

}

function showSection(section) {
    $('section').hide();
    section.show();
}

function showView(section, view) {
    showSection(section);
    var allViews = section.children();
    allViews.hide();
    view.show();
}


// Methoden

function tryLogin() {

    var loginEmail = $('#login').find('#email-logIn').val();
    var loginPassword = $('#login').find('#pwd-logIn').val();
    console.log('inside tryLogin with ' + loginEmail + " and " + loginPassword);

    //checken ob gültige Anmeldedaten
    //todo

    //wenn nicht:
    //todo

    //wenn ja:
    var url = 'http://localhost:8080/webec/wakingUp/api/users/login';
    $.ajax({
        url: url + '/' + loginEmail + '/' + loginPassword,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',

        success: function (data) {
            console.log(data);

            showView($('#profile'), $('#myAds'));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}


function tryLoginAuth() {

    var loginEmail = $('#login').find('#email-logIn').val();
    var loginPassword = $('#login').find('#pwd-logIn').val();

    //todo: passwort hashen

    console.log('inside tryLogin with ' + loginEmail + " and " + loginPassword);

    //checken ob gültige Anmeldedaten
    //todo

    //wenn nicht:
    //todo

    //wenn ja:
    var url = 'http://localhost:8080/webec/wakingUp/api/users/login';
    $.ajax({
        url: url,
        type: 'GET',

        dataType: 'json',
        data: JSON.stringify({
            "email": loginEmail,
            "password": loginPassword
        }),
        contentType: 'application/json',

        success: function (data) {
            console.log(data);
            window.localStorage.setItem('wakingUp_token', data);

            showView($('#profile'), $('#myAds'));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

function trySignUp() {

    //checken ob gültige Eingaben
    //todo

    //wenn nicht:
    //todo


    //wenn ja:
    var url = 'http://localhost:8080/webec/wakingUp/api/users/signin';
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "email": $('#signUp').find('#email-signUp').val(),
            "password": $('#signUp').find('#pwd-signUp').val()
        }),

        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        },
        success: function (data) {
            console.log(data);
            alert('Ihr Account wurde erstellt');
            showView($('#profile'), $('#login'));
        }
    });
}


function verifyToken() {

    /*
     * lets assume that your browser can handle "local storage" for the sake of simplicity.
     * You should have saves the token to local storage prior to this.
     *
     * localStorage.token=myApiResult.token
     *
     * myApiResult would be the JSON we received after the login
     *
     **/

    var tokenString = localStorage.getItem('wakingUp_token');
    if(tokenString!=null) {
        $.ajax({
            url: "http://localhost:8080/webec/wakingUp/api/users/auth",
            method: "GET",
            headers: {
                Authorization: tokenString
            },
            statusCode: {
                404: function () {
                    //If the endpoint is not found, we'll end up in here
                    alert("endpoint not found");
                    return false;
                },
                200: function () {
                    //Ok, everything worked as expected
                    alert("worked like a charm");
                    return true;
                },
                401: function () {
                    //Our token is either expired, invalid or doesn't exist
                    alert("token not valid or expired");
                    window.localStorage.removeItem('wakingUp_token');
                    return false;
                }
            }
        });
    }else{
        alert("no token found in the browser");
        return false;

    }

}
