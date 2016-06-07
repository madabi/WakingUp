<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 04.06.16
 * Time: 10:35
 */

require 'phpMethods.php';

require 'Slim-2.6.0/Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();



/*
 * Neuen Account erstellen
 */
$app->post('/users/signup', function () use ($app){
    signUp($app);
});


/*
 * User einloggen
 */
/*$app->get('/users/login/:email/:password', function () use ($app){
   login($app);
});*/

$app->get('/users/login/:email/:password', function ($email, $password) use ($app){
    loginAuth($app, $email, $password);
});


/*
 * User ausloggen
 */
$app->put('/users/logout', function () use ($app){
    //todo: logout implementieren
});


/*
 * Inserate eines Users
 */
$app->get('/users/ads', 'middleware', function() use ($app){
    //todo
    getMyAds($app);
});


$app->get('/users/auth', 'middleware', function() use ($app) {
    responseWithStatus($app, 200);
});



$app->run();


function middleware(){
    $app = \Slim\Slim::getInstance();
    $tokenToVerify = $app->request->headers->get('Authorization');
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $verifyToken = 'SELECT * FROM wakingUp.users WHERE token=:token';
    $verifyToken = $db->prepare($verifyToken);
    $verifyToken->bindParam(':token', $tokenToVerify);
    if ($verifyToken->execute()) {
        $verifyToken->fetchAll(PDO::FETCH_ASSOC);
        if ($verifyToken->rowCount() == 1) {
            $token_expire = date('Y-m-d H:i:s', strtotime('now'));
            $myEmail = '';
            foreach($verifyToken as $user){
                $token_expire = $user[5];
                $myEmail = $user[2];
            }
            $dateNow = date('Y-m-d H:i:s', strtotime('now'));
            if(strtotime($token_expire) > strtotime($dateNow)){
                $newTokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
                updateToken($myEmail, $tokenToVerify, $newTokenExpiration);

            }else{
                responseWithStatus($app, 401);
            }
        }
    } else {
        $app->halt(500, "Error in quering database.");
    }



}


//todo
function getMyAds(){
}