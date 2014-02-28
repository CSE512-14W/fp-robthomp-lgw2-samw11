<?php
$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "SELECT comp.charMatch, comp.gaps, comp.SWalign, comp.docB, comp.textA, comp.textB, comp.docAstart, comp.docAend, comp.docBstart, comp.docBend, comp.differencesA, comp.differencesB, comp.compLabel, bills.IntrDate, bills.Party, tex.text as sectionText, bills.URL FROM bills_sectcomp as comp, bills_sections as sec, bills, bills_secttext as tex WHERE comp.idA = " . $_GET["section"] . " AND sec.Bill_id = bills.id AND comp.idB = sec.sec_id AND tex.sec_id = idA AND NOT comp.docB like '%hr3590%'" or die("Error in the consult.." . mysqli_error($link));

$result = $link->query($query);

$out = array();

while($row = mysqli_fetch_array($result)) {
	$out[] = $row;
}

print(json_encode($out));

?>