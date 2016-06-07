<?php

    function getDBConnection($connectionString, $user, $pwd) {
        try {
            return new PDO($connectionString, $user, $pwd);
        }
        catch (PDOException $e) {
            exit('Keine Verbindung: Grund -' . $e->getMessage());
        }
    }
    
    
    
    function insertAd($app){
        $ad = getJSONFromBody($app);
        $db = getDBConnection('mysql:host=localhost;wakingUp', 'vitsch', 'vitsch');
    }

    
    function getJSONFromBody($app) {
        $json = $app->request->getBody();
        return json_decode($json, true);
    }


    
    var_dump($db->getAvailableDrivers());

    $db = null;

?>