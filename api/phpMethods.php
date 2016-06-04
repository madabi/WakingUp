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
        exit('Keine Verbindung. Grund: '.$e->getMessage());
    }
}


/*
 * Neuen Account erstellen
 *
 * @param $app
 */
function SignUp($app)
{
    $success = false;
    $user = getJSONFromBody($app);

    if (checkNewUser($user)) {
        $success = writeNewUser($user);
    }
    if ($success) {
        //todo: id und cookie zurückschicken
    }
}


/*
 * Überprüft, ob der User nicht bereits existiert
 *
 * @param $user
 * @return bool
 */
function checkNewUser($user)
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);

    //todo: Schutz vor SQL-Injections?
    $selection = $db->prepare('SELECT * FROM users where email=:email and passwort=:passwort');
    $selection->bindParam(':email', $user->email);
    $selection->bindParam(':passwort', $user->passwort);
    $selection->execute();
    $result = $selection->fetchAll();
    var_dump($result);
    $db = null;
    $new = false;
    if ($selection->rowCount() > 0) {
        echo('user already exists');
        $new = false;
    } else {
        echo("new user can be created");
        $new = true;
    }
    return $new;

}


/*
 * schreibt neuen User in die Datenbank
 *
 * @param $user
 */
function writeNewUser($user)
{
    //todo: Schutz vor SQL-Injections?
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $insertion = $db->prepare('INSERT INTO users (email, password) VALUES (:email, :password)');
    $insertion->bindParam(':email', $user->email);
    $insertion->bindParam(':password', $user->password);
    if ($insertion->execute()) {
        $success = true;
    } else {
        $success = false;
    }
    $db = null;
    return $success;
}


/*
 * Check if user email and password are valid
 *
 * @param $app
 * @param $userQuery
 */
function login($app, $email, $password)
{

    //sind email und passwort gültig?
    //todo: Schutz vor SQL-Injections?
    $userQuery = "SELECT * FROM users WHERE email = {$email} AND pwd = {$password}";
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selectUser = $db->prepare($userQuery);
    if ($selectUser->execute()) {
        $user = $selectUser->fetchAll(PDO::FETCH_ASSOC);
        if ($selectUser->rowCount() == 1) {
            echo('user found');

            //todo: id und cookie zurückschicken

        } else {
            echo("No user found.");

            //todo: client benachrichtigen

        }
    } else {
        $app->halt(500, "Error in quering database.");
    }
}



/**
 * Eine Utility Funktion für die Ausgabe zum aufrufenden Client.
 *
 */
function response($app, $result)
{

    $response = $app->response();
    $response->headers->set('Content-Type', 'application/json');
    $response->body(json_encode($result));
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
 *
 * Nur zum Ausprobieren
 *
 * @return array
 */
function getAllUsers()
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selection = $db->prepare('SELECT * FROM users');
    $selection->execute();
    $result = $selection->fetchAll();
    foreach ($result as $user) {
        echo($user[1]);
        echo(' ');
    }
    return $result;
    // var_dump($result);
}


/**
 *
 * Nur zum Ausprobieren
 *
 * @param $id
 * @return mixed
 */
function getUserById($id)
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selection = $db->prepare('SELECT * FROM users where id=:id');
    $selection->bindParam(':id', $id);
    $selection->execute();
    $result = $selection->fetch();
    return $result;
}


/**
 *
 * Nur zum Ausprobieren
 *
 * @param $id
 */
function deleteUserById($id)
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $deletion = $db->prepare('DELETE FROM users where id=:id');
    $deletion->bindParam(':id', $id);
    $deletion->execute();
}

