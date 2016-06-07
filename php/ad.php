<?php

require 'adMethods.php';
require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->post('/ads/insert', function() use ($app)
{
    insertAd();
})
        
$app->get('/ads/search', function() use ($app))
{
    searchAds();
}

$app->run();
?>