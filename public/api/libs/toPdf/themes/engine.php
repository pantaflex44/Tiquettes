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

class Theme
{

    private static function computeColor($hexColor)
    {
        list($r, $g, $b) = sscanf($hexColor, "#%02x%02x%02x");
        return array($r, $g, $b);
    }

    private static function setBgColor($pdf, $data)
    {
        if (array_key_exists('backgroundColor', $data)
            && preg_match('/^#[a-f0-9]{6}$/i', $data['backgroundColor'])
            && strlen($data['backgroundColor']) === 7
        ) {
            $color = self::computeColor($data['backgroundColor']);
            $pdf->SetFillColor($color[0], $color[1], $color[2]);
        } else {
            $pdf->SetFillColor(255, 255, 255);
        }
    }

    private static function setFgColor($pdf, $data)
    {
        if (array_key_exists('color', $data)
            && preg_match('/^#[a-f0-9]{6}$/i', $data['color'])
            && strlen($data['color']) === 7
        ) {
            $color = self::computeColor($data['color']);
            $pdf->SetTextColor($color[0], $color[1], $color[2]);
        } else {
            $pdf->SetTextColor(0, 0, 0);
        }
    }

    private static function setBdrColor($pdf, $data)
    {
        if (array_key_exists('borderColor', $data)
            && preg_match('/^#[a-f0-9]{6}$/i', $data['borderColor'])
            && strlen($data['borderColor']) === 7
        ) {
            $color = self::computeColor($data['borderColor']);
            $pdf->SetFillColor($color[0], $color[1], $color[2]);
            $pdf->SetDrawColor($color[0], $color[1], $color[2]);
        } else {
            $pdf->SetFillColor(0, 0, 0);
            $pdf->SetDrawColor(0, 0, 0);
        }
    }

    public static function render($pdf, $workBox, $themeData, $module, $printOptions)
    {
        if ($printOptions->freeModules === true || (!$printOptions->freeModules && !$module->free)) {
            $originalData = json_decode(json_encode($themeData), true);

            $data = array_filter(
                $originalData,
                fn($val, $key) => array_key_exists('shown', $val) && $val['shown'] === true && $key !== 'top' && $key !== 'bottom',
                ARRAY_FILTER_USE_BOTH
            );
            $count = count(array_keys($data));
            if ($count === 0) return;

            $data = array_map(fn($k) => array_merge($k, [
                'position' => $k['position'] === 'top' ? 0 : ($k['position'] === 'middle' ? 1 : 2),
            ]), $data);
            array_multisort(array_column($data, 'position'), SORT_ASC, $data);
            $pos = 0;
            $np = $workBox['y'];
            $nbFh = [];
            $keys = array_keys($data);
            $firstKey = count($keys) > 0 ? array_shift($keys) : '';
            $lastKey = count($keys) > 0 ? array_pop($keys) : '';
            $hasBottomBorder = array_key_exists('bottom', $originalData) && ($originalData['bottom']['border'] ?? false) === true;
            $hasTopBorder = array_key_exists('top', $originalData) && ($originalData['top']['border'] ?? false) === true;
            $borderBottomSize = $hasBottomBorder ? ($originalData['bottom']['borderSize'] ?? 1) * 0.2645833333 : 0;
            $borderTopSize = $hasTopBorder ? ($originalData['top']['borderSize'] ?? 1) * 0.2645833333 : 0;
            $borderBottomStyle = $hasBottomBorder ? ($originalData['bottom']['borderStyle'] ?? 'normal') : 'normal';
            $borderTopStyle = $hasTopBorder ? ($originalData['top']['borderStyle'] ?? 'normal') : 'normal';

            foreach (array_keys($data) as $key) {
                if ($data[$key]['fullHeight'] === true) $nbFh[] = $key;

                $data[$key]['margins'] = [
                    'top' => $pos === 0 ? 2 : 1,
                    'bottom' => $pos === $count - 1 ? 2 : 1,
                    'left' => 1,
                    'right' => 1,
                ];
                $data[$key]['position'] = $pos++;

                if ($key === 'id' || $key === 'text') {
                    $data[$key]['fontFamily'] = strtolower(trim($data[$key]['fontFamily'] ?? 'sans-serif'));
                    if ($data[$key]['fontFamily'] === 'serif') $data[$key]['fontFamily'] = 'Times';
                    else if ($data[$key]['fontFamily'] === 'monospace') $data[$key]['fontFamily'] = 'Courier';
                    else if ($data[$key]['fontFamily'] === 'cursive') $data[$key]['fontFamily'] = 'Symbol';
                    else $data[$key]['fontFamily'] = 'Helvetica';
                    $data[$key]['fontSize'] = (float)($data[$key]['fontSize'] ?? 2.4);
                    $data[$key]['fontSizePt'] = $data[$key]['fontSize'] / 0.35277777777778; // mm to pt
                    $data[$key]['fontStyle'] = strtolower(trim($data[$key]['fontStyle'] ?? 'normal'));
                    $data[$key]['fontWeight'] = strtolower(trim($data[$key]['fontWeight'] ?? 'normal'));
                    $s = $data[$key]['fontStyle'] === 'italic' ? 'I' : '';
                    $s .= $data[$key]['fontWeight'] === 'bold' ? 'B' : '';
                    $data[$key]['fontStyle'] = $s;
                    $data[$key]['fontWeight'] = '';

                    $data[$key]['lineCount'] = (int)($data[$key]['lineCount'] ?? 1);
                    $data[$key]['place'] = [
                        'w' => $workBox['w'] + 0.1,
                        'h' => ($data[$key]['lineCount'] * $data[$key]['fontSize']) + (($data[$key]['lineCount'] - 1) * 0.5373),
                    ];
                }

                if ($key === 'icon') {
                    $data[$key]['sizeMm'] = array_key_exists('sizePercent', $data[$key]) ? ((50 + ($data[$key]['sizePercent'] / 2)) / 100) * 10 : 10;
                    $data[$key]['place'] = [
                        'w' => min($data[$key]['sizeMm'], $workBox['w'] - $data[$key]['margins']['left'] - $data[$key]['margins']['right']) - 1,
                        'h' => min($data[$key]['sizeMm'], $workBox['w'] - $data[$key]['margins']['left'] - $data[$key]['margins']['right']) - 1,
                    ];
                }
                $data[$key]['bgPlace'] = [
                    'x' => $workBox['x'],
                    'y' => $np,
                    'w' => $workBox['w'],
                    'h' => $data[$key]['place']['h'] + $data[$key]['margins']['top'] + $data[$key]['margins']['bottom'],
                ];

                if ($firstKey === $key && $hasTopBorder) {
                    $data[$key]['bgPlace']['h'] += $borderTopSize;
                }
                if ($lastKey === $key && $hasBottomBorder) {
                    $data[$key]['bgPlace']['h'] += $borderBottomSize;
                }

                $np = $data[$key]['bgPlace']['y'] + $data[$key]['bgPlace']['h'];
            }

            // full height
            if (count($nbFh) > 0) {
                $hs = array_sum(array_values(array_map(fn($k) => $k['bgPlace']['h'], $data)));
                $diffNp = $workBox['h'] - $hs;
                $diffNp = $diffNp / count($nbFh);
                foreach ($nbFh as $key) $data[$key]['bgPlace']['h'] += $diffNp;
                $np = $workBox['y'];
                foreach (array_keys($data) as $key) {
                    $data[$key]['bgPlace']['y'] = $np;
                    $np = $data[$key]['bgPlace']['y'] + $data[$key]['bgPlace']['h'];
                }
            }

            // space between
            if ($count - 1 > 0) {
                $hs = array_sum(array_values(array_map(fn($k) => $k['bgPlace']['h'], $data)));
                $freeHs = ($workBox['h'] - $hs) / ($count - 1);
                $keys = array_keys($data);
                array_shift($keys);
                $cnt = 0;
                foreach ($keys as $key) $data[$key]['bgPlace']['y'] += $freeHs + ($cnt++ * $freeHs);
            }

            // draw background color
            foreach (array_keys($data) as $key) {
                self::setBgColor($pdf, $data[$key]);
                $r = $data[$key]['bgPlace'];
                $pdf->Rect($r['x'], $r['y'], $r['w'], $r['h'], 'F');

                $oldX = $pdf->GetX();
                $oldY = $pdf->GetY();
                $posX = $r['x'] + (($r['w'] - $data[$key]['place']['w']) / 2);
                $largeMarginTop = ($firstKey === $key ? 0.5 : 0);
                $largeMarginBottom = ($lastKey === $key ? 0.5 : 0);
                $borderBottomMargin = ($lastKey === $key && $hasBottomBorder ? $borderBottomSize : 0);
                $borderTopMargin = ($firstKey === $key && $hasTopBorder ? $borderTopSize : 0);
                $posY = $r['y'] + $largeMarginTop - $largeMarginBottom + (($r['h'] - $data[$key]['place']['h']) / 2) + $borderBottomMargin - $borderTopMargin;
                $pdf->SetXY($posX, $posY);

                if ($key === 'id' || $key === 'text') { // draw text
                    self::setFgColor($pdf, $data[$key]);
                    $pdf->SetFont($data[$key]['fontFamily'], $data[$key]['fontStyle'], $data[$key]['fontSizePt']);
                    $txt = mb_convert_encoding($module->{$key}, 'windows-1252', 'UTF-8');
                    $align = strtolower(trim(($data[$key]['horizontalAlignment'] ?? 'center')));
                    $align = $align === 'left' ? 'L' : ($align === 'right' ? 'R' : 'C');
                    $pdf->MultiCell($data[$key]['place']['w'], $data[$key]['fontSize'], $txt, 0, $align, false, $data[$key]['lineCount']);

                } else if ($key === 'icon' && $module->icon) { // draw icons

                    $color = (array_key_exists('color', $data[$key])
                        && preg_match('/^#[a-f0-9]{6}$/i', $data[$key]['color'])
                        && strlen($data[$key]['color']) === 7
                    ) ? $data[$key]['color'] : '#000000';

                    $icon = $pdf->getIcon($module->icon, $color, 100);

                    if ($icon !== '') {
                        $pdf->Image($icon, $posX, $posY, $data[$key]['place']['w'], $data[$key]['place']['w'], 'PNG');
                    }
                }

                $pdf->SetXY($oldX, $oldY);
            }

            // draw borders
            if ($firstKey !== '' && $hasTopBorder) {
                self::setBdrColor($pdf, $originalData['top']);

                $r = $data[$firstKey]['bgPlace'];
                //$pdf->Rect($r['x'], $r['y'] + $r['h'] - $borderTopSize, $r['w'], $borderTopSize, 'F');
                $pdf->SetLineWidth($borderTopSize);
                if ($borderTopStyle === 'dashed') {
                    $pdf->SetDash(1, 0.6);
                } elseif ($borderTopStyle === 'dotted') {
                    $pdf->SetDash(0.5, 0.5);
                } else {
                    $pdf->SetDash(null, null);
                }
                $pdf->Line($r['x'] + ($borderTopSize / 2), $r['y'] + $r['h'] - $borderTopSize + 0.4, $r['x'] + $r['w'] - ($borderTopSize / 2), $r['y'] + $r['h'] - $borderTopSize + 0.4);
                $pdf->SetDash(null, null);
                $pdf->SetLineWidth(0.2);
            }
            if ($lastKey !== '' && $hasBottomBorder) {
                self::setBdrColor($pdf, $originalData['bottom']);
                $r = $data[$lastKey]['bgPlace'];
                //$pdf->Rect($r['x'], $r['y'], $r['w'], $borderBottomSize, 'F');
                $pdf->SetLineWidth($borderBottomSize);
                if ($borderBottomStyle === 'dashed') {
                    $pdf->SetDash(1, 0.6);
                } elseif ($borderBottomStyle === 'dotted') {
                    $pdf->SetDash(0.5, 0.5);
                } else {
                    $pdf->SetDash(null, null);
                }
                $pdf->Line($r['x'] + ($borderBottomSize / 2), $r['y'], $r['x'] + $r['w'] - ($borderBottomSize / 2), $r['y']);
                $pdf->SetDash(null, null);
                $pdf->SetLineWidth(0.2);
            }
        }

    }

}