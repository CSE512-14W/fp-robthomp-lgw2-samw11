<?php
#This script takes a section ID parameter and returns all of the comparisons that include that
#section that also meet the requirements defined below

#any entries in the doc_ columns from sectcomp matching this string are excluded
#inthis case we use it to eliminate other versions of hr3590
$excluBill = "hr3590";

$billID = 446419;

$billVersionID = 10010;

#this is used as the lower limit for the SWalign field in sectcomp
$SWalignLimit = 1.0;

#this is used as the lower limit for the charMatch field in sectcomp
$charMatchLimit = 200;

#this is used as the lower limit for either the propA or propB fields in sectcomp (at least one must be above this)
$propLimit = 0.7;

$link = mysqli_connect("master.cmu4mm2fobzj.us-west-2.rds.amazonaws.com","habbal","Dp6wNcah47awWWbL","cbp_main",3306) or die("Error " . mysqli_error($link));

$query = "(
	SELECT comp.compID, comp.charMatch, comp.gaps, comp.SWalign, comp.docB, comp.textA, comp.textB, comp.docAstart, comp.docAend, comp.docBstart, comp.docBend, comp.differencesA, comp.differencesB, comp.compLabel, bills.IntrDate, bills.Party, bills.URL
		FROM bills_sectcomp as comp, bills_sections as sec, bills 
		WHERE comp.idA = " . $_GET["section"] . " 
			AND sec.Bill_id = bills.id 
			AND comp.idB = sec.sec_id 
			AND NOT sec.Bill_id = " . $billID . " 
			AND comp.SWalign > " . $SWalignLimit . "
			AND comp.charMatch > " . $charMatchLimit . "
			AND (
				comp.propA > " . $propLimit . "
				OR comp.propB > " . $propLimit . "
			)
	) 
	UNION 
	(SELECT comp.compID, comp.charMatch, comp.gaps, comp.SWalign, comp.docA as docB, comp.textA as textB, comp.textB as textA, comp.docAstart as docBstart, comp.docAend as docBend, comp.docBstart as docAstart, comp.docBend as docAend, comp.differencesA as differencesB, comp.differencesB as differencesA, comp.compLabel, bills.IntrDate, bills.Party, bills.URL 
		FROM bills_sectcomp as comp, bills_sections as sec, bills 
		WHERE comp.idB = " . $_GET["section"] . " 
			AND sec.Bill_id = bills.id 
			AND comp.idA = sec.sec_id 
			AND NOT sec.Bill_id = " . $billID . "
			AND comp.SWalign > " . $SWalignLimit . "
			AND comp.charMatch > " . $charMatchLimit . "
			AND (
				comp.propA > " . $propLimit . "
				OR comp.propB > " . $propLimit . "
			)
	)" or die("Error in the consult.." . mysqli_error($link));

/*
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
	$arr["IntrDate"] = $row["IntrDate"];
	$arr["Party"] = $row["Party"];
	$arr["URL"] = $row["URL"];
	$rows[] = $arr;
}

$out["matches"] = $rows;

#also get the base section text
$query = "SELECT text FROM bills_secttext WHERE sec_id = " . $_GET["section"];
$result = $link->query($query);
$row = mysqli_fetch_array($result);
$out["sectionText"] = $row["text"];

print(json_encode($out));

?>