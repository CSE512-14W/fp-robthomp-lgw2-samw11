<?php
/*
Takes a comparison id and label and adds it as a row to the csv specified below
*/

$fileName = "assignments.csv";

file_put_contents($fileName, $_GET["comp"] . "," . $_GET["label"] . "\n", FILE_APPEND);
	
?>