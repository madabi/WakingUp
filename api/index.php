<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 04.06.16
 * Time: 10:35
 */

require 'profileMethods.php';

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
 * Inserate eines bestimmten Users
 */
$app->get('/users/ads/:token', function($token) use ($app){

    if(verifyToken($app, $token)){
        getMyAds($app, $token);
    }else{
        responseWithStatus($app, 401);
    }
});


/*
 * Überprüfen des Tokens/ der Authentifizierung des Users. Wird ev. gar nicht benötigt, je nach Funktionen im
 * Javascript
 *
 */
$app->get('/users/auth/:token', function($token) use ($app) {
    if(verifyToken($app, $token)) {
        responseWithStatus($app, 200);
    }else{
        responseWithStatus($app, 401);
    }
});

$app->run();


