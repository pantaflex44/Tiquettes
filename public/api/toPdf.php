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

/*error_reporting(E_ALL);
ini_set('display_errors', '1');*/

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


require('./libs/fpdf186/fpdf.php');
define('EURO', chr(128));


function str(string $str): string|false
{
    return iconv('UTF-8', 'windows-1252', $str);
}

function cutStr(string $str, int $length = 50): string
{
    return strtok(wordwrap($str, $length, "...\n"), "\n");
}

function toFrenchDate(string $date, $withDate = true, $withHours = true): string
{
    $date = new \DateTimeImmutable($date);

    $f = [];
    $df = 'd/m/Y';
    $hf = 'H:i';
    if ($withDate)
        $f[] = $df;
    if ($withHours)
        $f[] = $hf;
    $f = implode(' à ', $f);

    return $date->format($f ?: 'd/m/Y à H:i');
}

class TiquettesPDF extends FPDF
{

    const VERSION = "1.5";

    protected $javascript;
    protected $n_js;
    protected $visibility = 'all';
    protected $n_ocg_print;
    protected $n_ocg_view;
    protected $subTitle = "";
    protected $NewPageGroup = false;
    protected $PageGroups = array();
    protected $CurrPageGroup;

    protected $grid = false;
    protected $gridOrientation = 'L';
    protected $gridColor = [230, 230, 230];
    protected $schemaLineWidth = 0.27;
    protected $schemaLineColor = [0, 0, 0];
    protected $schemaSymbolSize = ['w' => 20.1200833333, 'h' => 25.058333333];
    protected $schemaInitialPos = ['x' => 0, 'y' => 0];
    protected $schemaCurrentPosX = 0;
    protected $schemaLastPos = [];
    protected $schemaCurrentFolio = 1;
    protected $schemaLevelsCount = 0;
    protected $showLabelsCutLines = false;


    public $pageMargin = 10;
    public $pageBottomMargin = 12;
    public $schemaFunctions = null;

    public array $required = [];

    public static function requirements()
    {
        $response = [
            'modules' => [
                'php' => version_compare(phpversion(), '8.3', '>='),
                'fpdf' => file_exists('./libs/fpdf186/fpdf.php'),
                'schema_functions.json' => file_exists('./libs/toPdf/assets/schema_functions.json'),
                'php_imagick' => extension_loaded('imagick'),
                'convert' => false,
            ],
            'ok' => false
        ];

        try {
            $retval = 0;
            $ret = exec('convert -version', result_code: $retval);
            $response['modules']['convert'] = $ret !== false && $retval === 0;
        } catch (\Exception $ex) {
        }

        $response['ok'] = $response['modules']['php']
            && $response['modules']['fpdf']
            && $response['modules']['schema_functions.json']
            && ($response['modules']['php_imagick'] || $response['modules']['convert']);

        return $response;
    }

    public function SetGridColor(array $color): void
    {
        $this->gridColor = $color;
    }

    public function SetShowCutLines(bool $show): void
    {
        $this->showLabelsCutLines = $show;
    }


    function __construct($orientation = 'P', $unit = 'mm', $size = 'A4')
    {
        $this->required = self::requirements();

        $this->schemaFunctions = json_decode(file_get_contents('./libs/toPdf/assets/schema_functions.json'), true);
        $this->schemaLevelsCounterRecursive();

        parent::__construct($orientation, $unit, $size);
    }

    public function Polygon(array $points, string $style = 'D'): void
    {
        if ($style == 'F')
            $op = 'f';
        elseif ($style == 'FD' || $style == 'DF')
            $op = 'b';
        else
            $op = 's';

        $h = $this->h;
        $k = $this->k;

        $points_string = '';
        for ($i = 0; $i < count($points); $i += 2) {
            $points_string .= sprintf('%.2F %.2F', $points[$i] * $k, ($h - $points[$i + 1]) * $k);
            if ($i == 0)
                $points_string .= ' m ';
            else
                $points_string .= ' l ';
        }
        $this->_out($points_string . $op);
    }

    public function TextWithRotation($x, $y, $txt, $txt_angle, $font_angle = 0)
    {
        $font_angle += 90 + $txt_angle;
        $txt_angle *= M_PI / 180;
        $font_angle *= M_PI / 180;

        $txt_dx = cos($txt_angle);
        $txt_dy = sin($txt_angle);
        $font_dx = cos($font_angle);
        $font_dy = sin($font_angle);

        $s = sprintf('BT %.2F %.2F %.2F %.2F %.2F %.2F Tm (%s) Tj ET', $txt_dx, $txt_dy, $font_dx, $font_dy, $x * $this->k, ($this->h - $y) * $this->k, $this->_escape($txt));
        if ($this->ColorFlag)
            $s = 'q ' . $this->TextColor . ' ' . $s . ' Q';
        $this->_out($s);
    }

    public function TextWithDirection($x, $y, $txt, $direction = 'R')
    {
        if ($direction == 'R')
            $s = sprintf('BT %.2F %.2F %.2F %.2F %.2F %.2F Tm (%s) Tj ET', 1, 0, 0, 1, $x * $this->k, ($this->h - $y) * $this->k, $this->_escape($txt));
        elseif ($direction == 'L')
            $s = sprintf('BT %.2F %.2F %.2F %.2F %.2F %.2F Tm (%s) Tj ET', -1, 0, 0, -1, $x * $this->k, ($this->h - $y) * $this->k, $this->_escape($txt));
        elseif ($direction == 'U')
            $s = sprintf('BT %.2F %.2F %.2F %.2F %.2F %.2F Tm (%s) Tj ET', 0, 1, -1, 0, $x * $this->k, ($this->h - $y) * $this->k, $this->_escape($txt));
        elseif ($direction == 'D')
            $s = sprintf('BT %.2F %.2F %.2F %.2F %.2F %.2F Tm (%s) Tj ET', 0, -1, 1, 0, $x * $this->k, ($this->h - $y) * $this->k, $this->_escape($txt));
        else
            $s = sprintf('BT %.2F %.2F Td (%s) Tj ET', $x * $this->k, ($this->h - $y) * $this->k, $this->_escape($txt));
        if ($this->ColorFlag)
            $s = 'q ' . $this->TextColor . ' ' . $s . ' Q';
        $this->_out($s);
    }

    public function SetDash(float|null $black = null, float|null $white = null): void
    {
        if ($black !== null)
            $s = sprintf('[%.3F %.3F] 0 d', $black * $this->k, $white * $this->k);
        else
            $s = '[] 0 d';
        $this->_out($s);
    }

    public function MultiCell($w, $h, $txt, $border = 0, $align = 'J', $fill = false, $maxline = 0)
    {
        // Output text with automatic or explicit line breaks, at most $maxline lines
        if (!isset($this->CurrentFont))
            $this->Error('No font has been set');
        $cw = $this->CurrentFont['cw'];
        if ($w == 0)
            $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', (string) $txt);
        $nb = strlen($s);
        if ($nb > 0 && $s[$nb - 1] == "\n")
            $nb--;
        $b = 0;
        if ($border) {
            if ($border == 1) {
                $border = 'LTRB';
                $b = 'LRT';
                $b2 = 'LR';
            } else {
                $b2 = '';
                if (is_int(strpos($border, 'L')))
                    $b2 .= 'L';
                if (is_int(strpos($border, 'R')))
                    $b2 .= 'R';
                $b = is_int(strpos($border, 'T')) ? $b2 . 'T' : $b2;
            }
        }
        $sep = -1;
        $i = 0;
        $j = 0;
        $l = 0;
        $ns = 0;
        $nl = 1;
        while ($i < $nb) {
            // Get next character
            $c = $s[$i];
            if ($c == "\n") {
                // Explicit line break
                if ($this->ws > 0) {
                    $this->ws = 0;
                    $this->_out('0 Tw');
                }
                $this->Cell($w, $h, substr($s, $j, $i - $j), $b, 2, $align, $fill);
                $i++;
                $sep = -1;
                $j = $i;
                $l = 0;
                $ns = 0;
                $nl++;
                if ($border && $nl == 2)
                    $b = $b2;
                if ($maxline && $nl > $maxline)
                    return substr($s, $i);
                continue;
            }
            if ($c == ' ') {
                $sep = $i;
                $ls = $l;
                $ns++;
            }
            $l += $cw[$c];
            if ($l > $wmax) {
                // Automatic line break
                if ($sep == -1) {
                    if ($i == $j)
                        $i++;
                    if ($this->ws > 0) {
                        $this->ws = 0;
                        $this->_out('0 Tw');
                    }
                    $this->Cell($w, $h, substr($s, $j, $i - $j), $b, 2, $align, $fill);
                } else {
                    if ($align == 'J') {
                        $this->ws = ($ns > 1) ? ($wmax - $ls) / 1000 * $this->FontSize / ($ns - 1) : 0;
                        $this->_out(sprintf('%.3F Tw', $this->ws * $this->k));
                    }
                    $this->Cell($w, $h, substr($s, $j, $sep - $j), $b, 2, $align, $fill);
                    $i = $sep + 1;
                }
                $sep = -1;
                $j = $i;
                $l = 0;
                $ns = 0;
                $nl++;
                if ($border && $nl == 2)
                    $b = $b2;
                if ($maxline && $nl > $maxline) {
                    if ($this->ws > 0) {
                        $this->ws = 0;
                        $this->_out('0 Tw');
                    }
                    return substr($s, $i);
                }
            } else
                $i++;
        }
        // Last chunk
        if ($this->ws > 0) {
            $this->ws = 0;
            $this->_out('0 Tw');
        }
        if ($border && is_int(strpos($border, 'B')))
            $b .= 'B';
        $this->Cell($w, $h, substr($s, $j, $i - $j), $b, 2, $align, $fill);
        $this->x = $this->lMargin;
        return '';
    }

    public function IncludeJS($script)
    {
        $this->javascript = $script;
    }

    public function SetVisibility($v)
    {
        if ($this->visibility != 'all')
            $this->_out('EMC');
        if ($v == 'print')
            $this->_out('/OC /OC1 BDC');
        elseif ($v == 'screen')
            $this->_out('/OC /OC2 BDC');
        elseif ($v != 'all')
            $this->Error('Incorrect visibility: ' . $v);
        $this->visibility = $v;
    }

    public function StartPageGroup()
    {
        $this->NewPageGroup = true;
    }

    public function GroupPageNo()
    {
        return $this->PageGroups[$this->CurrPageGroup];
    }

    public function PageGroupAlias()
    {
        return $this->CurrPageGroup;
    }

    function _beginpage($orientation, $size, $rotation)
    {
        parent::_beginpage($orientation, $size, $rotation);
        if ($this->NewPageGroup) {
            // start a new group
            $n = sizeof($this->PageGroups) + 1;
            $alias = "{nb$n}";
            $this->PageGroups[$alias] = 1;
            $this->CurrPageGroup = $alias;
            $this->NewPageGroup = false;
        } elseif ($this->CurrPageGroup)
            $this->PageGroups[$this->CurrPageGroup]++;
    }

    function _putpages()
    {
        $nb = $this->page;
        if (!empty($this->PageGroups)) {
            // do page number replacement
            foreach ($this->PageGroups as $k => $v) {
                for ($n = 1; $n <= $nb; $n++) {
                    $this->pages[$n] = str_replace($k, $v, $this->pages[$n]);
                }
            }
        }
        parent::_putpages();
    }

    function _putjavascript()
    {
        $this->_newobj();
        $this->n_js = $this->n;
        $this->_put('<<');
        $this->_put('/Names [(EmbeddedJS) ' . ($this->n + 1) . ' 0 R]');
        $this->_put('>>');
        $this->_put('endobj');
        $this->_newobj();
        $this->_put('<<');
        $this->_put('/S /JavaScript');
        $this->_put('/JS ' . $this->_textstring($this->javascript));
        $this->_put('>>');
        $this->_put('endobj');
    }

    function _putresources()
    {
        $this->_putocg();
        parent::_putresources();
        if (!empty($this->javascript)) {
            $this->_putjavascript();
        }
    }

    function _putresourcedict()
    {
        parent::_putresourcedict();
        $this->_put('/Properties <</OC1 ' . $this->n_ocg_print . ' 0 R /OC2 ' . $this->n_ocg_view . ' 0 R>>');
    }

    function _putcatalog()
    {
        parent::_putcatalog();
        if (!empty($this->javascript)) {
            $this->_put('/Names <</JavaScript ' . ($this->n_js) . ' 0 R>>');
        }
        $p = $this->n_ocg_print . ' 0 R';
        $v = $this->n_ocg_view . ' 0 R';
        $as = "<</Event /Print /OCGs [$p $v] /Category [/Print]>> <</Event /View /OCGs [$p $v] /Category [/View]>>";
        $this->_put("/OCProperties <</OCGs [$p $v] /D <</ON [$p] /OFF [$v] /AS [$as]>>>>");
    }

    function _endpage()
    {
        $this->SetVisibility('all');
        parent::_endpage();
    }

    function _enddoc()
    {
        if ($this->PDFVersion < '1.5')
            $this->PDFVersion = '1.5';
        parent::_enddoc();
    }

    function _putocg()
    {
        $this->_newobj();
        $this->n_ocg_print = $this->n;
        $this->_put('<</Type /OCG /Name ' . $this->_textstring('print'));
        $this->_put('/Usage <</Print <</PrintState /ON>> /View <</ViewState /OFF>>>>>>');
        $this->_put('endobj');
        $this->_newobj();
        $this->n_ocg_view = $this->n;
        $this->_put('<</Type /OCG /Name ' . $this->_textstring('view'));
        $this->_put('/Usage <</Print <</PrintState /OFF>> /View <</ViewState /ON>>>>>>');
        $this->_put('endobj');
    }

    function AutoPrint($dialog = false)
    {
        //Open the print dialog or start printing immediately on the standard printer
        $param = ($dialog ? 'true' : 'false');
        $script = "print($param);";
        $this->IncludeJS($script);
    }

    function AutoPrintToPrinter($server, $printer, $dialog = false)
    {
        //Print on a shared printer (requires at least Acrobat 6)
        $script = "var pp = getPrintParams();";
        if ($dialog)
            $script .= "pp.interactive = pp.constants.interactionLevel.full;";
        else
            $script .= "pp.interactive = pp.constants.interactionLevel.automatic;";
        $script .= "pp.printerName = '\\\\\\\\" . $server . "\\\\" . $printer . "';";
        $script .= "print(pp);";
        $this->IncludeJS($script);
    }

    function svg2png(string $svgContent, string $pngFilepath, int $width = 100, int $height = 100): bool
    {
        global $isDev;

        if (!str_starts_with(trim($svgContent), "<?xml"))
            $svgContent = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + trim($svgContent);

        if ($this->required['modules']['php_imagick'] === true && !$isDev) {
            $image = new Imagick();

            $image->newImage($width, $height, new ImagickPixel('transparent'));
            $image->readImageBlob($svgContent);
            $image->transparentPaintImage('#ffffff', 0, 10, false);
            //$image->thumbnailImage($width, $height, true);
            $image->setImageFormat('png64');
            $image->writeImage($pngFilepath);

            return file_exists($pngFilepath);

        } else if ($this->required['modules']['convert'] === true || $isDev) {
            $f = basename($pngFilepath, '.png');
            $d = dirname($pngFilepath);
            $s = "{$d}/{$f}.svg";
            file_put_contents($s, $svgContent);

            $cmd = "convert {$s} -size 100x100 -transparent white png24:{$pngFilepath}";

            try {
                $retval = 0;
                $output = [];
                $ret = exec($cmd, $output, $retval);

                return $ret !== false && $retval === 0;
            } catch (\Exception $ex) {
                return false;
            }
        }

        return false;
    }

    function getIcon(string $name, string|false $color = false, int $iconSize = 100): string
    {
        if ($color === false)
            $color = '#000000';
        $color = strtolower(trim($color));
        if (!preg_match('/^#[a-f0-9A-Z]{6}$/i', $color))
            $color = '#000000';
        if ($color === '#ffffff')
            $color = '#fefefe';

        $path = '../';
        $name = trim(strtolower($name));
        $pi = pathinfo($name);

        $mtime = file_exists($path . $name) ? filemtime($path . $name) : time();

        $pngname = $pi['filename'] . '.png';
        $pngpath = './libs/toPdf/themes/icons/' . $color . '/';
        if (!is_dir($pngpath))
            mkdir($pngpath, 0777, true);
        if (file_exists($pngpath . $pngname) && filemtime($pngpath . $pngname) === $mtime)
            return $pngpath . $pngname;

        if (file_exists($path . $name) && is_readable($path . $name) && $pi['extension'] === 'svg') {
            $svg = file_get_contents($path . $name);

            foreach ([3, 4, 8, 6] as $size) {
                $colorPattern = "(#[0-9a-zA-Z]{{$size}})";

                $svg = preg_replace("/\"(\s*){$colorPattern}(\s*)\"/i", "\"{$color}\"", $svg);
                $svg = preg_replace('/\"(\s*)currentColor(\s*)\"/i', "\"{$color}\"", $svg);

                foreach (['color', 'fill', 'stroke'] as $key) {
                    $svg = preg_replace("/{$key}(\s*):(\s*){$colorPattern}(\s*)([;\"']+)/i", "{$key}:{$color}$5", $svg);
                }
            }

            if (!$this->svg2png($svg, $pngpath . $pngname, $iconSize, $iconSize)) {
                copy(__DIR__ . '/libs/toPdf/assets/blank.png', $pngpath . $pngname);
            }

            touch($pngpath . $pngname, $mtime);

            return $pngpath . $pngname;
        }

        return '';
    }

    function getSymbol(string $func, int $width = 100, int $height = 125): string
    {
        $name = "schema_{$func}.svg";
        $path = '../';
        $name = trim(strtolower($name));
        $pi = pathinfo($name);
        $mtime = file_exists($path . $name) ? filemtime($path . $name) : time();

        $pngname = $pi['filename'] . '.png';
        $pngpath = './libs/toPdf/themes/icons/symbols/';
        if (!is_dir($pngpath))
            mkdir($pngpath, 0777, true);
        if (file_exists($pngpath . $pngname) && filemtime($pngpath . $pngname) === $mtime)
            return $pngpath . $pngname;

        if (file_exists($path . $name) && is_readable($path . $name) && $pi['extension'] === 'svg') {
            $svg = file_get_contents($path . $name);
            if (!$this->svg2png($svg, $pngpath . $pngname, $width, $height)) {
                copy(__DIR__ . '/libs/toPdf/assets/blank.png', $pngpath . $pngname);
            }
            touch($pngpath . $pngname, $mtime);

            return $pngpath . $pngname;
        }

        return '';
    }

    function getPoleSymbol(string $pole, int $width = 11, int $height = 17): string
    {
        $name = "schema_{$pole}.svg";
        $path = '../';
        $name = trim($name);
        $pi = pathinfo($name);
        $mtime = file_exists($path . $name) ? filemtime($path . $name) : time();

        $pngname = $pi['filename'] . '.png';
        $pngpath = './libs/toPdf/themes/icons/poles/';
        if (!is_dir($pngpath))
            mkdir($pngpath, 0777, true);
        if (file_exists($pngpath . $pngname) && filemtime($pngpath . $pngname) === $mtime)
            return $pngpath . $pngname;

        if (file_exists($path . $name) && is_readable($path . $name) && $pi['extension'] === 'svg') {
            $svg = file_get_contents($path . $name);
            if (!$this->svg2png($svg, $pngpath . $pngname, $width, $height)) {
                copy(__DIR__ . '/libs/toPdf/assets/blank.png', $pngpath . $pngname);
            }
            touch($pngpath . $pngname, $mtime);

            return $pngpath . $pngname;
        }

        return '';
    }

    function Header()
    {
        global $switchboard, $tv;

        $this->SetY(1.5);

        if ($this->PageNo() > 1) {
            $this->SetTextColor(0, 0, 0);
            $this->SetFont('Arial', 'B', 9);
            $this->Cell(0, 10, str($switchboard->prjname . ' - rev ' . $switchboard->prjversion), 0, 0, 'R');
        }

        if ($this->PageNo() === 1) {
            $this->SetTextColor(170, 170, 170);
            $this->SetFont('Arial', '', 8);
            $this->Cell(0, 10, str('tiquettes.fr ' . $tv . ' / php ' . phpversion() . ' / fpdf ' . $this::VERSION . ' / ' . (phpversion('imagick') !== false ? 'imagick ' . phpversion('imagick') : 'ImageMagick CLI')), 0, 0, 'R');
        }

        if ($this->subTitle !== "" && $this->PageNo() > 1) {
            $this->SetX($this->pageMargin);
            $this->SetTextColor(0, 139, 139);
            $this->SetFont('Arial', 'B', 11);
            $this->Cell(0, 10, str($this->subTitle), 0, 0, 'L');
        }

        $this->SetDrawColor(0, 0, 0);
        $this->SetLineWidth(0.1);
        $this->Line($this->pageMargin, $this->pageMargin, $this->GetPageWidth() - $this->pageMargin, $this->pageMargin);

        if (is_array($this->grid)) {
            $this->SetDrawColor($this->gridColor[0], $this->gridColor[1], $this->gridColor[2]);
            $step = $this->grid[$this->gridOrientation]['step'] ?? 5 > 0 ? intval($this->grid[$this->gridOrientation]['step']) : 5;
            $originalX = $this->grid[$this->gridOrientation]['left'] ?? $this->pageMargin + 4;
            $originalY = $this->grid[$this->gridOrientation]['top'] ?? $this->pageMargin + $step;
            $x = $originalX;
            while ($x < $this->GetPageWidth() - $originalX) {
                $this->Line($x, $originalY, $x, $this->GetPageHeight() - $originalY);
                $x += $step;
            }
            $this->grid[$this->gridOrientation]['bottom'] = $this->GetPageHeight() - $originalY;
            $y = $originalY;
            while ($y < $this->GetPageHeight() - $originalY) {
                $this->Line($originalX, $y, $this->GetPageWidth() - $originalX, $y);
                $y += $step;
            }
            $this->grid[$this->gridOrientation]['right'] = $this->GetPageWidth() - $originalX;

        }

        $this->Ln($this->pageMargin + 5);
    }

    function Footer()
    {
        global $tv;

        if ($this->PageNo() > 1) {
            $this->SetY(-$this->pageBottomMargin);

            $align = 'C';
            $this->SetTextColor(50, 50, 50);
            $this->SetFont('Arial', 'I', 8);
            //$this->Cell(0, 10, str('Page ' . $this->PageNo() . '/{nb}'), 0, 0, 'C');
            $this->Cell(0, 10, str('Page ' . $this->GroupPageNo() . '/' . $this->PageGroupAlias()), 0, 0, $align);
            $this->SetDrawColor(0, 0, 0);
            $this->SetLineWidth(0.1);
            $this->Line($this->pageMargin, $this->GetPageHeight() - $this->pageMargin - 0.5, $this->GetPageWidth() - $this->pageMargin, $this->GetPageHeight() - $this->pageMargin - 0.5);

            $this->SetTextColor(170, 170, 170);
            $this->SetFont('Arial', '', 8);
            $this->Cell(0, 10, str("tiquettes.fr {$tv}"), 0, 0, 'R');
        }
    }

    function AddFirstPage()
    {
        global $switchboard, $printOptions;

        $this->grid = false;
        $this->StartPageGroup();
        $this->AddPage('P', 'A4', 0);
        $this->SetVisibility('all');

        // Titre

        $this->SetY(70);
        $this->SetFont('Arial', 'B', 36);
        $this->Cell(0, 15, str('Tableau électrique'), 0, 0, 'C');

        // Contenu du dossier

        $this->SetY(110);
        $this->SetX($this->pageMargin + 23);
        $this->SetFont('Arial', 'B', 14);
        $this->MultiCell(0, 7, cutStr(str("Ce dossier contient :")), 0, 'L', false);
        $this->Ln(5);
        $this->SetFont('Arial', '', 14);
        $contains = [];
        if ($printOptions->schema === true)
            $contains[] = "Le schéma unifilaire";
        if ($printOptions->summary === true)
            $contains[] = "La nomenclature";
        if (count($contains) === 0)
            $contains[] = "Rien du tout !";
        foreach ($contains as $title) {
            $this->SetX($this->pageMargin + 28);
            $this->MultiCell(0, 7, cutStr(str("- " . $title)), 0, 'L', false);
            $this->Ln(2);
        }

        // Cartouche principal

        $this->SetFont('Arial', 'B', 14);
        $this->SetY(150);
        $this->SetDrawColor(150, 150, 150);
        $this->SetTextColor(0, 0, 0);
        $this->SetLineWidth(0.05);
        $this->Line($this->pageMargin + 20, $this->GetY(), $this->GetPageWidth() - ($this->pageMargin + 20), $this->GetY());
        $this->Ln(2);
        $infos = [
            "Nom du projet :" => cutStr($switchboard->prjname, 100),
            "Révision :" => $switchboard->prjversion . " (" . $switchboard->appversion . ")",
            "Créé le :" => toFrenchDate($switchboard->prjcreated),
            "Modifié le :" => toFrenchDate($switchboard->prjupdated),
            "" => "",
            "Type :" => $switchboard->projectType === 'R' ? "Résidentiel" : ($switchboard->projectType === 'T' ? "Tertiaire" : "Divers"),
            "Tension de référence :" => $switchboard->vref . "V",
        ];
        foreach ($infos as $title => $value) {
            $this->SetX($this->pageMargin + 23);
            $this->SetFont('Arial', 'B', 14);
            $this->Cell(($this->GetPageWidth() / 2) - $this->pageMargin - ($this->pageMargin / 2) - 23, 7, str($title), 0, 0, 'L');

            $this->SetX(($this->GetPageWidth() / 2) - $this->pageMargin + +($this->pageMargin / 2));
            $this->SetFont('Arial', '', 14);
            $this->MultiCell(($this->GetPageWidth() / 2) - $this->pageMargin - ($this->pageMargin / 2) - 23, 7, cutStr(str($value)), 0, 'L', false);

            $this->Ln(2);

            $this->SetLineWidth(0.05);
            $this->Line($this->pageMargin + 20, $this->GetY(), $this->GetPageWidth() - ($this->pageMargin + 20), $this->GetY());
            $this->Ln(2);
        }
        $this->SetDrawColor(150, 150, 150);
        $this->SetLineWidth(0.1);
        $this->Line($this->pageMargin + 20, 107, $this->GetPageWidth() - ($this->pageMargin + 20), 107);
        $this->Line($this->pageMargin + 20, 107, $this->pageMargin + 20, $this->GetY() - 2);
        $this->Line($this->GetPageWidth() - ($this->pageMargin + 20), 107, $this->GetPageWidth() - ($this->pageMargin + 20), $this->GetY() - 2);

        // Alerte d'impression

        $this->SetY(260);
        $this->SetVisibility('screen');
        $this->SetFont('Helvetica', 'B', 13);
        $w = $this->GetPageWidth() - (2 * ($this->pageMargin + 20));
        $this->SetX(($this->GetPageWidth() / 2) - ($w / 2));
        $this->SetFillColor(255, 230, 230);
        $this->SetTextColor(255, 0, 0);
        $this->SetDrawColor(255, 0, 0);
        $this->MultiCell($w, 5, str("ATTENTION:\n\nImprimer en 'Taille réelle' ou 'Echelle 100%'. Ne pas 'ajuster à la page' dans les paramètres d'impression."), 1, 'L', true);
        $this->SetVisibility('all');


        $this->SetDrawColor(0, 0, 0);
    }

    function drawCutLines(array &$cutLines): void
    {
        if ($this->showLabelsCutLines) {
            foreach ($cutLines as $cutLine) {
                $this->SetDrawColor(170, 170, 170);
                $this->SetLineWidth(0.075);
                $this->SetDash(1, 1);
                $this->Line($cutLine[0], $cutLine[1], $cutLine[2], $cutLine[3]);
                $this->Image('./libs/toPdf/assets/cut.png', $cutLine[0] + 1.5, $cutLine[1] - 1.25, 2.5, 2.5, 'PNG');
                ;
            }
            $this->SetDash();
            $cutLines = [];
        }
    }

    function AddLabelsPage()
    {
        try {

            global $switchboard, $printOptions;
            $printCurrents = $printOptions->pdfOptions?->printCurrents ?? false;

            require_once './libs/toPdf/themes/engine.php';
            $h = $switchboard->height;
            $w = $switchboard->stepSize;

            $this->grid = false;
            $rowsCount = count($switchboard->rows);
            $modulesCount = $switchboard->stepsPerRows;
            $this->subTitle = "Etiquettes à découper: {$rowsCount} x {$modulesCount} module" . ($modulesCount > 1 ? "s" : "") . "  /  largeur {$w}mm  /  hauteur {$h}mm";
            $this->StartPageGroup();
            $this->AddPage('L', 'A4', 0);
            $this->SetVisibility('all');

            $cutLines = [];

            $this->SetY($this->pageMargin + 3);

            for ($i = 0; $i < count($switchboard->rows); $i++) {
                $row = $switchboard->rows[$i];

                $this->SetTextColor(170, 170, 170);
                $this->SetFont('Arial', '', 10);
                $this->Cell(0, 7, str("Rangée " . ($i + 1)), 0, 0, 'L');
                $this->Ln(7);

                $x = $this->pageMargin;

                for ($j = 0; $j < count($row); $j++) {
                    $module = $row[$j];

                    if ($x + $w * $module->span > $this->GetPageWidth() - $this->pageMargin) {
                        $this->SetY($this->GetY() + $h + ($printCurrents ? 11 : 3));
                        $x = $this->pageMargin;
                    }

                    if ($this->GetY() + $h > $this->GetPageHeight() - ($this->pageBottomMargin)) {
                        $this->drawCutLines($cutLines);
                        $this->AddPage('L', 'A4', 0);
                        $this->SetY($this->pageMargin + 10);
                    }

                    if ($x === $this->pageMargin) {
                        $cutLines[] = [$this->pageMargin - 8, $this->GetY(), $this->GetPageWidth() - $this->pageMargin + 8, $this->GetY()];
                        $cutLines[] = [$this->pageMargin - 8, $this->GetY() + $h, $this->GetPageWidth() - $this->pageMargin + 8, $this->GetY() + $h];
                    }

                    $box = [
                        'x' => $x,
                        'y' => $this->GetY(),
                        'w' => $w * $module->span,
                        'h' => $h,
                    ];
                    $workBox = [
                        'x' => $module->half === 'left' ? $box['x'] + ($w / 2) : $box['x'],
                        'y' => $box['y'],
                        'w' => $module->half === 'left' || $module->half === 'right' ? $box['w'] - ($w / 2) : $box['w'],
                        'h' => $box['h'],
                    ];

                    Theme::render($this, $workBox, $switchboard->theme->data, $module, $printOptions);

                    $this->SetDrawColor(170, 170, 170);
                    $this->SetLineWidth(0.1);
                    $this->Rect($box['x'], $box['y'], $box['w'], $box['h'], 'D');
                    $this->Line($workBox['x'], $workBox['y'], $workBox['x'], $workBox['y'] + $workBox['h']);
                    $this->Line($workBox['x'] + $workBox['w'], $workBox['y'], $workBox['x'] + $workBox['w'], $workBox['y'] + $workBox['h']);

                    if ($printCurrents) {
                        $ox = $this->GetX();
                        $oy = $this->GetY();

                        $this->SetXY($box['x'], $box['y'] + $box['h']);

                        $this->SetTextColor(150, 150, 150);
                        $this->SetDrawColor(220, 220, 220);
                        $this->SetFillColor(252, 252, 252);

                        $this->Rect($box['x'], $box['y'] + $box['h'], $box['w'], 6, 'DF');

                        $this->SetFont('Helvetica', '', 7);
                        $txt = mb_convert_encoding(trim((($module->crb ?? "") . $module->current ?? "") . " " . ($module->sensibility ?? "") . " " . ($module->type ?? "")), 'windows-1252', 'UTF-8');
                        $this->MultiCell($box['w'], 6, $txt, 0, 'C', false, 1);

                        $this->SetXY($ox, $oy);
                    }

                    $x += $w * $module->span;
                }

                $this->SetY($this->GetY() + $h + ($printCurrents ? 10 : 6));
            }

            $this->drawCutLines($cutLines);
        } catch (\Exception $e) {
            var_dump($e);
            die();
        }
    }

    function AddSchemaPage()
    {
        global $switchboard, $flattenModules;

        $this->grid = [
            'P' => [
                'schemaMaxLevels' => 11,
                'step' => 5,
                'left' => $this->pageMargin,
                'top' => $this->pageMargin + 3.5
            ],
            'L' => [
                'schemaMaxLevels' => 6,
                'step' => 5,
                'left' => $this->pageMargin + 1,
                'top' => $this->pageMargin + 2.5
            ]
        ];

        if ($this->gridOrientation !== 'P' && $this->schemaLevelsCount > $this->grid[$this->gridOrientation]['schemaMaxLevels']) {
            $this->gridOrientation = 'P';
        }

        $this->SetVisibility('all');
        $this->StartPageGroup();

        $this->schemaCurrentFolio = 1;
        $this->subTitle = "Schéma unifilaire - Folio " . $this->schemaCurrentFolio;
        $this->AddPage($this->gridOrientation, 'A4', 0);
        $this->drawGroundLine();

        $this->schemaInitialPos = [
            'x' => $this->grid[$this->gridOrientation]['left'] + $this->grid[$this->gridOrientation]['step'],
            'y' => $this->grid[$this->gridOrientation]['top'] + $this->grid[$this->gridOrientation]['step'],
        ];
        $this->schemaCurrentPosX = $this->schemaInitialPos['x'];

        $this->schemaDrawChilds('', 0);
    }

    protected function getDirectChildsCount($pm): int
    {
        global $flattenModules;

        if (is_null($pm))
            return 0;

        $childs = array_values(array_filter($flattenModules, fn($m) => $m->parentId === $pm->id));
        return count($childs);
    }

    protected function getSiblingCount($pm): int
    {
        global $flattenModules;

        if (is_null($pm))
            return 0;

        $childs = array_values(array_filter($flattenModules, fn($m) => $m->parentId === $pm->parentId));
        return count($childs);
    }

    protected function schemaLevelsCounterRecursive(string $id = '', int $level = 1)
    {
        global $flattenModules;

        $found = array_values(array_filter($flattenModules, fn($m) => $m->parentId === $id));
        if (count($found) > 0) {
            if ($level > $this->schemaLevelsCount)
                $this->schemaLevelsCount = $level;

            foreach ($found as $m)
                $this->schemaLevelsCounterRecursive($m->id, $level + 1);
        }
    }

    protected function drawGroundLine()
    {
        global $switchboard;

        if ($switchboard->withGroundLine) {
            $gridPosY = 30;

            $this->SetDash(1, 1);
            $this->SetLineWidth($this->schemaLineWidth);
            $this->SetDrawColor(200, 200, 200);
            $this->Line($this->grid[$this->gridOrientation]['left'], $this->grid[$this->gridOrientation]['bottom'] - $gridPosY, $this->grid[$this->gridOrientation]['right'], $this->grid[$this->gridOrientation]['bottom'] - $gridPosY);
            $this->SetDash();

            $this->Line($this->grid[$this->gridOrientation]['right'] - 2.5, $this->grid[$this->gridOrientation]['bottom'] - $gridPosY - 2.5, $this->grid[$this->gridOrientation]['right'] - 2.5, $this->grid[$this->gridOrientation]['bottom'] - $gridPosY + 2.5);
            $this->Line($this->grid[$this->gridOrientation]['right'] - 1.5, $this->grid[$this->gridOrientation]['bottom'] - $gridPosY - 1.5, $this->grid[$this->gridOrientation]['right'] - 1.5, $this->grid[$this->gridOrientation]['bottom'] - $gridPosY + 1.5);
            $this->Line($this->grid[$this->gridOrientation]['right'] - 0.5, $this->grid[$this->gridOrientation]['bottom'] - $gridPosY - 0.5, $this->grid[$this->gridOrientation]['right'] - 0.5, $this->grid[$this->gridOrientation]['bottom'] - $gridPosY + 0.5);
            $this->SetLineWidth(0.2);
        }
    }

    protected function drawPowerLine(object|null $m, int $level, int $pos): void
    {
        if (is_null($m) || $pos > 0)
            return;

        if (trim($m->parentId ?? '') === '') {
            $lx = $this->grid[$this->gridOrientation]['left'];
            $ly = $level > 0
                ? $this->schemaLastPos["L{$level}"]['y'] - ($this->schemaLineWidth / 2)
                : $this->schemaInitialPos['y'] - ($this->schemaLineWidth / 2) - 0.125;
            $lw = $this->schemaCurrentPosX - $lx + ($this->schemaSymbolSize['w'] / 2) + ($this->schemaLineWidth / 2);
            $this->SetFillColor($this->schemaLineColor[0], $this->schemaLineColor[1], $this->schemaLineColor[2]);
            $this->Rect($lx, $ly, $lw, $this->schemaLineWidth, 'F');

            $this->SetDrawColor($this->schemaLineColor[0], $this->schemaLineColor[1], $this->schemaLineColor[2]);
            $this->Polygon([
                $lx,
                $ly,
                $lx + 1.5,
                $ly - 1.5,
                $lx + 3,
                $ly
            ], 'F');

            $this->SetFont('Arial', '', 5);
            $fs = str("Réseau");
            $this->Text($lx + 3, $ly - 1, $fs);
        }
    }

    protected function drawPreviousLine(bool $isNew, int $pos, int $level): void
    {
        if ($pos > 0 && in_array("L{$level}", array_keys($this->schemaLastPos)) && $this->schemaLastPos["L{$level}"]['x'] && $this->schemaLastPos["L{$level}"]['y']) {
            $lx = $isNew || $this->schemaCurrentPosX < $this->schemaLastPos["L{$level}"]['x']
                ? $this->grid[$this->gridOrientation]['left']
                : $this->schemaLastPos["L{$level}"]['x'] + ($this->schemaSymbolSize['w'] / 2);
            $ly = $this->schemaLastPos["L{$level}"]['y'] - ($this->schemaLineWidth / 2);
            $lw = $this->schemaCurrentPosX - $lx + ($this->schemaSymbolSize['w'] / 2) + ($this->schemaLineWidth / 2);
            $this->SetFillColor($this->schemaLineColor[0], $this->schemaLineColor[1], $this->schemaLineColor[2]);
            $this->Rect($lx, $ly, $lw, $this->schemaLineWidth, 'F');

            if ($isNew || $this->schemaCurrentPosX < $this->schemaLastPos["L{$level}"]['x']) {
                $ly += ($this->schemaLineWidth / 2);
                $this->Polygon([
                    $lx,
                    $ly,
                    $lx + 1.5,
                    $ly - 1.5,
                    $lx + 1.5,
                    $ly + 1.5
                ], 'F');

                $this->SetFont('Arial', '', 5);
                $folio = $this->schemaCurrentFolio - 1;
                $fs = str("Folio {$folio}");
                $this->Text($lx + 2.5, $ly - 1, $fs);
            }
        }
    }

    protected function drawNextLine(object|null $m, int $l): void
    {
        global $flattenModules;

        if (!is_null($m) && $this->getSiblingCount($m) > 1) {
            $lx = $this->schemaLastPos["L{$l}"]['x'] + ($this->schemaSymbolSize['w'] / 2);
            $ly = $this->schemaInitialPos['y'] + ($this->schemaSymbolSize['h'] * $l) - ($this->schemaLineWidth / 2) - 0.125;
            $lw = $this->grid[$this->gridOrientation]['right'] - $lx;
            $this->SetFillColor($this->schemaLineColor[0], $this->schemaLineColor[1], $this->schemaLineColor[2]);
            $this->Rect($lx, $ly, $lw, $this->schemaLineWidth, 'F');

            $lx = $this->grid[$this->gridOrientation]['right'];
            $ly += ($this->schemaLineWidth / 2);
            $this->Polygon([
                $lx,
                $ly,
                $lx - 1.5,
                $ly - 1.5,
                $lx - 1.5,
                $ly + 1.5
            ], 'F');

            $this->SetFont('Arial', '', 5);
            $folio = $this->schemaCurrentFolio + 1;
            $fs = str("Folio {$folio}");
            $this->Text($lx - $this->GetStringWidth($fs) - 2.5, $ly - 1, $fs);

            $pms = array_values(array_filter($flattenModules, fn($pm) => $m->parentId === $pm->id));
            $pl = $l - 1;
            if (count($pms) > 0 && $pl >= 0) {
                $pm = $pms[0];
                if ($this->getSiblingCount($pm) > 0)
                    $this->drawNextLine($pm, $pl);
            }
            ;
        }
    }

    protected function schemaDrawItem(int $pos, object|null $lastModule, object $module, int $level): void
    {
        if ($module->func !== 'k') {
            $sf = $this->schemaFunctions[$module->func];
        } else {
            $sf = ['hasType' => false, 'hasCrb' => false, 'hasCurrent' => true];
        }

        $isNew = ($this->schemaCurrentPosX + $this->schemaSymbolSize['w']) > $this->grid[$this->gridOrientation]['right'];
        $currentPosY = $this->schemaInitialPos['y'] + ($this->schemaSymbolSize['h'] * $level) - 0.125;

        if ($isNew) {
            $this->drawNextLine($lastModule, $level);

            $this->schemaCurrentFolio++;
            $this->subTitle = "Schéma unifilaire - Folio " . $this->schemaCurrentFolio;
            $this->AddPage($this->gridOrientation, 'A4', 0);
            $this->drawGroundLine();
            $this->schemaCurrentPosX = $this->schemaInitialPos['x'];
        }

        $centerX = $this->schemaCurrentPosX + ($this->schemaSymbolSize['w'] / 2);

        if ($level < $this->grid[$this->gridOrientation]['schemaMaxLevels']) {
            $symbol = $this->getSymbol($module->func);
            if ($symbol !== '')
                $this->Image($symbol, $this->schemaCurrentPosX + 0.04, $currentPosY, $this->schemaSymbolSize['w'], $this->schemaSymbolSize['h'], 'PNG');

            $this->SetTextColor(0, 0, 0);
            $this->SetFont('Arial', 'B', 7);
            $this->Text($centerX + ($this->grid[$this->gridOrientation]['step'] / 2), $currentPosY + ($this->grid[$this->gridOrientation]['step'] / 2) + 2, str($module->id));
            $this->SetFont('Arial', '', 6);

            $lines = [
                $sf['hasType'] && $module->type ? str("Type " . $module->type ?? '') : '',
                $sf['hasType'] && $module->type ? str($module->sensibility ?? '') : '',
                str(trim(($sf['hasCrb'] && $module->crb ? ($module->crb ?? '') : '') . ' ' . ($sf['hasCurrent'] && $module->current ? ($module->current ?? '') : ''))),
                str($module->pole ?? '')
            ];
            for ($i = 0; $i < count($lines); $i++) {
                $this->Text($centerX + ($this->grid[$this->gridOrientation]['step'] / 2), $currentPosY + ($this->grid[$this->gridOrientation]['step'] / 2) + 2 + (($i + 1) * ($this->grid[$this->gridOrientation]['step'] / 2)), $lines[$i]);
            }

            /*if (isset($module->pole) && is_string($module->pole)) {
                $pole = $this->getPoleSymbol($module->pole);
                if ($pole !== '') $this->Image($pole, $centerX - (2.9104166667 / 2), $currentPosY + $this->schemaSymbolSize['h'] - 5, 2.9104166667, 0, 'PNG');
            }*/

        } else {
            $symbol = $this->getSymbol('blank');
            if ($symbol !== '')
                $this->Image($symbol, $this->schemaCurrentPosX, $currentPosY, $this->schemaSymbolSize['w'], $this->schemaSymbolSize['h'], 'PNG');
        }

        if ($this->getDirectChildsCount($module) === 0) {
            $this->SetFillColor($this->schemaLineColor[0], $this->schemaLineColor[1], $this->schemaLineColor[2]);
            $this->Rect($centerX - ($this->schemaLineWidth / 2), $currentPosY + $this->schemaSymbolSize['h'], $this->schemaLineWidth, $this->grid[$this->gridOrientation]['bottom'] - ($currentPosY + $this->schemaSymbolSize['h']) - 20, 'F');

            if (isset($module->pole) && is_string($module->pole)) {
                $pole = $this->getPoleSymbol($module->pole);
                if ($pole !== '')
                    $this->Image($pole, $centerX - (2.9104166667 / 2), $this->grid[$this->gridOrientation]['bottom'] - 25, 2.9104166667, 0, 'PNG');
            }

            if (isset($module->wire) && is_string($module->wire) && trim($module->wire) !== "" && trim($module->wire) !== "?") {
                $this->SetTextColor(0, 0, 0);
                $this->SetFont('Arial', '', 5.5);
                $this->TextWithDirection($centerX - 2.5, $this->grid[$this->gridOrientation]['bottom'] - 20.5, str($module->wire . " mm²"), 'U');
            }

            /*$this->SetFillColor(200, 200, 200);
            $this->Rect($centerX - ($this->schemaSymbolSize['w'] / 2), $this->grid[$this->gridOrientation]['bottom'] - 20, $this->schemaSymbolSize['w'], 0.1, 'F');*/

            if (isset($module->icon) && is_string($module->icon)) {
                $icon = $this->getIcon($module->icon, '#000000', 100);
                if ($icon !== '')
                    $this->Image($icon, $centerX - (5.5 / 2), $this->grid[$this->gridOrientation]['bottom'] - 18, 5.5, 5.5, 'PNG');
            }

            if (isset($module->text) && is_string($module->text) && trim($module->text) !== "") {
                $this->SetTextColor(0, 0, 0);
                $this->SetFont('Arial', '', 7);
                $oldX = $this->GetX();
                $oldY = $this->GetY();
                $this->SetXY($centerX - ($this->schemaSymbolSize['w'] / 2), $this->grid[$this->gridOrientation]['bottom'] - 11);
                $this->MultiCell($this->schemaSymbolSize['w'], 2.5, str($module->text), 0, 'C', false, 4);
                $this->SetXY($oldX, $oldY);
            }
        }

        $this->drawPreviousLine($isNew, $pos, $level);
        $this->drawPowerLine($module, $level, $pos);

        $this->schemaLastPos["L{$level}"] = [
            'x' => $this->schemaCurrentPosX,
            'y' => $currentPosY,
        ];
    }

    protected function schemaDrawChilds(string $parentId, int $level): void
    {
        global $flattenModules;

        $found = array_values(array_filter($flattenModules, function ($m) use ($parentId) {
            return $m->parentId === $parentId;
        }));
        if (count($found) === 0)
            return;

        $total = count($found);
        for ($i = 0; $i < $total; $i++) {
            $module = $found[$i];
            $lastModule = $i > 0 ? $found[$i - 1] : null;
            $this->schemaDrawItem($i, $lastModule, $module, $level);
            $this->schemaDrawChilds($module->id, $level + 1);

            if ($i < count($found) - 1)
                $this->schemaCurrentPosX += $this->schemaSymbolSize['w'] - 0.125;
        }
    }

    function AddSummaryPage()
    {
        global $switchboard, $printOptions;

        $this->grid = false;
        $this->subTitle = "Nomenclature";
        $this->StartPageGroup();
        $this->AddPage('L', 'A4', 0);
        $this->SetVisibility('all');

        $this->SetY($this->pageMargin + 3);
        $this->SetFont('Arial', 'B', 11);
        $this->SetTextColor(0, 0, 0);
        $oldPosX = $this->pageMargin;
        $columns = [
            ['id' => 'row', 'text' => 'Rangée', 'w' => 28, 'align' => 'L'],
            ['id' => 'column', 'text' => 'Position', 'w' => 17, 'align' => 'L'],
            ['id' => 'type', 'text' => 'Type', 'w' => 15, 'align' => 'C'],
            ['id' => 'identifiant', 'text' => 'Id', 'w' => 20, 'align' => 'L'],
            ['id' => 'function', 'text' => 'Fonction', 'w' => 53, 'align' => 'L'],
            ['id' => 'label', 'text' => 'Libellé', 'w' => 70, 'align' => 'L'],
            ['id' => 'description', 'text' => 'Annotations', 'w' => 74, 'align' => 'L'],
        ];
        foreach ($columns as $column) {
            $this->SetX($oldPosX);
            $this->Cell($column['w'], 7, str($column['text']), 0, 0, $column['align']);
            $oldPosX += $column['w'];
        }
        $this->Ln(12);

        $this->SetFont('Arial', '', 10);
        $this->SetTextColor(0, 0, 0);

        for ($i = 0; $i < count($switchboard->rows); $i++) {
            $oldPosX = $this->pageMargin;

            $rowPosition = $i + 1;
            $rowPositionText = str_pad($rowPosition, strlen(strval(count($switchboard->rows))), '0', STR_PAD_LEFT);

            $this->SetX($oldPosX + 5);
            $this->Cell($columns[0]['w'], 8, str("Rangée {$rowPositionText}"), 0, 0, $columns[0]['align']);
            $this->SetX($oldPosX);
            $this->Image('./libs/toPdf/assets/summary_row.png', $oldPosX, $this->GetY() + 1.9, 4, 4, 'PNG');

            for ($j = 0; $j < count($switchboard->rows[$i]); $j++) {
                $this->SetFont('Arial', '', 10);

                $oldPosX = $this->pageMargin + $columns[0]['w'];
                $columnPosition = $j + 1;
                $columnPositionText = str_pad($columnPosition, strlen(strval(count($switchboard->rows[$i]))), '0', STR_PAD_LEFT);

                $module = $switchboard->rows[$i][$j];
                if (!$module->free && ($module->func ?? '') !== '') {
                    if ($module->func === 'k')
                        $module->func = 'kc';

                    if ($j === 0) {
                        $this->SetFillColor(220, 220, 220);
                        $this->Rect($this->pageMargin, $this->GetY() - 2.5, $this->GetPageWidth() - $this->pageMargin - $this->pageMargin, 0.5, 'F');
                    } else {
                        $this->SetDrawColor(220, 220, 220);
                        $this->Line($this->pageMargin, $this->GetY() - 2.5, $this->GetPageWidth() - $this->pageMargin, $this->GetY() - 2.5);
                    }

                    $this->SetFont('Arial', '', 10);
                    $this->SetX($oldPosX + 5);
                    $this->Cell($columns[1]['w'], 8, str("P{$columnPositionText}"), 0, 0, $columns[1]['align']);
                    $this->SetX($oldPosX);
                    $this->Image('./libs/toPdf/assets/summary_position.png', $oldPosX, $this->GetY() + 1.9, 4, 4, 'PNG');
                    $oldPosX += $columns[1]['w'];

                    if ($module->icon) {
                        $icon = $this->getIcon($module->icon, '#000000', 100);
                        if ($icon !== '')
                            $this->Image($icon, $oldPosX + (($columns[2]['w'] / 2) - (5.5 / 2)), $this->GetY() + 1, 5.5, 5.5, 'PNG');
                    }
                    $oldPosX += $columns[2]['w'];

                    $this->SetFont('Arial', 'B', 10);
                    $this->SetX($oldPosX);
                    $this->Cell($columns[3]['w'], 8, str($module->id), 0, 0, $columns[3]['align']);
                    $oldPosX += $columns[3]['w'];

                    $oldPosY = $this->GetY();

                    $this->SetFont('Arial', '', 9);
                    $this->SetX($oldPosX);
                    $fname = array_key_exists($module->func, $this->schemaFunctions) ? trim($this->schemaFunctions[$module->func]['name'] ?? '-') : '-';
                    $ftype = array_key_exists($module->func, $this->schemaFunctions) ? trim($this->schemaFunctions[$module->func]['hasType'] ? 'Type ' . trim($module->type) : '') : '-';
                    $fcrb = array_key_exists($module->func, $this->schemaFunctions) ? trim($this->schemaFunctions[$module->func]['hasCrb'] ? 'Courbe ' . trim($module->crb) : '') : '-';
                    $fsensibility = array_key_exists($module->func, $this->schemaFunctions) ? trim($this->schemaFunctions[$module->func]['hasType'] ? $module->sensibility : '') : '-';
                    $fcurrent = trim($module->current ?? "");
                    $fpole = trim($module->pole ?? '');
                    $fdetails = trim($ftype . ' ' . $fcrb . ' ' . $fsensibility . ' ' . $fcurrent . ' ' . $fpole);
                    if ($fdetails !== '')
                        $fdetails = "\n" . $fdetails;
                    $this->MultiCell($columns[4]['w'], 4, str("$fname$fdetails"), 0, $columns[4]['align'], false, 3);
                    $oldPosX += $columns[4]['w'];

                    $this->SetFont('Arial', '', 10);
                    $this->SetY($oldPosY);
                    $this->SetX($oldPosX);
                    $this->MultiCell($columns[5]['w'], 4, str(trim($module->text ?? '')), 0, $columns[5]['align'], false, 3);
                    $oldPosX += $columns[5]['w'];

                    $this->SetFont('Arial', '', 10);
                    $this->SetY($oldPosY);
                    $this->SetX($oldPosX);
                    $this->MultiCell($columns[6]['w'], 4, str(trim($module->desc ?? '')), 0, $columns[6]['align'], false, 3);
                    $oldPosX += $columns[6]['w'];

                    $this->Ln(11);
                }
            }

            $this->Ln(3);
        }
    }


}


if (isset($_GET['require'])) {
    header('Content-Type: application/json; charset=utf-8');
    $requirements = TiquettesPDF::requirements();
    echo json_encode($requirements);
    exit();
}


if (!isset($_POST['switchboard'])) {
    echo 'Missing switchboard parameter';
    exit;
}
if (!isset($_POST['printOptions'])) {
    echo 'Missing printOptions parameter';
    exit;
}
if (!isset($_POST['tv'])) {
    echo 'Missing tv parameter';
    exit;
}

$switchboard = json_decode($_POST['switchboard']);
$printOptions = json_decode($_POST['printOptions']);
$tv = json_decode($_POST['tv']);
$auto = intval(trim(($_POST['auto'] ?? '0'))) === 1;
$schemaGridColor = explode(',', trim($_POST['schemaGridColor'] ?? ''));
$isDev = intval(trim(($_POST['isDev'] ?? '0'))) === 1;

if (!is_array($schemaGridColor) || count($schemaGridColor) !== 3)
    $schemaGridColor = [230, 230, 230];
if ($schemaGridColor[0] < 0 || $schemaGridColor[0] > 255)
    $schemaGridColor[0] = 230;
if ($schemaGridColor[1] < 0 || $schemaGridColor[1] > 255)
    $schemaGridColor[1] = 230;
if ($schemaGridColor[2] < 0 || $schemaGridColor[2] > 255)
    $schemaGridColor[2] = 230;
$labelsCutLines = intval(trim(($_POST['labelsCutLines'] ?? '0'))) === 1;

$hasSchema = $printOptions->schema === true;
$hasSummary = $printOptions->summary === true;
$hasLabels = $printOptions->labels === true;
$hasOnlyLabels = $hasLabels && !$hasSchema && !$hasSummary;

$flattenModules = [];
foreach ($switchboard->rows as $row) {
    foreach ($row as $module) {
        if (!$module->free && !is_null($module->id) && ($module->func ?? '') !== '') {
            $flattenModules[] = $module;
        }
    }
}
if ($switchboard->withDb) {
    $flattenModules = array_map(function ($module) {
        return (object) array_merge((array) $module, [
            'parentId' => $module->parentId === '' ? 'DB' : $module->parentId,
        ]);
    }, $flattenModules);
    $flattenModules[] = (object) array_merge((array) $switchboard->db, [
        'id' => 'DB',
        'parentId' => '',
        'func' => 'dd'
    ]);
}
foreach ($flattenModules as $module) {
    $kcId = trim($module->kcId ?? '');
    if ($kcId !== '') {
        $kcModule = array_values(array_filter($flattenModules, fn($module) => $module->id === $kcId));
        if (count($kcModule) === 1) {
            $kcModule = $kcModule[0];
            $flattenModules[] = (object) array_merge((array) $kcModule, [
                'kcId' => '',
                'id' => '¤_' . $kcModule->id,
                'parentId' => $module->id,
                'func' => 'k',
                'icon' => $module->icon,
                'text' => $module->text,
                'desc' => $module->desc,
                'pole' => $module->pole,
                'wire' => $module->wire ?? ''
            ]);
        }
    }
}

$pdf = new TiquettesPDF();

$pdf->SetAuthor('tiquettes.fr' . ' ' . $tv, true);
$pdf->SetCreator('tiquettes.fr' . ' ' . $tv, true);
$pdf->SetTitle("Projet '" . $switchboard->prjname . "'", true);
$pdf->SetCompression(true);
$pdf->SetDisplayMode('real', 'default');
$pdf->SetMargins(10, 10);
$pdf->SetAutoPageBreak('auto', $pdf->pageBottomMargin - 1);
$pdf->AliasNbPages();
$pdf->SetGridColor($schemaGridColor);
$pdf->SetShowCutLines($labelsCutLines);

if (!$hasOnlyLabels && $printOptions->firstPage === true)
    $pdf->AddFirstPage();
if ($printOptions->schema === true)
    $pdf->AddSchemaPage();
if ($printOptions->summary === true)
    $pdf->AddSummaryPage();
if ($printOptions->labels === true)
    $pdf->AddLabelsPage();
if ($auto)
    $pdf->AutoPrint(true);

echo $pdf->Output('I', "Projet " . $switchboard->prjname . " - Tiquettes " . $tv . ".pdf", true);