<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

setlocale(LC_ALL, "fr_FR.UTF-8");
date_default_timezone_set('Europe/Paris');

require('./libs/fpdf186/fpdf.php');;
define('EURO', chr(128));

if (!isset($_POST['switchboard']) || !isset($_POST['printOptions']) || !isset($_POST['tv'])) {
    echo 'Missing parameters';
    exit;
}

$switchboard = json_decode($_POST['switchboard']);
$printOptions = json_decode($_POST['printOptions']);
$tv = json_decode($_POST['tv']);
$auto = intval(trim(($_POST['auto'] ?? '0'))) === 1;

//var_dump($switchboard);
//var_dump($printOptions);

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
    if ($withDate) $f[] = $df;
    if ($withHours) $f[] = $hf;
    $f = implode(' à ', $f);

    return $date->format($f ?: 'd/m/Y à H:i');
}

class TiquettesPDF extends FPDF
{

    protected $javascript;
    protected $n_js;
    protected $visibility = 'all';
    protected $n_ocg_print;
    protected $n_ocg_view;
    protected $subTitle = "";

    public $pageMargin = 10;
    public $pageBottomMargin = 12;
    public $schemaFunctions = null;

    function __construct($orientation = 'P', $unit = 'mm', $size = 'A4')
    {
        $this->schemaFunctions = json_decode(file_get_contents('./libs/toPdf/assets/schema_functions.json'), true);

        parent::__construct($orientation, $unit, $size);
    }

    function MultiCell($w, $h, $txt, $border = 0, $align = 'J', $fill = false, $maxline = 0)
    {
        // Output text with automatic or explicit line breaks, at most $maxline lines
        if (!isset($this->CurrentFont))
            $this->Error('No font has been set');
        $cw = $this->CurrentFont['cw'];
        if ($w == 0)
            $w = $this->w - $this->rMargin - $this->x;
        $wmax = ($w - 2 * $this->cMargin) * 1000 / $this->FontSize;
        $s = str_replace("\r", '', (string)$txt);
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

    function IncludeJS($script)
    {
        $this->javascript = $script;
    }

    function SetVisibility($v)
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

    function getIcon(string $name, string|false $color = false, int $iconSize = 100): string
    {
        if ($color === false) $color = '#000000';
        $color = strtolower(trim($color));
        if (!preg_match('/^#[a-f0-9A-Z]{6}$/i', $color)) $color = '#000000';
        if ($color === '#ffffff') $color = '#fefefe';

        $path = '../';
        $name = trim(strtolower($name));
        $pi = pathinfo($name);
        $mtime = file_exists($path . $name) ? filemtime($path . $name) : time();

        $pngname = $pi['filename'] . '.png';
        $pngpath = './libs/toPdf/themes/icons/' . $color . '/';
        if (!is_dir($pngpath)) mkdir($pngpath, 0777, true);
        if (file_exists($pngpath . $pngname) && filemtime($pngpath . $pngname) === $mtime) return $pngpath . $pngname;

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

            $image = new Imagick();
            $image->newImage($iconSize, $iconSize, new ImagickPixel('transparent'));
            $image->readImageBlob($svg);
            $image->transparentPaintImage('#ffffff', 0, 10, false);
            $image->thumbnailImage($iconSize, $iconSize, true);
            $image->setImageFormat('png64');
            $image->writeImage($pngpath . $pngname);

            touch($pngpath . $pngname, $mtime);

            return $pngpath . $pngname;
        }

        return '';
    }

    function Header()
    {
        global $switchboard, $tv;

        $this->SetY(1.5);

        $this->SetTextColor(0, 0, 0);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 10, str($switchboard->prjname), 0, 0, 'L');

        $this->SetTextColor(170, 170, 170);
        $this->SetFont('Arial', '', 8);
        $this->Cell(0, 10, str('tiquettes.fr ' . $tv . ' / php ' . phpversion() . ' / fpdf ' . $this::VERSION . ' / imagick ' . phpversion('imagick')), 0, 0, 'R');

        if ($this->subTitle !== "") {
            $this->SetX($this->pageMargin);
            $this->SetTextColor(0, 139, 139);
            $this->SetFont('Arial', 'B', 11);
            $this->Cell(0, 10, str($this->subTitle), 0, 0, 'C');
        }

        $this->Ln($this->pageMargin + 5);

        $this->SetDrawColor(0, 0, 0);
        $this->SetLineWidth(0.1);
        $this->Line($this->pageMargin, $this->pageMargin, $this->GetPageWidth() - $this->pageMargin, $this->pageMargin);
    }

    function Footer()
    {
        $this->SetY(-$this->pageBottomMargin);

        $this->SetTextColor(0, 0, 0);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, str('Page ' . $this->PageNo() . '/{nb}'), 0, 0, 'C');

        $this->SetDrawColor(0, 0, 0);
        $this->SetLineWidth(0.1);
        $this->Line($this->pageMargin, $this->GetPageHeight() - $this->pageMargin - 0.5, $this->GetPageWidth() - $this->pageMargin, $this->GetPageHeight() - $this->pageMargin - 0.5);
    }

    function AddFirstPage()
    {
        global $switchboard, $printOptions;

        $this->AddPage('P', 'A4', 0);
        $this->SetVisibility('all');

        // Titre

        $this->SetY(60);
        $this->SetFont('Arial', 'B', 36);
        $this->Cell(0, 15, str('Tableau électrique'), 0, 0, 'C');

        // Contenu du dossier

        $this->SetY(100);
        $this->SetX($this->pageMargin + 23);
        $this->SetFont('Arial', 'B', 14);
        $this->MultiCell(0, 7, cutStr(str("Ce dossier contient :")), 0, 'L', false);
        $this->Ln(5);
        $this->SetFont('Arial', '', 14);
        $contains = [];
        if ($printOptions->labels === true) $contains[] = "Les étiquettes à découper";
        if ($printOptions->schema === true) $contains[] = "Le schéma unifilaire";
        if ($printOptions->summary === true) $contains[] = "La nomenclature";
        if (count($contains) === 0) $contains[] = "Rien du tout !";
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
            "Version :" => $switchboard->prjversion . " (" . $switchboard->appversion . ")",
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
        $this->Line($this->pageMargin + 20, 97, $this->GetPageWidth() - ($this->pageMargin + 20), 97);
        $this->Line($this->pageMargin + 20, 97, $this->pageMargin + 20, $this->GetY() - 2);
        $this->Line($this->GetPageWidth() - ($this->pageMargin + 20), 97, $this->GetPageWidth() - ($this->pageMargin + 20), $this->GetY() - 2);

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

    function AddLabelsPage()
    {
        global $switchboard, $printOptions;

        require_once './libs/toPdf/themes/engine.php';

        $this->subTitle = "Etiquettes";
        $this->AddPage('L', 'A4', 0);
        $this->SetVisibility('all');

        $h = $switchboard->height;
        $w = $switchboard->stepSize;

        $this->SetY($this->pageMargin + 5);

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
                    $this->SetY($this->GetY() + $h + 3);
                    $x = $this->pageMargin;
                }

                if ($this->GetY() + $h > $this->GetPageHeight() - ($this->pageBottomMargin)) {
                    $this->AddPage('L', 'A4', 0);
                    $this->SetY($this->pageMargin + 10);
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
                    'w' => $module->half === 'right' ? $box['w'] - ($w / 2) : $box['w'],
                    'h' => $box['h'],
                ];

                Theme::render($this, $workBox, $switchboard->theme->data, $module, $printOptions);

                $this->SetDrawColor(170, 170, 170);
                $this->SetLineWidth(0.1);
                $this->Rect($box['x'], $box['y'], $box['w'], $box['h'], 'D');
                $this->Line($workBox['x'], $workBox['y'], $workBox['x'], $workBox['y'] + $workBox['h']);
                $this->Line($workBox['x'] + $workBox['w'], $workBox['y'], $workBox['x'] + $workBox['w'], $workBox['y'] + $workBox['h']);

                $x += $w * $module->span;
            }

            $this->SetY($this->GetY() + $h + 6);
        }

    }

    function AddSummaryPage()
    {
        global $switchboard, $printOptions;

        $this->subTitle = "Nomenclature";
        $this->AddPage('L', 'A4', 0);
        $this->SetVisibility('all');

        $this->SetY($this->pageMargin + 5);
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
                if (!$module->free) {
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
                        if ($icon !== '') {
                            $this->Image($icon, $oldPosX + (($columns[2]['w'] / 2) - (5.5 / 2)), $this->GetY() + 1, 5.5, 5.5, 'PNG');
                        }
                    }
                    $oldPosX += $columns[2]['w'];

                    $this->SetFont('Arial', 'B', 10);
                    $this->SetX($oldPosX);
                    $this->Cell($columns[3]['w'], 8, str($module->id), 0, 0, $columns[3]['align']);
                    $oldPosX += $columns[3]['w'];

                    $oldPosY = $this->GetY();

                    $this->SetFont('Arial', '', 9);
                    $this->SetX($oldPosX);
                    $fname = trim($this->schemaFunctions[$module->func]['name'] ?? '-');
                    $ftype = trim($this->schemaFunctions[$module->func]['hasType'] ? 'Type ' . trim($module->type) : '');
                    $fcrb = trim($this->schemaFunctions[$module->func]['hasCrb'] ? 'Courbe ' . trim($module->crb) : '');
                    $fsensibility = trim($this->schemaFunctions[$module->func]['hasType'] ? $module->sensibility : '');
                    $fcurrent = trim($module->current ?? "");
                    $fpole = trim($module->pole ?? '');
                    $fdetails = trim($ftype . ' ' . $fcrb . ' ' . $fsensibility . ' ' . $fcurrent . ' ' . $fpole);
                    if ($fdetails !== '') $fdetails = "\n" . $fdetails;
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

                    $this->Ln(13);
                }
            }

            $this->Ln(5);
        }

        $this->SetDrawColor(170, 170, 170);
        $this->Line($this->pageMargin, $this->GetY() - 7.5, $this->GetPageWidth() - $this->pageMargin, $this->GetY() - 7.5);

    }


}

$pdf = new TiquettesPDF();

$pdf->SetAuthor('tiquettes.fr' . ' ' . $tv, true);
$pdf->SetCreator('tiquettes.fr' . ' ' . $tv, true);
$pdf->SetTitle("Projet '" . $switchboard->prjname . "'", true);
$pdf->SetCompression(true);
$pdf->SetDisplayMode('real', 'default');
$pdf->SetMargins(10, 10);
$pdf->SetAutoPageBreak('auto', $pdf->pageBottomMargin);
$pdf->AliasNbPages();

$pdf->AddFirstPage();
if ($printOptions->labels === true) $pdf->AddLabelsPage();
if ($printOptions->summary === true) $pdf->AddSummaryPage();

if ($auto) $pdf->AutoPrint(true);
echo $pdf->Output('I', "Projet " . $switchboard->prjname . " - tiquettes " . $tv . ".pdf", true);