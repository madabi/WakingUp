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
       switchToProfile();
    });

    $('#accountTitle').on('click', function (event) {
        event.preventDefault();
        if ($(this).text() == "Abmelden") {
            logOut();
            setAccountViewTitle('Anmelden');
        } else {
            switchToAccountView(login);
        }
        hideOldErrorMessages();
    });


    $('#lostPasswordTitle').on('click', function (event) {
        event.preventDefault();
        switchToAccountView(lostPasswordInfo);
    });


    $('#createAccountTitle').on('click', function (event){
        event.preventDefault();
        switchToAccountView(signUp);
        hideOldErrorMessages();
    });


    $('#loginButton').on('click', function (event) {
        event.preventDefault();
        tryLoginAuth();
    });


    $('#noAccountYetButton').on('click', function (event) {
        event.preventDefault();
        emptyForm($('#signUp'));
        switchToAccountView(signUp);
    });


    $('#lostPasswordButton').on('click', function (event) {
        event.preventDefault();
        switchToAccountView(lostPasswordInfo);
    });


    $('#signUpButton').on('click', function (event) {
        event.preventDefault();
        trySignUp();
    });


    $('#myAdsList').on('click', '.glyphicon-trash', function (event) {
        event.preventDefault();
        var source = $(event.srcElement || event.target);
        var adIdToDelete = source.closest('li').attr('id');
        deleteAd(adIdToDelete);
    });


    $('#myAdsTitle').on('click', function (event) {
        event.preventDefault();
        emptyForm($('#login'));
        if (myAds.css("top") == "50px") {
            logOut();
        } else {
            if (verifyToken()) {
                getMyAds();
                moveUpMyAdsView();
            } else {
                $('#myAds').find('li').remove();
                $('#myAdsList').append($('<li><span id="notLoggedInIcon" class="glyphicon glyphicon-log-in" aria-hidden="true"></span></li>' +
                    '<li id="pleaseLogIn">Bitte logge dich ein.</li>'));
                moveUpMyAdsView();
            }
        }
    });




  // ------- Methoden -----------------



    function showSection(section) {
        weather.hide();
        ad.hide();
        profile.hide();
        section.show();
        section.children().show();
    }


    function moveUpMyAdsView() {
        myAds.css("top", ("50px"));
    }


    function setActive(button) {
        $('nav').find('button').removeClass("activeButton");
        $(button).addClass("activeButton");

    }


    function switchToProfile(){
        hideOldErrorMessages();
        showSection(profile);
        if (verifyToken()) {
            setAccountViewTitle('Abmelden');
            getMyAds();
        } else {
            showPleaseLoginIcon();
            setAccountViewTitle('Anmelden');
            switchToAccountView(login);
        }
        setActive($('#btn_profile'));
    }


    function switchToAccountView(view) {
        myAds.css("top", ("85%"));
        account.find('section').hide();
        view.show();
    }


    function setAccountViewTitle(title) {
        login.find('h4').first().text(title);
    }


    /**
     * Loggt den Benutzer aus
     */
    function logOut(){
        removeToken();
        login.find('h4').first().text('Anmelden');
        switchToAccountView(login);
    }


    function showPleaseLoginIcon(){
        $('#myAds').find('li').remove();
        $('#myAdsList').append($('<li><span id="notLoggedInIcon" class="glyphicon glyphicon-log-in" aria-hidden="true"></span></li>' +
            '<li id="pleaseLogIn">Bitte logge dich ein.</li>'));
    }


    function showNoMessagesIcon(){
        $('#myAds').find('li').remove();
         $('#myAdsList').append($('<li><span id="noContentIcon" class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></li>' +
                '<li id="noContentText">Du hast noch keine Inserate erstellt.</li>'));
    }

    /*
     *  Inserate des eingeloggten Users laden und anzeigen
     */
    function getMyAds() {
        var tokenString = localStorage.getItem('wakingUp_token');
        if (tokenString !== null && tokenString != 'undefined' && tokenString != 'null') {
            var url = 'api/users/ads/' + tokenString;
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                contentType: 'application/json',
                statusCode: {
                    200: function (data) {
                        createAdTable(data);
                    },
                    401: function () {
                        removeToken();
                        showPleaseLoginIcon();
                        switchToAccountView(login);
                    }
                }
            });
        } else {
            removeToken();
            switchToAccountView(login);
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
        emptyForm($('#login'));

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
                    setAccountViewTitle('Abmelden');
                    moveUpMyAdsView();
                },
                401: function () {
                    $('#badLoginDetails').removeClass('hidden');
                }
            }
        });
    }


    /*
     *  Erstellen eines neuen Accounts
     */
    function trySignUp() {

        var email = $('#signUp').find('#email-signUp').val();
        var pwd = $('#signUp').find('#pwd-signUp').val();
        var invalidDetails = $('#invalidDetails-signUp');

        var validLoginDetails = true;
        if (!validateEmail(email)) {
            invalidDetails.text('Bitte geben Sie eine gültige Email-Adresse an');
            invalidDetails.removeClass('hidden');
            $('#email-signUp').text('');
            validLoginDetails = false;
        } else if (pwd.length < 8 || pwd.length > 20) {
            invalidDetails.text('Das Passwort muss eine Länge von 8-20 Zeichen haben');
            invalidDetails.removeClass('hidden');
            $('#pwd-signUp').text('');
            validLoginDetails = false;
        }

        if (validLoginDetails) {

            invalidDetails.addClass('hidden');

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
                        setAccountViewTitle('Abmelden');
                        getMyAds();
                        switchToAccountView(login);
                        moveUpMyAdsView();
                    },
                    401: function () {
                        invalidDetails.text('Es gibt bereits einen Benutzer mit dieser Adresse');
                        invalidDetails.removeClass('hidden');
                    }
                }
            });
            emptyForm($('#signUp'));
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
                },
                401: function () {
                    switchToAccountView(login);
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



    /*
     *  Inserat löschen
     *
     *  @param adId: id des Inserats
     */
    function deleteAd(adId) {
        var tokenString = localStorage.getItem('wakingUp_token');
        if (tokenString !== null && tokenString != 'undefined' && tokenString != 'null') {

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

});