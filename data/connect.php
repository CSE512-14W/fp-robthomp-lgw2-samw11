<?php
$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "SELECT comp.idA, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sec, bills WHERE sec.Bill_id = bills.id AND comp.idB = sec.sec_id AND comp.docA = 'hr3590-111-enr' AND NOT comp.docB like '%hr3590%' ORDER BY idA" or die("Error in the consult.." . mysqli_error($link));

$result = $link->query($query);

$out = array();

$row = mysqli_fetch_array($result);
$count = 1;
$secId = $row["idA"];
$minDate = strtotime($row["IntrDate"]);
$minParty = $row["Party"];

while($row = mysqli_fetch_array($result)) {
	if ($secId != $row["idA"]) {
		$newRow = array();
		$newRow["secId"] = $secId;
		$newRow["party"] = $minParty;
		$newRow["matchingBills"] = $count;
		$newRow["minDate"] = $minDate;
		$out[] = $newRow;
		
		$count = 1;
		$secId = $row["idA"];
		$minDate = strtotime($row["IntrDate"]);
		$minParty = $row["Party"];
	} else {
		$count++;
		$tempDate = strtotime($row["IntrDate"]);
		if ($tempDate < $minDate) {
			$minDate = $tempDate;
			$minParty = $row["Party"];
		}
	}
}

$newRow = array();
$newRow["secId"] = $secId;
$newRow["party"] = $minParty;
$newRow["matchingBills"] = $count;
$newRow["minDate"] = $minDate;
$out[] = $newRow;

print(json_encode($out));

?>