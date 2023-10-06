<?php
$data = file_get_contents("php://input");
$data = json_decode($data, true);

if ($data) {   
    $type = $data["type"];

    if ($type == "removeLocation") {
        $result = $data["result"];
        $path = "../logs/location/logs.json";
        $file = fopen($path, "w");
        if (empty($result)) {
            $result = new stdClass();
        }
        fwrite($file, json_encode($result));
    }

    if ($type == "removeIP") {
        $result = $data["result"];
        $path = "../logs/ip/logs.json";
        $file = fopen($path, "w");
        if (empty($result)) {
            $result = new stdClass();
        }
        fwrite($file, json_encode($result));
    }

    if ($type == "transferIps") {
        $host = $data["host"];
        $local = $data["local"];

        $fileLocal = fopen("../logs/ip/logs.json", "w");

        $array = array();

        $hostData = file_get_contents("../host/data.json");
            $hostData = json_decode($hostData, true);
            if ($hostData != NULL) {
                array_push($array, $hostData);
            }
        fwrite($fileLocal, ltrim(rtrim(json_encode($array), "]"), "["));
    }

    if ($type == "removeHostIps") {
        $file = fopen("../host/data.json", "w");
        fwrite($file, "{}");
    }
}

?>