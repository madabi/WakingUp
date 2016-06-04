<?php
/**
 * Created by PhpStorm.
 * User: leaboesch
 * Date: 03.06.16
 * Time: 21:49
 */






/*
 * return PDO Database Connection
 *
 */
function getDBConnection($connectionString, $user, $pwd)
{
    try {
        return new PDO($connectionString, $user, $pwd);
    } catch (PDOException $e) {
        echo $e->getMessage();
        exit('Keine Verbindung. Grund: ' + $e->getMessage());
    }
}




/**
 * @return array
 */
function getAllUsers()
{
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selection = $db->prepare('SELECT * FROM users');
    $selection->execute();
    $result = $selection->fetchAll();
    foreach($result as $user){
        echo($user[1]);
        echo(' ');
    }
    return $result;
   // var_dump($result);
}



/**
 * @param $id
 * @return mixed
 */
function getUserById($id){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $selection = $db->prepare('SELECT * FROM users where id=:id');
    $selection->bindParam(':id', $id);
    $selection->execute();
    $result = $selection->fetch();
    return $result;
}




/**
 * @param $id
 */
function deleteUserById($id){
    $db = getDBConnection('mysql:host=localhost;dbname=wakingUp', 'root', null);
    $deletion = $db->prepare('DELETE FROM users where id=:id');
    $deletion->bindParam(':id', $id);
    $deletion->execute();
}



