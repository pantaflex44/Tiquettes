<?php

declare(strict_types=1);

include_once('./cors.php');
include_once('./functions.php');

$availlable_languages = get_availlable_languages();

if (isset($_GET['api_availlable'])) {
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(array_map(function ($l) {
        return array_merge([
            'locale' => $l,
            'display' => [
                'language' => ucfirst(locale_get_display_language($l, 'fr')),
                'name' => ucfirst(locale_get_display_name($l, 'fr')),
                'region' => ucfirst(locale_get_display_region($l, 'fr')),
                'script' => locale_get_display_script($l, 'fr'),
                'variant' => locale_get_display_variant($l, 'fr')
            ]
        ], locale_parse($l));
    }, $availlable_languages));
    exit();
}

clearstatcache();

$lang = htmlentities($_GET['lang'] ?? 'fr_FR');
if (!in_array($lang, $availlable_languages)) {
    $lang = 'fr_FR';
}
$lang .= '.UTF8';

putenv("LANG=" . $lang);
setlocale(LC_ALL, $lang);

$domain = "messages";
$language_files_found = glob('./locale/' . $lang . '/LC_MESSAGES/messages-v*.mo');
if (is_array($language_files_found) && count($language_files_found) > 0) {
    usort($language_files_found, function ($a, $b) {
        $mtime_a = filemtime($a);
        $mtime_b = filemtime($b);
        if ($mtime_b > $mtime_a) {
            return 1;
        } else if ($mtime_b < $mtime_a) {
            return -1;
        } else {
            return 0;
        }
    });
    $domain = basename($language_files_found[0], '.mo');
}
bindtextdomain($domain, './locale');
textdomain($domain);

bind_textdomain_codeset($domain, 'UTF-8');

define('LANG', $lang);
