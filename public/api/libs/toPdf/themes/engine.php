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
        if (array_key_exists('backgoundColor', $data)
            && preg_match('/^#[a-f0-9]{6}$/i', $data['backgoundColor'])
            && strlen($data['backgoundColor']) === 7
        ) {
            $color = self::computeColor($data['backgoundColor']);
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

    public static function render($pdf, $workBox, $themeData, $module)
    {
        $data = json_decode(json_encode($themeData), true);
        $data = array_filter(
            $data,
            fn($val, $key) => array_key_exists('shown', $val) && $val['shown'] === true,
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
        foreach (array_keys($data) as $key) {
            if ($data[$key]['fullHeight'] === true) {
                $nbFh[] = $key;
            }

            $data[$key]['margins'] = [
                'top' => $pos === 0 ? 2 : 1,
                'bottom' => $pos === $count - 1 ? 2 : 1,
                'left' => 1,
                'right' => 1,
            ];
            $data[$key]['position'] = $pos++;

            self::setBgColor($pdf, $data);

            if ($key === 'id' || $key === 'text') {
                self::setFgColor($pdf, $data);

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
                $pdf->SetFont($data[$key]['fontFamily'], $data[$key]['fontStyle'], $data[$key]['fontSizePt']);

                $data[$key]['lineCount'] = (int)($data[$key]['lineCount'] ?? 1);
                $data[$key]['place'] = [
                    'w' => $workBox['w'] - $data[$key]['margins']['left'] - $data[$key]['margins']['right'],
                    'h' => ($data[$key]['lineCount'] * $data[$key]['fontSize']) + (($data[$key]['lineCount'] - 1) * 0.5373),
                ];
            }
            if ($key === 'icon') {
                $sizeMm = array_key_exists('sizePercent', $data[$key]) ? ((50 + ($data[$key]['sizePercent'] / 2)) / 100) * 10 : 10;
                $data[$key]['place'] = [
                    'w' => $sizeMm,
                    'h' => $sizeMm,
                ];
            }
            $data[$key]['bgPlace'] = [
                'x' => $workBox['x'],
                'y' => $np,
                'w' => $workBox['w'],
                'h' => $data[$key]['place']['h'] + $data[$key]['margins']['top'] + $data[$key]['margins']['bottom'],
            ];
            $np = $data[$key]['bgPlace']['y'] + $data[$key]['bgPlace']['h'];
        }

        $diffNp = $workBox['h'] - $np;
        if (count($nbFh) > 0) {
            $diffNp = $diffNp / count($nbFh);
            foreach ($nbFh as $key) $data[$key]['bgPlace']['h'] += $diffNp;
        }


        var_dump($data);

    }

}