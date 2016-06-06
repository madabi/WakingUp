<?php

/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 06.06.16
 * Time: 16:47
 */
class User
{
    public $id;
    public $email;
    public $password;
    public $token;
    public $token_expire;

    function __construct(){
    }


static function getUserByToken($tokenAuth){



}

static function keepTokenAlive($tokenAuth){}






    function updateToken($email, $token, $tokenExpiration){
        $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
        $update = $db->prepare('UPDATE wakingUp.users SET token=:token AND token_expire=:token_expire WHERE email=:email');
        $update->bindParam(':token', $token);
        $update->bindParam(':token_expire', $tokenExpiration);
        $update->bindParam(':email', $email, PDO::PARAM_STR);

        if ($update->execute()) {

            echo('new cookie set in database');

        } else {
            echo('could not write new cookie into database');
        }

        $db = null;
    }







}