<?php

function isMobileDevice() { 
    return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo 
        |fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i" 
        , $_SERVER["HTTP_USER_AGENT"]);
} 

if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
}

if (isMobileDevice()) {
    $deviceType = "Mobile";
} else {
    $deviceType = "Desktop";
}

$agent = array(
    "ip" => $ip,
    "browser" => $_SERVER['HTTP_USER_AGENT'],
    "device" => php_uname(),
    "device_type" => $deviceType,
);

$fileRead = file_get_contents("data.json");
$disabledPush = false;
if ($fileRead == NULL) {
    $agent["date"] = date("Y-m-d H:i:s");
    $fileArray = array(1 => $agent);
} else {
    $fileArray = json_decode($fileRead, true);
    if ($fileArray != NULL) {
        foreach ($fileArray as $key => $value) {
            if ($value == $agent) {
                $disabledPush = true;
            }
        }
    }
}
if (!$disabledPush) {
    $agent["date"] = date("Y-m-d H:i:s");
    array_push($fileArray, $agent);
    $file = fopen("data.json", "w");
    fwrite($file, json_encode($fileArray));
}
?>