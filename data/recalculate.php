<?php

$vars = explode(",", file_get_contents("vars"));

if (isset($_POST["billID"])) {
	file_put_contents("vars", $_POST["billID"] . "," . $_POST["billVersionID"] . "," . $_POST["SWalignLimit"] . "," . $_POST["charMatchLimit"] . "," . $_POST["propLimit"]);
	?>
		<html>
			<body>
				<p>New variables saved.</p>
				<p>Redirecting to data calculation script...</p>
				<script>
					window.onload = function() {
						setTimeout(function() {
							document.location.href = './data.php';
						}, 2000);
					}
				</script>
			</body>
		</html>
	<?php
} else {

?>
<html>
	<body>
		<p></p>
		<form name="input" action="recalculate.php" method="post">
			Bill ID: <input type="text" name="billID" value="<?php echo($vars[0]); ?>"><br>
			Bill Version ID: <input type="text" name="billVersionID" value="<?php echo($vars[1]); ?>"><br>
			SWAlign Lower Limit: <input type="text" name="SWalignLimit" value="<?php echo($vars[2]); ?>"><br>
			Character Match Limit: <input type="text" name="charMatchLimit" value="<?php echo($vars[3]); ?>"><br>
			Prop Limit: <input type="text" name="propLimit" value="<?php echo($vars[4]); ?>"><br>
			<input type="submit" value="Submit">
		</form>
	</body>
</html>

<?php
}
?>