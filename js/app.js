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
        /*if(verifyToken()){
         getMyAds();
         login.find('h4').first().text('Abmelden');
         showMyAdsSection();
         }else{
         switchAccountView(login);
         }
         */


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
        console.log('loginButton clicked');
        tryLoginAuth();
        login.find('h4').first().text('Abmelden');
        emptyForm($('#login'));
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
        emptyForm($('#signUp'));
    });

    $('#myAdsTitle').on('click', function (event) {
        event.preventDefault();
        if (myAds.css("top") == "50px") {
            logOut();
        } else {
            if (verifyToken()) {
                getMyAds();
                /*createAdTable();
                 showMyAdsSection();*/
            } else {
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

    function logOut() {
        login.find('h4').first().text('Anmelden');
        removeToken();
        switchAccountView(login);

    }


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
                        console.log(data);
                        createAdTable(data);
                        login.find('h4').first().text('Abmelden');
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
        } else {
            removeToken();
            switchAccountView(login);
        }

    }


    function createAdTable(data) {

       /* var adTable = "";
        var data2 = [{
            "title": "Suche 2 Personen",
            "lake_name": "Bodensee",
            "message": "Lorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj aLorem Ipsum bla blaa löksdfj a"
        }, {"title": "Suche 2 Personen", "lake_name": "Walensee", "message": "toll"}];
*/

        adTable = '<tr></tr>';

        for (var i = 0; i < data.length; i++) {

            var date =  data[i].date;
            var day = date.substr(8,2);
            var month = date.substr(5,2);
            var year = date.substr(0,4);

            var formattedDate = day + ' - ' + month + ' - ' +year;

            adTable = adTable.concat('<tr><td><h5>' + data[i].title + '</h5></td><td><span class="glyphicon glyphicon-trash"></span></td></tr>' +
                '<tr><td><h5>' + data[i].lake + ' / ' + formattedDate + '</h5></td></tr>' +
                '<tr><td>' + data[i].message + '</td></tr>'
            );
        }

        $('#myAds').find('table').empty().append(adTable);


        /*for (var i = 0; i < data.length; i++) {
            adTable = adTable.concat('<tr><td><h5>' + data[i].title + '</h5></td><td><span class="glyphicon glyphicon-trash"></span></td></tr>' +
                '<tr><td><h5>' + data[i].lake + '</h5></td></tr>' +
                '<tr><td>' + data[i].message + '</td></tr>');
        }

        $('#myAds').find('table').empty().append(adTable);*/

       /* for(var i = 0; i<data.length; i++){
            var title = data[i].title;
            var message = data[i].message;
            var userEmail = data[i].email;
            $('#myAds').append('<header class=\"messageStart\"><h5><div class="glyphicon glyphicon-triangle-right"></div> ' + title + '</h5></header><div class=\"content\">'+ message + '<br> ' + userEmail+'</div>');
        }
        //Hides content and shows it on click on the title
        $('.content').toggle();

        $('.messageStart').on('click', function(){
            $(this).next().toggle();
            if ($(this).next().is(":visible")){
                //alert("sichtbar");
            }
        })*/
    }


    function tryLoginAuth() {


        var loginEmail = $('#login').find('#email-logIn').val();
        var loginPassword = $('#login').find('#pwd-logIn').val();

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
                    createAdTable();
                    showMyAdsSection();
                },
                401: function () {
                    $('#badLoginDetails').removeClass('hidden');
                    switchAccountView(login);

                }
            }

        });
    }

    function trySignUp() {

        var email = $('#signUp').find('#email-signUp').val();
        var pwd = $('#signUp').find('#pwd-signUp').val();

        var validLoginDetails = true;
        if(!validateEmail(email)){
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

        if(validLoginDetails) {

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
    }

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
                    alert('Ungültige Logindaten');
                    switchAccountView(login);

                }
            }

        });


    }


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
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                    window.localStorage.removeItem('wakingUp_token');
                    verified = false;
                }
            });
            return verified;

        } else {
            return false;
        }

    }


    function setToken(token) {

        localStorage.setItem('wakingUp_token', token);
    }

    function removeToken() {
        window.localStorage.removeItem('wakingUp_token');
    }


    function emptyForm(myForm) {
        myForm.find("input[type=email], textarea").val("");
        myForm.find("input[type=password], textarea").val("");

    }

    function hideOldErrorMessages() {
        $('#badLoginDetails').addClass('hidden');
        $('#invalidDetails-signUp').addClass('hidden');

    }


    function validateEmail(email)
    {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
        {
            return true;
        } else {
            return false;
        }
    }




    function sha1(msg) {


        var blockstart;

        var i, j;

        var W = new Array(80);

        var H0 = 0x67452301;

        var H1 = 0xEFCDAB89;

        var H2 = 0x98BADCFE;

        var H3 = 0x10325476;

        var H4 = 0xC3D2E1F0;

        var A, B, C, D, E;

        var temp;


        msg = Utf8Encode(msg);


        var msg_len = msg.length;


        var word_array = new Array();

        for (i = 0; i < msg_len - 3; i += 4) {

            j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |

                msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);

            word_array.push(j);

        }


        switch (msg_len % 4) {

            case 0:

                i = 0x080000000;

                break;

            case 1:

                i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;

                break;


            case 2:

                i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;

                break;


            case 3:

                i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;

                break;

        }


        word_array.push(i);


        while ((word_array.length % 16) != 14) word_array.push(0);


        word_array.push(msg_len >>> 29);

        word_array.push((msg_len << 3) & 0x0ffffffff);


        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {


            for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];

            for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);


            A = H0;

            B = H1;

            C = H2;

            D = H3;

            E = H4;


            for (i = 0; i <= 19; i++) {

                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;

                E = D;

                D = C;

                C = rotate_left(B, 30);

                B = A;

                A = temp;

            }


            for (i = 20; i <= 39; i++) {

                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;

                E = D;

                D = C;

                C = rotate_left(B, 30);

                B = A;

                A = temp;

            }


            for (i = 40; i <= 59; i++) {

                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;

                E = D;

                D = C;

                C = rotate_left(B, 30);

                B = A;

                A = temp;

            }


            for (i = 60; i <= 79; i++) {

                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;

                E = D;

                D = C;

                C = rotate_left(B, 30);

                B = A;

                A = temp;

            }


            H0 = (H0 + A) & 0x0ffffffff;

            H1 = (H1 + B) & 0x0ffffffff;

            H2 = (H2 + C) & 0x0ffffffff;

            H3 = (H3 + D) & 0x0ffffffff;

            H4 = (H4 + E) & 0x0ffffffff;


        }


        temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

        return temp.toLowerCase();

    }


    function rotate_left(n, s) {

        var t4 = ( n << s ) | (n >>> (32 - s));

        return t4;

    }

    function lsb_hex(val) {

        var str = "";

        var i;

        var vh;

        var vl;


        for (i = 0; i <= 6; i += 2) {

            vh = (val >>> (i * 4 + 4)) & 0x0f;

            vl = (val >>> (i * 4)) & 0x0f;

            str += vh.toString(16) + vl.toString(16);

        }

        return str;

    }


    function cvt_hex(val) {

        var str = "";

        var i;

        var v;


        for (i = 7; i >= 0; i--) {

            v = (val >>> (i * 4)) & 0x0f;

            str += v.toString(16);

        }

        return str;

    }

    function Utf8Encode(string) {

        string = string.replace(/\r\n/g, "\n");

        var utftext = "";


        for (var n = 0; n < string.length; n++) {


            var c = string.charCodeAt(n);


            if (c < 128) {

                utftext += String.fromCharCode(c);

            }

            else if ((c > 127) && (c < 2048)) {

                utftext += String.fromCharCode((c >> 6) | 192);

                utftext += String.fromCharCode((c & 63) | 128);

            }

            else {

                utftext += String.fromCharCode((c >> 12) | 224);

                utftext += String.fromCharCode(((c >> 6) & 63) | 128);

                utftext += String.fromCharCode((c & 63) | 128);

            }


        }


        return utftext;

    }

});