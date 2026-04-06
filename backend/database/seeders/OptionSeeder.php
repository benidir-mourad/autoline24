<?php

namespace Database\Seeders;

use App\Models\Option;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            'Climatisation',
            'Climatisation automatique',
            'GPS',
            'Caméra de recul',
            'Radar avant',
            'Radar arrière',
            'Sièges chauffants',
            'Sièges en cuir',
            'Toit ouvrant',
            'Régulateur de vitesse',
            'Limiteur de vitesse',
            'Bluetooth',
            'Jantes alliage',
            'Phares LED',
            'Apple CarPlay',
            'Android Auto',
            'Détecteur de pluie',
            'Détecteur de lumière',
        ];

        foreach ($options as $name) {
            Option::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
