<?php

class Theme
{

    private static function computeColor($hexColor)
    {
        list($r, $g, $b) = sscanf($hexColor, "#%02x%02x%02x");
        return array($r, $g, $b);
    }

    private static function computeMargins($data, $count)
    {
        $marginsMM = ['top' => 1, 'bottom' => 1, 'left' => 1, 'right' => 1];
        if ($data['position'] === 0) $marginsMM['top'] = 2;
        if ($data['position'] === $count - 1) $marginsMM['bottom'] = 2;

        return $marginsMM;
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

    private static function renderIcon($pdf, $workBox, $data, $module, $count)
    {
        $marginsMM = self::computeMargins($data, $count);
        $sizeMm = array_key_exists('sizePercent', $data) ? ((50 + ($data['sizePercent'] / 2)) / 100) * 10 : 10;

        self::setBgColor($pdf, $data);
    }

    public static function render($pdf, $workBox, $themeData, $module)
    {
        $data = json_decode(json_encode($themeData), true);
        $data = array_filter(
            $data,
            fn($val, $key) => array_key_exists('shown', $val) && $val['shown'] === true,
            ARRAY_FILTER_USE_BOTH
        );
        if (count($data) === 0) return;

        $data = array_map(fn($k) => array_merge($k, ['position' => $k['position'] === 'top' ? 0 : ($k['position'] === 'middle' ? 1 : 2)]), $data);
        array_multisort(array_column($data, 'position'), SORT_ASC, $data);

        $count = count(array_keys($data));
        foreach ($data as $key => $val) {
            if ($key === 'icon') self::renderIcon($pdf, $workBox, $val, $module, $count);
        }

        var_dump($data);

    }

}