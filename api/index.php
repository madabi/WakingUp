<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 04.06.16
 * Time: 10:35
 */

require 'phpMethods.php';

require 'Slim-2.6.0/Slim/Slim.php';
require_once('/Middleware/TokenAuth.php');

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();
$app->config('debug', true);
$app->add(new \TokenAuth());



/*
 * Neuen Account erstellen
 */
$app->post('/users/signin', function () use ($app){
    signUp($app);
});


/*
 * User einloggen
 */
$app->get('/users/login/:email/:password', function () use ($app){
   login($app);
});

$app->get('/users/login', function () use ($app){
    loginAuth($app);
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