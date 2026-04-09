<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            OptionSeeder::class,
        ]);

        User::query()->updateOrCreate([
            'email' => 'admin@autoline24.test',
        ], [
            'name' => 'Admin Autoline24',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
}
