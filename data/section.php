<?php
$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "SELECT comp.charMatch, comp.gaps, comp.SWalign, comp.docB, comp.textA, comp.textB, comp.docAstart, comp.docAend, comp.docBstart, comp.docBend, comp.differencesA, comp.differencesB, comp.compLabel, bills.IntrDate, bills.Party, bills.URL FROM bills_sectcomp as comp, bills_sections as sec, bills WHERE comp.idA = " . $_GET["section"] . " AND sec.Bill_id = bills.id AND comp.idB = sec.sec_id AND NOT comp.docB like '%hr3590%'" or die("Error in the consult.." . mysqli_error($link));

$result = $link->query($query);

$out = array();
$rows = array();

while($row = mysqli_fetch_array($result)) {
	$arr = array();
	$arr["charMatch"] = $row["charMatch"];
	$arr["gaps"] = $row["gaps"];
	$arr["SWalign"] = $row["SWalign"];
	$arr["docB"] = $row["docB"];
	$arr["textA"] = $row["textA"];
	$arr["textB"] = $row["textB"];
	$arr["docAstart"] = $row["docAstart"];
	$arr["docBstart"] = $row["docBstart"];
	$arr["docAend"] = $row["docAend"];
	$arr["docBend"] = $row["docBend"];
	$arr["differencesA"] = $row["differencesB"];
	$arr["differencesB"] = $row["differencesB"];
	$arr["compLabel"] = $row["compLabel"];
	$arr["IntrDate"] = $row["IntrDate"];
	$arr["Party"] = $row["Party"];
	$arr["URL"] = $row["URL"];
	$rows[] = $arr;
}

$out["matches"] = $rows;

$query = "SELECT text FROM bills_secttext WHERE sec_id = " . $_GET["section"];
$result = $link->query($query);
$row = mysqli_fetch_array($result);
$out["sectionText"] = $row["text"];

print(json_encode($out));

?>