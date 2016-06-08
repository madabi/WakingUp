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
        setActive(this);
        getMyAds();


    });


    //profile
    profile.find('#login').find('#loginButton').on('click', function (event) {
        event.preventDefault();
        console.log('loginButton clicked');
        tryLoginAuth();

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
        removeToken();
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

function showRestrictedView(section, view) {

    if(verifyToken()) {
        showSection(section);
        var allViews = section.children();
        allViews.hide();
        view.show();
    }else{
        showView($('#profile'), $('#login'));
    }
}


function getMyAds(){
    var tokenString = localStorage.getItem('wakingUp_token');
    if(tokenString!=null) {
        tokenString = tokenString.substr(0,16);

        var url = 'http://localhost:8080/webec/wakingUp/api/users/ads/' + tokenString;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            statusCode: {
                200: function (data) {
                    console.log(data);
                    createAdTable(data);
                    showView($('#profile'), $('#myAds'));
                },
                401: function () {
                    removeToken();
                    alert('fehler bei authentifizierung');
                    showView($('#profile'), $('#login'));

                },
                418: function () {
                    alert('fehler beim holen der inserate');
                }

            }

        });
    }else{
        removeToken();
        alert('fehler bei authentifizierung');
        showView($('#profile'), $('#login'));
    }

}

function createAdTable(data){

    // für alle ads in data eine neue tabellenreihe zum dom hinzufügen.

}




function tryLoginAuth() {

    var loginEmail = $('#login').find('#email-logIn').val();
    var loginPassword = $('#login').find('#pwd-logIn').val();

    //todo: passwort hashen
    //var hashedPassword = Sha1.hash(loginPassword);

    console.log('inside tryLogin with ' + loginEmail + " and " + loginPassword);

    //checken ob gültige Anmeldedaten
    //todo

    //wenn nicht:
    //todo

    //wenn ja:
    var url = 'http://localhost:8080/webec/wakingUp/api/users/login/'+loginEmail +'/' +loginPassword;
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        statusCode: {
            200: function (data) {
                setToken(data['token']);
                showView($('#profile'), $('#myAds'));
            },
            401: function () {
                alert('Ungültige Logindaten');
                showView($('#profile'), $('#login'));

            }
        }

    });
}

function trySignUp() {

    //checken ob gültige Eingaben
    //todo

    //wenn nicht:
    //todo


    //wenn ja:

    var pwd = $('#signUp').find('#pwd-signUp').val();

    //todo: pwd hashen
    // var hashedPassword = Sha1.hash(pwd);


    var url = 'http://localhost:8080/webec/wakingUp/api/users/signup';
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "email": $('#signUp').find('#email-signUp').val(),
            "password": pwd
        }),
        statusCode: {
            200: function () {
                //Ok, everything worked as expected
                alert('Ihr Account wurde erstellt');
                showView($('#profile'), $('#login'));
            },
            401: function () {
                //Our token is either expired, invalid or doesn't exist
                alert("Es gibt bereits einen Benutzer mit dieser Email-Adresse");
                showView($('#profile'), $('#login'));
            }
        }

    });
}



function verifyToken() {


    var tokenString = localStorage.getItem('wakingUp_token');
    if (tokenString) {
        tokenString = tokenString.substr(0,16);
         var verified = $.ajax({
            url: 'http://localhost:8080/webec/wakingUp/api/users/auth/'+tokenString,
            method: 'GET',

            success: function () {
                verified=true;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
                window.localStorage.removeItem('wakingUp_token');
                verified=false;
            }
        });
        return verified;

    } else {
        return false;
    }

}


function setToken(token){

    localStorage.setItem('wakingUp_token', token);
}

function removeToken(){
    window.localStorage.removeItem('wakingUp_token');
}


