/**
    Tiquettes - Générateur d'étiquettes pour tableaux et armoires électriques
    Copyright (C) 2024-2026 Christophe LEMOINE

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


export default function generateDisplayName(fileName) {
    const adjectifs = [
        'Joyeux', 'Bavard', 'Rapide', 'Timide', 'Rusé',
        'Majestueux', 'Curieux', 'Énergique', 'Paisible', 'Malicieux',
        'Brillant', 'Audacieux', 'Mystérieux', 'Élégant', 'Farfelu',
        'Fougueux', 'Serein', 'Intrépide', 'Jovial', 'Sage',
        'Vaillant', 'Dynamique', 'Charmant', 'Noble', 'Rigolo',
        'Zen', 'Généreux', 'Fabuleux', 'Cosmique', 'Magique',
        'Funky', 'Disco', 'Rebelle', 'Féroce', 'Doux',
        'Étincelant', 'Flamboyant', 'Glacial', 'Torride', 'Électrique',
        'Atomique', 'Quantique', 'Galactique', 'Stellaire', 'Lunaire',
        'Solaire', 'Volcanique', 'Océanique', 'Montagnard', 'Sauvage',
        'Urbain', 'Rustique', 'Futuriste', 'Vintage', 'Rétro',
        'Psychédélique', 'Hypnotique', 'Magnétique', 'Spectaculaire', 'Colossal',
        'Microscopique', 'Infini', 'Éternel', 'Foudroyant', 'Tourbillonnant',
        'Pétillant', 'Scintillant', 'Radieux', 'Ténébreux', 'Crépusculaire',
        'Chaotique', 'Harmonieux', 'Rythmique', 'Mélodieux', 'Symphonique',
        'Poétique', 'Épique', 'Légendaire', 'Mythique', 'Héroïque',
        'Diabolique', 'Angélique', 'Céleste', 'Divin', 'Sacré',
        'Profane', 'Absurde', 'Loufoque', 'Déjanté', 'Zinzin',
        'Givré', 'Allumé', 'Décalé', 'Barré', 'Timbré',
        'Dingo', 'Cinglé', 'Illuminé', 'Visionnaire', 'Transcendant',
        'Excentrique', 'Baroque', 'Rococo', 'Gothique', 'Punk',
        'Grunge', 'Jazzy', 'Bluesy', 'Funky', 'Techno',
        'Cybernétique', 'Bionique', 'Robotique', 'Mécanique', 'Organique',
        'Synthétique', 'Naturel', 'Sauvage', 'Domestique', 'Exotique'
    ];

    const noms = [
        'Panda', 'Renard', 'Licorne', 'Dragon', 'Koala',
        'Hibou', 'Lama', 'Pingouin', 'Raton', 'Castor',
        'Loutre', 'Flamant', 'Narval', 'Poulpe', 'Hérisson',
        'Axolotl', 'Fennec', 'Paresseux', 'Capybara', 'Quokka',
        'Phénix', 'Lynx', 'Mouffette', 'Écureuil', 'Colibri',
        'Marmotte', 'Caméléon', 'Morse', 'Ornithorynque', 'Tatou',
        'Toucan', 'Perroquet', 'Cacatoès', 'Aigle', 'Faucon',
        'Vautour', 'Condor', 'Albatros', 'Pélican', 'Cormoran',
        'Dauphin', 'Orque', 'Baleine', 'Requin', 'Raie',
        'Méduse', 'Hippocampe', 'Étoile', 'Crabe', 'Homard',
        'Crevette', 'Langouste', 'Seiche', 'Calmar', 'Pieuvre',
        'Tigre', 'Léopard', 'Jaguar', 'Guépard', 'Panthère',
        'Lion', 'Lionne', 'Lynx', 'Puma', 'Ocelot',
        'Ours', 'Grizzli', 'Panda', 'Koala', 'Wombat',
        'Kangourou', 'Wallaby', 'Émeu', 'Kiwi', 'Autruche',
        'Gazelle', 'Antilope', 'Impala', 'Gnou', 'Zèbre',
        'Girafe', 'Éléphant', 'Rhinocéros', 'Hippopotame', 'Buffle',
        'Bison', 'Yak', 'Chameau', 'Dromadaire', 'Lama',
        'Alpaga', 'Vigogne', 'Renne', 'Caribou', 'Élan',
        'Cerf', 'Biche', 'Chevreuil', 'Sanglier', 'Phacochère',
        'Mangouste', 'Suricate', 'Belette', 'Hermine', 'Fouine',
        'Blaireau', 'Taupe', 'Hérisson', 'Musaraigne', 'Chauve-souris',
        'Loup', 'Coyote', 'Chacal', 'Hyène', 'Renard',
        'Fennec', 'Raton', 'Tanuki', 'Panda', 'Binturong',
        'Lémurien', 'Tarsier', 'Ouistiti', 'Tamarin', 'Capucin',
        'Gorille', 'Chimpanzé', 'Orang-outan', 'Gibbon', 'Babouin',
        'Mandrill', 'Macaque', 'Singe', 'Paresseux', 'Tamanoir',
        'Fourmilier', 'Pangolin', 'Agouti', 'Capybara', 'Cochon',
        'Tapir', 'Okapi', 'Dugong', 'Lamantin', 'Phoque',
        'Otarie', 'Morse', 'Narval', 'Béluga', 'Cachalot'
    ];

    const adjectif = adjectifs[Math.floor(Math.random() * adjectifs.length)];
    const nom = noms[Math.floor(Math.random() * noms.length)];

    const nombre = Math.floor(Math.random() * 90) + 10;

    return adjectif + nom + nombre;
}