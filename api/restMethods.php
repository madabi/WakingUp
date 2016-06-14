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


/**
 * Löscht Inserat mit id $id
 *
 * @param $app
 * @param $id
 */
function deleteAd($app, $id)
{
    $db = getDBConnection(myDatabase, db_username, db_password);
    $id = intval($id);
    $deletion = $db->prepare('DELETE FROM wakingUp.pinboard WHERE id=:id');
    $deletion->bindParam(':id', $id, PDO::PARAM_INT);
    if ($deletion->execute()) {
        responseWithStatus($app, 200);
    } else {
        responseWithStatus($app, 400);
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
    $db = getDBConnection(myDatabase, db_username, db_password);
    $selection = $db->prepare('SELECT * FROM wakingUp.users WHERE email=:email');
    $selection->bindParam(':email', $user['email'], PDO::PARAM_STR);
    if ($selection->execute()) {
        $selection->fetchAll(PDO::FETCH_ASSOC);
        if ($selection->rowCount() > 0) {
            echo('user already exists');
            responseWithStatus($app, 401);
        } else {
            echo("new user can be created");
            $longToken = bin2hex(openssl_random_pseudo_bytes(16));
            $token = substr($longToken, 0, 16);
            $tokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
            $insertion = $db->prepare('INSERT INTO wakingUp.users (email, password, token, token_expire)
VALUES (:email, :password, :token, :token_expire)');
            $insertion->bindParam(':email', $user['email'], PDO::PARAM_STR);
            $insertion->bindParam(':password', $user['password'], PDO::PARAM_STR);
            $insertion->bindParam(':token', $token, PDO::PARAM_STR);
            $insertion->bindParam(':token_expire', $tokenExpiration);
            if ($insertion->execute()) {
                responseWithStatus($app, 200);
            } else {
                responseWithStatus($app, 401);
            }
        }
    } else {
        responseWithStatus($app, 401);
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

function responseWithStatus($app, $status)
{
    $app->response->setStatus($status);
}

function responseTokenWithStatus($app, $token, $status)
{
    $app->response->setStatus($status);
    $app->response->headers->set('Content-Type', 'application/json');
    $app->response->setBody(json_encode($token));
}


/**
 * Utility, um Daten vom Request-Body als JSON zu erhalten.
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
function loginAuth($app, $email, $password)
{
    if (validateUser($app, $email, $password)) {
        $longToken = bin2hex(openssl_random_pseudo_bytes(16));
        $return['token'] = substr($longToken, 0, 16);
        $tokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $tokenSet = setToken($email, $return['token'], $tokenExpiration);
        if ($tokenSet) {
            responseTokenWithStatus($app, $return, 200);
        } else {
            responseWithStatus($app, 401);
        }
    } else {
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
function validateUser($app, $email, $password)
{
    $db = getDBConnection(myDatabase, db_username, db_password);
    $validateUser = 'SELECT * FROM wakingUp.users WHERE email=:email AND password=:password';
    $validateUser = $db->prepare($validateUser);
    $validateUser->bindParam(':email', $email);
    $validateUser->bindParam(':password', $password);
    if ($validateUser->execute()) {
        $validateUser->fetchAll(PDO::FETCH_ASSOC);
        if ($validateUser->rowCount() == 1) {
            $db = null;
            return true;
        } else {
            $db = null;
            return null;
        }
    } else {
        $db = null;
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
function updateToken($email, $tokenExpiration)
{
    $db = getDBConnection(myDatabase, db_username, db_password);
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


/**
 *
 *  Schreibt ein Token in die Datenbank
 *
 * @param $email
 * @param $token
 * @param $tokenExpiration
 * @return bool
 */
function setToken($email, $token, $tokenExpiration)
{
    $db = getDBConnection(myDatabase, db_username, db_password);
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
 * @param $app
 * @param $token
 */
function getMyAds($app, $token)
{
    $userEmail = getUserEmail($token);
    if ($userEmail) {
        $db = getDBConnection(myDatabase, db_username, db_password);
        $findAds = $db->prepare('SELECT * FROM wakingUp.pinboard WHERE userEmail=:userEmail ORDER BY date ASC');
        $findAds->bindParam(':userEmail', $userEmail, PDO::PARAM_STR);
        if ($findAds->execute()) {
            $result = $findAds->fetchAll(PDO::FETCH_ASSOC);

            if ($findAds->rowCount() > 0) {
                $ads = array();
                foreach ($result as $ad) {
                    $ads[] = array(
                        'id' => $ad['id'],
                        'title' => $ad['title'],
                        'message' => $ad['message'],
                        'date' => $ad['date'],
                        'lake' => $ad['lake'],
                        'userEmail' => $ad['userEmail']
                    );
                }
                $db = null;
                response($app, $ads);
            } else {
                $db = null;
                responseWithStatus($app, 420);
            }
        } else {
            $db = null;
            responseWithStatus($app, 421);
        }
    } else {
        responseWithStatus($app, 422);
    }
}


/**
 * Gibt die email-Adresse des zu $token gehörenden Users zurück
 *
 * @param $token
 * @return bool
 */
function getUserEmail($token)
{
    $db = getDBConnection(myDatabase, db_username, db_password);
    $selection = $db->prepare('SELECT * FROM wakingUp.users WHERE token=:token');
    $selection->bindParam(':token', $token, PDO::PARAM_STR);
    if ($selection->execute()) {
        $user = $selection->fetch();
        $user_email = $user['email'];
        return $user_email;
    }
    return false;
}


/**
 * Überprüft Gültigkeit des übergebenen Tokens
 *
 * @param $tokenToVerify
 * @return bool
 */
function verifyToken($tokenToVerify)
{
    $db = getDBConnection(myDatabase, db_username, db_password);
    $selection = 'SELECT * FROM wakingUp.users WHERE token=:token';
    $selection = $db->prepare($selection);
    $selection->bindParam(':token', $tokenToVerify);
    if ($selection->execute()) {
        $users = $selection->fetchAll(PDO::FETCH_ASSOC);
        if ($selection->rowCount() > 0) {
            $token_expire = date('Y-m-d H:i:s', strtotime('now'));
            $myEmail = '';
            foreach ($users as $user) {
                $token_expire = $user['token_expire'];
                $myEmail = $user['email'];
            }
            $date_expire = new DateTime($token_expire);
            $dateNow = new DateTime('now');
            if ($date_expire > $dateNow) {
                $newTokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
                updateToken($myEmail, $newTokenExpiration);
                $db = null;
                return true;
            }
        }
    }
    $db = null;
    return false;
}

function insertAd($app)
{
    $ad = getJSONFromBody($app);
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'wakeboarder', 'Webec16!');

    if (verifyToken($ad['token'])){

        $userEmail = getUserEmail($ad['token']);

        $insertion = $db->prepare('INSERT INTO wakingUp.pinboard (title, message, date, lake, userEmail) VALUES (:title, :message, STR_TO_DATE(:date, \'%m,%d,%Y\'), :lake, :email)');

        $insertion->bindParam(':title', $ad['title'], PDO::PARAM_STR);
        $insertion->bindParam(':message', $ad['message'], PDO::PARAM_STR);
        $insertion->bindParam(':date', $ad['date'], PDO::PARAM_STR);
        $insertion->bindParam(':lake', $ad['lake'], PDO::PARAM_STR);
        $insertion->bindParam(':email', $userEmail, PDO::PARAM_STR);

        if ($insertion->execute()){
            responseWithStatus($app, 200);
        } else {
            responseWithStatus($app, 401);
        }
    }
    //else {
    // responseWithStatus($app,401);
    //}

}

function searchAds($app, $lake, $from, $until)
{
    $info = getJSONFromBody($app);
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'wakeboarder', 'Webec16!');

    $selection = $db->prepare('SELECT * FROM wakingUp.pinboard WHERE lake=:lake AND (date BETWEEN STR_TO_DATE(:from, \'%m,%d,%Y\') AND STR_TO_DATE(:until, \'%m,%d,%Y\')) ORDER BY date ASC');

    $selection->bindParam(':lake', $lake, PDO::PARAM_STR);
    $selection->bindParam(':from', $from, PDO::PARAM_STR);
    $selection->bindParam(':until', $until, PDO::PARAM_STR);

    //where lake='Brienzersee' AND (date BETWEEN '2016-01-01' AND '2017-05-05');
    //date=\'2016-04-18\'');
    //STR_TO_DATE(:fromDate, \'%m,%d,%Y\')');
    //SELECT * FROM wakingUp.ads WHERE date=STR_TO_DATE('04,18,2016', '%m,%d,%Y');
    //SELECT * FROM wakingUp.ads WHERE date=STR_TO_DATE(\'04,18,2016\', \'%m,%d,%Y\');
    //BETWEEN :fromDate AND :untilDate



    if ($selection->execute()){
        $result = $selection->fetchAll(PDO::FETCH_ASSOC);

        $ads = array();
        foreach ($result as $ad) {
            $ads[] = array(
                'id' => $ad['id'],
                'title' => $ad['title'],
                'message' => $ad['message'],
                'date' => $ad['date'],
                'lake_name' => $ad['lake'],
                'user_email' => $ad['userEmail']
            );
        }
        responseTokenWithStatus($app, $ads, 200);
    }
}


