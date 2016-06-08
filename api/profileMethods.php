<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 03.06.16
 * Time: 21:49
 */

/*
 * Anfrage für PDO Database Connection
 *
 */
function getDBConnection($connectionString, $user, $password)
{
    try {
        return new PDO($connectionString, $user, $password);
    } catch (PDOException $e) {
        echo $e->getMessage();
        exit('Keine Verbindung. Grund: ' . $e->getMessage());
    }
}


/*
 * Neuen Account erstellen
 *
 * @param $app
 */
function SignUp($app)
{
    $user = getJSONFromBody($app);
    var_dump($user);

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);

    //todo: Schutz vor SQL-Injections?

    $selection = $db->prepare('SELECT * FROM wakingUp.users WHERE email=:email AND password=:password');

    $selection->bindParam(':email', $user['email'], PDO::PARAM_STR);
    $selection->bindParam(':password', $user['password'], PDO::PARAM_STR);


    $selection->execute();
    $selection->fetchAll();

    if ($selection->rowCount() > 0) {
        echo('user already exists');
        responseWithStatus($app, 401);

    } else {
        echo("new user can be created");


        $longToken = bin2hex(openssl_random_pseudo_bytes(16));
        $token = substr($longToken, 0, 16);
        $tokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));


        $insertion = $db->prepare('INSERT INTO wakingUp.users (email, password, token, token_expire) VALUES (:email, :password, :token, :token_expire)');
        $insertion->bindParam(':email', $user['email'], PDO::PARAM_STR);
        $insertion->bindParam(':password', $user['password'], PDO::PARAM_STR);
        $insertion->bindParam(':token', $token, PDO::PARAM_STR);
        $insertion->bindParam(':token_expire', $tokenExpiration);

        $returnToken['token'] = $token;

        if ($insertion->execute()) {

            echo('new user has been created');

        } else {
            echo('could not write new user into database');
            //todo: was zurückgeben?
        }

    }
    $db = null;
}




/**
 * Utility-Funktionen für die Ausgabe zum aufrufenden Client.
 *
 */
function response($app, $result)
{
    $app->response->headers->set('Content-Type', 'application/json');
    $app->response->setBody(json_encode($result));
}


function responseWithStatus($app, $status){
    $app->response->setStatus($status);
}

function responseTokenWithStatus($app, $token, $status)
{
    $app->response->setStatus($status);
    $app->response->headers->set('Content-Type', 'application/json');
    $app->response->setBody(json_encode($token));
}



/**
 * Utility um Daten vom Request-Body als JSON zu erhalten.
 */
function getJSONFromBody($app)
{
    $json = $app->request->getBody();
    return json_decode($json, true);
}



/**
 * Loginfunktion. Überprüft email & Passwort.
 * Setzt ein Token in der Datenbank und schickt dasselbe Token zurück
 *
 *
 * @param $app
 * @param $email
 * @param $password
 */
function loginAuth($app, $email, $password) {

    if (validateUser($app, $email, $password)) {
        $longToken = bin2hex(openssl_random_pseudo_bytes(16));
        $return['token'] = substr($longToken, 0, 16);
        $tokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $tokenSet = setToken($email, $return['token'], $tokenExpiration);
        if($tokenSet){responseTokenWithStatus($app, $return, 200);
        }else {
            responseWithStatus($app, 401);
        }
    }else {
        responseWithStatus($app, 401);
    }
}



/**
 *
 * Hilfsmethode für loginAuth()
 *
 * @param $app
 * @param $user
 * @return bool
 */
function validateUser($app, $email, $password){

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);
    $validateUser = 'SELECT * FROM wakingUp.users WHERE email=:email AND password=:password';
    $validateUser = $db->prepare($validateUser);
    $validateUser->bindParam(':email', $email);
    $validateUser->bindParam(':password', $password);
    if ($validateUser->execute()) {
        $validateUser->fetchAll(PDO::FETCH_ASSOC);
        if ($validateUser->rowCount() == 1) {
            $db =null;
            return true;
        } else {
            $db =null;
            return null;
        }
    } else {
        $db =null;
        $app->halt(500, "Error in quering database.");
    }
}


/**
 * Erneuert das Verfalldatum des Tokens in der Datenbank oder setzt ein neues Token.
 *
 *
 * @param $email
 * @param $token
 * @param $tokenExpiration
 * @return bool
 */
function updateToken($email, $tokenExpiration){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);
    $update = $db->prepare('UPDATE wakingUp.users SET token_expire=:token_expire WHERE email=:email');
    $update->bindParam(':token_expire', $tokenExpiration);
    $update->bindParam(':email', $email, PDO::PARAM_STR);

    if ($update->execute()) {
        $db = null;

        return true;

    } else {
        $db = null;

        return false;
    }

}


function setToken($email, $token, $tokenExpiration){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);
    $update = $db->prepare('UPDATE wakingUp.users SET token=:token, token_expire=:token_expire WHERE email=:email');
    $update->bindParam(':token', $token);
    $update->bindParam(':token_expire', $tokenExpiration);
    $update->bindParam(':email', $email, PDO::PARAM_STR);

    if ($update->execute()) {
        $db = null;

        return true;

    } else {
        $db = null;

        return false;
    }

}


/**
 * Gibt die Inserate eines bestimmten (zu $token gehörenden) Users zurück
 *
 *
 * @param $app
 * @param $token
 */
function getMyAds($app, $token){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);
    $getUser = $db->prepare('SELECT * FROM wakingUp.users WHERE token=:token');
    $getUser->bindParam(':token', $token, PDO::PARAM_STR);
    if ($getUser->execute()) {
        $getUser->fetchAll(PDO::FETCH_ASSOC);
        foreach($getUser as $user) {
            $user_email = $user[2];
        }
            $ads = $db->prepare('SELECT * FROM wakingUp.ads WHERE user_email=:user_email');
            $ads->bindParam(':user_email', $user_email);
            if($ads->execute()) {
                $ads->fetchAll(PDO::FETCH_ASSOC);
                $db = null;
                $return_arr = array();
                $index = 0;
                foreach($ads as $ad) {
                    $return_arr[$index] = $ad;
                    $index++;
                }

                response($app, $return_arr);
            }else{
                responseWithStatus($app, 418);
            }
    }else {
        $db = null;

        responseWithStatus($app, 418);
    }
}


/**
 * Erstellt Test-Inserate. Wird noch entfernt
 */
function createRandomAd(){

    $title = 'myTitle';
    $message = 'myMessage blablabla';
    $email = 'lea@lea.com';

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);
    $insertion = $db->prepare('INSERT INTO wakingUp.ads (title, message, user_email) VALUES (:title, :message, :user_email)');
    $insertion->bindParam(':title', $title, PDO::PARAM_STR);
    $insertion->bindParam(':message', $message, PDO::PARAM_STR);
    $insertion->bindParam(':user_email', $email, PDO::PARAM_STR);

    if ($insertion->execute()) {

        echo('new ad has been created');

    } else {
        echo('could not write new user into database');
        //todo: was zurückgeben?
    }

    $db = null;

}


/**
 * Überprüft Gültigkeit des übergebenen Tokens
 *
 *
 * @param $app
 * @param $tokenToVerify
 * @return bool
 */
function verifyToken($app, $tokenToVerify){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', db_username, db_password);
    $selection = 'SELECT * FROM wakingUp.users WHERE token=:token';
    $selection = $db->prepare($selection);
    $selection->bindParam(':token', $tokenToVerify);
    if ($selection->execute()) {
        $selection->fetchall(PDO::FETCH_ASSOC);
        if ($selection->rowCount() > 0) {
            $token_expire = date('Y-m-d H:i:s', strtotime('now'));
            $myEmail = '';
            foreach($selection as $user){
               $token_expire = $user['token_expire'];
                $myEmail = $user['email'];
            }
            $dateNow = date('Y-m-d H:i:s', strtotime('now'));
            if(strtotime($token_expire) > $dateNow){
                $newTokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
                updateToken($myEmail, $newTokenExpiration);
                $db = null;
                return true;
            }

        }
    } else {
        $app->halt(500, "Error in quering database.");
    }
    $db = null;
    return false;

}







/*
function getUserById($id)
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selection = $db->prepare('SELECT * FROM users where id=:id');
    $selection->bindParam(':id', $id);
    $selection->execute();
    $result = $selection->fetch();
    return $result;
}

/*
/**
 *
 * Nur zum Ausprobieren
 *
 * @param $id

function deleteUserById($id)
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $deletion = $db->prepare('DELETE FROM users where id=:id');
    $deletion->bindParam(':id', $id);
    $deletion->execute();
}


*/
/**
 *
 * Nur zum Ausprobieren
 *
 * @return array

function getAllUsers()
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selection = $db->prepare('SELECT * FROM wakingUp.users');
    $selection->execute();
    $result = $selection->fetchAll();
    foreach ($result as $user) {
        echo($user[1]);
        echo(' ');
    }
    return $result;
    // var_dump($result);
}
*/


