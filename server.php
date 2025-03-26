<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $shortUrl = $input['shortUrl'];

    try {
        // 解碼短網址
        $ch = curl_init($shortUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
        $response = curl_exec($ch);
        $destinationUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL) ?: $shortUrl;
        curl_close($ch);

        // 獲取目標頁面資訊
        $html = file_get_contents($destinationUrl);
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $title = $dom->getElementsByTagName('title')->item(0)->textContent ?? '無法獲取';
        $description = '';
        foreach ($dom->getElementsByTagName('meta') as $meta) {
            if ($meta->getAttribute('name') === 'description') {
                $description = $meta->getAttribute('content');
                break;
            }
        }

        echo json_encode(['destinationUrl' => $destinationUrl, 'title' => $title, 'description' => $description]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
