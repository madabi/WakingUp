<?php

function getDBConnection($connectionString, $user, $pwd) 
{
    try {
        return new PDO($connectionString, $user, $pwd);
    }
    catch (PDOException $e) {
        exit('Keine Verbindung: Grund -' . $e->getMessage());
    }
}
    
    
    
function insertAd($app)
{
    $ad = getJSONFromBody($app);
    $db = getDBConnection('mysql:host=localhost;wakingUp', 'vitsch', 'vitsch');  
        
    $selection = $db->prepare('INSERT INTO wakingUp.ads (title, message, date) VALUES (:title, :message, STR_TO_DATE(:date, \'%d,%m,%Y\'))');
    
    
    $selection->bindParam(':title', $ad['title'], PDO::PARAM_STR);
    $selection->bindParam(':message', $ad['message'], PDO::PARAM_STR);
    $selection->bindParam(':date', $ad['date'], PDO::PARAM_STR);

    $selection->execute();        
}

function searchAds($app)
{   
    $db = getDBConnection('mysql:host=localhost;wakingUp', 'vitsch', 'vitsch');
}
    
function getJSONFromBody($app) 
{
    $json = $app->request->getBody();
    return json_decode($json, true);
}

function response($app, $result)
{
    $response = $app->response();
    $response->headers->set('Content-Type', 'application/json');
    $response->body(json_encode($result));
}
    
var_dump($db->getAvailableDrivers());

$db = null;

?>