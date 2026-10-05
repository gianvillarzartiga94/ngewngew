<?php

// === API RESPONSE SETUP: Return JSON and prevent cached visitor data. ===
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
require_once __DIR__ . '/library_hours.php';

$method = $_SERVER['REQUEST_METHOD'];

// === LIBRARY HOURS: Load the administrator-configured schedule for check-in rules. ===
$librarySchedule = loadLibrarySchedule();

// =============================================
// GET - ADMIN: LOAD ALL VISITOR RECORDS
// =============================================
// === GET BRANCH: Authenticate the administrator and load visitor records. ===
if ($method === 'GET') {
    // Get admin JWT sent by admin.js
    $headers = function_exists('getallheaders')
        ? getallheaders()
        : [];

    $authHeader =
        $_SERVER['HTTP_AUTHORIZATION']
            ?? $headers['Authorization']
            ?? $headers['authorization']
            ?? '';

    if (
        empty($authHeader) ||
        strpos($authHeader, 'Bearer ') !== 0
    ) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Administrator authentication required.'
        ]);

        exit;
    }

    $url = SUPABASE_URL
        . '/rest/v1/visitor_logs?select=*&order=created_at.desc';

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_PUBLISHABLE_KEY,
        'Authorization: ' . $authHeader,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => curl_error($ch)
        ]);

        curl_close($ch);
        exit;
    }

    $statusCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    if ($statusCode < 200 || $statusCode >= 300) {
        http_response_code($statusCode);

        echo json_encode([
            'success' => false,
            'message' => 'Unable to retrieve visitor records.',
            'details' => $response
        ]);

        exit;
    }

    echo $response;
    exit;
}

// =============================================
// POST - STUDENT: ADD NEW VISITOR
// =============================================
// === POST BRANCH: Validate and save a new anonymous student visit. ===
if ($method === 'POST') {
    // === CHECK-IN ACCESS: Reject closed-library submissions unless the requester is an administrator. ===
    $headers = function_exists('getallheaders')
        ? getallheaders()
        : [];

    $authHeader =
        $_SERVER['HTTP_AUTHORIZATION']
            ?? $headers['Authorization']
            ?? $headers['authorization']
            ?? '';

    $libraryStatus = getLibraryStatus($librarySchedule);
    $adminOverride = !$libraryStatus['open'] && isAdministrator($authHeader);

    if (!$libraryStatus['open'] && !$adminOverride) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => $libraryStatus['message']
        ]);

        exit;
    }

    $input = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (
        empty($input['student_name']) ||
        empty($input['program']) ||
        empty($input['year_level']) ||
        empty($input['purpose'])
    ) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'All fields are required.'
        ]);

        exit;
    }

    $visitor = [
        'student_name' => trim($input['student_name']),
        'program'      => trim($input['program']),
        'year_level'   => trim($input['year_level']),
        'purpose'      => trim($input['purpose'])
    ];

    $url = SUPABASE_URL
        . '/rest/v1/visitor_logs';

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);

    curl_setopt(
        $ch,
        CURLOPT_POSTFIELDS,
        json_encode($visitor)
    );

    // Student is anonymous.
    // Publishable key is used only as apikey.
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_PUBLISHABLE_KEY,
        'Content-Type: application/json',
        'Prefer: return=minimal'
    ]);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => curl_error($ch)
        ]);

        curl_close($ch);
        exit;
    }

    $statusCode = curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );

    curl_close($ch);

    if ($statusCode < 200 || $statusCode >= 300) {
        http_response_code($statusCode);

        echo json_encode([
            'success' => false,
            'message' => 'Unable to save visitor record.',
            'details' => $response
        ]);

        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Visitor successfully recorded.'
    ]);

    exit;
}

// =============================================
// INVALID REQUEST
// =============================================
http_response_code(405);

echo json_encode([
    'success' => false,
    'message' => 'Method not allowed.'
]);
