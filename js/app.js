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

    var account =  $('#account');
    var login = $('#login');
    var signUp = $('#signUp');
    var lostPasswordInfo = $('#lostPasswordInformation');
    var myAds = $('#myAds');

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
       // event.preventDefault();
        showSection(profile);

        account.show();
        myAds.show();
        setActive(this);

        if(verifyToken()){
            getMyAds();
            login.find('h4').first().text('Abmelden');
            showMyAdsSection();
        }else{
            switchAccountView(login);
        }



    });


    $('#accountTitle').on('click', function (event) {
        event.preventDefault();
        if($(this).text()=="Abmelden") {
          logOut();
        }else{
            switchAccountView(login);
        }


        //todo: werte im formular zurücksetzen
    });
    //profile
    $('#loginButton').on('click', function (event) {
        event.preventDefault();
        console.log('loginButton clicked');
        tryLoginAuth();
        login.find('h4').first().text('Abmelden');

        //todo: werte im formular zurücksetzen
    });

    $('#noAccountYetButton').on('click', function (event) {
        event.preventDefault();
        switchAccountView(signUp);
    });

    $('#lostPasswordButton').on('click', function (event) {
        event.preventDefault();
        switchAccountView(lostPasswordInfo);
    });

    $('#signUpButton').on('click', function (event) {
        event.preventDefault();
        //todo: input validation

        trySignUp();

        //todo: werte im formular zurücksetzen
    });
    $('#myAdsTitle').on('click', function (event) {
        event.preventDefault();
        if(myAds.css("top") == "50px"){
            logOut();
        }else{
            if(verifyToken()){
                getMyAds();
                /*createAdTable();
                showMyAdsSection();*/
            }else{
                myAds.find('table').empty().append('<tr><td><span id="noContentIcon" class="glyphicon glyphicon-log-in" aria-hidden="true"></span></td></tr>+' +
                    '<tr><td id="pleaseLogIn">Bitte logge dich ein.</td></tr>');
                showMyAdsSection();
            }
        }
    });

    profile.find('#newAccountConfirmation').find('button').on('click', function (event) {
        event.preventDefault();
        showSection(profile);
        setActive(profileButton);

    });


    function showSection(section){
        weather.hide();
        ad.hide();
        profile.hide();
        section.show();
        section.children().show();
    }


    function showMyAdsSection(){
        myAds.css("top", ("50px"));
    }

// Hilfsmethoden



function setActive(button) {
    $('nav').find('button').removeClass("activeButton");
    $(button).addClass("activeButton");

}


function switchAccountView(view) {
    myAds.css("top", ("85%"));
    account.find('section').hide();
    view.show();
}

    function logOut(){
        login.find('h4').first().text('Anmelden');
        removeToken();
        switchAccountView(login);

}

function showRestrictedView(section, view) {

    if(verifyToken()) {
        showSection(section);
        var allViews = section.children();
        allViews.hide();
        view.show();
    }else{
        switchAccountView(login);
    }
}


function getMyAds(){
    var tokenString = localStorage.getItem('wakingUp_token');
    if(tokenString!=null && tokenString!='undefined' && tokenString!='null') {
        var url = 'api/users/ads/' + tokenString;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            statusCode: {
                200: function (data) {
                    console.log(data);
                    createAdTable();
                    showMyAdsSection();

                },
                401: function () {
                    removeToken();
                    alert('fehler bei authentifizierung');
                    switchAccountView(login);

                },
                418: function () {

                    switchAccountView(login);
                    //showSection($('#profile'));
                    //switchAccountView($('#profile'), $('#myAds'));
                    //alert('fehler beim holen der inserate');
                }
            }
        });
    }else{
        removeToken();
        switchAccountView(login);
    }

}



function createAdTable(){

    var adTable = "";
    var data2= [{"title": "Suche 2 Personen", "lake_name": "Bodensee", "message":"Lorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj a"},{"title": "Suche 2 Personen","lake_name": "Walensee", "message":"toll"}];

    for(var i=0; i<data2.length;i++){
        adTable = adTable.concat('<tr><td><h5>'+data2[i].title+'</h5></td><td><span class="glyphicon glyphicon-trash"></span></td></tr>'+
            '<tr><td><h5>'+data2[i].lake_name+'</h5></td></tr>'+
            '<tr><td>'+data2[i].message+'</td></tr>');
    }

    $('#myAds').find('table').empty().append(adTable);
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
    var url = 'api/users/login/'+loginEmail +'/' +loginPassword;
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        statusCode: {
            200: function (data) {
                setToken(data['token']);
                createAdTable();
                showMyAdsSection();
            },
            401: function () {
                alert('Ungültige Logindaten');
                switchAccountView(login);

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
    var email = $('#signUp').find('#email-signUp').val();

    //todo: pwd hashen
    // var hashedPassword = Sha1.hash(pwd);


    var url = 'api/users/signup';
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "email": email,
            "password": pwd
        }),
        statusCode: {
            200: function (data) {
                //Ok, everything worked as expected
                alert('Ihr Account wurde erstellt');
                directLoginAuth(email, pwd);
                showMyAdsSection();
            },
            401: function () {
                //Our token is either expired, invalid or doesn't exist
                alert("Es gibt bereits einen Benutzer mit dieser Email-Adresse");
                switchAccountView(login);
            }
        }

    });
}

function directLoginAuth(email, password){
    var url = 'api/users/login/'+email +'/' +password;
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        statusCode: {
            200: function (data) {
                setToken(data['token']);
                showMyAdsSection();
            },
            401: function () {
                alert('Ungültige Logindaten');
                switchAccountView(login);

            }
        }

    });



}



function verifyToken() {


    var tokenString = localStorage.getItem('wakingUp_token');
    if (tokenString) {
        tokenString = tokenString.substr(0,16);
         var verified = $.ajax({
            url: 'api/users/auth/'+tokenString,
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

});
