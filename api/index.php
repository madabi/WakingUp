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
$app->post('/users', function () use ($app){
    signUp($app);
});


/*
 * User einloggen
 */
$app->get('/users/login/:email/:password', function ($email, $password) use ($app){
   login($app, $email, $password);
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
$app->get('/ads/:id', function($id) use ($app){
    //todo
});

$app->run();