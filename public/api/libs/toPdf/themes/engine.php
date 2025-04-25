<?php

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
        } else {
            $pdf->SetFillColor(0, 0, 0);
        }
    }

    public static function render($pdf, $workBox, $themeData, $module)
    {
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
        $borderBottomSize = $hasBottomBorder ? $originalData['bottom']['borderSize'] * 0.2645833333 : 0;
        $borderTopSize = $hasTopBorder ? $originalData['top']['borderSize'] * 0.2645833333 : 0;
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
                    'w' => $workBox['w'] - $data[$key]['margins']['left'] - $data[$key]['margins']['right'],
                    'h' => ($data[$key]['lineCount'] * $data[$key]['fontSize']) + (($data[$key]['lineCount'] - 1) * 0.5373),
                ];
            }
            if ($key === 'icon') {
                $data[$key]['sizeMm'] = array_key_exists('sizePercent', $data[$key]) ? ((50 + ($data[$key]['sizePercent'] / 2)) / 100) * 10 : 10;
                $data[$key]['place'] = [
                    'w' => $data[$key]['sizeMm'],
                    'h' => $data[$key]['sizeMm'],
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

            if ($key === 'id' || $key === 'text') {
                self::setFgColor($pdf, $data);
                $pdf->SetFont($data[$key]['fontFamily'], $data[$key]['fontStyle'], $data[$key]['fontSizePt']);

                
            } else if ($key === 'icon') {

            }
        }

        // draw borders
        if ($firstKey !== '' && $hasTopBorder) {
            self::setBdrColor($pdf, $originalData['top']);
            $r = $data[$firstKey]['bgPlace'];
            $pdf->Rect($r['x'], $r['y'] + $r['h'] - $borderTopSize, $r['w'], $borderTopSize, 'F');
        }
        if ($lastKey !== '' && $hasBottomBorder) {
            self::setBdrColor($pdf, $originalData['bottom']);
            $r = $data[$lastKey]['bgPlace'];
            $pdf->Rect($r['x'], $r['y'], $r['w'], $borderBottomSize, 'F');
        }


    }

}