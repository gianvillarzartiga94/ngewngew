<?php

// === LIBRARY SETTINGS: Shared schedule storage and status helpers for student and admin pages. ===
date_default_timezone_set('Asia/Manila');

const LIBRARY_SETTINGS_FILE = __DIR__ . '/library_settings.json';
const SUPABASE_URL = 'https://aidugxbvsabspuoyuhkl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_765qVFgt5Z4MWCiZas0tTg_l43PTl10';

// === DEFAULT SCHEDULE: Define the fallback hours used when no saved schedule is available. ===
// This protects the student check-in feature from failing if the settings file is missing or unreadable.
function getDefaultLibrarySchedule(): array
{
    return [
        0 => null,
        1 => ['open' => '06:00', 'close' => '16:00'],
        2 => ['open' => '06:00', 'close' => '16:00'],
        3 => ['open' => '06:00', 'close' => '16:00'],
        4 => ['open' => '06:00', 'close' => '16:00'],
        5 => ['open' => '06:00', 'close' => '16:00'],
        6 => ['open' => '06:00', 'close' => '16:00']
    ];
}

// === SCHEDULE LOADING: Read the saved weekly opening and closing times from the JSON settings file. ===
// The system uses the stored values to decide whether the library should accept student check-ins.
function loadLibrarySchedule(): array
{
    if (!is_readable(LIBRARY_SETTINGS_FILE)) {
        return getDefaultLibrarySchedule();
    }

    $settings = json_decode(
        file_get_contents(LIBRARY_SETTINGS_FILE),
        true
    );

    if (!is_array($settings) || !isset($settings['schedule'])) {
        return getDefaultLibrarySchedule();
    }

    return normalizeLibrarySchedule($settings['schedule']);
}

// === SCHEDULE NORMALIZATION: Ensure each day has the expected schedule format even if the file is partially incomplete. ===
// This keeps the schedule structure consistent before it is used anywhere else in the app.
function normalizeLibrarySchedule(array $schedule): array
{
    $normalized = [];

    for ($day = 0; $day <= 6; $day++) {
        $hours = $schedule[$day] ?? null;

        if (!$hours) {
            $normalized[$day] = null;
            continue;
        }

        $normalized[$day] = [
            'open' => (string) ($hours['open'] ?? ''),
            'close' => (string) ($hours['close'] ?? '')
        ];
    }

    return $normalized;
}

// === SCHEDULE PERSISTENCE: Save the weekly library hours as a JSON file for use by both PHP and JavaScript pages. ===
// The pretty-printed output makes the file easier to inspect manually when needed.
function saveLibrarySchedule(array $schedule): bool
{
    $settings = json_encode(
        ['schedule' => normalizeLibrarySchedule($schedule)],
        JSON_PRETTY_PRINT
    );

    return $settings !== false
        && file_put_contents(LIBRARY_SETTINGS_FILE, $settings, LOCK_EX) !== false;
}

// === STATUS CHECK: Determine whether the library is open at the current time and compute the next opening message. ===
// The message returned here is displayed to students and staff to explain the library availability clearly.
function getLibraryStatus(array $schedule): array
{
    $day = (int) date('w');
    $currentTime = date('H:i');
    $today = $schedule[$day] ?? null;

    if (
        $today &&
        $currentTime >= $today['open'] &&
        $currentTime < $today['close']
    ) {
        return [
            'open' => true,
            'message' => 'The library is currently open.'
        ];
    }

    for ($daysAhead = 0; $daysAhead <= 7; $daysAhead++) {
        $nextDay = ($day + $daysAhead) % 7;
        $nextSchedule = $schedule[$nextDay] ?? null;

        if (!$nextSchedule) {
            continue;
        }

        if ($daysAhead === 0 && $currentTime >= $nextSchedule['open']) {
            continue;
        }

        $dayName = $daysAhead === 0
            ? 'today'
            : date('l', strtotime('+' . $daysAhead . ' day'));

        return [
            'open' => false,
            'message' => 'The library is closed. Opens '
                . $dayName . ' at '
                . date('g:i A', strtotime($nextSchedule['open'])) . '.'
        ];
    }

    return [
        'open' => false,
        'message' => 'The library is currently closed.'
    ];
}

// === AUTH HEADER: Extract the bearer token from the HTTP request so administrators can be validated. ===
// This helper supports both standard PHP request headers and the legacy allheaders helper format.
function getAuthorizationHeader(): string
{
    $headers = function_exists('getallheaders')
        ? getallheaders()
        : [];

    return $_SERVER['HTTP_AUTHORIZATION']
        ?? $headers['Authorization']
        ?? $headers['authorization']
        ?? '';
}

// === ADMIN CHECK: Verify that the provided token belongs to a valid library administrator and not just any user. ===
// The function calls Supabase to validate the token and then checks whether the user has the admin role in the admin_profiles table.
function isAdministrator(string $authHeader): bool
{
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return false;
    }

    $ch = curl_init(SUPABASE_URL . '/auth/v1/user');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_PUBLISHABLE_KEY,
        'Authorization: ' . $authHeader
    ]);

    $userResponse = curl_exec($ch);
    $userStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($userStatus < 200 || $userStatus >= 300) {
        return false;
    }

    $user = json_decode($userResponse, true);
    if (empty($user['id'])) {
        return false;
    }

    $profileUrl = SUPABASE_URL
        . '/rest/v1/admin_profiles?select=id&role=eq.admin&id=eq.'
        . rawurlencode($user['id']);
    $ch = curl_init($profileUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_PUBLISHABLE_KEY,
        'Authorization: ' . $authHeader
    ]);

    $profileResponse = curl_exec($ch);
    $profileStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $profiles = json_decode($profileResponse, true);
    return $profileStatus >= 200
        && $profileStatus < 300
        && is_array($profiles)
        && count($profiles) > 0;
}

// === TIME VALIDATION: Confirm that a submitted time string matches the expected 24-hour HH:MM format. ===
// This prevents invalid library hours like missing minutes or incorrect times from being saved to the schedule.
function validateLibraryTime(string $time): bool
{
    return preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) === 1;
}
