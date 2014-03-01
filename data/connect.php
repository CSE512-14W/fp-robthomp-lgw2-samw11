<?php
$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "(SELECT comp.idA as secID, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sect, bills WHERE comp.idB = sect.sec_id AND sect.Bill_id = bills.id AND comp.docA = 'hr3590-111-enr' AND NOT comp.docB like 'hr3590%' AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7)) UNION (SELECT comp.idB as secID, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sect, bills WHERE comp.idA = sect.sec_id AND sect.Bill_id = bills.id AND comp.docB = 'hr3590-111-enr' AND NOT comp.docA like 'hr3590%' AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7))" or die("Error in the consult.." . mysqli_error($link));

#(SELECT comp.idA as secID, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sect, bills WHERE comp.idB = sect.sec_id AND sect.Bill_id = bills.id AND comp.docA = 'hr3590-111-enr' AND NOT comp.docB like 'hr3590%' AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7)) UNION (SELECT comp.idB as secID, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sect, bills WHERE comp.idA = sect.sec_id AND sect.Bill_id = bills.id AND comp.docB = 'hr3590-111-enr' AND NOT comp.docB like 'hr3590%' AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7))


$result = $link->query($query);

$out = array();
$sections = array();

while($row = mysqli_fetch_array($result)) {
	if (!array_key_exists($row["secID"], $sections)) {
		$arr = array();
		$arr["secID"] = $row["secID"];
		$arr["matchingBills"] = 1;
		$arr["minDate"] = strtotime($row["IntrDate"]);
		$arr["party"] = $row["Party"];
		$sections[$row["secID"]] = $arr;
	} else {
		$sections[$row["secID"]]["matchingBills"]++;
		if ($sections[$row["secID"]]["minDate"] > strtotime($row["IntrDate"])) {
			$sections[$row["secID"]]["minDate"] = strtotime($row["IntrDate"]);
			$sections[$row["secID"]]["party"] = $row["Party"];
		}
	}
	
	/*if ($secId != $row["secId"]) {
		$newRow = array();
		$newRow["secId"] = $secId;
		$newRow["party"] = $minParty;
		$newRow["matchingBills"] = $count;
		$newRow["minDate"] = $minDate;
		$out[] = $newRow;
		
		$count = 1;
		$secId = $row["secId"];
		$minDate = strtotime($row["IntrDate"]);
		$minParty = $row["Party"];
	} else {
		$count++;
		$tempDate = strtotime($row["IntrDate"]);
		if ($tempDate < $minDate) {
			$minDate = $tempDate;
			$minParty = $row["Party"];
		}
	}*/
}

foreach ($sections as $section) {
	$out[] = $section;
}

print(json_encode($out));

?>