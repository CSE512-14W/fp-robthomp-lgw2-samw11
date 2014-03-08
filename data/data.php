<?php
/*This script performs two functions. 

If it is not passed a "section" parameter it will collect all comparison data associated 
with the bill id and version defined below. It will then aggregate the data under each 
section id and record the time and party of the earliest matching bill with that section.
The script will return all of this data in json format.

If the script is passed a section parameter it will return all of the comparisons that 
include that section
*/

#return breakdown of house/senate and return full matching bill text

#the id of the base bill, only sections from this bill are aggregated, comparisons against
#this id are ignored (the same bill being compared to different versions of itself)
$billID = 446419;

#the id of the version of the base bill, sections of the bill that are not from this 
#version are not aggregated
$billVersionID = 10010;

#this is used as the lower limit for the SWalign field in sectcomp
$SWalignLimit = 1.0;

#this is used as the lower limit for the charMatch field in sectcomp
$charMatchLimit = 200;

#this is used as the lower limit for either the propA or propB fields in sectcomp (at 
#least one must be above this value)
$propLimit = 0.7;

#the name of the file this script will output
$outFileName = "layer1.json";

$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

if (!isset($_GET["section"])) {
	
	$query = "(
		SELECT comp.compID, comp.idA AS secID, bills.IntrDate, bills.Party, bills.BillType
			FROM bills_sectcomp AS comp, bills_sections AS sect, bills, bills_sections AS sectb
			WHERE comp.idB = sect.sec_id
				AND sect.Bill_id = bills.id
				AND comp.idA = sectb.sec_id
				AND sectb.Bill_id = " . $billID . "
				AND sectb.bill_ver_id = " . $billVersionID . "
				AND NOT sect.Bill_id = " . $billID . "
				AND comp.SWalign > " . $SWalignLimit . "
				AND comp.charMatch > " . $charMatchLimit . "
				AND (
					comp.propA > " . $propLimit . "
					OR comp.propB > " . $propLimit . "
				)
		)
		UNION 
		(SELECT comp.compID, comp.idB AS secID, bills.IntrDate, bills.Party, bills.BillType
			FROM bills_sectcomp AS comp, bills_sections AS sect, bills, bills_sections AS sectb
			WHERE comp.idA = sect.sec_id
				AND sect.Bill_id = bills.id
				AND comp.idB = sectb.sec_id
				AND sectb.Bill_id = " . $billID . "
				AND sectb.bill_ver_id = " . $billVersionID . "
				AND NOT sect.Bill_id = " . $billID . "
				AND comp.SWalign > " . $SWalignLimit . "
				AND comp.charMatch > " . $charMatchLimit . "
				AND (
					comp.propA > " . $propLimit . "
					OR comp.propB > " . $propLimit . "
				)
		)" or die("Error in the consult.." . mysqli_error($link));

	/* sample query
	(SELECT comp.idA as secID, bills.IntrDate, bills.Party 
		FROM bills_sectcomp as comp, bills_sections as sect, bills, bills_sections as sectb
		WHERE comp.idB = sect.sec_id AND sect.Bill_id = bills.id AND comp.idA = sectb.sec_id AND sectb.Bill_id = 446419 AND sectb.bill_ver_id = 10010 AND NOT sect.Bill_id = 446419 AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7) AND comp.idA = 78644) 
	UNION 
	(SELECT comp.idB as secID, bills.IntrDate, bills.Party 
		FROM bills_sectcomp as comp, bills_sections as sect, bills, bills_sections as sectb
		WHERE comp.idA = sect.sec_id AND sect.Bill_id = bills.id AND comp.idB = sectb.sec_id AND sectb.Bill_id = 446419 AND sectb.bill_ver_id = 10010 AND NOT sect.Bill_id = 446419 AND comp.SWalign > 1.0 AND comp.charMatch > 200 AND (comp.propA > 0.7 OR comp.propB > 0.7) AND comp.idB = 78644)
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
			$arr["HR200"] = 0;
			$arr["S200"] = 0;
			$arr["HR100"] = 0;
			$arr["S100"] = 0;
			$sections[$row["secID"]] = $arr;
		} else {
			$sections[$row["secID"]]["matchingBills"]++;
			if ($sections[$row["secID"]]["minDate"] > strtotime($row["IntrDate"])) {
				$sections[$row["secID"]]["minDate"] = strtotime($row["IntrDate"]);
				$sections[$row["secID"]]["party"] = $row["Party"];
			}
		}
		if ($row["Party"] == "100" or $row["Party"] == "200") {
			$sections[$row["secID"]][$row["BillType"] . $row["Party"]]++;
		}
	}

	$query = "SELECT sec_id as secID FROM `bills_sections` WHERE bill_ver_id = " . $billVersionID . " AND Bill_id = " . $billID;
	$result = $link->query($query);
	while($row = mysqli_fetch_array($result)) {
		if (!array_key_exists($row["secID"], $sections)) {
			$arr = array();
			$arr["secID"] = $row["secID"];
			$arr["matchingBills"] = 0;
			$arr["minDate"] = 0;
			$arr["party"] = 0;
			$arr["HR200"] = 0;
			$arr["S200"] = 0;
			$arr["HR100"] = 0;
			$arr["S100"] = 0;
			$sections[$row["secID"]] = $arr;
		}
	}
	
	#convert the dictionary to a numerical array
	foreach ($sections as $section) {
		$out[] = $section;
	}

	//print(json_encode($out));
	
	#if the query was faster you could use it to dynamically request data and send it to the client
	#but as things are the query takes about 30mins and so the data must be saved to file for later
	file_put_contents($outFileName, json_encode($out));
} else {
	$query = "(
		SELECT comp.compID, comp.charMatch, comp.gaps, comp.SWalign, comp.docB, comp.textA, comp.textB, comp.docAstart, comp.docAend, comp.docBstart, comp.docBend, comp.differencesA, comp.differencesB, comp.compLabel, bills.IntrDate, bills.Party, bills.URL, bills.BillNum, bills.BillType, bills.NameFull, bills.Postal, tex.text as BillText
			FROM bills_sectcomp as comp, bills_sections as sec, bills, bills_secttext as tex
			WHERE comp.idA = " . $_GET["section"] . " 
				AND sec.Bill_id = bills.id 
				AND comp.idB = sec.sec_id 
				AND comp.idB = tex.sec_id
				AND NOT sec.Bill_id = " . $billID . " 
				AND comp.SWalign > " . $SWalignLimit . "
				AND comp.charMatch > " . $charMatchLimit . "
				AND (
					comp.propA > " . $propLimit . "
					OR comp.propB > " . $propLimit . "
				)
		) 
		UNION 
		(SELECT comp.compID, comp.charMatch, comp.gaps, comp.SWalign, comp.docA as docB, comp.textA as textB, comp.textB as textA, comp.docAstart as docBstart, comp.docAend as docBend, comp.docBstart as docAstart, comp.docBend as docAend, comp.differencesA as differencesB, comp.differencesB as differencesA, comp.compLabel, bills.IntrDate, bills.Party, bills.URL, bills.BillNum, bills.BillType, bills.NameFull, bills.Postal, tex.text as BillText 
			FROM bills_sectcomp as comp, bills_sections as sec, bills, bills_secttext as tex
			WHERE comp.idB = " . $_GET["section"] . " 
				AND sec.Bill_id = bills.id 
				AND comp.idA = sec.sec_id 
				AND comp.idA = tex.sec_id
				AND NOT sec.Bill_id = " . $billID . "
				AND comp.SWalign > " . $SWalignLimit . "
				AND comp.charMatch > " . $charMatchLimit . "
				AND (
					comp.propA > " . $propLimit . "
					OR comp.propB > " . $propLimit . "
				)
		)" or die("Error in the consult.." . mysqli_error($link));

	/* sample query
	(SELECT comp.charMatch, comp.gaps, comp.SWalign, comp.docB, comp.textA, comp.textB, comp.docAstart, comp.docAend, comp.docBstart, comp.docBend, comp.differencesA, comp.differencesB, comp.compLabel, bills.IntrDate, bills.Party, bills.URL 
		FROM bills_sectcomp as comp, bills_sections as sec, bills 
		WHERE comp.idA = " . $_GET["section"] . " AND sec.Bill_id = bills.id AND comp.idB = sec.sec_id AND NOT sec.Bill_id = " . $billID . " AND SWalign > " . $SWalignLimit . " AND charMatch > " . $charMatchLimit . " AND ( propA > " . $propLimit . " OR propB > " . $propLimit . "))
	UNION
	(SELECT comp.charMatch, comp.gaps, comp.SWalign, comp.docA as docB, comp.textA as textB, comp.textB as textA, comp.docAstart as docBstart, comp.docAend as docBend, comp.docBstart as docAstart, comp.docBend as docAend, comp.differencesA as differencesB, comp.differencesB as differencesA, comp.compLabel, bills.IntrDate, bills.Party, bills.URL
		FROM bills_sectcomp as comp, bills_sections as sec, bills
		WHERE comp.idB = " . $_GET["section"] . " AND sec.Bill_id = bills.id AND comp.idA = sec.sec_id AND NOT sec.Bill_id = " . $billID . " AND SWalign > " . $SWalignLimit . " AND charMatch > " . $charMatchLimit . " AND ( propA > " . $propLimit . " OR propB > " . $propLimit . "))
	*/

	$result = $link->query($query);

	$out = array();
	$rows = array();

	#just loop through the query response and record the rows
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
		$arr["IntrDate"] = strtotime($row["IntrDate"]);
		$arr["Party"] = $row["Party"];
		$arr["URL"] = $row["URL"];
		$arr["matchText"] = $row["BillText"];
		$arr["BillNum"] = $row["BillNum"];
		$arr["BillType"] = $row["BillType"];
		$arr["NameFull"] = $row["NameFull"];
		$arr["Postal"] = $row["Postal"];
		$rows[] = $arr;
	}

	$out["matches"] = $rows;

	#also get the base section text
	$query = "SELECT text FROM bills_secttext WHERE sec_id = " . $_GET["section"];
	$result = $link->query($query);
	$row = mysqli_fetch_array($result);
	$out["sectionText"] = $row["text"];

	print(json_encode($out));
}
?>