<?php
// CORS headers for Render frontend
add_action('init', function() {
    header("Access-Control-Allow-Origin: https://properties-uny6.onrender.com");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit;
    }
});
