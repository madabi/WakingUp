<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 04.06.16
 * Time: 10:35
 */

require 'profileMethods.php';
require 'Slim-2.6.0/Slim/Slim.php';

define('db_username', 'wakeboarder');
define('db_password', 'Webec16!');
define('myDatabase', 'mysql:host=localhost;dbname=wakingUp;charset=utf8');

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();
$app->config('debug', true);


/*
 * Inserat löschen
 */
$app->delete('/ads/:id/:token', function ($id, $token) use ($app){

    if(verifyToken($token)){
        deleteAd($app, $id);
    }else{
        responseWithStatus($app, 401);
    }

});


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
 * Inserate eines bestimmten Users
 */
$app->get('/users/ads/:token', function($token) use ($app){

    if(verifyToken($token)){
        getMyAds($app, $token);
    }else{
        responseWithStatus($app, 401);
    }
});


/*
 * Überprüfen des Tokens / der Authentifizierung des Users
 */
$app->get('/users/auth/:token', function($token) use ($app) {
    if(verifyToken($token)) {
        responseWithStatus($app, 200);
    }else{
        responseWithStatus($app, 401);
    }
});

$app->run();



