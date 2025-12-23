<?php
/**
 * VOLLEDIGE FIX VOOR RENDER EN ACF DATA
 */

// 1. Regelt de toegang voor je Render-app
add_action('init', function() {
    header("Access-Control-Allow-Origin: https://properties-uny6.onrender.com");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit;
    }
});


// 2. Forceert ACF velden in de REST API (belangrijk voor WP REST API v2)
add_filter('acf/settings/show_in_rest', '__return_true');

// 3. FORCEER ACF VELDEN IN DE WP REST API (ook in de lijst)
add_action('rest_api_init', function() {
    register_rest_field('property', 'acf', array(
        'get_callback' => function($data) {
            $fields = get_fields($data['id']);
            // Forceer altijd een array, ook als er geen velden zijn ingevuld
            return is_array($fields) ? $fields : new stdClass();
        },
        'schema' => null,
    ));
});