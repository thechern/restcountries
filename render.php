<?php

  $country = $_GET["country"];
  $country_code =  $_GET["country-code"];

  if ($country !== ''){
    $url = "https://restcountries.eu/rest/v2/name/" . $country;
  }
  if ($country_code !== '' ){
    $url = "https://restcountries.eu/rest/v2/alpha/" . $country_code;
  }

  $result = file_get_contents($url);

  echo json_encode($result);

?>
