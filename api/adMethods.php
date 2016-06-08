<?php

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


function insertAd($app)
{
    $ad = getJSONFromBody($app);
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', 'root');  
        
    $selection = $db->prepare('INSERT INTO wakingUp.ads (title, message) VALUES (:title, :message)');
    //, STR_TO_DATE(:date, \'%d,%m,%Y\')
    
    $selection->bindParam(':title', $ad['title'], PDO::PARAM_STR);
    $selection->bindParam(':message', $ad['message'], PDO::PARAM_STR);
   // $selection->bindParam(':date', $ad['date'], PDO::PARAM_STR);

    if ($selection->execute()){
        responseWithStatus($app, 200);
    } else {
        responseWithStatus($app, 401);
    }       
}

function searchAds($app)
{   
    $db = getDBConnection('mysql:host=localhost;wakingUp', 'vitsch', 'vitsch');
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
