<?php

/**
 * Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
 * Copyright (C) 2024-2026 Christophe LEMOINE
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

declare(strict_types=1);

include_once('./functions.php');

class Svg2Png
{

    /* Privates */

    private $isDevMode = false;
    private $converters = [];

    private function Initialize(): void
    {
        if (!version_compare(phpversion(), '8.3', '>=')) {
            throw new Exception("Svg2Png library require PHP version greater or equal than 8.3");
        }

        $cliExecutor = function (string $cmdLine, callable $callback): bool {
            try {
                $retval = 0;
                $output = [];
                $ret = exec($cmdLine, $output, $retval);
                return $callback($ret,  $retval, $output);
            } catch (\Exception $ex) {
                return false;
            }
        };

        $cliConverterExecutor = function (string $cmdLine, callable $callback, string $svgContent, int $outputWidth, int $outputHeight, string $pngFilepath): bool {
            $f = basename($pngFilepath, '.png');
            $d = dirname($pngFilepath);
            $s = "{$d}/{$f}.svg";
            if (file_put_contents($s, $svgContent) !== false) {
                try {
                    $cmd = sprintf($cmdLine, $s, $outputWidth, $outputHeight, $pngFilepath);
                    $retval = 0;
                    $output = [];
                    $ret = exec($cmd, $output, $retval);
                    return $callback($ret, $retval, $output);
                } catch (\Exception $ex) {
                    return false;
                }
            } else {
                return false;
            }
        };

        $converters = [
            [
                'type' => 'module_imagick',
                'displayname' => trim('PHP Imagick ' . phpversion('imagick') ?: ''),
                'requirement' => [null, fn() => extension_loaded('imagick')],
                'callback' => function (string $svgContent, int $outputWidth, int $outputHeight, string $pngFilepath): bool {
                    $image = new Imagick();
                    $image->newImage($outputWidth, $outputHeight, new ImagickPixel('transparent'));
                    $image->readImageBlob($svgContent);
                    $image->transparentPaintImage('#ffffff', 0, 10, false);
                    //$image->thumbnailImage($outputWidth, $outputHeight, true);
                    $image->setImageFormat('png64');
                    $image->writeImage($pngFilepath);
                    return file_exists($pngFilepath);
                }
            ],
            [
                'type' => 'cli_magick',
                'displayname' => 'ImageMagick CLI (magick)',
                'requirement' => ['magick -version', fn(mixed $ret, int $retval) => $ret !== false && $retval === 0],
                'callback' => function (string $svgContent, int $outputWidth, int $outputHeight, string $pngFilepath) use ($cliConverterExecutor): bool {
                    return $cliConverterExecutor(
                        'magick %1$s -size %2$dx%3$d -transparent white png24:%4$s',
                        fn(mixed $ret, int $retval) => $ret !== false && $retval === 0,
                        $svgContent,
                        $outputWidth,
                        $outputHeight,
                        $pngFilepath
                    );
                }
            ],
            [
                'type' => 'cli_convert',
                'displayname' => 'ImageMagick CLI (convert)',
                'requirement' => ['convert -version', fn(mixed $ret, int $retval) => $ret !== false && $retval === 0],
                'callback' => function (string $svgContent, int $outputWidth, int $outputHeight, string $pngFilepath) use ($cliConverterExecutor): bool {
                    return $cliConverterExecutor(
                        'convert %1$s -size %2$dx%3$d -transparent white png24:%4$s',
                        fn(mixed $ret, int $retval) => $ret !== false && $retval === 0,
                        $svgContent,
                        $outputWidth,
                        $outputHeight,
                        $pngFilepath
                    );
                }
            ],
            [
                'type' => 'cli_batik',
                'displayname' => 'Apache™ Batik SVG Toolkit',
                'requirement' => ['java -version', fn(mixed $ret, int $retval) => $ret !== false && $retval === 0 && file_exists('./libs/batik-1.19/batik-rasterizer-1.19.jar')],
                'callback' => function (string $svgContent, int $outputWidth, int $outputHeight, string $pngFilepath) use ($cliConverterExecutor): bool {
                    return $cliConverterExecutor(
                        'java -jar ./libs/batik-1.19/batik-rasterizer-1.19.jar -m image/png -w %2$d -h %3$d -d %4$s %1$s',
                        fn(mixed $ret, int $retval) => $ret !== false && is_string($ret) && $retval === 0 && str_contains($ret, 'success'),
                        $svgContent,
                        $outputWidth,
                        $outputHeight,
                        $pngFilepath
                    );
                }
            ]
        ];

        foreach ($converters as $converter) {
            if (str_starts_with($converter['type'], 'module_')) {
                if ($this->isDevMode && $converter['type'] === 'module_imagick') {
                    continue;
                }
                if ($converter['requirement'][1]()) {
                    $this->converters[] = $converter;
                }
            } else if (str_starts_with($converter['type'], 'cli_')) {
                if ($cliExecutor($converter['requirement'][0], $converter['requirement'][1])) {
                    $this->converters[] = $converter;
                }
            }
        }

        if (count($this->converters) === 0) {
            throw new Exception("No SVG to PNG converter found !");
        }
    }

    /* Publics */

    public function __construct(bool $isDevMode)
    {
        $this->isDevMode = $isDevMode;

        $this->Initialize();
    }

    function GetCurrentConverter(): array
    {
        return $this->converters[0];
    }

    function Convert(string $svgContent, int $outputWidth, int $outputHeight, string $pngFilepath): bool
    {
        return $this->GetCurrentConverter()['callback']($svgContent, $outputWidth, $outputHeight, $pngFilepath);
    }
}
