<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarImageController extends Controller
{
    public function index(string $carId)
    {
        $car = Car::with('images')->findOrFail($carId);

        return response()->json([
            'car_id' => $car->id,
            'images' => $car->images,
        ]);
    }

    public function store(Request $request, string $carId)
    {
        $car = Car::findOrFail($carId);

        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'is_main' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $path = $request->file('image')->store('cars', 'public');

        $isMain = (bool) ($validated['is_main'] ?? false);
        $sortOrder = $validated['sort_order'] ?? 0;

        if ($isMain) {
            $car->images()->update(['is_main' => false]);
        }

        if ($car->images()->count() === 0) {
            $isMain = true;
        }

        $image = $car->images()->create([
            'image_path' => $path,
            'is_main' => $isMain,
            'sort_order' => $sortOrder,
        ]);

        return response()->json([
            'message' => 'Image ajoutée avec succès.',
            'image' => $image,
        ], 201);
    }

    public function setMain(string $id)
    {
        $image = CarImage::findOrFail($id);
        $car = $image->car;

        $car->images()->update(['is_main' => false]);
        $image->update(['is_main' => true]);

        return response()->json([
            'message' => 'Image principale mise à jour avec succès.',
            'image' => $image->fresh(),
        ]);
    }

    public function destroy(string $id)
    {
        $image = CarImage::findOrFail($id);
        $car = $image->car;
        $wasMain = $image->is_main;

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        if ($wasMain) {
            $newMain = $car->images()->orderBy('sort_order')->first();
            if ($newMain) {
                $newMain->update(['is_main' => true]);
            }
        }

        return response()->json([
            'message' => 'Image supprimée avec succès.',
        ]);
    }
}
