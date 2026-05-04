<?php

/**
 * Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 * Copyright (C) 2024-2025 Christophe LEMOINE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

require './libs/ZipStream-PHP-3.2.2/src/ZipStream.php';
require './libs/ZipStream-PHP-3.2.2/src/OperationMode.php';
require './libs/ZipStream-PHP-3.2.2/src/CompressionMethod.php';
require './libs/ZipStream-PHP-3.2.2/src/File.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception.php';
require './libs/ZipStream-PHP-3.2.2/src/GeneralPurposeBitFlag.php';
require './libs/ZipStream-PHP-3.2.2/src/Version.php';
require './libs/ZipStream-PHP-3.2.2/src/Time.php';
require './libs/ZipStream-PHP-3.2.2/src/PackField.php';
require './libs/ZipStream-PHP-3.2.2/src/LocalFileHeader.php';
require './libs/ZipStream-PHP-3.2.2/src/EndOfCentralDirectory.php';
require './libs/ZipStream-PHP-3.2.2/src/DataDescriptor.php';
require './libs/ZipStream-PHP-3.2.2/src/CentralDirectoryFileHeader.php';

require './libs/ZipStream-PHP-3.2.2/src/Stream/CallbackStreamWrapper.php';

require './libs/ZipStream-PHP-3.2.2/src/Zs/ExtendedInformationExtraField.php';

require './libs/ZipStream-PHP-3.2.2/src/Exception/StreamNotSeekableException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/StreamNotReadableException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/SimulationFileUnknownException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/ResourceActionException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/OverflowException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/FileSizeIncorrectException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/FileNotReadableException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/FileNotFoundException.php';
require './libs/ZipStream-PHP-3.2.2/src/Exception/DosTimeOverflowException.php';


use ZipStream\ZipStream;
use ZipStream\Stream\CallbackStreamWrapper;

error_reporting(E_ALL);
ini_set('display_errors', '1');

set_time_limit(120); // 2 min

if (isset($_SERVER['HTTP_ORIGIN'])) {
    //header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}


function filter_string_polyfill(string $string): string
{
    $str = preg_replace('/\x00|<[^>]*>?/', '', $string);
    return str_replace(["'", '"'], ['&#39;', '&#34;'], $str);
}




class TiquettesLabeler
{

    const VERSION = "1.0";

    protected string $model = '';
    protected array $options = [];
    protected int $margins = 10;

    public array $required = [];

    public static function requirements()
    {
        $response = [
            'modules' => [
                'php' => version_compare(phpversion(), '8.3', '>='),
                'php_imagick' => extension_loaded('imagick'),
                'convert' => false,
                'magick' => false,
            ],
            'ok' => false
        ];

        try {
            $retval = 0;
            $ret = exec('magick -version', result_code: $retval);
            $response['modules']['magick'] = $ret !== false && $retval === 0;
        } catch (\Exception $ex) {
        }

        if ($response['modules']['magick'] === false) {
            try {
                $retval = 0;
                $ret = exec('convert -version', result_code: $retval);
                $response['modules']['convert'] = $ret !== false && $retval === 0;
            } catch (\Exception $ex) {
            }
        }

        $response['ok'] = $response['modules']['php']
            && ($response['modules']['php_imagick']  || $response['modules']['magick'] || $response['modules']['convert']);

        return $response;
    }

    function __construct(string $model, array $options)
    {
        $this->required = self::requirements();
        $this->model = $model;
        $this->options = $options;
    }

    function svg2png(string $svgContent, string $pngFilepath, int $width = 100, int $height = 100): bool
    {
        global $isDev;

        try {
            if (!str_starts_with(trim($svgContent), "<?xml"))
                $svgContent = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . trim($svgContent);

            if ($this->required['modules']['php_imagick'] === true && !$isDev) {
                $image = new Imagick();

                $image->newImage($width, $height, new ImagickPixel('transparent'));
                $image->readImageBlob($svgContent);
                $image->transparentPaintImage('#ffffff', 0, 10, false);
                //$image->thumbnailImage($width, $height, true);
                $image->setImageFormat('png64');
                $image->writeImage($pngFilepath);

                return file_exists($pngFilepath);
            } else if ($this->required['modules']['magick'] === true) {
                $f = basename($pngFilepath, '.png');
                $d = dirname($pngFilepath);
                $s = "{$d}/{$f}.svg";
                file_put_contents($s, $svgContent);
                $cmd = "magick {$s} -size " . $width . "x" . $height . " -transparent white png24:{$pngFilepath}";

                try {
                    $retval = 0;
                    $output = [];
                    $ret = exec($cmd, $output, $retval);

                    return $ret !== false && $retval === 0;
                } catch (\Exception $ex) {
                    return false;
                }
            } else if ($this->required['modules']['convert'] === true) {
                $f = basename($pngFilepath, '.png');
                $d = dirname($pngFilepath);
                $s = "{$d}/{$f}.svg";
                file_put_contents($s, $svgContent);
                $cmd = "convert {$s} -size " . $width . "x" . $height . " -transparent white png24:{$pngFilepath}";

                try {
                    $retval = 0;
                    $output = [];
                    $ret = exec($cmd, $output, $retval);

                    return $ret !== false && $retval === 0;
                } catch (\Exception $ex) {
                    return false;
                }
            }
        } catch (\Exception $ex) {
            var_dump($ex);
            exit();
        }

        return false;
    }

    function getIcon(string|null $name, int $iconSizeX = 100, int $iconSizeY = 100): string
    {
        try {
            if (is_null($name)) {
                return '';
            }

            $color = '#000000';

            $path = '../';
            $name = trim(strtolower($name));
            $pi = pathinfo($name);

            $mtime = file_exists($path . $name) ? filemtime($path . $name) : time();

            $pngname = $pi['filename'] . '.png';
            $pngpath = './libs/toLabeler/icons/' . $color . '/' . $iconSizeX . 'x' . $iconSizeY . '/';
            if (!is_dir($pngpath))
                mkdir($pngpath, 0777, true);
            if (file_exists($pngpath . $pngname) && filemtime($pngpath . $pngname) === $mtime)
                return $pngpath . $pngname;

            if (file_exists($path . $name) && is_readable($path . $name) && $pi['extension'] === 'svg') {
                $svg = file_get_contents($path . $name);

                foreach ([3, 4, 8, 6] as $size) {
                    $svg = preg_replace("/([\s]+)width[\s]*=[\"'][\s]*(.+?)[\s]*[\"']/i", '$1width="1000"', $svg);
                    $svg = preg_replace("/([\s]+)height[\s]*=[\"'][\s]*(.+?)[\s]*[\"']/i", '$1height="1000"', $svg);

                    $colorPattern = "(#[0-9a-zA-Z]{{$size}})";
                    $svg = preg_replace("/\"(\s*){$colorPattern}(\s*)\"/i", "\"{$color}\"", $svg);
                    $svg = preg_replace('/\"(\s*)currentColor(\s*)\"/i', "\"{$color}\"", $svg);

                    foreach (['color', 'fill', 'stroke'] as $key) {
                        $svg = preg_replace("/{$key}(\s*):(\s*){$colorPattern}(\s*)([;\"']+)/i", "{$key}:{$color}$5", $svg);
                    }
                }

                if (!$this->svg2png($svg, $pngpath . $pngname, $iconSizeX, $iconSizeY)) {
                    copy(__DIR__ . '/libs/toLabeler/assets/blank.png', $pngpath . $pngname);
                } else {
                    list($width, $height, $type, $attr) = getimagesize($pngpath . $pngname);

                    $newWidth = $iconSizeX;
                    $newHeight = $iconSizeY;
                    if ($width > $height) {
                        $newWidth = $iconSizeX;
                        $newHeight = $height * ($iconSizeY / $width);
                    }
                    if ($width < $height) {
                        $newWidth = $width * ($iconSizeX / $height);
                        $newHeight = $iconSizeY;
                    }

                    $resampledIm = imagecreatetruecolor($newWidth, $newHeight);

                    $white = imagecolorallocate($resampledIm, 255, 255, 255);
                    imagefill($resampledIm, 0, 0, $white);

                    $image = imagecreatefrompng($pngpath . $pngname);
                    imagecopyresampled($resampledIm, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                    imagepng($resampledIm, $pngpath . $pngname, 0);

                    if (file_exists($pngpath . $name) && is_writable($pngpath . $name)) {
                        unlink($pngpath . $name);
                    }
                }

                touch($pngpath . $pngname, $mtime);

                return $pngpath . $pngname;
            }
        } catch (\Exception $ex) {
            var_dump($ex);
            exit();
        }

        return '';
    }

    public function Output(int $rowIndex): mixed
    {
        global $switchboard;

        if ($rowIndex < 0 || $rowIndex > count($switchboard->rows) - 1) {
            return null;
        }

        $fName = "Output_" . $this->model;
        if (!is_callable([__CLASS__, $fName])) {
            return null;
        }

        return call_user_func_array([__CLASS__, $fName], [$rowIndex]);
    }

    public function Output_PT_P300BT(int $rowIndex): mixed
    {
        return $this->Output_PT_P710BT($rowIndex);
    }

    public function Output_PT_P720BT(int $rowIndex): mixed
    {
        return $this->Output_PT_P710BT($rowIndex);
    }

    public function Output_PT_P910BT(int $rowIndex): mixed
    {
        return $this->Output_PT_P710BT($rowIndex);
    }

    public function Output_PT_P920BT(int $rowIndex): mixed
    {
        return $this->Output_PT_P710BT($rowIndex);
    }

    public function Output_PT_P710BT(int $rowIndex): mixed
    {
        global $switchboard;

        $modules = $switchboard->rows[$rowIndex];

        $trim = isset($this->options['options']['trim'])  ? $this->options['options']['trim'] : 'ext';
        if ($trim === 'all') {
            for ($i = 1; $i < count($modules) - 1; $i++) {
                if (isset($modules[$i]->free) && $modules[$i]->free === true) {
                    array_splice($modules, $i, 1);
                    $i--;
                }
            }
        }
        if ($trim === 'all' || $trim === 'ext') {
            // trim left
            while (count($modules) > 0 && isset($modules[0]->free) && $modules[0]->free === true) {
                array_shift($modules);
            }
            // trim right
            while (count($modules) > 0 && isset($modules[count($modules) - 1]->free) && $modules[count($modules) - 1]->free === true) {
                array_pop($modules);
            }
        }
        if (count($modules) === 0) {
            return null;
        }

        $dpiX = isset($this->options['dpi']) && isset($this->options['dpi']['x']) ? intval($this->options['dpi']['x']['value'] ?? 180) : 180;
        $dpiY = isset($this->options['dpi']) && isset($this->options['dpi']['y']) ? intval($this->options['dpi']['y']['value'] ?? 360) : 360;

        $displayOptions = isset($this->options['options']) ? $this->options['options'] : null;

        $hasBorderInter = isset($displayOptions['borders']) && isset($displayOptions['borders']['inter']) ? $displayOptions['borders']['inter'] === true : true;

        $invert = isset($displayOptions['invert']) ? $displayOptions['invert'] : ['has' => false, 'value' => false];
        $invert = ($invert['has'] ?? false) === true && ($invert['value'] ?? false) === true;

        $iconsOptions = isset($displayOptions['icons']) ? $displayOptions['icons'] : ['has' => false, 'value' => false];
        $withIcons = ($iconsOptions['has'] ?? false) === true && ($iconsOptions['value'] ?? false) === true;

        $textOptions = isset($displayOptions['text']) ? $displayOptions['text'] : ['has' => false, 'value' => false];
        $withText = ($textOptions['has'] ?? false) === true && ($textOptions['value'] ?? false) === true;

        $textOrientation = strtoupper(trim(isset($displayOptions['textOrientation']) ? $displayOptions['textOrientation']['value'] ?? 'horizontal' : 'horizontal'));
        $textSize = strtoupper(trim(isset($displayOptions['textSize']) ? $displayOptions['textSize']['value'] ?? 'normal' : 'normal'));

        $displayMode = 'BOTH';
        if ($withIcons && !$withText) {
            $displayMode = 'ICONS';
        } else if (!$withIcons && $withText) {
            $displayMode = 'TEXT';
        }

        $stepSize = isset($this->options['stepSize']) && isset($this->options['stepSize']['value']) ? floatval($this->options['stepSize']['value'] ?? $switchboard->stepSize) : $switchboard->stepSize;
        if ($stepSize !== 17.5 && $stepSize !== 18) {
            $stepSize = $switchboard->stepSize;
        }

        $widthMM = array_sum(array_map(function ($m) use ($stepSize) {
            return $m->span * $stepSize;
        }, $modules));
        $widthPX = (int)round($widthMM * ($dpiX / 25.4));
        $heightMM = $this->options['ribbon']['value'];
        $heightPX = (int)round($heightMM * ($dpiY / 25.4));
        $stepSizePX = (int) round($stepSize * ($dpiX / 25.4));

        $im = imagecreatetruecolor($widthPX, $heightPX);
        imageresolution($im, $dpiX, $dpiY);
        imagealphablending($im, true);
        imagesavealpha($im, false);

        $white = imagecolorallocate($im, 255, 255, 255);
        $black = imagecolorallocate($im, 0, 0, 0);
        imagefill($im, 0, 0, $white);

        $r = $dpiY / $dpiX;
        $w = $stepSizePX - $this->margins;
        $h = ($displayMode === 'BOTH' ? $heightPX / 2 : $heightPX) - $this->margins;
        $placeSizeX = $w;
        $placeSizeY = $h;

        if (($w * $r) < $h) {
            $placeSizeX = $w;
            $placeSizeY = $w * $r;
        } else {
            $placeSizeX = $h / $r;
            $placeSizeY = $h;
        }
        $placeSizeX = (int) round($placeSizeX);
        $placeSizeY = (int) round($placeSizeY);

        $posX = 0;

        for ($i = 0; $i < count($modules); $i++) {
            $module = $modules[$i];

            $currentWidthPx = $stepSizePX * $module->span;
            $posY = 0;

            if (isset($module->icon) && !is_null($module->icon) && is_string($module->icon) && $displayMode === 'BOTH' || $displayMode === 'ICONS') {
                $icon = $this->getIcon($module->icon, $placeSizeX, $placeSizeY);
                if ($icon !== '') {
                    $iconIm = imagecreatefrompng($icon);
                    $sx = imagesx($iconIm);
                    $sy = imagesy($iconIm);

                    $centerX = (int)round(($currentWidthPx / 2) - ($sx / 2));
                    $centerY = (int) round((($displayMode === 'BOTH' ? $heightPX / 2 : $heightPX) / 2) - ($sy / 2));

                    imagecopy($im, $iconIm, $posX + $centerX, $posY + $centerY, 0, 0, $sx, $sy);
                }
            }

            if (isset($module->text) && is_string($module->text) && trim($module->text) !== "" && $displayMode === 'BOTH' || $displayMode === 'TEXT') {
                $w = (int)$currentWidthPx - $this->margins - $this->margins;
                $h = (int) round($placeSizeY / $r);

                $imt = imagecreatetruecolor($w, $h);
                imageresolution($imt, $dpiX, $dpiY);
                imagealphablending($imt, true);

                $white2 = imagecolorallocate($imt, 255, 255, 255);
                $black2 = imagecolorallocate($imt, 0, 0, 0);
                imagefill($imt, 0, 0, $white2);

                $font = __DIR__ . '/libs/toLabeler/assets/arial.ttf';
                $fontSize = $textSize === 'LARGE' ? 14 : ($textSize === 'SMALL' ? 10 : 12);
                $box = imagettfbbox($fontSize, 0, $font, $module->text);
                $boxW = $box[4] - $box[6];
                $boxH = $box[5] - $box[3];

                $tx = (int) round(($w / 2) - ($boxW / 2));
                $ty = $posY + $this->margins + 5;
                $angle = 0;
                if ($textOrientation === 'VERTICAL') {
                    $angle = 90;
                    $tx = ((int) round(($w / 2) + ($boxH / 2))) + $this->margins;
                    $h -= (2 * $this->margins);
                    $ty = $posY + $h;
                }

                imagettftext($imt, $fontSize, $angle, $tx, $ty,  $black2, $font, $module->text);

                imagecopyresampled($im, $imt, $posX + ((int) round(($currentWidthPx / 2) - ($w / 2))), $posY + $this->margins + ($displayMode === 'BOTH' ? (int) round($heightPX / 2) : 0), 0, 0, $currentWidthPx - $this->margins - $this->margins, $placeSizeY, $w, $h);
            }

            if ($hasBorderInter) {
                imagedashedline($im, $posX + $currentWidthPx - 1, 0, $posX + $currentWidthPx - 1, $heightPX, $black);
            }

            $posX += $currentWidthPx;
        }

        if ($invert) {
            imagefilter($im, IMG_FILTER_NEGATE);
        }

        return $im;
    }
}


if (isset($_GET['require'])) {
    header('Content-Type: application/json; charset=utf-8');
    $requirements = TiquettesLabeler::requirements();
    echo json_encode($requirements);
    exit();
}


if (!isset($_POST['switchboard'])) {
    echo 'Missing switchboard parameter';
    exit;
}
if (!isset($_POST['model'])) {
    echo 'Missing labeler model parameter';
    exit;
}
if (!isset($_POST['options'])) {
    echo 'Missing options parameter';
    exit;
}
if (!isset($_POST['selections'])) {
    echo 'Missing selections parameter';
    exit;
}

$switchboard = json_decode($_POST['switchboard']);
$options = json_decode($_POST['options'], true);
$selections = json_decode($_POST['selections'], true);
$tv = json_decode($_POST['tv']);
$isDev = intval(trim(($_POST['isDev'] ?? '0'))) === 1;
$model = trim(filter_string_polyfill($_POST['model']));

$displayOptions = isset($options['options']) ? $options['options'] : null;
$hasBorderLeft = isset($displayOptions['borders']) && isset($displayOptions['borders']['left']) ? $displayOptions['borders']['left'] === true : false;
$hasBorderTop = isset($displayOptions['borders']) && isset($displayOptions['borders']['top']) ? $displayOptions['borders']['top'] === true : false;
$hasBorderRight = isset($displayOptions['borders']) && isset($displayOptions['borders']['right']) ? $displayOptions['borders']['right'] === true : false;
$hasBorderBottom = isset($displayOptions['borders']) && isset($displayOptions['borders']['bottom']) ? $displayOptions['borders']['bottom'] === true : false;

$tl = new TiquettesLabeler($model, $options);

$rowImages = [];
for ($rowIndex = 0; $rowIndex < count($switchboard->rows); $rowIndex++) {
    if (!in_array($rowIndex, $selections)) {
        continue;
    }
    $img = $tl->Output($rowIndex);
    if (!is_null($img)) {
        $rowImages[] = [
            'filename' => "Rangée " . ($rowIndex + 1) . " - " . $options['ribbon']['value'] . "mm - " . $model . ".png",
            'stream' => $img
        ];
    }
}

$zip = new ZipStream(
    //operationMode: OperationMode::SIMULATE_STRICT, // or SIMULATE_LAX
    defaultEnableZeroHeader: false,
    sendHttpHeaders: true,
    outputName: $switchboard->prjname .  " - " . $options['ribbon']['value'] . "mm - " . $model . " - Tiquettes " . $tv . ".zip",
    outputStream: CallbackStreamWrapper::open(function (string $data) {
        echo $data;
    }),
);

$tmppath = './libs/toLabeler/tmp/' . uniqid() . '/';
if (!is_dir($tmppath))
    mkdir($tmppath, 0777, true);

$created = [];
foreach ($rowImages as $img) {
    $f = $tmppath . $img['filename'];
    if (file_exists($f)) {
        unlink($f);
    }

    $sx = imagesx($img['stream']);
    $sy = imagesy($img['stream']);
    $black = imagecolorallocate($img['stream'], 0, 0, 0);
    if ($hasBorderLeft) {
        imagedashedline($img['stream'], 0, 0, 0, $sy, $black);
    }
    if ($hasBorderRight) {
        imagedashedline($img['stream'], $sx - 1, 0, $sx - 1, $sy, $black);
    }
    if ($hasBorderTop) {
        imagedashedline($img['stream'], 0, 0, $sx, 0, $black);
    }
    if ($hasBorderBottom) {
        imagedashedline($img['stream'], 0, $sy - 1, $sx, $sy - 1, $black);
    }

    if (imagepng($img['stream'], $f)) {
        $zip->addFileFromPath(basename($f), $f);
    }
}

$size = $zip->finish();

$files = glob($tmppath . '*');
foreach ($files as $file) {
    if (is_file($file)) {
        unlink($file);
    }
}
rmdir($tmppath);
