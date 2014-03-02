<?php
#This script creates a data file that aggregates comparison data for all the sections of the base bill
#defined below. The party of the earliest matching bill for each section is recorded. Data is output as
#a json file.

#this is matched to the docA or docB columns in sectcomp and is the base to collect all comparison data
$baseBill = "hr3590-111-enr";

#any entries in the doc_ columns from sectcomp matching this string are excluded
#inthis case we use it to eliminate other versions of hr3590
$excluBill = "hr3590";

#this is used as the lower limit for the SWalign field in sectcomp
$SWalignLimit = "1.0";

#this is used as the lower limit for the charMatch field in sectcomp
$charMatchLimit = "200";

#this is used as the lower limit for either the propA or propB fields in sectcomp (at least one must be above this)
$propLimit = "0.7";

#the name of the file this script will output
$outFileName = "layer1.json";

$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "(SELECT comp.idA as secID, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sect, bills WHERE comp.idB = sect.sec_id AND sect.Bill_id = bills.id AND comp.docA = '" . $baseBill . "' AND NOT comp.docB like '%" . $excluBill . "%' AND comp.SWalign > " . $SWalignLimit . " AND comp.charMatch > " . $charMatchLimit . " AND (comp.propA > " . $propLimit . " OR comp.propB > " . $propLimit . ")) UNION (SELECT comp.idB as secID, bills.IntrDate, bills.Party FROM bills_sectcomp as comp, bills_sections as sect, bills WHERE comp.idA = sect.sec_id AND sect.Bill_id = bills.id AND comp.docB = '" . $baseBill . "' AND NOT comp.docA like '%" . $excluBill . "%' AND comp.SWalign > " . $SWalignLimit . " AND comp.charMatch > " . $charMatchLimit . " AND (comp.propA > " . $propLimit . " OR comp.propB > " . $propLimit . "))" or die("Error in the consult.." . mysqli_error($link));

/*(SELECT comp.idA as secID, bills.IntrDate, bills.Party 
	FROM bills_sectcomp as comp, bills_sections as sect, bills 
	WHERE comp.idB = sect.sec_id AND sect.Bill_id = bills.id AND comp.docA = 'hr3590-111-enr' AND NOT comp.docB like 'hr3590%' AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7)) 
  UNION
  (SELECT comp.idB as secID, bills.IntrDate, bills.Party 
  	FROM bills_sectcomp as comp, bills_sections as sect, bills 
  	WHERE comp.idA = sect.sec_id AND sect.Bill_id = bills.id AND comp.docB = 'hr3590-111-enr' AND NOT comp.docB like 'hr3590%' AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7))
*/
$result = $link->query($query);

$out = array();
$sections = array();

#iterate through each row
#for each base bill section keep a tally of the number of comparing sections and record 
#the party and time of the earliest bill so far
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
}

#convert the dictionary to a numerical array
foreach ($sections as $section) {
	$out[] = $section;
}

#if the query was faster you could use it to dynamically request data and send it to the client
#but as things are the query takes about 30mins and so the data must be saved to file for later
//print(json_encode($out));
file_put_contents($outFileName, json_encode($out));
?>