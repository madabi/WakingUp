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

    var account = $('#account');
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
        hideOldErrorMessages();
        // event.preventDefault();
        showSection(profile);

        account.show();
        myAds.show();
        setActive(this);
        getMyAds();
    });


    $('#accountTitle').on('click', function (event) {
        event.preventDefault();
        if ($(this).text() == "Abmelden") {
            logOut();
        } else {
            switchAccountView(login);
        }


        //todo: werte im formular zurücksetzen
    });
    //profile
    $('#loginButton').on('click', function (event) {
        event.preventDefault();
        if (tryLoginAuth()) {
            showLoggedInAccountView();
        }
        emptyForm($('#login'));
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
        trySignUp();
        emptyForm($('#signUp'));
    });

    $('#myAdsList').on('click', '.glyphicon-trash', function (event) {
        event.preventDefault();
        var source = $(event.srcElement || event.target);
        var adIdToDelete = source.closest('li').attr('id');
        deleteAd(adIdToDelete);
    });

    $('#myAdsTitle').on('click', function (event) {
        event.preventDefault();
        if (myAds.css("top") == "50px") {
            logOut();
        } else {
            if (verifyToken()) {
                getMyAds();
            } else {
                $('#myAds').find('li').remove();
                    $('#myAdsList').append($('<li><span id="notLoggedInIcon" class="glyphicon glyphicon-log-in" aria-hidden="true"></span></li>' +
                        '<li id="pleaseLogIn">Bitte logge dich ein.</li>'));
                showMyAdsSection();
            }
        }
    });

    profile.find('#newAccountConfirmation').find('button').on('click', function (event) {
        event.preventDefault();
        showSection(profile);
        setActive(profileButton);

    });


    function showSection(section) {
        weather.hide();
        ad.hide();
        profile.hide();
        section.show();
        section.children().show();
    }


    function showMyAdsSection() {
        myAds.css("top", ("50px"));
    }


    function setActive(button) {
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }


    function switchAccountView(view) {
        myAds.css("top", ("85%"));
        account.find('section').hide();
        view.show();
    }

    function logOut() {
        login.find('h4').first().text('Anmelden');
        removeToken();
        switchAccountView(login);
    }

    function showLoggedInAccountView() {
        login.find('h4').first().text('Abmelden');
    }


    /*
     *  Inserat löschen
     *
     *  @param adId: id des Inserats
     */
    function deleteAd(adId) {
        var tokenString = localStorage.getItem('wakingUp_token');
        if (tokenString != null && tokenString != 'undefined' && tokenString != 'null') {

            var url = 'api/ads/' + adId + '/' + tokenString;
            $.ajax({
                url: url,
                type: 'DELETE',
                success: function () {
                    getMyAds();
                },
                error: function () {
                    $('#deleteError').toggleClass('hidden', false);
                    getMyAds();
                }
            });
        }
    }


    /*
     *  Inserate des eingeloggten Users laden und anzeigen
     */
    function getMyAds() {
        var tokenString = localStorage.getItem('wakingUp_token');
        if (tokenString != null && tokenString != 'undefined' && tokenString != 'null') {
            var url = 'api/users/ads/' + tokenString;
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                statusCode: {
                    200: function (data) {
                        showLoggedInAccountView();
                        createAdTable(data);
                        showMyAdsSection();

                    },
                    401: function () {
                        removeToken();
                        switchAccountView(login);

                    },
                    418: function () {
                        switchAccountView(login);
                    }
                }
            });
        } else {
            removeToken();
            switchAccountView(login);
        }

    }

    /*
     *  Dynamisches Erzeugen und Anzeigen der Liste der Inserate
     *
     *  @param data: Json-Daten der Inserate
     */
    function createAdTable(data) {

        $('#myAds').find('li').remove();

        if (data.length == undefined || data.length == 0) {
            $('#myAdsList').append($('<li><span id="noContentIcon" class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></li>' +
                '<li id="noContentText">Du hast noch keine Inserate erstellt.</li>'));
        } else {

            for (var i = 0; i < data.length; i++) {

                var date = data[i].date;
                var day = date.substr(8, 2);
                var month = date.substr(5, 2);
                var year = date.substr(0, 4);

                var adTable = $('<table></table>');
                var newListElement = $('<li id="' + data[i].id + '"></li>');
                var formattedDate = day + ' - ' + month + ' - ' + year;

                adTable = adTable.append($('<tr><td><h5>' + data[i].title + '</h5></td><td><span class="glyphicon glyphicon-trash"></span></td></tr>' +
                    '<tr><td><h5>' + data[i].lake + ' / ' + formattedDate + '</h5></td></tr>' +
                    '<tr><td>' + data[i].message + '</td></tr>'
                ));

                newListElement.append(adTable);

                $('#myAdsList').append(newListElement);
            }
        }
    }


    /*
     *  Loginfunktion
     *
     *  @return boolean
     */
    function tryLoginAuth() {

        var loginEmail = $('#login').find('#email-logIn').val();
        var loginPassword = $('#login').find('#pwd-logIn').val();

        var loginSuccessful = false;

        var hashedPassword = sha1(loginPassword);
        hashedPassword.substr(0, 45);

        var url = 'api/users/login/' + loginEmail + '/' + hashedPassword;
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            statusCode: {
                200: function (data) {
                    setToken(data['token']);
                    getMyAds();
                    loginSuccessful = true;
                },
                401: function () {
                    $('#badLoginDetails').removeClass('hidden');
                    switchAccountView(login);
                }
            }
        });
        return loginSuccessful;
    }


    /*
     *  Erstellen eines neuen Accounts
     */
    function trySignUp() {

        var email = $('#signUp').find('#email-signUp').val();
        var pwd = $('#signUp').find('#pwd-signUp').val();

        var validLoginDetails = true;
        if (!validateEmail(email)) {
            $('#invalidDetails-signUp').text('Bitte geben Sie eine gültige Email-Adresse an');
            $('#invalidDetails-signUp').removeClass('hidden');
            $('#email-signUp').text('');
            validLoginDetails = false;
        } else if (pwd.length < 8 || pwd.length > 20) {
            $('#invalidDetails-signUp').text('Das Passwort muss eine Länge von 8-20 Zeichen haben');
            $('#invalidDetails-signUp').removeClass('hidden');
            $('#pwd-signUp').text('');
            validLoginDetails = false;
        }

        if (validLoginDetails) {

            $('#invalidDetails-signUp').addClass('hidden');

            var hashedPassword = sha1(pwd);
            hashedPassword.substr(0, 45);

            var url = 'api/users/signup';
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "email": email,
                    "password": hashedPassword
                }),
                statusCode: {
                    200: function (data) {
                        directLoginAuth(email, pwd);
                        showLoggedInAccountView();
                        getMyAds();
                        switchAccountView(login);
                        showMyAdsSection();
                    },
                    401: function () {
                        $('#invalidDetails-signUp').text('Es gibt bereits einen Benutzer mit dieser Adresse');
                        $('#invalidDetails-signUp').removeClass('hidden');
                        emptyForm($('#signUp'));
                    }
                }
            });
        }
    }


    /*
     *  Loggt den Benutzer direkt ein.
     *
     *  @param email: Email-Adresse des Benutzers
     *  @param password: Passwort des Benutzers
     */
    function directLoginAuth(email, password) {
        var hashedPassword = sha1(password);
        hashedPassword.substr(0, 45);

        var url = 'api/users/login/' + email + '/' + hashedPassword;
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
                    switchAccountView(login);
                }
            }
        });
    }


    /*
     * Überprüft, ob im Browser-Local Storage ein gültiges Token vorhanden ist.
     *
     * @return boolean
     */
    function verifyToken() {

        var tokenString = localStorage.getItem('wakingUp_token');
        if (tokenString) {
            tokenString = tokenString.substr(0, 16);
            var verified = $.ajax({
                url: 'api/users/auth/' + tokenString,
                method: 'GET',

                success: function () {
                    verified = true;
                },
                error: function () {
                    window.localStorage.removeItem('wakingUp_token');
                    verified = false;
                }
            });
            return verified;

        } else {
            return false;
        }
    }


    /*
     *  Schreibt ein Token in den Local Storage des Browsers
     *
     *  @param token: Zu setzendes Token
     */
    function setToken(token) {

        localStorage.setItem('wakingUp_token', token);

    }


    /*
     *  Löscht das Token aus dem Local Storage des Browsers
     */
    function removeToken() {

        window.localStorage.removeItem('wakingUp_token');

    }

    /*
     *  Leert ein Formular nach dem Submit
     *  @param myForm: das betreffende Formular
     */
    function emptyForm(myForm) {
        myForm.find("input[type=email], textarea").val("");
        myForm.find("input[type=password], textarea").val("");

    }


    /*
     *  Versteckt vergangene Fehlermeldungen
     */
    function hideOldErrorMessages() {
        $('#badLoginDetails').addClass('hidden');
        $('#invalidDetails-signUp').addClass('hidden');
        $('#deleteError').addClass('hidden');
    }


    /*
     *  Überprüft eingegebene Email-Adressen auf deren Gültigkeit
     *
     *  @param email: zu überprüfende Email-Adresse
     *  @return boolean
     */
    function validateEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) && email.length < 45) {
            return true;
        } else {
            return false;
        }
    }

});