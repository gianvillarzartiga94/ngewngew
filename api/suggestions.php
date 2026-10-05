<?php

header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

const SUGGESTIONS_FILE = __DIR__ . '/suggestions.json';

function loadSuggestions(): array
{
    if (!is_readable(SUGGESTIONS_FILE) || !filesize(SUGGESTIONS_FILE)) {
        return [];
    }

    $raw = file_get_contents(SUGGESTIONS_FILE);
    if ($raw === false) {
        return [];
    }

    $items = json_decode($raw, true);
    return is_array($items) ? array_values($items) : [];
}

function saveSuggestions(array $items): bool
{
    $payload = json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($payload === false) {
        return false;
    }

    return file_put_contents(SUGGESTIONS_FILE, $payload . PHP_EOL, LOCK_EX) !== false;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode([
        'success' => true,
        'items' => loadSuggestions()
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $message = trim((string) ($input['message'] ?? ''));

    if ($message === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Please enter a comment or suggestion.'
        ]);
        exit;
    }

    $items = loadSuggestions();
    $items[] = [
        'id' => uniqid('suggestion_', true),
        'message' => $message,
        'created_at' => gmdate('c')
    ];

    if (!saveSuggestions($items)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Unable to save the suggestion.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Suggestion submitted successfully.',
        'item' => $items[count($items) - 1]
    ]);
    exit;
}

http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed.'
]);
