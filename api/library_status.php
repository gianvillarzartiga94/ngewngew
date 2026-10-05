<?php

// === LIBRARY STATUS API: Read the public schedule or update it as an administrator. ===
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

require_once __DIR__ . '/library_hours.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $schedule = loadLibrarySchedule();

    echo json_encode([
        'success' => true,
        'schedule' => $schedule,
        'status' => getLibraryStatus($schedule)
    ]);

    exit;
}

if ($method === 'PUT') {
    $authHeader = getAuthorizationHeader();

    if (!isAdministrator($authHeader)) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Administrator authentication required.'
        ]);

        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $openTime = trim((string) ($input['open'] ?? ''));
    $closeTime = trim((string) ($input['close'] ?? ''));

    if (
        !validateLibraryTime($openTime) ||
        !validateLibraryTime($closeTime) ||
        $openTime >= $closeTime
    ) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Opening time must be before closing time.'
        ]);

        exit;
    }

    $schedule = [
        0 => null,
        1 => ['open' => $openTime, 'close' => $closeTime],
        2 => ['open' => $openTime, 'close' => $closeTime],
        3 => ['open' => $openTime, 'close' => $closeTime],
        4 => ['open' => $openTime, 'close' => $closeTime],
        5 => ['open' => $openTime, 'close' => $closeTime],
        6 => ['open' => $openTime, 'close' => $closeTime]
    ];

    if (!saveLibrarySchedule($schedule)) {
        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => 'Unable to save library hours. Check the API folder permissions.'
        ]);

        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Library hours updated.',
        'schedule' => $schedule,
        'status' => getLibraryStatus($schedule)
    ]);

    exit;
}

http_response_code(405);

echo json_encode([
    'success' => false,
    'message' => 'Method not allowed.'
]);
