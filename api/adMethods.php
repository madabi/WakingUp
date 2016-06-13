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
    
    //if (verifyToken){

        $userEmail = getUserEmail($ad['token']);
        
        $insertion = $db->prepare('INSERT INTO wakingUp.ads (title, message, date, lake, userEmail) VALUES (:title, :message, STR_TO_DATE(:date, \'%m,%d,%Y\'), :lake, :email)');
    
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
    /*} else {
        responseWithStatus($app,401);
    }*/
       
}

function searchAds($app, $lake, $from, $until)
{   
    $info = getJSONFromBody($app);
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', 'root');
    
    $selection = $db->prepare('SELECT * FROM wakingUp.ads WHERE lake=:lake AND (date BETWEEN STR_TO_DATE(:from, \'%m,%d,%Y\') AND STR_TO_DATE(:until, \'%m,%d,%Y\')) ORDER BY date ASC');
    
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


/**
 * Überprüft Gültigkeit des übergebenen Tokens
 *
 *
 * @param $app
 * @param $tokenToVerify
 * @return bool
 */
function verifyToken($app, $tokenToVerify)
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', 'root');
    $selection = 'SELECT * FROM wakingUp.users WHERE token=:token';
    $selection = $db->prepare($selection);
    $selection->bindParam(':token', $tokenToVerify);
    if ($selection->execute()) {
        $users = $selection->fetchall(PDO::FETCH_ASSOC);
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
    } else {
        $app->halt(500, "Error in quering database.");
    }
    $db = null;
    return false;

}

function getUserEmail($token){

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', 'root');
    $selection = $db->prepare('SELECT * FROM wakingUp.users WHERE token=:token');
    $selection->bindParam(':token', $token, PDO::PARAM_STR);
    if ($selection->execute()) {
        $user = $selection->fetch();

       //      $selection->fetchAll(PDO::FETCH_ASSOC);
        // if ($selection->rowCount() > 0) {
            /*
            foreach ($selection as $user) {
                $user_email = $user['userEmail'];
            }}*/

        $user_email = $user['email'];
        return $user_email;
    }
    return false;
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
