<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 04.06.16
 * Time: 10:35
 */

require 'phpMethods.php';


$db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);

//createNewUser($db, 'martin', 'martinPassword');
//$all = getAllUsers($db);
//var_dump($all);
//$db = null;


require 'Slim-2.6.0/Slim/Slim.php';
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->post('/users', function () use ($app){
    $user = json_decode($app->request->getBody());

    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $insertion = $db->prepare('INSERT INTO users (email, password) VALUES (:email, :password)');
    $insertion->bindParam(':email', $user->email);
    $insertion->bindParam(':password', $user->pwd);
    $insertion->execute();
});


$app->run();



