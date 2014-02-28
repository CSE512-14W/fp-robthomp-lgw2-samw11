<?php
$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "SELECT comp.charMatch, comp.gaps, comp.SWalign, comp.docB, comp.docAstart, comp.docAend, comp.docBstart, comp.docBend, comp.differencesA, comp.differencesB, comp.compLabel, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sec, bills WHERE comp.idA = " . $_GET["section"] . " AND sec.Bill_id = bills.id AND comp.idB = sec.sec_id AND NOT comp.docB like '%hr3590%'" or die("Error in the consult.." . mysqli_error($link));

$result = $link->query($query);

$out = array();

while($row = mysqli_fetch_array($result)) {
	$out[] = $row;
}

print(json_encode($out));

?>