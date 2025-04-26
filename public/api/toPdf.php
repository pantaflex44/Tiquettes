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

    public $pageMargin = 10;
    public $pageBottomMargin = 12;

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

    function Header()
    {
        global $switchboard, $tv;

        $this->SetY(1.5);

        $this->SetTextColor(0, 0, 0);
        $this->SetFont('Arial', 'B', 9);
        $this->Cell(0, 10, str($switchboard->prjname), 0, 0, 'L');

        $this->SetTextColor(170, 170, 170);
        $this->SetFont('Arial', '', 8);
        $this->Cell(0, 10, str('tiquettes.fr ' . $tv . ' (php ' . phpversion() . ' / fpdf ' . $this::VERSION . ' / imagick ' . phpversion('imagick') . ')'), 0, 0, 'R');
        $this->Ln($this->pageMargin + 1);

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

        $this->SetY(170);
        $this->SetDrawColor(150, 150, 150);
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


        $this->SetDrawColor(0, 0, 0);
    }

    function AddLabelsPage()
    {
        global $switchboard, $printOptions;

        require_once './libs/toPdf/themes/engine.php';

        $this->AddPage('L', 'A4', 0);

        $cnt = $switchboard->stepsPerRows;
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


}

$pdf = new TiquettesPDF();

$pdf->SetAuthor('tiquettes.fr' . ' ' . $switchboard->appversion, true);
$pdf->SetCreator('tiquettes.fr' . ' ' . $switchboard->appversion, true);
$pdf->SetTitle("Projet '" . $switchboard->prjname . "'", true);
$pdf->SetCompression(true);
$pdf->SetDisplayMode('real', 'default');
$pdf->SetMargins(10, 10);
$pdf->SetAutoPageBreak('auto', $pdf->pageBottomMargin);
$pdf->AliasNbPages();

$pdf->AddFirstPage();

if ($printOptions->labels === true) $pdf->AddLabelsPage();

echo $pdf->Output('I', 'tiquettes.pdf', true);