<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CarImageApiTest extends TestCase
{
    use RefreshDatabase;

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function makeCar(): Car
    {
        return Car::create([
            'brand'              => 'Toyota',
            'model'              => 'Yaris',
            'year'               => 2020,
            'mileage'            => 30000,
            'price'              => 14000,
            'fuel_type'          => 'Essence',
            'transmission'       => 'Manuelle',
            'status'             => 'available',
            'publication_status' => 'published',
        ]);
    }

    public function test_admin_can_upload_an_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car  = $this->makeCar();
        $file = UploadedFile::fake()->image('photo.jpg', 800, 600);

        $response = $this->postJson("/api/admin/cars/{$car->id}/images", [
            'image' => $file,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Image ajoutée avec succès.')
            ->assertJsonStructure(['image' => ['id', 'image_path', 'is_main']]);

        $this->assertDatabaseHas('car_images', ['car_id' => $car->id, 'is_main' => true]);
    }

    public function test_first_uploaded_image_becomes_main_automatically(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car  = $this->makeCar();
        $file = UploadedFile::fake()->image('photo.jpg');

        $response = $this->postJson("/api/admin/cars/{$car->id}/images", [
            'image'   => $file,
            'is_main' => false,
        ]);

        $response->assertCreated()->assertJsonPath('image.is_main', true);
    }

    public function test_upload_rejects_non_image_files(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car  = $this->makeCar();
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->postJson("/api/admin/cars/{$car->id}/images", [
            'image' => $file,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['image']);
    }

    public function test_upload_rejects_oversized_files(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car  = $this->makeCar();
        $file = UploadedFile::fake()->image('huge.jpg')->size(11000);

        $response = $this->postJson("/api/admin/cars/{$car->id}/images", [
            'image' => $file,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['image']);
    }

    public function test_admin_can_set_main_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car    = $this->makeCar();
        $first  = $car->images()->create(['image_path' => 'cars/a.jpg', 'is_main' => true,  'sort_order' => 0]);
        $second = $car->images()->create(['image_path' => 'cars/b.jpg', 'is_main' => false, 'sort_order' => 1]);

        $response = $this->patchJson("/api/admin/images/{$second->id}/set-main");

        $response->assertOk()->assertJsonPath('image.is_main', true);

        $this->assertDatabaseHas('car_images', ['id' => $second->id, 'is_main' => true]);
        $this->assertDatabaseHas('car_images', ['id' => $first->id,  'is_main' => false]);
    }

    public function test_admin_can_delete_an_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car   = $this->makeCar();
        $image = $car->images()->create(['image_path' => 'cars/photo.jpg', 'is_main' => true, 'sort_order' => 0]);

        Storage::disk('public')->put('cars/photo.jpg', 'fake content');

        $response = $this->deleteJson("/api/admin/images/{$image->id}");

        $response->assertOk()->assertJsonPath('message', 'Image supprimée avec succès.');
        $this->assertDatabaseMissing('car_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing('cars/photo.jpg');
    }

    public function test_deleting_main_image_promotes_next_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->adminUser());

        $car    = $this->makeCar();
        $main   = $car->images()->create(['image_path' => 'cars/main.jpg',  'is_main' => true,  'sort_order' => 0]);
        $second = $car->images()->create(['image_path' => 'cars/second.jpg', 'is_main' => false, 'sort_order' => 1]);

        Storage::disk('public')->put('cars/main.jpg', 'fake');

        $this->deleteJson("/api/admin/images/{$main->id}");

        $this->assertDatabaseHas('car_images', ['id' => $second->id, 'is_main' => true]);
    }
}
