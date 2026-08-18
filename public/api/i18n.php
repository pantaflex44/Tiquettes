<?php

declare(strict_types=1);

if (count(array_filter(array_map(fn($f) => false !== strpos($f, 'cors.php'), get_included_files()), fn($r) => $r === true)) === 0) {
    include_once('./cors.php');
}

if (count(array_filter(array_map(fn($f) => false !== strpos($f, 'functions.php'), get_included_files()), fn($r) => $r === true)) === 0) {
    include_once('./functions.php');
}

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
bindtextdomain($domain, './locale/nocache');
bindtextdomain($domain, './locale');
textdomain($domain);

bind_textdomain_codeset($domain, 'UTF-8');

define('LANG', $lang);
