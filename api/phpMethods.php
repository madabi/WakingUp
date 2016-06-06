<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 03.06.16
 * Time: 21:49
 */

require 'User.php';
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

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);

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
        $insertion = $db->prepare('INSERT INTO wakingUp.users (email, password) VALUES (:email, :password)');
        $insertion->bindParam(':email', $user['email'], PDO::PARAM_STR);
        $insertion->bindParam(':password', $user['password'], PDO::PARAM_STR);
        if ($insertion->execute()) {

            echo('new user has been created');
            responseWithStatus($app, 200);

        } else {
            echo('could not write new user into database');
            //todo: was zurückgeben?
        }

    }
    $db = null;
}




/**
 * Eine Utility Funktion für die Ausgabe zum aufrufenden Client.
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




function loginAuth($app, $email, $password) {

    if (validateUser($app, $email, $password)) { //implement your own validation method against your db

        $arrRtn['token'] = bin2hex(openssl_random_pseudo_bytes(16)); //generate a random token

        $tokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));//the expiration date will be in one hour from the current moment

        $tokenSet = updateToken($email, $arrRtn['token'], $tokenExpiration); //This function can update the token on the database and set the expiration date-time, implement your own

        if($tokenSet){responseTokenWithStatus($app, $arrRtn, 200);
        }else {
            responseWithStatus($app, 401);
        }

    }else {
        responseWithStatus($app, 401);
    }

}



/**
 * @param $app
 * @param $user
 * @return bool
 */
function validateUser($app, $email, $password){

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $verifyUser = 'SELECT * FROM wakingUp.users WHERE email=:email AND password=:password';
    $verifyUser = $db->prepare($verifyUser);
    $verifyUser->bindParam(':email', $email);
    $verifyUser->bindParam(':password', $password);
    if ($verifyUser->execute()) {
        $verifyUser->fetchAll(PDO::FETCH_ASSOC);
        if ($verifyUser->rowCount() == 1) {
            echo 'login valid';
            $db =null;
            return true;
        } else {
            echo 'login invalid';
            $db =null;
            return null;
        }
    } else {
        $db =null;
        $app->halt(500, "Error in quering database.");
    }
}


function updateToken($email, $token, $tokenExpiration){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $update = $db->prepare('UPDATE wakingUp.users SET token=:token AND token_expire=:token_expire WHERE email=:email');
    $update->bindParam(':token', $token);
    $update->bindParam(':token_expire', $tokenExpiration);
    $update->bindParam(':email', $email, PDO::PARAM_STR);

    if ($update->execute()) {
        echo('new token_expire in database');
        $db = null;

        return true;

    } else {
        echo('could not write new token_expire into database');
        $db = null;

        return false;
    }

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



/*
 * Check if user email and password are valid
 *
 * @param $app
 * @param $userQuery
 */
/*function login($app)
{
    $user = getJSONFromBody($app);
    //sind email und passwort gültig?
    //todo: Schutz vor SQL-Injections?

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $verifyUser = 'SELECT * FROM wakingUp.users WHERE email=:email AND password=:password';
    $verifyUser = $db->prepare($verifyUser);
    $verifyUser->bindParam(':email', $user['email']);
    $verifyUser->bindParam(':password', $user['password']);
    if ($verifyUser->execute()) {
        $verifyUser->fetchAll(PDO::FETCH_ASSOC);
        if ($verifyUser->rowCount() == 1) {
            echo('user found');

            //todo: id und cookie zurückschicken

        } else {
            echo("No user found.");

            //todo: client benachrichtigen

        }
    } else {
        $app->halt(500, "Error in quering database.");
    }
}*/
