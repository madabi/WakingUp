<?php


require 'adMethods.php';

require 'Slim-2.6.0/Slim/Slim.php';

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();


$app->post('/ads/insert', function() use ($app)
{
    insertAd($app);
});

$app->get('/ads/search/:lake/:from/:until', function($lake, $from, $until) use ($app)
{
    searchAds($app, $lake, $from, $until);
});

$app->run();



