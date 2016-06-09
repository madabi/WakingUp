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
        
    $insertion = $db->prepare('INSERT INTO wakingUp.ads (title, message, date) VALUES (:title, :message,STR_TO_DATE(:date, \'%m,%d,%Y\'))');
    //, STR_TO_DATE(:date, \'%d,%m,%Y\'))');
    //STR_TO_DATE(:date, \'%d,%m,%Y\'))');
    
    $insertion->bindParam(':title', $ad['title'], PDO::PARAM_STR);
    $insertion->bindParam(':message', $ad['message'], PDO::PARAM_STR);
    $insertion->bindParam(':date', $ad['date'], PDO::PARAM_STR);

    if ($insertion->execute()){
        responseWithStatus($app, 200);
    } else {
        responseWithStatus($app, 401);
    }       
}

function searchAds($app)
{   
    $ad = getJSONFromBody($app);
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', 'root');
    
    $selection = $db->prepare('SELECT * FROM wakingUp.ads WHERE date=STR_TO_DATE(:fromDate, \'%m,%d,%Y\')');
    //BETWEEN :fromDate AND :untilDate
    $selection-> bindParam(':fromDate', $ad['fromDate'], PDO::PARAM_STR);
    $selection-> bindParam(':untilDate', $ad['untilDate'], PDO::PARAM_STR);
    
    
    if ($selection->execute()){
        $result = $selection->fetchAll(PDO::FETCH_ASSOC);
        //$app->response->setBody(json_encode($result));
        response($app, $result);
    } else {
        responseWithStatus($app, 401);
    } 
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
